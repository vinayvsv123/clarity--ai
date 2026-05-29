import { Pinecone } from '@pinecone-database/pinecone';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.PINECONE_API_KEY;

if (!apiKey) {
    throw new Error('Missing Pinecone credentials in environment variables');
}

export const pinecone = new Pinecone({
    apiKey
});