
import { GoogleGenAI, GenerateContentResponse, Modality, Type, LiveServerMessage } from "@google/genai";
import { PERSONA_INSTRUCTIONS } from "../constants";
// Fix: Added missing ImageSize import
import { Persona, AspectRatio, ImageSize } from "../types";

export interface ChatOptions {
  useSearch?: boolean;
  useMaps?: boolean;
  useThinking?: boolean;
  useFast?: boolean;
  image?: string; 
  video?: string; 
  persona?: Persona;
}

export function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export class GeminiService {
  constructor() {}

  private getAI() {
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  private async handleApiError(err: any): Promise<never> {
    if (err?.message?.includes("Requested entity was not found.") && (window as any).aistudio) {
      await (window as any).aistudio.openSelectKey();
    }
    throw err;
  }

  async chat(prompt: string, history: any[] = [], options: ChatOptions = {}): Promise<{ text: string; sources: any[] }> {
    const ai = this.getAI();
    try {
      // Feature: AI powered chatbot (Default) uses gemini-3-pro-preview
      let model = 'gemini-3-pro-preview'; 
      
      // Feature: Fast AI responses uses gemini-2.5-flash-lite
      if (options.useFast) {
        model = 'gemini-flash-lite-latest';
      } 
      // Feature: Use Google Search data uses gemini-3-flash-preview
      else if (options.useSearch) {
        model = 'gemini-3-flash-preview';
      }
      // Feature: Use Google Maps data uses gemini-2.5-flash
      else if (options.useMaps) {
        model = 'gemini-2.5-flash';
      }

      const tools: any[] = [];
      const config: any = {
        systemInstruction: PERSONA_INSTRUCTIONS[options.persona || Persona.ARCHITECT],
      };

      // Feature: Thinking mode uses gemini-3-pro-preview and max thinkingBudget
      if (options.useThinking) {
        model = 'gemini-3-pro-preview';
        config.thinkingConfig = { thinkingBudget: 32768 };
      }

      if (options.useMaps) {
        tools.push({ googleMaps: {} });
        try {
          const pos = await new Promise<GeolocationPosition>((res, rej) => 
            navigator.geolocation.getCurrentPosition(res, rej)
          );
          config.toolConfig = {
            retrievalConfig: { latLng: { latitude: pos.coords.latitude, longitude: pos.coords.longitude } }
          };
        } catch (e) { console.warn("Location error", e); }
      } else if (options.useSearch) {
        tools.push({ googleSearch: {} });
      }

      if (tools.length > 0) config.tools = tools;

      const contents: any[] = [...history];
      const parts: any[] = [{ text: prompt }];
      
      // Feature: Analyze images uses gemini-3-pro-preview
      if (options.image) {
        parts.unshift({ inlineData: { mimeType: 'image/jpeg', data: options.image.split(',')[1] || options.image } });
        if (!options.useFast && !options.useSearch && !options.useMaps) {
           model = 'gemini-3-pro-preview';
        }
      }

      if (options.video) {
        parts.unshift({ inlineData: { mimeType: 'video/mp4', data: options.video.split(',')[1] || options.video } });
        if (!options.useFast && !options.useSearch && !options.useMaps) {
          model = 'gemini-3-pro-preview';
        }
      }

      contents.push({ role: 'user', parts });

      const response = await ai.models.generateContent({ model, contents, config });
      const text = response.text || "No response generated.";
      
      const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
        ?.map((chunk: any) => {
          if (chunk.web) return { title: chunk.web.title, uri: chunk.web.uri };
          if (chunk.maps) return { title: chunk.maps.title, uri: chunk.maps.uri };
          return null;
        }).filter(Boolean) || [];

      return { text, sources };
    } catch (error) {
      return await this.handleApiError(error);
    }
  }

  // Feature: Transcribe audio uses gemini-3-flash-preview
  async transcribe(audioBase64: string): Promise<string> {
    const ai = this.getAI();
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { inlineData: { data: audioBase64, mimeType: 'audio/webm' } },
            { text: "Transcribe this audio accurately." }
          ]
        }
      });
      return response.text || "";
    } catch (error) {
      return await this.handleApiError(error);
    }
  }

  // Feature: Control image aspect ratios + gemini-3-pro-image-preview
  async generateImage(prompt: string, options: { aspectRatio: AspectRatio; imageSize: ImageSize }): Promise<string | null> {
    const ai = this.getAI();
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: { parts: [{ text: prompt }] },
        config: {
          imageConfig: {
            aspectRatio: options.aspectRatio as any,
            imageSize: options.imageSize as any
          }
        }
      });

      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
      return null;
    } catch (error) {
      return await this.handleApiError(error);
    }
  }

  // Image editing using Flash Image model
  async editImage(prompt: string, base64Image: string): Promise<string | null> {
    const ai = this.getAI();
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { inlineData: { data: base64Image.split(',')[1], mimeType: 'image/jpeg' } },
            { text: prompt }
          ]
        }
      });
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
      return null;
    } catch (error) {
      return await this.handleApiError(error);
    }
  }

  // Feature: Generate speech uses gemini-2.5-flash-preview-tts
  async generateSpeech(text: string): Promise<string | null> {
    const ai = this.getAI();
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } }
          }
        }
      });
      return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
    } catch (error) {
      return await this.handleApiError(error);
    }
  }

  // Feature: Prompt based video generation & Animate images with Veo
  // Uses model: veo-3.1-fast-generate-preview
  async generateVideo(prompt: string, aspectRatio: '16:9' | '9:16' = '16:9', startImage?: string, resolution: '720p' | '1080p' = '720p'): Promise<string> {
    const ai = this.getAI();
    try {
      const config: any = { numberOfVideos: 1, resolution, aspectRatio };
      const payload: any = { model: 'veo-3.1-fast-generate-preview', prompt, config };
      if (startImage) payload.image = { imageBytes: startImage.split(',')[1], mimeType: 'image/jpeg' };

      let operation = await ai.models.generateVideos(payload);
      while (!operation.done) {
        await new Promise(res => setTimeout(res, 10000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }
      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (error) {
      return await this.handleApiError(error);
    }
  }

  connectLive(callbacks: {
    onopen: () => void;
    onmessage: (m: LiveServerMessage) => void;
    onerror: (e: any) => void;
    onclose: (e: any) => void;
  }) {
    const ai = this.getAI();
    return ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-09-2025',
      callbacks,
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
        },
        systemInstruction: 'You are a helpful IT support agent for the Directorate of IT. Speak clearly and professionally.',
      }
    });
  }
}

export const gemini = new GeminiService();
