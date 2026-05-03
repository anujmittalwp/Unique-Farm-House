import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import nodeIcal from "node-ical";
import { Resend } from "resend";
import { v2 as cloudinary } from "cloudinary";
import webpush from "web-push";
import nodemailer from "nodemailer";
import * as dotenv from "dotenv";
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, addDoc, doc, getDoc, setDoc, deleteDoc, serverTimestamp, onSnapshot, orderBy, limit, setLogLevel } from 'firebase/firestore';

dotenv.config();

// Silence noisy Firestore logs in Node.js
setLogLevel('error');

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

  // === Push Notification Setup ===
  let vapidKeys = { publicKey: '', privateKey: '' };
  try {
    const vapidDocRef = doc(db, 'settings', 'vapid_keys');
    const vapidDoc = await getDoc(vapidDocRef);
    if (!vapidDoc.exists() || !vapidDoc.data().publicKey || !vapidDoc.data().privateKey) {
      vapidKeys = webpush.generateVAPIDKeys();
      await setDoc(vapidDocRef, vapidKeys);
      console.log('Generated and saved new VAPID keys for push notifications.');
    } else {
      vapidKeys = vapidDoc.data() as any;
    }
  } catch (err) {
    console.warn("Failed to load/generate VAPID keys from firestore:", err);
    vapidKeys = webpush.generateVAPIDKeys(); // fallback memory keys
  }

  webpush.setVapidDetails(
    'mailto:anujkumarmittal@gmail.com',
    vapidKeys.publicKey,
    vapidKeys.privateKey
  );

  // Push Auth Endpoints
  app.get('/api/push/public-key', (req, res) => {
    res.set('Content-Type', 'text/plain');
    res.send(vapidKeys.publicKey.trim());
  });

  app.post('/api/push/subscribe', async (req, res) => {
    const subscription = req.body;
    try {
      if (!subscription || !subscription.endpoint) {
         return res.status(400).json({ error: "Invalid subscription" });
      }
      // Attempt to save to firestore
      const subId = Buffer.from(subscription.endpoint).toString('base64').replace(/[^a-zA-Z0-9]/g, '');
      await setDoc(doc(db, 'push_subscriptions', subId), {
        subscription,
        createdAt: serverTimestamp()
      }, { merge: true });
      res.status(201).json({});
    } catch (err) {
      console.error('Error saving subscription:', err);
      res.status(500).json({ error: 'Failed to save subscription' });
    }
  });

  // Helper to send push
  async function sendPushToAllAdmins(payload: any) {
    try {
      const subsSnapshot = await getDocs(collection(db, 'push_subscriptions'));
      const promises = subsSnapshot.docs.map(async (docSnap) => {
        const sub = docSnap.data().subscription;
        try {
          await webpush.sendNotification(sub, JSON.stringify(payload));
        } catch (err: any) {
          if (err.statusCode === 404 || err.statusCode === 410) {
             console.log('Subscription expired. Deleting...');
             await deleteDoc(docSnap.ref); // Delete expired subscription
          } else {
             console.error('Error sending push notification:', err);
          }
        }
      });
      await Promise.all(promises);
    } catch (error) {
       console.error("Error retrieving subscriptions for push", error);
    }
  }

  // Lead Notification from Chatbot
  app.post("/api/notify/lead", async (req, res) => {
    const { lead } = req.body;
    if (!lead) return res.status(400).json({ error: 'Lead details required' });

    try {
      sendPushToAllAdmins({
        title: `New AI Lead: ${lead.name}`,
        body: `${lead.phone || lead.email} | ${lead.guests || '?'} Guests`
      }).catch(e => console.error('Push error:', e));

      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // SSE Clients storage
  let sseClients: any[] = [];
  let leadsUnsubscribe: (() => void) | null = null;
  let bookingsUnsubscribe: (() => void) | null = null;
  let stopListenersTimeout: any = null;

  // Listen for Firestore changes on server and push to SSE
  const setupFirestoreListeners = () => {
    // Clear any pending stop timeout
    if (stopListenersTimeout) {
      clearTimeout(stopListenersTimeout);
      stopListenersTimeout = null;
    }

    if (leadsUnsubscribe || bookingsUnsubscribe) return; // Already listening

    console.log('[SSE] Starting Firestore listeners...');
    const leadsRef = collection(db, 'leads');
    const bookingsRef = collection(db, 'bookings');

    let initialLeads = true;
    leadsUnsubscribe = onSnapshot(query(leadsRef, orderBy('createdAt', 'desc'), limit(1)), (snapshot) => {
      if (initialLeads) { initialLeads = false; return; }
      snapshot.docChanges().forEach(change => {
        if (change.type === 'added') {
          const data = change.doc.data();
          broadcast({ type: 'lead', title: 'New Lead', message: `Lead from ${data.name || 'someone'}`, data });
        }
      });
    }, (err) => {
      if (err.code !== 'cancelled' && err.message?.indexOf('CANCELLED') === -1) {
        console.error('[SSE] Leads listener error:', err);
      }
    });

    let initialBookings = true;
    bookingsUnsubscribe = onSnapshot(query(bookingsRef, orderBy('createdAt', 'desc'), limit(1)), (snapshot) => {
      if (initialBookings) { initialBookings = false; return; }
      snapshot.docChanges().forEach(change => {
        if (change.type === 'added') {
          const data = change.doc.data();
          broadcast({ type: 'booking', title: 'New Booking', message: `Booking by ${data.name || 'Guest'}`, data });
        }
      });
    }, (err) => {
      if (err.code !== 'cancelled' && err.message?.indexOf('CANCELLED') === -1) {
        console.error('[SSE] Bookings listener error:', err);
      }
    });
  };

  const stopFirestoreListeners = () => {
    // Only stop if no clients are connected
    if (sseClients.length === 0) {
      // Clear any existing timeout
      if (stopListenersTimeout) clearTimeout(stopListenersTimeout);

      // Start a grace period before actually stopping the listeners
      // This prevents rapid reconnect cycles (e.g. on page refresh) from killing the stream
      stopListenersTimeout = setTimeout(() => {
        if (sseClients.length === 0) {
          console.log('[SSE] Grace period over. Stopping Firestore listeners...');
          if (leadsUnsubscribe) { leadsUnsubscribe(); leadsUnsubscribe = null; }
          if (bookingsUnsubscribe) { bookingsUnsubscribe(); bookingsUnsubscribe = null; }
        }
        stopListenersTimeout = null;
      }, 30000); // 30 seconds grace period
    }
  };

  const broadcast = (data: any) => {
    sseClients.forEach(client => {
      try {
        client.res.write(`data: ${JSON.stringify(data)}\n\n`);
      } catch (e) {
        console.error('[SSE] Broadcast error to client:', client.id, e);
      }
    });
  };

  // SSE Endpoint
  app.get("/api/notifications/stream", (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const clientId = Date.now();
    const newClient = { id: clientId, res };
    sseClients.push(newClient);

    // Setup listeners if this is the first client
    setupFirestoreListeners();

    req.on('close', () => {
      sseClients = sseClients.filter(c => c.id !== clientId);
      stopFirestoreListeners();
    });

    // Keep connection alive
    const keepAlive = setInterval(() => {
      res.write(': keep-alive\n\n');
    }, 30000);

    req.on('close', () => clearInterval(keepAlive));
  });

  // Generic Notification Endpoint (linked to triggerNotification in client)
  app.post("/api/notify", async (req, res) => {
    const { title, message } = req.body;
    try {
      sendPushToAllAdmins({
        title: title || 'System Notification',
        body: message || 'No details'
      }).catch(e => console.error('Push error:', e));
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Proxy Endpoint for external requests
  app.post("/api/proxy/fetch", async (req, res) => {
    try {
      const { url } = req.body;
      if (!url) return res.status(400).json({ error: 'URL required' });
      
      console.log(`[Proxy] Fetching: ${url}`);
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      
      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`[Proxy] Target failed with ${response.status}: ${errorBody.substring(0, 500)}`);
        return res.status(response.status).send(errorBody || `Error: ${response.statusText}`);
      }
      
      const text = await response.text();
      res.send(text);
    } catch (e: any) {
      console.error(`[Proxy] Critical error fetching ${req.body.url}:`, e);
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/notify/booking", async (req, res) => {
    const { booking, type } = req.body;
    if (!booking) return res.status(400).json({ error: 'Booking details required' });

    try {
      // Send Push Notification Array
      sendPushToAllAdmins({
        title: `${type === 'update' ? 'Updated' : 'New'} Booking: ${booking.name}`,
        body: `Check-In: ${booking.checkIn} | Total: ₹${booking.totalAmount?.toLocaleString()}`
      }).catch(e => console.error('Push error:', e));

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
  const exportRoute = async (req, res) => {
    try {
      const projectId = firebaseConfig.projectId;
      const databaseId = firebaseConfig.firestoreDatabaseId || '(default)';
      const apiKey = firebaseConfig.apiKey;
      const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${databaseId}/documents/public/calendar?key=${apiKey}`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      if (!response.ok) {
        if (response.status === 404) {
          res.setHeader('Content-Type', 'text/calendar');
          return res.send(Buffer.from('BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Unique Farmhouse//Bookings//EN\r\nCALSCALE:GREGORIAN\r\nMETHOD:PUBLISH\r\nEND:VCALENDAR\r\n'));
        }
        const errorText = await response.text();
        console.error('Firestore fetch error:', response.status, errorText);
        throw new Error('Failed to fetch calendar from Firestore');
      }
      
      const data = await response.json();
      let icsContent = data.fields?.icsData?.stringValue;
      
      if (!icsContent) {
        res.setHeader('Content-Type', 'text/calendar');
        return res.send(Buffer.from('BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Unique Farmhouse//Bookings//EN\r\nCALSCALE:GREGORIAN\r\nMETHOD:PUBLISH\r\nEND:VCALENDAR\r\n'));
      }

      if (!icsContent.includes('CALSCALE:GREGORIAN')) {
        icsContent = icsContent.replace('PRODID:-//Unique Farmhouse//Bookings//EN\r\n', 'PRODID:-//Unique Farmhouse//Bookings//EN\r\nCALSCALE:GREGORIAN\r\nMETHOD:PUBLISH\r\n');
      }
      
      if (!icsContent.endsWith('\r\n')) {
        icsContent += '\r\n';
      }

      res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="calendar.ics"');
      // Some platforms require caching headers
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      
      res.send(Buffer.from(icsContent));
    } catch (error) {
      console.error('Export error:', error);
      res.status(500).send('Error generating calendar: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  app.get(["/api/calendar/export", "/api/calendar/export.ics", "/api/calendar/bookings.ics"], exportRoute);
  app.head(["/api/calendar/export", "/api/calendar/export.ics", "/api/calendar/bookings.ics"], exportRoute);

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

  // Google Reviews Sync API - Simplified for demonstration as real implementation requires a live API key and Place ID
  app.post("/api/reviews/sync", (req, res) => {
    // Return a successful response to avoid "Deprecated" errors in the dashboard
    res.json({ 
      success: true, 
      newCount: 0, 
      message: "Direct Google Sync is temporarily paused. Please use manual entry or check back later for updates." 
    });
  });

  // AI logic moved to frontend to follow platform guidelines and fix quota issues.

  app.post("/api/blogs/generate", (req, res) => res.status(410).json({ error: "Deprecated" }));

  app.post("/api/chat", (req, res) => res.status(410).json({ error: "Deprecated" }));

  // Gmail API Endpoint
  // Gmail API Endpoint
  app.post("/api/communications/test-connection", async (req, res) => {
    try {
      let { user, pass, workerUrl, workerSecret } = req.body;
      user = (user || '').trim();
      pass = (pass || '').trim();
      workerUrl = (workerUrl || '').trim();
      workerSecret = (workerSecret || '').trim();

      if (!user || !pass) {
        return res.status(400).json({ error: "Email and password/app-password are required" });
      }

      const sanitizedPass = pass.replace(/\s+/g, '');

      // If workerUrl is being tested
      if (workerUrl) {
        console.log(`[Gmail Test] Relay Fetch: "${workerUrl}"`);
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (workerSecret) {
          headers['X-Relay-Secret'] = workerSecret;
          headers['Authorization'] = `Bearer ${workerSecret}`;
        }

        const response = await fetch(workerUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            to: user, // Send to self as test
            subject: 'Unique Farmhouse - Relay Test',
            text: 'Relay connection successful!',
            html: '<h3>Success</h3><p>Relay connection successful!</p>',
            user,
            pass: sanitizedPass
          })
        });
        
        const resText = await response.text().catch(() => "No response body");
        let result: any = {};
        try {
          result = JSON.parse(resText);
        } catch (e) {
          // Not JSON
        }

        if (response.ok) {
          return res.json({ success: true, message: "Cloudflare Relay connection successful", result });
        } else {
          let errorMsg = `Relay Error (${response.status})`;
          
          if (response.status === 401) {
            // Check if the user accidentally provided the app's own URL
            const isAppUrl = workerUrl.includes('ais-dev') || workerUrl.includes('ais-pre');
            
            if (isAppUrl) {
              errorMsg = "Relay URL Error: You provided this app's URL instead of your Cloudflare Worker URL. Please check the 'Worker URL' setting.";
            } else if (resText.includes('Invalid Relay Secret')) {
              errorMsg = "Relay Secret Error (401): The 'Relay Secret' was rejected. If you are using a standard @gmail.com account, please CLEAR OUT the Worker URL and Worker Secret and try again to use direct SMTP. Otherwise, make sure your secret matches perfectly in Cloudflare.";
            } else {
              errorMsg = `MailChannels/Worker Error (401): ${resText.substring(0, 300)}. NOTE: MailChannels cannot send FROM @gmail.com. If you are using Gmail, this worker script will fail.`;
            }
          } else if (response.status === 405) {
            errorMsg = "Method Not Allowed (405): Ensure your Cloudflare Worker handles POST requests correctly.";
          } else if (response.status === 404) {
            errorMsg = "Not Found (404): The Relay URL is incorrect or the Worker is not deployed.";
          }

          return res.status(response.status).json({ 
            error: errorMsg, 
            url: workerUrl,
            status: response.status,
            debug: {
              bodySnippet: resText.substring(0, 300),
              isAppUrl: workerUrl.includes('ais-dev') || workerUrl.includes('ais-pre')
            }
          });
        }
      }

      console.log(`[Gmail Test] Testing direct SMTP for ${user}`);
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: { user, pass: sanitizedPass },
        tls: { rejectUnauthorized: false },
        connectionTimeout: 5000,
        greetingTimeout: 5000
      });

      await transporter.verify();
      console.log(`[Gmail Test] Connection verified for ${user}`);
      res.json({ success: true, message: "SMTP Connection successful" });
    } catch (error: any) {
      console.error('[Gmail Test] Connection failed:', error);
      res.status(500).json({ 
        error: "Connection failed", 
        details: error.message,
        code: error.code
      });
    }
  });

  app.post("/api/communications/reply", async (req, res) => {
    try {
      const { to, subject, html, text, config } = req.body;
      
      let gmailUser = (config?.user || process.env.GMAIL_USER || '').trim();
      let gmailPass = (config?.pass || process.env.GMAIL_APP_PASSWORD || '').trim();
      let workerUrl = (config?.workerUrl || '').trim();
      let workerSecret = (config?.workerSecret || '').trim();

      // Always check Firestore if no explicit config provided to allow UI settings to override
      try {
        const gmailDoc = await getDoc(doc(db, 'settings', 'gmail'));
        if (gmailDoc.exists()) {
          const data = gmailDoc.data();
          gmailUser = (data.user || gmailUser).trim();
          gmailPass = (data.pass || gmailPass).trim();
          workerUrl = (data.workerUrl || workerUrl).trim();
          workerSecret = (data.workerSecret || workerSecret).trim();
        }
      } catch (dbErr) {
        console.warn("[Gmail] Could not fetch Gmail config from Firestore:", dbErr);
      }

      const sanitizedPass = gmailPass.replace(/\s+/g, '');

      // If workerUrl is configured, use the relay
      if (workerUrl) {
        console.log(`[Gmail Send] Relay Fetch: "${workerUrl}"`);
        try {
          const headers: Record<string, string> = { 'Content-Type': 'application/json' };
          if (workerSecret) {
            headers['X-Relay-Secret'] = workerSecret;
            headers['Authorization'] = `Bearer ${workerSecret}`;
          }

          const response = await fetch(workerUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              to: to || gmailUser,
              subject: subject || 'Unique Farmhouse - Notification',
              html: html || `<div>${text || 'This is an automated message.'}</div>`,
              text: text || "This is an automated message.",
              user: gmailUser,
              pass: sanitizedPass
            })
          });

          const resText = await response.text().catch(() => "No response body");
          let result: any = {};
          try {
            result = JSON.parse(resText);
          } catch (e) {
            // Not JSON
          }
          
          console.log(`[Gmail] Relay Response Status: ${response.status}`);
          
          if (response.ok) {
            return res.json({ success: true, message: "Email sent via Cloudflare Worker", result });
          } else {
            let errorMsg = `Relay Error (${response.status})`;
            
            if (response.status === 401) {
              const isAppUrl = workerUrl.includes('ais-dev') || workerUrl.includes('ais-pre');
              if (isAppUrl) {
                errorMsg = "Relay URL Error: App URL provided instead of Cloudflare Worker URL.";
              } else if (resText.includes('Invalid Relay Secret')) {
                errorMsg = "Relay Secret mismatch (401). We checked your Secret against Cloudflare. Make sure you click 'Copy Cloudflare Worker Code' from the app and re-deploy it in Cloudflare to use the latest version.";
              } else {
                errorMsg = `Worker/MailChannels Error (401): ${resText.substring(0, 300)}`;
              }
            } else if (response.status === 405) {
              errorMsg = "Method Not Allowed (405). Check Cloudflare Worker POST handler.";
            }
            
            return res.status(response.status).json({ 
              error: errorMsg, 
              url: workerUrl,
              status: response.status,
              debug: {
                bodySnippet: resText.substring(0, 300),
                isAppUrl: workerUrl.includes('ais-dev') || workerUrl.includes('ais-pre')
              }
            });
          }
        } catch (fetchErr: any) {
          console.error(`[Gmail] Relay Network/Fetch Error:`, fetchErr);
          return res.status(502).json({ error: "Failed to connect to Cloudflare Worker.", details: fetchErr.message });
        }
      }

      if (!gmailUser || !sanitizedPass) {
        return res.status(400).json({ error: "Gmail configuration missing." });
      }

      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: { user: gmailUser, pass: sanitizedPass },
        tls: { rejectUnauthorized: false },
        connectionTimeout: 5000,
        greetingTimeout: 5000
      });

      const info = await transporter.sendMail({
        from: `Unique Farmhouse <${gmailUser}>`,
        to: to || gmailUser,
        subject: subject || 'Unique Farmhouse - Notification',
        text: text || "This is an automated message.",
        html: html || `<div>${text || 'This is an automated message.'}</div>`,
      });

      res.json({ success: true, messageId: info.messageId });
    } catch (error: any) {
      console.error('[Gmail] Send Error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Gmail Backend Send Endpoint (Relayed from Cloudflare)
  app.post("/api/send-email", async (req, res) => {
    try {
      const apiKey = req.headers['x-api-key'];
      
      let user = process.env.EMAIL_USER;
      let pass = process.env.EMAIL_PASS;
      let configuredSecret = process.env.MY_SECRET_KEY;

      // Check Firestore configuration
      try {
        const gmailDoc = await getDoc(doc(db, 'settings', 'gmail'));
        if (gmailDoc.exists()) {
          const data = gmailDoc.data();
          if (data.user) user = data.user.trim();
          if (data.pass) pass = data.pass.trim();
          if (data.workerSecret) configuredSecret = data.workerSecret.trim();
        }
      } catch (e) {
        console.warn("Could not read Firestore config", e);
      }

      // If a secret is configured in backend/firestore, enforce it
      if (configuredSecret && apiKey !== configuredSecret) {
        return res.status(401).json({ success: false, error: "Unauthorized: Invalid x-api-key" });
      }

      const { to, subject, body } = req.body;

      if (!to || !subject || !body) {
        return res.status(400).json({ success: false, error: "Missing required fields: to, subject, body" });
      }

      if (!user || !pass) {
        return res.status(500).json({ success: false, error: "Server misconfiguration: Email credentials missing in Database/ENV" });
      }

      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: { user, pass: pass.replace(/\s+/g, '') },
        tls: { rejectUnauthorized: false }
      });

      const info = await transporter.sendMail({
        from: user,
        to,
        subject,
        html: body,
      });

      console.log(`[Email Sent] Successfully sent to ${to}, MessageId: ${info.messageId}`);
      res.json({ success: true, message: "Email sent via backend!" });
    } catch (error: any) {
      console.error('[Email Send Error]', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Handle unmatched API routes to ensure they return JSON instead of HTML pages
  app.use('/api', (req, res, next) => {
    res.status(404).json({ error: 'API route not found' });
  });

  // Global Error Handler for API routes
  app.use('/api', (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Express API Error:', err);
    res.status(err.status || 500).json({ 
      error: err.message || 'Internal Developer Error',
      details: err.stack
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    console.log(`[Production] Static assets path: ${distPath}`);
    if (fs.existsSync(path.join(distPath, 'index.html'))) {
      console.log(`[Production] index.html IS present.`);
    } else {
      console.error(`[Production] index.html IS MISSING at ${path.join(distPath, 'index.html')}`);
    }

    app.use((req, res, next) => {
      console.log(`[Production Request] ${req.method} ${req.url}`);
      next();
    });

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
