import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function testFetch() {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Find the Google Maps listing for "Unique Farm House" at Plot No. 22, Phase 17, Sector 135, Noida, Uttar Pradesh 201305. 
      It has 14 reviews and a 5.0 rating.
      Extract all 14 reviews.
      Return ONLY a JSON array of objects with userName, rating, comment, and googleReviewId. Do not include markdown.`,
      config: {
        tools: [{ googleSearch: {} }],
      }
    });
    console.log(response.text);
  } catch (e) {
    console.error(e);
  }
}

testFetch();
