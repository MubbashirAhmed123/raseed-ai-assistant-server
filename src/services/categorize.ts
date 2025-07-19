import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
    apiKey:'AIzaSyCMWvCoyeXUvp3m7r4XEBMcEDvXVF-1irI'
});

export async function categorize(prompt:string) {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });
  console.log(response.text);
  return response.text
}

