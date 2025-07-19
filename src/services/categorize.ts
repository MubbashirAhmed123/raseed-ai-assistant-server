import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';
import credentials from '../config/credentials.json';
import { RECEIPT_CATEGORIZATION_PROMPT } from "../constants/prompts";
const GEMINI_API_KEY = credentials.GEMINI_API_KEY

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: GEMINI_API_KEY,
});



export async function categorize(rawText: string) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY environment variable is required');
  }

  console.log(rawText, "rawText in categorize function");

  // Use the separated prompt function
  const combinedPrompt = RECEIPT_CATEGORIZATION_PROMPT(rawText);

  try {
    const response = await ai.models.generateContent({
      model: process.env.MODEL || 'gemini-2.0-flash',
      contents: combinedPrompt,

    });

    console.log('Categorization Response:', response.text);
    return response.text;
  } catch (error) {
    console.error('Error in categorization:', error);
    throw new Error('Failed to categorize receipt data');
  }
}
