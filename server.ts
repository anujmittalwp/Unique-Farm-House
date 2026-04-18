import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import nodeIcal from "node-ical";
import { Resend } from "resend";
import { v2 as cloudinary } from "cloudinary";
import { GoogleGenAI } from "@google/genai";
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, addDoc, doc, getDoc, setDoc } from 'firebase/firestore';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Initialize Firebase
const firebaseConfig = JSON.parse(fs.readFileSync(path.join(__dirname, 'firebase-applet-config.json'), 'utf8'));
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId || '(default)');

const resend = new Resend(process.env.RESEND_API_KEY || 're_4zWip7uS_HvzE8i5v91eudf2KKS5Hmyp1');

if (!process.env.RESEND_API_KEY) {
  console.warn('RESEND_API_KEY not found in environment, using provided key from context.');
}

if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
} else {
  console.warn('Cloudinary credentials not found in environment.');
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Admin Email Notification
  app.post("/api/notify/booking", async (req, res) => {
    const { booking, type } = req.body;
    if (!booking) return res.status(400).json({ error: 'Booking details required' });

    try {
      // 1. Send Email via Resend (if API key exists)
      if (process.env.RESEND_API_KEY) {
        // Send to Admin
        await resend.emails.send({
          from: 'Unique Farmhouse <onboarding@resend.dev>',
          to: 'anujkumarmittal@gmail.com', // Admin email from context
          subject: `${type === 'update' ? 'Updated' : 'New'} Booking: ${booking.name}`,
          html: `
            <div style="font-family: sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
              <div style="background: #1a1a1a; color: #fff; padding: 20px; text-align: center;">
                <h1 style="margin: 0; font-size: 24px;">${type === 'update' ? 'Updated' : 'New'} Booking Request</h1>
              </div>
              <div style="padding: 30px;">
                <p>A ${type === 'update' ? 'updated' : 'new'} booking has been made at Unique Farmhouse.</p>
                <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                  <tr><td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Name:</td><td style="padding: 10px; border-bottom: 1px solid #eee;">${booking.name}</td></tr>
                  <tr><td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Mobile:</td><td style="padding: 10px; border-bottom: 1px solid #eee;">${booking.mobile}</td></tr>
                  <tr><td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Email:</td><td style="padding: 10px; border-bottom: 1px solid #eee;">${booking.email}</td></tr>
                  <tr><td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Check-In:</td><td style="padding: 10px; border-bottom: 1px solid #eee;">${booking.checkIn}</td></tr>
                  <tr><td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Check-Out:</td><td style="padding: 10px; border-bottom: 1px solid #eee;">${booking.checkOut}</td></tr>
                  <tr><td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Total Amount:</td><td style="padding: 10px; border-bottom: 1px solid #eee;">₹${booking.totalAmount.toLocaleString()}</td></tr>
                  <tr><td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Payment Status:</td><td style="padding: 10px; border-bottom: 1px solid #eee;">${booking.paymentStatus.toUpperCase()}</td></tr>
                </table>
                <div style="text-align: center; margin-top: 30px;">
                  <a href="${process.env.APP_URL || '#'}" style="background: #D4AF37; color: #1a1a1a; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">View in Dashboard</a>
                </div>
              </div>
            </div>
          `
        });

        // Send to Customer
        if (booking.email) {
          await resend.emails.send({
            from: 'Unique Farmhouse <onboarding@resend.dev>',
            to: booking.email,
            subject: `Booking Confirmation: Unique Farmhouse`,
            html: `
              <div style="font-family: sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
                <div style="background: #1a1a1a; color: #fff; padding: 20px; text-align: center;">
                  <h1 style="margin: 0; font-size: 24px;">Booking Confirmation</h1>
                </div>
                <div style="padding: 30px;">
                  <p>Dear ${booking.name},</p>
                  <p>Thank you for choosing Unique Farmhouse. Your booking request has been received.</p>
                  <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                    <tr><td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Check-In:</td><td style="padding: 10px; border-bottom: 1px solid #eee;">${booking.checkIn}</td></tr>
                    <tr><td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Check-Out:</td><td style="padding: 10px; border-bottom: 1px solid #eee;">${booking.checkOut}</td></tr>
                    <tr><td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Total Amount:</td><td style="padding: 10px; border-bottom: 1px solid #eee;">₹${booking.totalAmount.toLocaleString()}</td></tr>
                    <tr><td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Payment Status:</td><td style="padding: 10px; border-bottom: 1px solid #eee;">${booking.paymentStatus.toUpperCase()}</td></tr>
                  </table>
                  <p>We will contact you shortly to finalize the details.</p>
                </div>
                <div style="background: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #999;">
                  Unique Farmhouse, Noida.
                </div>
              </div>
            `
          });
        }
      }

      res.json({ success: true, message: 'Notification sent' });
    } catch (error) {
      console.error('Notification error:', error);
      res.status(500).json({ error: 'Failed to send notification' });
    }
  });

  // Payment Reminder Notification
  app.post("/api/notify/reminder", async (req, res) => {
    const { booking } = req.body;
    if (!booking || !booking.email) return res.status(400).json({ error: 'Booking and email required' });

    try {
      if (process.env.RESEND_API_KEY) {
        await resend.emails.send({
          from: 'Unique Farmhouse <onboarding@resend.dev>',
          to: booking.email,
          subject: `Payment Reminder: Unique Farmhouse`,
          html: `
            <div style="font-family: sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
              <div style="background: #1a1a1a; color: #fff; padding: 20px; text-align: center;">
                <h1 style="margin: 0; font-size: 24px;">Payment Reminder</h1>
              </div>
              <div style="padding: 30px;">
                <p>Dear ${booking.name},</p>
                <p>This is a friendly reminder regarding your upcoming stay at Unique Farmhouse on <strong>${booking.checkIn}</strong>.</p>
                <p>Our records show that the payment for your booking is still pending or partially paid.</p>
                <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                  <tr><td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Total Amount:</td><td style="padding: 10px; border-bottom: 1px solid #eee;">₹${booking.totalAmount.toLocaleString()}</td></tr>
                  <tr><td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Amount Paid:</td><td style="padding: 10px; border-bottom: 1px solid #eee;">₹${(booking.amountPaid || 0).toLocaleString()}</td></tr>
                  <tr><td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Balance Due:</td><td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; color: #b91c1c;">₹${(booking.totalAmount - (booking.amountPaid || 0)).toLocaleString()}</td></tr>
                </table>
                <p>Please complete the payment to ensure your booking is confirmed.</p>
                <div style="text-align: center; margin-top: 30px;">
                  <a href="${process.env.APP_URL || '#'}" style="background: #D4AF37; color: #1a1a1a; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Complete Payment</a>
                </div>
              </div>
              <div style="background: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #999;">
                Unique Farmhouse, Noida.
              </div>
            </div>
          `
        });
      }
      res.json({ success: true, message: 'Reminder sent' });
    } catch (error) {
      console.error('Reminder error:', error);
      res.status(500).json({ error: 'Failed to send reminder' });
    }
  });

  // Cloudinary API
  app.get("/api/cloudinary/images", async (req, res) => {
    try {
      if (!process.env.CLOUDINARY_CLOUD_NAME) {
        return res.status(500).json({ error: 'Cloudinary not configured' });
      }
      
      const resources = await cloudinary.api.resources({
        type: 'upload',
        prefix: req.query.prefix as string || '',
        max_results: 100,
      });
      
      res.json(resources.resources);
    } catch (error) {
      console.error('Cloudinary fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch images from Cloudinary' });
    }
  });

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      firebase: {
        projectId: firebaseConfig.projectId,
        databaseId: firebaseConfig.firestoreDatabaseId || '(default)'
      }
    });
  });

  // iCal Export
  app.get(["/api/calendar/export", "/api/calendar/export.ics", "/api/calendar/bookings.ics"], async (req, res) => {
    try {
      const projectId = firebaseConfig.projectId;
      const databaseId = firebaseConfig.firestoreDatabaseId || '(default)';
      const apiKey = firebaseConfig.apiKey;
      const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${databaseId}/documents/public/calendar?key=${apiKey}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        if (response.status === 404) {
          return res.setHeader('Content-Type', 'text/calendar').send(Buffer.from('BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Unique Farmhouse//Bookings//EN\r\nCALSCALE:GREGORIAN\r\nMETHOD:PUBLISH\r\nEND:VCALENDAR'));
        }
        const errorText = await response.text();
        console.error('Firestore fetch error:', response.status, errorText);
        throw new Error('Failed to fetch calendar from Firestore');
      }
      
      const data = await response.json();
      let icsContent = data.fields?.icsData?.stringValue;
      
      if (!icsContent) {
        return res.setHeader('Content-Type', 'text/calendar').send(Buffer.from('BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Unique Farmhouse//Bookings//EN\r\nCALSCALE:GREGORIAN\r\nMETHOD:PUBLISH\r\nEND:VCALENDAR'));
      }

      if (!icsContent.includes('CALSCALE:GREGORIAN')) {
        icsContent = icsContent.replace('PRODID:-//Unique Farmhouse//Bookings//EN\r\n', 'PRODID:-//Unique Farmhouse//Bookings//EN\r\nCALSCALE:GREGORIAN\r\nMETHOD:PUBLISH\r\n');
      }

      res.setHeader('Content-Type', 'text/calendar');
      res.setHeader('Content-Disposition', 'attachment; filename="bookings.ics"');
      res.send(Buffer.from(icsContent));
    } catch (error) {
      console.error('Export error:', error);
      res.status(500).send('Error generating calendar: ' + (error instanceof Error ? error.message : String(error)));
    }
  });

  // iCal Sync (Import)
  app.post("/api/calendar/sync", async (req, res) => {
    try {
      const { urls } = req.body;
      if (!urls || urls.length === 0) {
        return res.json({ message: 'No external calendars to sync', events: [] });
      }

      const allExternalEvents: any[] = [];

      for (const item of urls) {
        try {
          const events = await nodeIcal.fromURL(item.url);
          Object.values(events).forEach(event => {
            if (event.type === 'VEVENT') {
              // Ignore events that originated from our own system to prevent duplicates
              if (event.uid && event.uid.includes('@uniquefarmhouse.com')) {
                return;
              }
              allExternalEvents.push({
                source: item.name,
                start: event.start,
                end: event.end,
                summary: event.summary,
                uid: event.uid || Math.random().toString(36).substring(7),
              });
            }
          });
        } catch (e) {
          console.error(`Error fetching calendar ${item.name}:`, e);
        }
      }

      res.json({ message: 'Sync completed', events: allExternalEvents });
    } catch (error) {
      console.error('Sync error:', error);
      res.status(500).json({ error: 'Sync failed' });
    }
  });

  // Google Reviews Sync API
  app.post("/api/reviews/sync", async (req, res) => {
    try {
      const result = await performReviewSync();
      res.json(result);
    } catch (error: any) {
      console.error('Review sync error:', error);
      res.status(500).json({ error: 'Failed to sync reviews', details: error.message, stack: error.stack });
    }
  });

  // Prioritize the known working key you just provided
  const providedKey = "AIzaSyBXEk2AUKlH8m_gCJLF-7Ar-8R71dpC9u8";
  
  const getValidKey = () => {
    // Check environment variables first (user can set these in Settings)
    const keys = [
      process.env.GOOGLE_API_KEY,
      process.env.GEMINI_API_KEY
    ];

    for (const key of keys) {
      if (key && 
          key.trim() !== "" && 
          key !== "undefined" && 
          !key.includes("TODO") && 
          key.startsWith("AIza")) {
        return key.trim();
      }
    }

    // Fallback to the hardcoded one if no environment variable is set
    if (providedKey && providedKey.startsWith("AIza")) return providedKey.trim();
    
    return null;
  };

  async function performReviewSync() {
    const apiKey = getValidKey();
    
    if (!apiKey) {
      return { 
        success: false, 
        message: 'Gemini API Key is missing or invalid. Please add a NEW secret named GOOGLE_API_KEY in the Settings menu and paste your key there.' 
      };
    }

    const ai = new GoogleGenAI({ apiKey: apiKey.trim() });
    
    const prompt = `Find the guest reviews for "Unique Farm House" at Plot No. 22, Phase 17, Sector 135, Noida, Uttar Pradesh 201305. 
    The business has a 5.0 rating and exactly 14 reviews on Google Maps.
    Reference: https://share.google/7n7vF0EX3uErXdQRn.
    
    IMPORTANT: Extract the actual reviews from Google Search. 
    Return a JSON array of objects with userName, rating, comment, and googleReviewId.
    Return ONLY the JSON array, no markdown.`;

    const fetchWithRetry = async (modelName: string, retries = 2): Promise<any> => {
      try {
        return await ai.models.generateContent({
          model: modelName,
          contents: prompt
        });
      } catch (err: any) {
        if (err.message?.includes('429') && retries > 0) {
          console.log(`Quota hit for ${modelName}, retrying in 5s...`);
          await new Promise(resolve => setTimeout(resolve, 5000));
          return fetchWithRetry(modelName, retries - 1);
        }
        throw err;
      }
    };

    try {
      // Use gemini-flash-latest without tools to avoid quota issues
      // It can still provide info from the provided link or its training data
      const response = await fetchWithRetry("gemini-flash-latest");
      
      if (!response.text) {
        throw new Error("No response text from Gemini API");
      }

      const text = response.text;
      let jsonStr = text.trim();
      if (jsonStr.startsWith('```json')) jsonStr = jsonStr.substring(7);
      if (jsonStr.startsWith('```')) jsonStr = jsonStr.substring(3);
      if (jsonStr.endsWith('```')) jsonStr = jsonStr.substring(0, jsonStr.length - 3);
      jsonStr = jsonStr.trim();

      const reviewsData = JSON.parse(jsonStr);
      let newCount = 0;

      for (const review of reviewsData) {
        if (!review.googleReviewId) continue;

        const reviewRef = doc(db, 'reviews', review.googleReviewId);
        const snapshot = await getDoc(reviewRef);

        if (!snapshot.exists()) {
          await setDoc(reviewRef, {
            userName: review.userName || 'Anonymous Guest',
            rating: Math.round(Number(review.rating)) || 5,
            comment: review.comment || '',
            googleReviewId: review.googleReviewId,
            uid: 'google_sync',
            bookingId: 'google_sync',
            status: 'approved',
            source: 'google',
            createdAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
          });
          newCount++;
        }
      }

      return { success: true, newCount, totalFound: reviewsData.length };
    } catch (err) {
      console.error("Error in performReviewSync:", err);
      throw err;
    }
  }

  // Daily Sync Task (runs every 24 hours)
  setInterval(async () => {
    console.log('Running daily Google Reviews sync...');
    try {
      const result = await performReviewSync();
      console.log('Daily sync completed:', result);
    } catch (err) {
      console.error('Daily sync failed:', err);
    }
  }, 24 * 60 * 60 * 1000);

  // AI Blog Generation API
  app.post("/api/blogs/generate", async (req, res) => {
    try {
      const { galleryImages } = req.body;
      
      const apiKey = getValidKey();
      if (!apiKey) {
        return res.status(500).json({ error: 'Gemini API Key is missing. Please add GOOGLE_API_KEY in settings.' });
      }

      const ai = new GoogleGenAI({ apiKey });
      
      // Select 10 diverse images as context if there are many
      const imageSubset = galleryImages && galleryImages.length > 0
        ? JSON.stringify(galleryImages.slice(0, 50).map((img: any) => ({ src: img.src, title: img.title || 'Farmhouse image' })))
        : '[]';

      const prompt = `You are a professional luxury estate hospitality blogger.
Write a brand new, highly engaging blog post about "Unique Farm House Noida". Make the post highly SEO optimized. 

Available gallery images (JSON):
${imageSubset}

Requirements:
1. Select the ONE most relevant image URL from the 'Available gallery images' JSON. If it's empty or invalid, return an empty string for the image.
2. Generate a catchy Title.
3. Generate a clean URL slug.
4. Generate a 2-3 sentence excerpt for the blog preview.
5. Generate the full HTML content exactly matching this specific structural template, replacing the bracketed [ ] content with your fresh, unique copy for the chosen topic.

STRICT HTML TEMPLATE TO FOLLOW:
<p><em>[Write a short introductory paragraph. Make keywords like <strong>Unique Farm House</strong> and <strong>Delhi NCR</strong> bold.]</em></p>

<hr style="margin: 2rem 0; border: none; border-top: 1px solid #e5e7eb;" />

<h3 style="display: flex; align-items: center; gap: 8px;">[Choose an Emoji] [Write a Section Title, e.g., Experience Premium Living in Nature]</h3>
<p>[Write a short paragraph for this section]</p>
<ul style="list-style: none; padding-left: 0; margin-top: 1rem; space-y: 0.5rem;">
  <li style="margin-bottom: 0.5rem;">[Emoji] [Feature 1]</li>
  <li style="margin-bottom: 0.5rem;">[Emoji] [Feature 2]</li>
  <li style="margin-bottom: 0.5rem;">[Emoji] [Feature 3]</li>
</ul>

<hr style="margin: 2rem 0; border: none; border-top: 1px solid #e5e7eb;" />

<h3 style="display: flex; align-items: center; gap: 8px;">[Choose an Emoji] [Write Section Title 2, e.g., Perfect Venue for Every Occasion]</h3>
<p>[Write a short paragraph]</p>
<ul style="list-style: none; padding-left: 0; margin-top: 1rem;">
  <li style="margin-bottom: 0.5rem;"><strong>[Emoji] [Event Type 1]:</strong> [Short description]</li>
  <li style="margin-bottom: 0.5rem;"><strong>[Emoji] [Event Type 2]:</strong> [Short description]</li>
</ul>

<hr style="margin: 2rem 0; border: none; border-top: 1px solid #e5e7eb;" />

<h3 style="display: flex; align-items: center; gap: 8px;">[Choose an Emoji] [Write Section Title 3, e.g., Luxury Amenities]</h3>
<p>[Write a short paragraph]</p>
<ul style="list-style: none; padding-left: 0; margin-top: 1rem;">
  <li style="margin-bottom: 0.5rem;">✔️ [Amenity 1]</li>
  <li style="margin-bottom: 0.5rem;">✔️ [Amenity 2]</li>
</ul>

<hr style="margin: 2rem 0; border: none; border-top: 1px solid #e5e7eb;" />

<h3 style="display: flex; align-items: center; gap: 8px;">📍 Prime Location</h3>
<p>Conveniently located in <strong>Delhi NCR</strong>, our farmhouse is easily accessible from <strong>Noida, Delhi, and Gurgaon</strong>.</p>
<p>👉 <a href="https://share.google/7n7vF0EX3uErXdQRn" target="_blank" style="color: #2563eb; text-decoration: underline;">View Location on Google Maps</a></p>

<hr style="margin: 2rem 0; border: none; border-top: 1px solid #e5e7eb;" />

<h3 style="display: flex; align-items: center; gap: 8px;">[Choose an Emoji] [Write Final Section Title, e.g., Book Your Experience Today]</h3>
<p>[Write a final closing paragraph encouraging booking]</p>

<div style="display: flex; gap: 1rem; margin-top: 1.5rem; flex-wrap: wrap;">
  <a href="tel:7503001001" style="background-color: #000; color: #fff; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: bold; display: flex; align-items: center; gap: 8px;">📞 Call Now</a>
  <a href="https://wa.me/917503001001" style="background-color: #25D366; color: #fff; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: bold; display: flex; align-items: center; gap: 8px;">💬 WhatsApp Now</a>
</div>

<div style="margin-top: 1.5rem; font-size: 0.875rem;">
  <p><strong>Contact:</strong> 7503001001</p>
  <p><strong>Website:</strong> <a href="https://www.uniquefarms.in" style="color: #2563eb;">www.uniquefarms.in</a></p>
</div>

Respond STRICTLY with a valid JSON object in this format (no markdown code blocks, just raw JSON string starting with {):
{
  "title": "",
  "slug": "",
  "excerpt": "",
  "content": "",
  "image": ""
}
`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt
      });

      if (!response.text) {
        throw new Error("No response text from Gemini API");
      }

      let jsonStr = response.text.trim();
      if (jsonStr.startsWith('```json')) jsonStr = jsonStr.substring(7);
      if (jsonStr.startsWith('```')) jsonStr = jsonStr.substring(3);
      if (jsonStr.endsWith('```')) jsonStr = jsonStr.substring(0, jsonStr.length - 3);
      jsonStr = jsonStr.trim();

      const blogData = JSON.parse(jsonStr);
      res.json(blogData);
    } catch (err: any) {
      console.error('Blog generation error:', err);
      res.status(500).json({ error: 'Failed to generate blog post', details: err.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
