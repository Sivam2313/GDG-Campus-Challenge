import { GoogleGenerativeAI } from "@google/generative-ai";
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.error("GOOGLE_API_KEY is not set in environment variables.");
  process.exit(1); 
}

export const genAI = new GoogleGenerativeAI(API_KEY);