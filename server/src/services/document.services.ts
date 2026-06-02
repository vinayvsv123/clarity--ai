import DocumentModel, { IDocument } from "../models/document.model.js";
import { extractTextFromPDF } from "./pdf.services.js";
import { ChunkService } from "./chunk.services.js";
import { generateEmbedding } from "./embedding.services.js";
import { upsertVectors, deleteVectors } from "./pinecone.services.js";
import path from "path";

interface DocumentData {
    filePath: string;
    userId: string;
    originalName: string;
    fileType: string;
}

/**
 * Processes an uploaded document by:
 * 1. Extracting text (currently supporting PDF)
 * 2. Creating chunked text representation
 * 3. Saving the initial document in MongoDB with 'processing' status
 * 4. Generating Gemini embeddings for each chunk
 * 5. Upserting vector embeddings to Pinecone
 * 6. Storing chunk texts and indexing in MongoDB, setting status to 'ready'
 */
export const processDocument = async (documentData: DocumentData): Promise<IDocument> => {
    let document: IDocument | null = null;
    try {
        console.log(`Starting to process document: ${documentData.originalName}`);

        // 1. Extract text from the PDF file
        let rawText = "";
        const isPdf = documentData.fileType.toLowerCase() === "pdf" || 
                      documentData.fileType.toLowerCase() === "application/pdf" ||
                      documentData.filePath.toLowerCase().endsWith(".pdf");

        if (isPdf) {
            rawText = await extractTextFromPDF(documentData.filePath);
        } else {
            throw new Error(`Unsupported file type: ${documentData.fileType}. Only PDF files are supported currently.`);
        }

        if (!rawText || rawText.trim() === "") {
            throw new Error("Extracted text is empty. Cannot process document.");
        }

        // 2. Chunk the text
        const chunks = ChunkService.chunkText(rawText);
        if (chunks.length === 0) {
            throw new Error("No text chunks generated. Cannot process document.");
        }
        console.log(`Successfully chunked text into ${chunks.length} chunks.`);

        // 3. Create document record in MongoDB with 'processing' status
        const filename = path.basename(documentData.filePath);
        const namespace = `ns-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

        document = new DocumentModel({
            userId: documentData.userId,
            filename: filename,
            originalName: documentData.originalName,
            namespace: namespace,
            totalChunks: chunks.length,
            status: "processing",
            chunks: []
        });

        await document.save();
        const documentId = document._id.toString();
        console.log(`Saved initial document in DB with ID: ${documentId}`);

        // 4. Generate embeddings and prepare vectors for Pinecone
        const vectors = [];
        const savedChunks = [];

        for (const chunk of chunks) {
            console.log(`Generating embedding for chunk ${chunk.chunkIndex + 1}/${chunks.length}`);
            const embedding = await generateEmbedding(chunk.text);
            const pineconeId = `doc-${documentId}-chunk-${chunk.chunkIndex}`;

            vectors.push({
                id: pineconeId,
                values: embedding,
                metadata: {
                    documentId: documentId,
                    chunkIndex: chunk.chunkIndex
                }
            });

            savedChunks.push({
                chunkIndex: chunk.chunkIndex,
                text: chunk.text,
                pineconeId: pineconeId
            });
        }

        // 5. Upsert vectors to Pinecone
        console.log(`Upserting ${vectors.length} vectors to Pinecone...`);
        await upsertVectors(vectors);
        console.log(`Successfully upserted vectors to Pinecone.`);

        // 6. Update MongoDB document with chunks and mark status as 'ready'
        document.chunks = savedChunks;
        document.status = "ready";
        await document.save();
        console.log(`Document processing completed successfully for: ${documentId}`);

        return document;
    } catch (error) {
        console.error(`Error processing document:`, error);
        
        // If document was created in DB, update status to failed
        if (document) {
            try {
                document.status = "failed";
                await document.save();
                console.log(`Updated document status to 'failed' in DB.`);
                
                // Clean up any partially upserted vectors in Pinecone
                console.log(`Attempting to clean up Pinecone vectors for failed document ID: ${document._id}`);
                await deleteVectors(document._id.toString());
            } catch (cleanupError) {
                console.error(`Error during cleanup after document processing failure:`, cleanupError);
            }
        }
        
        throw error;
    }
};

/**
 * Deletes a document from the MongoDB database and its corresponding vectors from Pinecone.
 */
export const deleteDocument = async (documentId: string): Promise<void> => {
    try {
        console.log(`Starting deletion of document: ${documentId}`);
        
        // 1. Delete vectors from Pinecone
        await deleteVectors(documentId);
        
        // 2. Delete document from MongoDB
        const result = await DocumentModel.findByIdAndDelete(documentId);
        if (!result) {
            throw new Error(`Document with ID ${documentId} not found in DB.`);
        }
        
        console.log(`Document ${documentId} and its vectors deleted successfully.`);
    } catch (error) {
        console.error(`Error deleting document ${documentId}:`, error);
        throw error;
    }
};

/**
 * Fetches a document by its MongoDB ID.
 */
export const getDocumentById = async (documentId: string): Promise<IDocument | null> => {
    try {
        return await DocumentModel.findById(documentId);
    } catch (error) {
        console.error(`Error fetching document ${documentId}:`, error);
        throw error;
    }
};

/**
 * Fetches all documents belonging to a specific user.
 */
export const getDocumentsByUser = async (userId: string): Promise<IDocument[]> => {
    try {
        return await DocumentModel.find({ userId });
    } catch (error) {
        console.error(`Error fetching documents for user ${userId}:`, error);
        throw error;
    }
};