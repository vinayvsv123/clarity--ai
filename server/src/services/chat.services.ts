import { generateEmbedding } from '../services/embedding.services.js';
import { queryVectors } from '../services/pinecone.services.js';
import { retrievalChunks } from '../services/retrieval.services.js';
import { askLLM, LLMResponse } from '../services/llm.services.js';
import ChatHistory, { IChatHistory } from '../models/chatHistory.model.js';
import DocumentModel from '../models/document.model.js';

//  Interfaces

export interface ChatRequest {
    userId: string;
    documentId: string;
    question: string;
}

export interface ChatResponse {
    answer: string;
    sourcesUsed: number;
    chatHistoryId: string;
}


//  Main Chat Orchestration 

export const chat = async (chatRequest: ChatRequest): Promise<ChatResponse> => {
    const { userId, documentId, question } = chatRequest;

    if (!userId) {
        throw new Error('userId is required');
    }
    if (!documentId) {
        throw new Error('documentId is required');
    }
    if (!question || question.trim() === '') {
        throw new Error('Question cannot be empty');
    }

    
    let document;
    try {
        document = await DocumentModel.findById(documentId);
    } catch (error) {
        console.error('[Chat] Error fetching document from MongoDB:', error);
        throw new Error('Failed to fetch document. Please try again.');
    }

    if (!document) {
        throw new Error(`Document with ID "${documentId}" not found.`);
    }

    //   Generate Embedding for the Question 

    let queryEmbedding: number[];
    try {
        queryEmbedding = await generateEmbedding(question);
        console.log('embedding successfully genereated');
    } 
    catch (error) {
        console.error('[Chat] Error generating embedding:', error);
        throw new Error(
            'Failed to generate embedding for your question. Please try again.'
        );
    }

    //Query Pinecone for Top-5
    // Declare outside the try-block so `matches` is accessible in the
    // subsequent chunk-retrieval step further down.
    let matches: Awaited<ReturnType<typeof queryVectors>>;
    try {
        matches = await queryVectors({
            queryVector: queryEmbedding,
            topK: 5,
            documentId,
        });
        console.log('pinecone query successfully completed');
    } catch (error) {
        console.error('[Chat] Pinecone query failed:', error);
        throw new Error('Vector search failed. Please try again later.');
    }
    // Retrieve Chunk Texts from MongoDB

    let chunkTexts: string[];
    try {
        console.log('[Chat] Retrieving chunk texts from MongoDB...');

     
        // Pinecone metadata values are typed as RecordMetadataValue
        // (string | number | boolean | string[]). Coerce to the exact
        // primitive types that `pineconematch` / retrievalChunks expects.
        const formattedMatches = matches.map((match) => ({
            Metadata: {
                documentId: String(match.metadata?.documentId ?? documentId),
                chunkIndex: Number(match.metadata?.chunkIndex ?? 0),
            },
        }));

        chunkTexts = await retrievalChunks(formattedMatches);
        console.log('chunk texts successfully retrieved');
    } catch (error) {
        console.error('[Chat] Error retrieving chunks from MongoDB:', error);
        throw new Error(
            'Failed to retrieve document content for context. Please try again.'
        );
    }

    if (!chunkTexts || chunkTexts.length === 0) {
        throw new Error(
            'Could not retrieve relevant document sections. ' +
            'The matching vectors could not be mapped to stored content.'
        );
    }

    //  Generate Answer via LLM 

    let llmResponse: LLMResponse;
    try {
        llmResponse = await askLLM(chunkTexts, question);
        console.log('LLM response successfully generated');
    } 
    catch (error) {
        console.error('[Chat] LLM response generation failed:', error);
        throw new Error(
            'Failed to generate an answer. Please try again.'
        );
    }

    //  Save Chat History 

    let chatHistory: IChatHistory;
    try {
        console.log('[Chat] Saving chat history...');
        const existingHistory = await ChatHistory.findOne({ userId, documentId });

        const userMessage = {
            role: 'user' as const,
            content: question,
            createdAt: new Date(),
        };
        const assistantMessage = {
            role: 'assistant' as const,
            content: llmResponse.answer,
            toolsUsed: ['embedding', 'pinecone-search', 'retrieval', 'llm'],
            createdAt: new Date(),
        };

        if (existingHistory) {
            // Append to the existing conversation thread
            existingHistory.messages.push(userMessage, assistantMessage);
            await existingHistory.save();
            chatHistory = existingHistory;
            
        } else {
            // Create a brand-new conversation thread
            chatHistory = await ChatHistory.create({
                userId,
                documentId,
                messages: [userMessage, assistantMessage],
            });
        }
    } catch (error) {
       
        console.error('[Chat] Error saving chat history:', error);
        return {
            answer: llmResponse.answer,
            sourcesUsed: llmResponse.sourcesUsed,
            chatHistoryId: 'unsaved',
        };
    }

    return {
        answer: llmResponse.answer,
        sourcesUsed: llmResponse.sourcesUsed,
        chatHistoryId: chatHistory._id.toString(),
    };
};

