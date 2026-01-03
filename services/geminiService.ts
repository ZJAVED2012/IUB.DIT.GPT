
import { GoogleGenAI, GenerateContentResponse, Modality, Type } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";

export interface ChatOptions {
  useSearch?: boolean;
  useMaps?: boolean;
  useThinking?: boolean;
  image?: string; // base64
}

export class GeminiService {
  constructor() {}

  private getAI() {
    return new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async chat(prompt: string, history: any[] = [], options: ChatOptions = {}) {
    const ai = this.getAI();
    try {
      let model = 'gemini-3-flash-preview';
      const tools: any[] = [];
      const config: any = {
        systemInstruction: SYSTEM_INSTRUCTION,
      };

      if (options.useThinking) {
        model = 'gemini-3-pro-preview';
        config.thinkingConfig = { thinkingBudget: 32768 };
      } else if (options.useMaps) {
        model = 'gemini-2.5-flash';
        tools.push({ googleMaps: {} });
        
        // Try to get user location
        try {
          const pos = await new Promise<GeolocationPosition>((res, rej) => 
            navigator.geolocation.getCurrentPosition(res, rej)
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
          console.warn("Location permission denied for Maps Grounding.");
        }
      } else if (options.useSearch) {
        model = 'gemini-3-flash-preview';
        tools.push({ googleSearch: {} });
      } else if (options.image) {
        model = 'gemini-3-pro-preview';
      }

      if (tools.length > 0) config.tools = tools;

      const contents: any[] = [...history];
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

      const response = await ai.models.generateContent({
        model,
        contents,
        config
      });

      const text = response.text || "No response content.";
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

      let generatedImage = '';
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          generatedImage = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }
      return { image: generatedImage, text: response.text };
    } catch (error) {
      console.error("Image Editing Error:", error);
      throw error;
    }
  }

  async generateVideo(prompt: string, aspectRatio: '16:9' | '9:16' = '16:9') {
    const ai = this.getAI();
    try {
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt,
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio
        }
      });

      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error("Video Generation Error:", error);
      throw error;
    }
  }

  async transcribeAudio(audioBase64: string) {
    const ai = this.getAI();
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { inlineData: { data: audioBase64, mimeType: 'audio/webm' } },
            { text: "Transcribe this audio exactly as it is spoken. Provide only the transcription." }
          ]
        }
      });
      return response.text;
    } catch (error) {
      console.error("Transcription Error:", error);
      throw error;
    }
  }
}

export const gemini = new GeminiService();
