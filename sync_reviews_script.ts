import { GoogleGenAI } from "@google/genai";
import { initializeApp } from 'firebase/app';
import { initializeFirestore, collection, addDoc } from 'firebase/firestore';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, config.firestoreDatabaseId || '(default)');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function fetchReviews(searchPrompt: string, retryCount = 0): Promise<any[]> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: searchPrompt + "\n\nReturn ONLY a valid JSON array. Do not include markdown formatting like ```json.",
      config: {
        tools: [{ googleSearch: {} }],
      }
    });

    if (!response.text) {
      console.log("No response text from AI for prompt:", searchPrompt.substring(0, 50) + "...");
      return [];
    }
    
    let jsonStr = response.text.trim();
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.substring(7);
    }
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.substring(3);
    }
    if (jsonStr.endsWith('```')) {
      jsonStr = jsonStr.substring(0, jsonStr.length - 3);
    }
    jsonStr = jsonStr.trim();
    
    const parsed = JSON.parse(jsonStr);
    console.log(`Found ${parsed.length} reviews from AI.`);
    return parsed;
  } catch (err: any) {
    console.error("Error in fetchReviews:", err);
    if (err?.message?.includes('429') || err?.message?.includes('RESOURCE_EXHAUSTED')) {
      if (retryCount < 2) {
        console.log(`Quota hit, retrying in ${5 * (retryCount + 1)}s...`);
        await new Promise(resolve => setTimeout(resolve, 5000 * (retryCount + 1)));
        return fetchReviews(searchPrompt, retryCount + 1);
      }
    }
    return [];
  }
}

async function sync() {
  const primaryPrompt = `Search for the guest reviews for "Unique Farm House" located at Plot No. 22, Phase 17, Sector 135, Noida, Uttar Pradesh 201305. 
  Reference: https://share.google/7n7vF0EX3uErXdQRn.
  
  IMPORTANT: ONLY include reviews for this specific location. DO NOT include reviews for "Elivaas".
  Extract the reviewer names, ratings, and the full text of each review.
  
  Return a JSON array of objects with userName, rating, comment, and googleReviewId.`;

  let reviewsData = await fetchReviews(primaryPrompt);

  if (reviewsData.length < 5) {
    console.log("Few reviews found, retrying with broader terms...");
    const generalPrompt = `Search for the reviews of "Unique Farm House" in Sector 135, Noida, Plot No. 22. 
    Reference: https://share.google/7n7vF0EX3uErXdQRn.
    Find the guest testimonials and ratings for the specific "Unique Farm House" location. 
    Return a JSON array of objects with userName, rating, comment, and googleReviewId.`;
    const additionalReviews = await fetchReviews(generalPrompt);
    
    const existingIds = new Set(reviewsData.map((r: any) => r.googleReviewId));
    additionalReviews.forEach((r: any) => {
      if (!existingIds.has(r.googleReviewId)) {
        reviewsData.push(r);
      }
    });
  }

  for (const review of reviewsData) {
    try {
      if (!review.googleReviewId || typeof review.googleReviewId !== 'string') {
        continue;
      }
      
      const now = new Date();
      const formattedDate = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}, ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
      
      await addDoc(collection(db, 'reviews'), {
        userName: review.userName || 'Anonymous',
        rating: Math.round(Number(review.rating)) || 5,
        comment: review.comment || '',
        googleReviewId: review.googleReviewId,
        uid: 'google_sync',
        bookingId: 'google_sync',
        status: 'approved',
        source: 'google',
        createdAt: formattedDate
      });
      console.log('Added review:', review.userName);
    } catch (e) {
      console.error('Error adding review:', e);
    }
  }
  console.log('Done syncing');
}

sync();
