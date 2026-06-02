import dotenv from 'dotenv';
import { pinecone } from '../config/pinecone.js';
//import { env } from 'process';
dotenv.config();

const indexName=process.env.PINECONE_INDEX_NAME;

if(!indexName){
    throw new Error('PINECONE_INDEX_NAME is not defined in environment variables');
}

const index = pinecone.index({
      name:indexName
});

interface VectorData {
    id: string;
    values: number[];
    metadata:{
        documentId: string;
        chunkIndex: number;
       // text: string;
    }
}

interface QueryData {
    queryVector: number[];
    topK?: number;
    documentId: string;
}

//storing chunks in pinecone

export const upsertVectors=async(vectors:VectorData[])=>{
    try{
        const response=await index.upsert(
            {
                records:vectors
            }
        );
        console.log('Vectors upserted successfully:', response);
    } 
    catch (error) {
    console.error('Error upserting vectors:', error);
    throw new Error('Failed to upsert vectors');
    }
}

//querying pinecone for similar chunks

export const queryVectors=async({
    queryVector,
    topK=5,
    documentId
}:QueryData)=>{
    try{
        const response=await index.query({
            vector: queryVector,
            topK,
            includeMetadata: true,
            filter: documentId ? {
                documentId: {
                    $eq: documentId
                }
            } : undefined
        });
        return response.matches;
    } 
    catch (error)
     {
        console.error('Error querying vectors:', error);
        throw new Error('Failed to query vectors');
    }
};

//deleting the document

  export const deleteVectors=async(documentId:string)=>{
    try{
        await index.deleteMany({
            filter: {
                documentId: {
                    $eq: documentId
                }
         }
        });
        console.log(`Vectors with documentId ${documentId} deleted successfully`);
    }

    catch(error){
        console.error('Error deleting vectors:', error);
        throw new Error('Failed to delete vectors');
    }
};