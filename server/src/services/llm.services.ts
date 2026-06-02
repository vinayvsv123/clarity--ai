import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    throw new Error('GEMINI_API_KEY is missing in environment variables');
}

const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash"
});

// ─── Types 

export interface LLMResponse {
    answer: string;
    sourcesUsed: number;
}

// Prompt for llm


export function buildPrompt(chunks: string[], userQuestion: string): string {
    const numberedContext = chunks
        .map((chunk, i) => `[Source ${i + 1}]\n${chunk}`)
        .join('\n\n');

    return `You are **Clarity AI**, an intelligent document assistant.
Your job is to answer the user's question **using only** the provided document context below.

### Rules
1. Base your answer **solely** on the context provided. Do **not** use outside knowledge.
2. If the context does not contain enough information to answer, say:
   "I couldn't find enough information in the document to answer that question."
3. When referencing information, cite the source number (e.g. [Source 1]).
4. Keep your answer clear, concise, and well-structured. Use bullet points or numbered lists when appropriate.
5. If the question is ambiguous, make a reasonable interpretation and state your assumption.

---

### Document Context

${numberedContext}

---

### User Question

${userQuestion}
`;
}

// Main LLM Service

export async function askLLM(
    chunks: string[],
    userQuestion: string
): Promise<LLMResponse> {
    if (!userQuestion || userQuestion.trim() === '') {
        throw new Error('User question is required');
    }

    if (!chunks || chunks.length === 0) {
        throw new Error('No context chunks provided for the LLM');
    }

    try {
        const prompt = buildPrompt(chunks, userQuestion);

        const result = await model.generateContent(prompt);
        const response = result.response;
        const answer = response.text();

        return {
            answer,
            sourcesUsed: chunks.length,
        };
    } 
    catch (error) 
    {
        console.error('Error generating LLM response:', error);
        throw new Error('Failed to generate response from LLM');
    }
}
