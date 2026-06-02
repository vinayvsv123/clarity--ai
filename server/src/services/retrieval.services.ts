import DocumentModel from "../models/document.model.js"

interface pineconematch{
    Metadata:{
        documentId: string;
        chunkIndex: number;
       // text: string;
    }
}
export const retrievalChunks=async(matches:pineconematch[]):Promise<string[]> => {
    try{
        if(!matches || matches.length === 0){
            return [];
        }

        const documentId=matches[0].Metadata.documentId;
        if(!documentId){
          throw new Error('Document ID is missing in metadata');
        }

        const document=await DocumentModel.findById(documentId);
        if(!document){
          throw new Error('Document not found');
        }
        
        const chunkTexts: string[] = [];

        for(const match of matches)
        {

            const chunkIndex=match.Metadata.chunkIndex;
            const chunk=document.chunks.find(c=>c.chunkIndex===chunkIndex);

            if(chunk){
                chunkTexts.push(chunk.text);
            } 
            else {
                console.warn(`Chunk with index ${chunkIndex} not found in document ${documentId}`);
            }
       }
      return chunkTexts;

    } 
    
    catch (error) 
    {
        console.error('Error occurred while retrieving chunks:', error);
        throw new Error('Failed to retrieve chunks');
    }
}