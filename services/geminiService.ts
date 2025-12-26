
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const parseDrawingCommand = async (prompt: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Parse the following user request into a list of geometric entities for a CAD program.
    Request: "${prompt}"
    
    Coordinate system: X increases right, Y increases down (browser canvas style).
    Available types: 'line', 'circle', 'rect'.
    Colors should be hex codes.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING, enum: ['line', 'circle', 'rect'] },
            params: {
              type: Type.OBJECT,
              properties: {
                x1: { type: Type.NUMBER },
                y1: { type: Type.NUMBER },
                x2: { type: Type.NUMBER },
                y2: { type: Type.NUMBER },
                cx: { type: Type.NUMBER },
                cy: { type: Type.NUMBER },
                radius: { type: Type.NUMBER },
              },
              required: [],
            },
            color: { type: Type.STRING },
          },
          required: ['type', 'params'],
        },
      },
    },
  });

  try {
    return JSON.parse(response.text);
  } catch (e) {
    console.error("Failed to parse AI response", e);
    return [];
  }
};
