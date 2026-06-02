import fs from 'fs';
const pdf = require('pdf-parse');
//import {pdf} from 'pdf-parse';

export const extractTextFromPDF = async (filePath: string): Promise<string> => {
    const dataBuffer= fs.readFileSync(filePath);

    const data=await pdf(dataBuffer);

    return data.text;

};