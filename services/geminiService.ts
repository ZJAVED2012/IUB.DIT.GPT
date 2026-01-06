
import { GoogleGenAI, GenerateContentResponse, Modality, Type, LiveServerMessage } from "@google/genai";
import { PERSONA_INSTRUCTIONS } from "../constants";
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

  /**
   * Helper to perform retries with exponential backoff for transient errors (like 429)
   */
  private async withRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
    let lastError: any;
    for (let i = 0; i <= maxRetries; i++) {
      try {
        return await fn();
      } catch (err: any) {
        lastError = err;
        const isQuotaError = 
          err?.message?.includes("429") || 
          err?.status === 429 || 
          err?.message?.toLowerCase().includes("quota") ||
          err?.message?.toLowerCase().includes("exhausted");
        
        // If it's not a quota error or we've reached max retries, break
        if (!isQuotaError || i === maxRetries) break;
        
        // Wait: i=0 -> 3s, i=1 -> 6s, i=2 -> 12s (+ jitter)
        const delay = Math.pow(2, i) * 3000 + Math.random() * 1500;
        console.warn(`Quota exceeded. Retrying in ${Math.round(delay)}ms... (Attempt ${i + 1}/${maxRetries})`);
        await new Promise(res => setTimeout(res, delay));
      }
    }
    return await this.handleApiError(lastError);
  }

  private async handleApiError(err: any): Promise<never> {
    console.error("Gemini API Error Detail:", err);
    
    const errMsg = err?.message || "";
    
    // Guidelines: Reset key if 404/Not Found
    if (errMsg.includes("Requested entity was not found.") && (window as any).aistudio) {
      await (window as any).aistudio.openSelectKey();
    }
    
    // Enrich error message for the UI
    if (errMsg.includes("429") || errMsg.toLowerCase().includes("quota") || errMsg.toLowerCase().includes("exhausted")) {
      const quotaErr = new Error("RESOURCE_EXHAUSTED");
      (quotaErr as any).originalError = err;
      throw quotaErr;
    }

    throw err;
  }

  async openKeySelector() {
    if ((window as any).aistudio) {
      await (window as any).aistudio.openSelectKey();
    }
  }

  async chat(prompt: string, history: any[] = [], options: ChatOptions = {}): Promise<{ text: string; sources: any[] }> {
    return this.withRetry(async () => {
      const ai = this.getAI();
      let model = 'gemini-3-pro-preview'; 

      if (options.useSearch) {
        model = 'gemini-3-flash-preview';
      } else if (options.useMaps) {
        model = 'gemini-2.5-flash';
      } else if (options.useFast) {
        model = 'gemini-flash-lite-latest';
      } else if (options.useThinking) {
        model = 'gemini-3-pro-preview';
      }

      const tools: any[] = [];
      const config: any = {
        systemInstruction: PERSONA_INSTRUCTIONS[options.persona || Persona.ARCHITECT],
      };

      if (options.useThinking) {
        config.thinkingConfig = { thinkingBudget: 32768 };
        config.maxOutputTokens = 35000; 
      }

      if (options.useMaps) {
        tools.push({ googleMaps: {} });
        try {
          const pos = await new Promise<GeolocationPosition>((res, rej) => 
            navigator.geolocation.getCurrentPosition(res, rej, { timeout: 5000 })
          );
          config.toolConfig = {
            retrievalConfig: { 
              latLng: { 
                latitude: pos.coords.latitude, 
                longitude: pos.coords.longitude 
              } 
            }
          };
        } catch (e) {
          console.warn("Location context unavailable for Maps grounding.");
        }
      } else if (options.useSearch) {
        tools.push({ googleSearch: {} });
      }

      if (tools.length > 0) config.tools = tools;

      const contents: any[] = history.length > 0 ? history : [];
      const parts: any[] = [{ text: prompt }];
      
      if (options.image) {
        parts.unshift({ 
          inlineData: { 
            mimeType: 'image/jpeg', 
            data: options.image.split(',')[1] || options.image 
          } 
        });
      }

      contents.push({ role: 'user', parts });

      const response = await ai.models.generateContent({ model, contents, config });
      const text = response.text || "No response content generated.";
      
      const sources: any[] = [];
      const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
      if (groundingMetadata?.groundingChunks) {
        groundingMetadata.groundingChunks.forEach((chunk: any) => {
          if (chunk.web) sources.push({ title: chunk.web.title, uri: chunk.web.uri });
          if (chunk.maps) sources.push({ title: chunk.maps.title, uri: chunk.maps.uri });
        });
      }

      return { text, sources };
    });
  }

  async transcribe(audioBase64: string): Promise<string> {
    return this.withRetry(async () => {
      const ai = this.getAI();
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { inlineData: { data: audioBase64, mimeType: 'audio/webm' } },
            { text: "Accurately transcribe the provided audio input into text." }
          ]
        }
      });
      return response.text || "";
    });
  }

  async generateImage(prompt: string, options: { aspectRatio: AspectRatio; imageSize: ImageSize }): Promise<string | null> {
    return this.withRetry(async () => {
      const ai = this.getAI();
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
    });
  }

  async editImage(prompt: string, imageBase64: string): Promise<string | null> {
    return this.withRetry(async () => {
      const ai = this.getAI();
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              inlineData: {
                data: imageBase64.split(',')[1] || imageBase64,
                mimeType: 'image/jpeg',
              },
            },
            {
              text: prompt,
            },
          ],
        },
      });

      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            return `data:image/png;base64,${part.inlineData.data}`;
          }
        }
      }
      return null;
    });
  }

  async generateSpeech(text: string): Promise<string | null> {
    return this.withRetry(async () => {
      const ai = this.getAI();
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
    });
  }

  async generateVideo(prompt: string, aspectRatio: '16:9' | '9:16' = '16:9', startImage?: string, resolution: '720p' | '1080p' = '720p'): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      if (window.aistudio && !(await window.aistudio.hasSelectedApiKey())) {
        await window.aistudio.openSelectKey();
      }

      const config: any = { 
        numberOfVideos: 1, 
        resolution, 
        aspectRatio 
      };
      
      const payload: any = { 
        model: 'veo-3.1-fast-generate-preview', 
        prompt, 
        config 
      };
      
      if (startImage) {
        payload.image = { 
          imageBytes: startImage.split(',')[1], 
          mimeType: 'image/jpeg' 
        };
      }

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
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
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
