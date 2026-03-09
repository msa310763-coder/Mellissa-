import { GoogleGenAI } from "@google/genai";

export const IMAGE_MODEL = "gemini-2.5-flash-image";

export class GeminiService {
  private ai: GoogleGenAI | null = null;

  constructor(apiKey: string) {
    if (apiKey && apiKey !== 'undefined' && apiKey.length > 10) {
      this.ai = new GoogleGenAI({ apiKey });
    }
  }

  async transformOutfit(base64Image: string, mimeType: string, outfitDescription: string) {
    if (!this.ai) {
      throw new Error("API Key is missing. Please provide a valid Gemini API Key.");
    }

    try {
      const response = await this.ai.models.generateContent({
        model: IMAGE_MODEL,
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Image.split(',')[1] || base64Image,
                mimeType: mimeType,
              },
            },
            {
              text: `High-end fashion photography retouching. 
              Task: Replace the subject's current outfit with: ${outfitDescription}.
              Style: Editorial, professional studio lighting, 8k resolution, highly detailed fabric textures.
              Technical requirements: 
              - Maintain the exact pose, facial features, and body proportions of the person.
              - Render materials like ${outfitDescription.includes('transparent') ? 'sheer organza, translucent chiffon, and delicate lace' : 'high-quality textiles'} with realistic transparency and light refraction.
              - Ensure the background remains consistent with the original image.
              - The result must be a sophisticated, artistic fashion edit.
              Output the final transformed image.`,
            },
          ],
        },
      });

      const candidate = response.candidates?.[0];
      
      // Check if the request was blocked by safety filters
      if (candidate?.finishReason === 'SAFETY') {
        throw new Error("Permintaan Anda terdeteksi sebagai konten sensitif oleh sistem keamanan AI. Silakan gunakan deskripsi yang lebih artistik atau fokus pada gaya busana.");
      }

      const part = candidate?.content?.parts?.find(p => p.inlineData);
      if (part?.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }

      // If AI returned text instead of an image (usually a refusal)
      const textPart = candidate?.content?.parts?.find(p => p.text);
      if (textPart?.text) {
        throw new Error(`AI Refusal: ${textPart.text}`);
      }

      throw new Error("AI tidak dapat menghasilkan gambar untuk deskripsi ini. Silakan coba deskripsi yang berbeda atau lebih spesifik.");
    } catch (error: any) {
      console.error("Outfit transformation failed:", error);
      throw new Error(error.message || "Gagal melakukan transformasi pakaian.");
    }
  }
}
