import {GoogleGenerativeAI} from "@google/generative-ai";
import dotenv from "dotenv";        

dotenv.config();

const apiKey = process.env.GOOGLE_API_KEY || "";

if(!apiKey) {
   throw new Error("Google API key is not set in environment variables.");
}

const genAI = new GoogleGenerativeAI(apiKey);

export async function generateEmbedding(text: string): Promise<number[]>
 {

    if (!text || text.trim() === "") {
        throw new Error("Text is required for embedding generation.");
    }

    try {

        const model = genAI.getGenerativeModel({
            model: "embedding-001"
        });

        const result = await model.embedContent(text);

        const embedding = result.embedding.values;

        return embedding;

    } 
    catch (error) 
    {
        console.error("Error generating embedding:", error);
        throw new Error("Failed to generate embedding.");
    }
}