//  Get Chat History

export const getChatHistory = async (
    userId: string,
    documentId: string
): Promise<IChatHistory | null> => {
    if (!userId || !documentId) {
        throw new Error('userId and documentId are required');
    }

    try {
        return await ChatHistory.findOne({ userId, documentId }).sort({ createdAt: -1 });
    } catch (error) {
        console.error(`[Chat] Error fetching chat history for user ${userId}, doc ${documentId}:`, error);
        throw new Error('Failed to retrieve chat history.');
    }
};

//  Get All Chats for a User

export const getAllChatsForUser = async (
    userId: string
): Promise<IChatHistory[]> => {
    if (!userId) {
        throw new Error('userId is required');
    }

    try {
        return await ChatHistory.find({ userId }).sort({ createdAt: -1 });
    } catch (error) {
        console.error(`[Chat] Error fetching all chats for user ${userId}:`, error);
        throw new Error('Failed to retrieve chat history.');
    }
};

//  Delete Chat History


export const deleteChatHistory = async (
    userId: string,
    documentId: string
): Promise<void> => {
    if (!userId || !documentId) {
        throw new Error('userId and documentId are required');
    }

    try {
        const result = await ChatHistory.findOneAndDelete({ userId, documentId });
        if (!result) {
            throw new Error('Chat history not found for the given user and document.');
        }
       
    } catch (error) {
        console.error(`[Chat] Error deleting chat history:`, error);
        throw error;
    }
};

// ─────────────────────────────────────────────────────────────
//  Alias – askQuestion (used by chat.controller.ts)
// ─────────────────────────────────────────────────────────────

/**
 * Named alias for the `chat` function so the controller can call
 * `chatService.askQuestion()` as specified in the API contract.
 */
export const askQuestion = chat;

// ─────────────────────────────────────────────────────────────
//  Get Conversations (enriched summaries)
// ─────────────────────────────────────────────────────────────

/**
 * Retrieves all conversation threads for a user and enriches each
 * with document metadata (original name, last message, last activity).
 *
 * This powers the conversation list / sidebar in the client UI.
 *
 * @param userId - The authenticated user's ID
 * @returns Array of conversation summary objects
 */
export const getConversations = async (userId: string) => {
    if (!userId) {
        throw new Error('userId is required');
    }

    try {
        // Fetch all chat histories for this user, newest first
        const chatHistories = await ChatHistory.find({ userId })
            .sort({ updatedAt: -1 })
            .lean();

        // Enrich each conversation with document metadata
        const conversations = await Promise.all(
            chatHistories.map(async (chat) => {
                // Fetch the associated document's name
                const document = await DocumentModel.findById(chat.documentId)
                    .select('originalName')
                    .lean();

                // Determine the last message in the conversation
                const lastMessage = chat.messages.length > 0
                    ? chat.messages[chat.messages.length - 1]
                    : null;

                return {
                    documentId: chat.documentId,
                    documentName: document?.originalName ?? 'Untitled Document',
                    lastMessage: lastMessage?.content ?? '',
                    lastActivity: lastMessage?.createdAt ?? chat.createdAt,
                };
            })
        );

        return conversations;
    } catch (error) {
        console.error(`[Chat] Error fetching conversations for user ${userId}:`, error);
        throw new Error('Failed to retrieve conversations.');
    }
};
