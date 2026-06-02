import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;

export const getAI = () => {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Gemini API key is not configured.");
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
};

// Global state to track quota exhaustion session-wide
let quotaExceeded = false;
let quotaResetTime: number | null = null;

export const isQuotaExceeded = () => {
  if (quotaExceeded && quotaResetTime && Date.now() > quotaResetTime) {
    quotaExceeded = false;
    quotaResetTime = null;
  }
  return quotaExceeded;
};

export const handleAIError = (error: any) => {
  const errorMessage = String(error?.message || error || "");
  console.log("AI Error detected:", errorMessage);

  if (errorMessage.includes("429") || errorMessage.includes("RESOURCE_EXHAUSTED") || errorMessage.includes("quota")) {
    quotaExceeded = true;
    // Set a reset time for 1 hour from now for this session (generous estimate)
    quotaResetTime = Date.now() + (60 * 60 * 1000);
    return "API Quota exceeded for the free tier. Please try again later or provide a custom API key.";
  }

  if (errorMessage.includes("503") || errorMessage.includes("UNAVAILABLE") || errorMessage.includes("overloaded")) {
    return "The AI service is currently overloaded. Retrying might help.";
  }

  return errorMessage || "An unexpected AI error occurred.";
};

/**
 * Executes a Gemini request with built-in retry and quota management.
 */
export async function safeAiCall<T = any>(
  call: () => Promise<T>,
  retries = 2,
  delay = 2000
): Promise<T> {
  if (isQuotaExceeded()) {
    throw new Error("AI Quota exceeded. Please wait before trying again.");
  }

  try {
    return await call();
  } catch (error: any) {
    const msg = handleAIError(error);
    
    // If it's a transient error (not quota), we can retry
    const isTransient = msg.includes("overloaded") || msg.includes("UNAVAILABLE");
    
    if (isTransient && retries > 0) {
      console.log(`AI Transient Issue: ${msg}. Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return safeAiCall(call, retries - 1, delay * 2);
    }
    
    throw error;
  }
}
