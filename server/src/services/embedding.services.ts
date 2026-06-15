import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import pinecone from "@pinecone-database/pinecone";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    throw new Error("Google API key is not set in environment variables.");
}

const ai = new GoogleGenAI({
    apiKey,
});
console.log('Initialized Google GenAI client');

export async function generateEmbedding(
    text: string
): Promise<number[]> {
    try {
        const response = await ai.models.embedContent({
            model: "gemini-embedding-001",
            contents: text,
            //outputDimensionality: 1024,
        });

        return response.embeddings?.[0]?.values ?? [];
    } catch (error) {
        console.error("Error generating embedding:", error);
        throw new Error("Failed to generate embedding.");
    }
}