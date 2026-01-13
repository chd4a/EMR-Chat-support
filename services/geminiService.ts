
import { GoogleGenAI } from "@google/genai";
import { SheetData, Message, Source } from "../types";

const MODEL_NAME = 'gemini-3-flash-preview';

export const generateSupportResponse = async (
  query: string,
  history: Message[],
  sheetData: SheetData | null,
  systemInstruction?: string
): Promise<{ text: string; sources: Source[] }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

  // Format context from sheet if available
  const context = sheetData 
    ? `
    DATABASE CONTEXT (Google Sheets):
    Columns: ${sheetData.headers.join(', ')}
    Data:
    ${sheetData.rows.map(row => row.join(' | ')).join('\n')}
    `
    : "DATABASE CONTEXT: No private database connected. Use general knowledge and web search.";

  const finalSystemInstruction = systemInstruction || `
    You are an elite AI Support Representative for Information Systems' Electronic Medical Records (EMR) department.
    
    OPERATIONAL PROTOCOL:
    1. DATABASE SEARCH: If a private database is provided in the CONTEXT, search it first for specific internal records or protocols.
    2. WEB SEARCH FALLBACK: If the information is not in the private database, or if no database is connected, use the googleSearch tool to find verified medical/technical information.
    3. IDENTITY: You represent the "Information Systems" department.
    
    TONE: Professional, HIPAA-aware (simulated), efficient, and helpful.
    FORMAT: Use clean Markdown.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: [
        { role: 'user', parts: [{ text: `CONTEXT:\n${context}\n\nUSER QUERY: ${query}` }] }
      ],
      config: {
        systemInstruction: finalSystemInstruction,
        temperature: 0.3,
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "I'm sorry, I couldn't process that request.";
    
    const sources: Source[] = [];
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    
    if (groundingChunks) {
      groundingChunks.forEach((chunk: any) => {
        if (chunk.web && chunk.web.uri && chunk.web.title) {
          if (!sources.find(s => s.url === chunk.web.uri)) {
            sources.push({
              title: chunk.web.title,
              url: chunk.web.uri
            });
          }
        }
      });
    }

    return { text, sources };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
