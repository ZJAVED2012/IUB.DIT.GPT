
// @google/genai compliance: Using correct model names and property access for .text
import { GoogleGenAI, GenerateContentResponse, Modality, Type } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";

export interface ChatOptions {
  useSearch?: boolean;
  useMaps?: boolean;
  useThinking?: boolean;
  useFast?: boolean;
  image?: string; // base64
  video?: string; // base64
}

export class GeminiService {
  constructor() {}

  private getAI() {
    // Guidelines: Always use new GoogleGenAI({apiKey: process.env.API_KEY});
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async chat(prompt: string, history: any[] = [], options: ChatOptions = {}) {
    const ai = this.getAI();
    try {
      let model = 'gemini-3-pro-preview';
      const tools: any[] = [];
      const config: any = {
        systemInstruction: SYSTEM_INSTRUCTION,
      };

      if (options.useFast) {
        // Guidelines: Select 'gemini-flash-lite-latest' for lite/fast tasks.
        model = 'gemini-flash-lite-latest';
      } else if (options.useThinking) {
        model = 'gemini-3-pro-preview';
        config.thinkingConfig = { thinkingBudget: 32768 };
      } else if (options.useMaps) {
        // Guidelines: Select 'gemini-flash-latest' for general flash tasks.
        model = 'gemini-flash-latest';
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
        // Guidelines: Use 'gemini-3-flash-preview' for basic text tasks/search.
        model = 'gemini-3-flash-preview';
        tools.push({ googleSearch: {} });
      }

      if (tools.length > 0) config.tools = tools;

      const contents: any[] = [...history];
      const parts: any[] = [{ text: prompt }];
      
      if (options.image) {
        parts.unshift({ inlineData: { mimeType: 'image/jpeg', data: options.image.split(',')[1] || options.image } });
      }
      if (options.video) {
        parts.unshift({ inlineData: { mimeType: 'video/mp4', data: options.video.split(',')[1] || options.video } });
      }

      contents.push({ role: 'user', parts });

      const response = await ai.models.generateContent({ model, contents, config });
      // Guidelines: Access .text property directly, do not call as a method.
      const text = response.text || "No response generated.";
      
      const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
        ?.map((chunk: any) => {
          if (chunk.web) return { title: chunk.web.title, uri: chunk.web.uri };
          if (chunk.maps) return { title: chunk.maps.title, uri: chunk.maps.uri };
          return null;
        }).filter(Boolean) || [];

      return { text, sources };
    } catch (error) {
      console.error("Gemini Error:", error);
      throw error;
    }
  }

  async generateImage(prompt: string, options: { aspectRatio: string; imageSize: string }) {
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

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
      return null;
    } catch (error) {
      console.error("Image Gen Error:", error);
      throw error;
    }
  }

  async editImage(prompt: string, base64Image: string) {
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

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
      }
      return null;
    } catch (error) {
      console.error("Edit Image Error:", error);
      throw error;
    }
  }

  async transcribeAudio(base64Audio: string) {
    const ai = this.getAI();
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { inlineData: { data: base64Audio, mimeType: 'audio/webm' } },
            { text: "Transcribe the following audio accurately." }
          ]
        }
      });
      // Guidelines: Access .text property directly.
      return response.text;
    } catch (error) {
      console.error("Transcription Error:", error);
      return "[Transcription Error]";
    }
  }

  async generateSpeech(text: string) {
    const ai = this.getAI();
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Zephyr' }
            }
          }
        }
      });
      const base64 = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64) return base64;
      return null;
    } catch (error) {
      console.error("TTS Error:", error);
      throw error;
    }
  }

  async generateVideo(prompt: string, aspectRatio: string = '16:9', startImage?: string) {
    const ai = this.getAI();
    try {
      const payload: any = {
        model: 'veo-3.1-fast-generate-preview',
        prompt,
        config: { numberOfVideos: 1, resolution: '720p', aspectRatio }
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
        operation = await ai.operations.getVideosOperation({ operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error("Veo Error:", error);
      throw error;
    }
  }
}

export const gemini = new GeminiService();
