
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

/**
 * Extracts MIME type and base64 data from a data URL.
 */
function parseDataUrl(dataUrl: string) {
  const match = dataUrl.match(/^data:(.*?);base64,(.*)$/);
  if (match) {
    return { mimeType: match[1], data: match[2] };
  }
  return { mimeType: 'image/jpeg', data: dataUrl };
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

  private async withRetry<T>(fn: () => Promise<T>, maxRetries = 2): Promise<T> {
    let lastError: any;
    for (let i = 0; i <= maxRetries; i++) {
      try {
        return await fn();
      } catch (err: any) {
        lastError = err;
        const errMsg = err?.message?.toLowerCase() || "";
        const isQuotaError = errMsg.includes("429") || errMsg.includes("quota") || errMsg.includes("exhausted");
        if (!isQuotaError || i === maxRetries) break;
        const delay = Math.pow(2, i) * 2000 + Math.random() * 1000;
        await new Promise(res => setTimeout(res, delay));
      }
    }
    return await this.handleApiError(lastError);
  }

  private async handleApiError(err: any): Promise<never> {
    const errMsg = err?.message || "";
    if (errMsg.includes("Requested entity was not found.") && (window as any).aistudio) {
      await (window as any).aistudio.openSelectKey();
    }
    if (errMsg.includes("429") || errMsg.toLowerCase().includes("quota") || errMsg.toLowerCase().includes("exhausted")) {
      throw new Error("RESOURCE_EXHAUSTED");
    }
    throw err;
  }

  async openKeySelector() {
    if ((window as any).aistudio) await (window as any).aistudio.openSelectKey();
  }

  async chat(prompt: string, history: any[] = [], options: ChatOptions = {}): Promise<{ text: string; sources: any[] }> {
    return this.withRetry(async () => {
      const ai = this.getAI();
      let model = 'gemini-3-flash-preview'; 

      if (options.useThinking || options.persona === Persona.ARCHITECT) {
        model = 'gemini-3-pro-preview';
      }

      const config: any = {
        systemInstruction: PERSONA_INSTRUCTIONS[options.persona || Persona.ARCHITECT],
      };

      if (options.useThinking) {
        config.thinkingConfig = { thinkingBudget: 16000 };
      }

      if (options.useSearch) {
        config.tools = [{ googleSearch: {} }];
      } else if (options.useMaps) {
        model = 'gemini-2.5-flash';
        config.tools = [{ googleMaps: {} }];
      }

      const contents = [...history];
      const parts: any[] = [{ text: prompt }];
      
      if (options.image) {
        const { mimeType, data } = parseDataUrl(options.image);
        parts.push({ inlineData: { mimeType, data } });
      }

      if (options.video) {
        const { mimeType, data } = parseDataUrl(options.video);
        parts.push({ inlineData: { mimeType, data } });
      }

      contents.push({ role: 'user', parts });

      const response = await ai.models.generateContent({ model, contents, config });
      const text = response.text || "No response.";
      
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
      const { mimeType, data } = parseDataUrl(audioBase64);
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { inlineData: { data, mimeType: mimeType === 'application/octet-stream' ? 'audio/webm' : mimeType } },
            { text: "Transcribe this audio." }
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
      const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
      return part ? `data:image/png;base64,${part.inlineData.data}` : null;
    });
  }

  async generateVideo(prompt: string, aspectRatio: '16:9' | '9:16' = '16:9'): Promise<string> {
    const ai = this.getAI();
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt,
      config: { numberOfVideos: 1, resolution: '720p', aspectRatio }
    });
    while (!operation.done) {
      await new Promise(res => setTimeout(res, 5000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }
    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  }

  connectLive(callbacks: any) {
    const ai = this.getAI();
    return ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-12-2025',
      callbacks,
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } }
      }
    });
  }
}

export const gemini = new GeminiService();
