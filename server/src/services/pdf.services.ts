import fs from 'fs';
import { PDFParse } from 'pdf-parse';

export const extractTextFromPDF = async (
    filePath: string
): Promise<string> => {
    try{
    console.log(`Extracting text from PDF: ${filePath}`);
    const dataBuffer = await fs.promises.readFile(filePath);
    const parser = new PDFParse({ data: dataBuffer });
    const result = await parser.getText();
  
    await parser.destroy();
    return result.text;
    }
    catch(error)
    {
        console.error(`Error extracting text from PDF:`, error);
        throw error;
    }
};