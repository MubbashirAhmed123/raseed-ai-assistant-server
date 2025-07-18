import { VertexAI } from '@google-cloud/vertexai';
import dotenv from 'dotenv';

dotenv.config();


const vertexAI = new VertexAI({
  project: process.env.PROJECT_ID,
  location: process.env.LOCATION
});

const model = `${process.env.MODEL}`

const generativeModel = vertexAI.preview.getGenerativeModel({
  model,
  generationConfig: {
    maxOutputTokens: 100,
    temperature: 0.9,
    topP: 1,
  },
});

export const streamVertexContent = async (prompt: string, write: (chunk: string) => void) => {
  try {
    const requestPayload = {
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      };
    
      const response = await generativeModel.generateContentStream(requestPayload);
    
      for await (const item of response.stream) {
        const chunk = item?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
        write(chunk);
      }
  } catch (error) {
    console.log(error, 'error');    
    
  }
};
