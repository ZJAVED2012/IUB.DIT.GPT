
import { GoogleGenAI, GenerateContentResponse, Modality, Type, LiveServerMessage, FunctionDeclaration } from "@google/genai";
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

function parseDataUrl(dataUrl: string) {
  const match = dataUrl.match(/^data:(.*?);base64,(.*)$/);
  if (match) {
    return { mimeType: match[1], data: match[2] };
  }
  return { mimeType: 'image/jpeg', data: dataUrl };
}

export class GeminiService {
  constructor() {}

  private getAI() {
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  // Enhanced retry logic for "Unlimited" feel
  private async withRetry<T>(fn: () => Promise<T>, maxRetries = 5): Promise<T> {
    let lastError: any;
    for (let i = 0; i <= maxRetries; i++) {
      try {
        return await fn();
      } catch (err: any) {
        lastError = err;
        const errMsg = err?.message?.toLowerCase() || "";
        if (errMsg.includes("429") || errMsg.includes("quota")) {
          if (i === maxRetries) break;
          const delay = i < 2 ? 1000 : Math.pow(2, i) * 1000;
          await new Promise(res => setTimeout(res, delay));
          continue;
        }
        break;
      }
    }
    throw lastError;
  }

  async openKeySelector() {
    if ((window as any).aistudio) await (window as any).aistudio.openSelectKey();
  }

  async *chatStream(prompt: string, history: any[] = [], options: ChatOptions = {}) {
    const ai = this.getAI();
    const model = 'gemini-3.1-pro-preview'; 

    const tools: any[] = [];
    if (options.useSearch) {
      tools.push({ googleSearch: {} });
    }

    const functionDeclarations: FunctionDeclaration[] = [
      {
        name: "get_student_data",
        description: "Fetch student profile, fee status, and timetable using Roll Number or CNIC.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            identifier: { type: Type.STRING, description: "Roll Number or CNIC of the student." }
          },
          required: ["identifier"]
        }
      },
      {
        name: "create_support_ticket",
        description: "Create a technical support ticket for IT issues.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            issue: { type: Type.STRING, description: "Description of the technical issue." },
            category: { type: Type.STRING, enum: ["LMS", "MyIUB", "WiFi", "Email", "Hardware"], description: "Category of the issue." }
          },
          required: ["issue", "category"]
        }
      },
      {
        name: "check_server_status",
        description: "Check the real-time uptime and load status of IUB portals.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            portal: { type: Type.STRING, enum: ["MyIUB", "LMS", "E-Portal", "Website"], description: "Name of the portal to check." }
          },
          required: ["portal"]
        }
      },
      {
        name: "get_campus_location",
        description: "Get the exact location or route for departments/offices within IUB campuses.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            query: { type: Type.STRING, description: "Department or office name (e.g., 'Software Engineering', 'Registrar Office')." }
          },
          required: ["query"]
        }
      },
      {
        name: "get_faculty_workload",
        description: "Fetch real-time class scheduling and room allocation data for faculty members.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            facultyName: { type: Type.STRING, description: "Optional: Name of the faculty member to filter by." },
            department: { type: Type.STRING, description: "Optional: Department to filter by." }
          }
        }
      }
    ];

    tools.push({ functionDeclarations });

    const config: any = {
      systemInstruction: PERSONA_INSTRUCTIONS[options.persona || Persona.ARCHITECT],
      temperature: 0.7,
      tools,
      toolConfig: { includeServerSideToolInvocations: true }
    };

    const contents = [...history];
    const parts: any[] = [{ text: prompt }];
    
    if (options.image) {
      const { mimeType, data } = parseDataUrl(options.image);
      parts.push({ inlineData: { mimeType, data } });
    }

    contents.push({ role: 'user', parts });

    const responseStream: any = await this.withRetry(() => 
      ai.models.generateContentStream({ model, contents, config })
    );

    for await (const chunk of responseStream) {
      yield chunk;
    }
  }

  async handleToolCall(name: string, args: any): Promise<any> {
    console.log(`Executing tool: ${name}`, args);
    
    switch (name) {
      case 'get_student_data':
        return {
          rollNumber: args.identifier,
          name: "Zeeshan Javed",
          feeStatus: "Paid",
          attendance: "88%",
          timetable: [
            { day: "Monday", subject: "Cloud Computing", time: "09:00 AM", room: "CS-01" },
            { day: "Wednesday", subject: "AI Ethics", time: "11:30 AM", room: "Lab-04" }
          ]
        };
      case 'create_support_ticket':
        return {
          ticketId: `IUB-TKT-${Math.floor(Math.random() * 10000)}`,
          status: "Open",
          priority: "High",
          estimatedResolution: "24 Hours"
        };
      case 'check_server_status':
        const statuses = ["Online", "Degraded", "Offline"];
        const status = args.portal === "LMS" ? "Degraded" : "Online";
        return {
          portal: args.portal,
          status: status,
          uptime: "99.9%",
          load: status === "Degraded" ? "High" : "Normal",
          message: status === "Degraded" ? "Server is experiencing high traffic due to exam results." : "All systems operational."
        };
      case 'get_campus_location':
        return {
          location: args.query,
          campus: "Baghdad-ul-Jadeed",
          coordinates: "29.3718° N, 71.7051° E",
          mapUrl: `https://www.google.com/maps/search/IUB+${encodeURIComponent(args.query)}`,
          directions: "Take the main gate, turn left at the fountain, and proceed 200m past the library."
        };
      case 'get_faculty_workload':
        return {
          timestamp: new Date().toISOString(),
          activeSessions: 12,
          totalFaculty: 45,
          roomsOccupied: "18/25",
          schedule: [
            { faculty: "Dr. Ahmed Khan", course: "Advanced Algorithms", time: "08:30 AM - 10:00 AM", room: "CS-101", status: "In Session" },
            { faculty: "Prof. Sarah Malik", course: "Database Systems", time: "10:30 AM - 12:00 PM", room: "Lab-03", status: "Upcoming" },
            { faculty: "Dr. Usman Ali", course: "Machine Learning", time: "01:00 PM - 02:30 PM", room: "CS-205", status: "Cancelled" },
            { faculty: "Ms. Fatima Noor", course: "Software Engineering", time: "02:45 PM - 04:15 PM", room: "CS-102", status: "Postponed" }
          ]
        };
      default:
        throw new Error(`Tool ${name} not implemented.`);
    }
  }

  async chat(prompt: string, history: any[] = [], options: ChatOptions = {}): Promise<{ text: string; sources: any[] }> {
    return this.withRetry(async () => {
      const ai = this.getAI();
      const model = 'gemini-3-pro-preview'; 

      const config: any = {
        systemInstruction: PERSONA_INSTRUCTIONS[options.persona || Persona.ARCHITECT],
        // Recommendation: Avoid setting maxOutputTokens if not required.
        temperature: 0.7,
      };

      if (options.useSearch) {
        config.tools = [{ googleSearch: {} }];
      }

      const contents = [...history];
      const parts: any[] = [{ text: prompt }];
      
      if (options.image) {
        const { mimeType, data } = parseDataUrl(options.image);
        parts.push({ inlineData: { mimeType, data } });
      }

      contents.push({ role: 'user', parts });

      const response = await ai.models.generateContent({ model, contents, config });
      const text = response.text || "No response generated by neural core.";
      
      const sources: any[] = [];
      const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
      if (groundingMetadata?.groundingChunks) {
        groundingMetadata.groundingChunks.forEach((chunk: any) => {
          if (chunk.web) sources.push({ title: chunk.web.title, uri: chunk.web.uri });
        });
      }

      return { text, sources };
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
}

export const gemini = new GeminiService();
