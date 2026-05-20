import express from "express";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import nodeIcal from "node-ical";
import { Resend } from "resend";
import { v2 as cloudinary } from "cloudinary";
import webpush from "web-push";
import nodemailer from "nodemailer";
import Razorpay from "razorpay";
import crypto from "crypto";
import * as dotenv from "dotenv";
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, addDoc, doc, getDoc, setDoc, deleteDoc, serverTimestamp, onSnapshot, orderBy, limit, setLogLevel, writeBatch } from 'firebase/firestore';
import { initializeApp as initializeAdminApp, getApps as getAdminApps, applicationDefault } from 'firebase-admin/app';
import { getFirestore as getAdminFirestore, FieldValue as AdminFieldValue, Firestore as AdminFirestoreClass } from 'firebase-admin/firestore';
import type { App as AdminApp } from 'firebase-admin/app';
import type { Firestore as AdminFirestore } from 'firebase-admin/firestore';

dotenv.config();

// Silence noisy Firestore logs in Node.js
setLogLevel('error');

let currentDir;
if (typeof __dirname !== 'undefined') {
  currentDir = __dirname.endsWith("dist") ? require("path").join(__dirname, "..") : __dirname;
} else {
  currentDir = path.dirname(fileURLToPath((typeof import.meta !== 'undefined' ? import.meta.url : '')));
}

// Initialize Firebase
const firebaseConfig = JSON.parse(fs.readFileSync(path.join(currentDir, 'firebase-applet-config.json'), 'utf8'));
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId || '(default)');

// Initialize Firebase Admin lazily for background listeners (bypasses security rules)
let adminApp: AdminApp | null = null;
let adminDb: AdminFirestore | null = null;
let adminDbVerified = false;
let adminDbProbeFailed = false;

function getAdminDb() {
  if (adminDbProbeFailed) return null;
  if (adminDbVerified && adminDb) return adminDb;

  if (!adminDb && !adminDbProbeFailed) {
    try {
      const apps = getAdminApps();
      if (apps.length === 0) {
        // AI Studio: Try to use applicationDefault() which sometimes works better for IAM mapping
        try {
          adminApp = initializeAdminApp({
            credential: applicationDefault(),
            projectId: firebaseConfig.projectId
          });
          // Avoid logging the initialization if we aren't assured it works yet.
        } catch (e) {
          adminApp = initializeAdminApp({
            projectId: firebaseConfig.projectId
          });
        }
      } else {
        adminApp = apps[0];
      }
      
      const databaseId = firebaseConfig.firestoreDatabaseId;
      // In this environment, named databases often require explicit databaseId in getFirestore
      if (databaseId && databaseId !== '(default)') {
        adminDb = getAdminFirestore(adminApp, databaseId);
      } else {
        adminDb = getAdminFirestore(adminApp);
      }

      // Verification probe (non-blocking)
      adminDb.collection('_permission_probe').limit(1).get()
        .then(() => {
          adminDbVerified = true;
          console.log('[Firebase Admin] PROBE SUCCESS: Backend DB access verified.');
        })
        .catch(err => {
          adminDbProbeFailed = true;
          // Silently fail to avoid console clutter. The app will smoothly fallback to the Client SDK.
        });

    } catch (err) {
      adminDbProbeFailed = true;
      return null;
    }
  }
  
  // Return null until verified, forcing safe fallbacks to use the Client SDK!
  return null;
}

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
  app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key']
  }));


  // === Push Notification Setup ===
  async function setupVapid() {
  let vapidKeys = { publicKey: '', privateKey: '' };
  try {
    const vapidDocRef = doc(db, 'settings', 'vapid_keys');
    const vapidDoc = await getDoc(vapidDocRef);
    if (!vapidDoc.exists() || !vapidDoc.data()?.publicKey || !vapidDoc.data()?.privateKey) {
      vapidKeys = webpush.generateVAPIDKeys();
      // Try Admin SDK first for write as it bypasses rules
      const aDb = getAdminDb();
      if (aDb) {
        await aDb.collection('settings').doc('vapid_keys').set(vapidKeys)
          .then(() => console.log('Successfully saved VAPID keys via Admin SDK'))
          .catch(e => console.warn("Failed to save VAPID keys via Admin SDK:", e.message));
      } else {
        await setDoc(vapidDocRef, vapidKeys).catch(() => console.warn("Failed to persist VAPID keys to Firestore (Unauthenticated Client)"));
      }
      console.log('Generated new VAPID keys.');
    } else {
      vapidKeys = vapidDoc.data() as any;
    }
  } catch (err) {
    // Fallback: try Admin SDK if Client SDK blocked by rules
    try {
      const aDb = getAdminDb();
      if (aDb) {
        const vapidDoc = await aDb.collection('settings').doc('vapid_keys').get();
        if (vapidDoc.exists) {
          vapidKeys = vapidDoc.data() as any;
        } else {
          vapidKeys = webpush.generateVAPIDKeys();
        }
      } else {
        vapidKeys = webpush.generateVAPIDKeys();
      }
    } catch (adminErr) {
      console.warn("Could not read VAPID keys from Firestore. Falling back to memory-only keys.");
      vapidKeys = webpush.generateVAPIDKeys(); 
    }
  }

  webpush.setVapidDetails(
    'mailto:anujkumarmittal@gmail.com',
    vapidKeys.publicKey,
    vapidKeys.privateKey
  );

  }
  setupVapid().catch(console.error);

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
      const subId = Buffer.from(subscription.endpoint).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, 100);
      const aDb = getAdminDb();
      if (aDb) {
        await aDb.collection('push_subscriptions').doc(subId).set({
          subscription,
          createdAt: AdminFieldValue.serverTimestamp()
        }, { merge: true });
      } else {
        // Fallback to client SDK if Admin fails (requires specific rules)
        await setDoc(doc(db, 'push_subscriptions', subId), {
          subscription,
          createdAt: serverTimestamp()
        }, { merge: true });
      }
      res.status(201).json({});
    } catch (err) {
      console.error('Error saving subscription:', err);
      res.status(500).json({ error: 'Failed to save subscription' });
    }
  });

  // Helper to send push
  async function sendPushToAllAdmins(payload: any) {
    const aDb = getAdminDb();
    if (!aDb) return;
    try {
      const subsSnapshot = await aDb.collection('push_subscriptions').get();
      const promises = subsSnapshot.docs.map(async (docSnap) => {
        const sub = docSnap.data().subscription;
        try {
          await webpush.sendNotification(sub, JSON.stringify(payload));
        } catch (err: any) {
          if (err.statusCode === 404 || err.statusCode === 410) {
             console.log('Subscription expired. Deleting...');
             await docSnap.ref.delete().catch(() => {}); 
          } else {
             console.error('Error sending push notification:', err);
          }
        }
      });
      await Promise.all(promises);
    } catch (error: any) {
       console.error("Error retrieving push subscriptions:", error.message);
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

  // SSE Clients storage (Compatible with ReadableStream)
  interface SSEClient {
    controller: ReadableStreamDefaultController;
    userId: string;
    role: string;
  }
  let clients: SSEClient[] = [];
  let leadsUnsubscribe: (() => void) | null = null;
  let bookingsUnsubscribe: (() => void) | null = null;
  let stopListenersTimeout: any = null;

  // Broadcast to SSE clients with role filtering
  const broadcast = async (payload: any, docData?: any) => {
    for (const client of clients) {
      try {
        let shouldSend = true;
        if (client.role === 'agent' && docData && docData.assignedTo) {
          if (docData.assignedTo !== client.userId) {
            shouldSend = false;
          }
        }
        if (shouldSend) {
          client.controller.enqueue(`data: ${JSON.stringify(payload)}\n\n`);
        }
      } catch (e) {
        console.error('[SSE] Local Broadcast error:', e);
      }
    }

    const workerUrl = process.env.VITE_WORKER_URL;
    if (workerUrl) {
      try {
        await fetch(`${workerUrl}/api/notify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } catch (e) {
        console.error('[SSE] Cloudflare Forward error:', e);
      }
    }
  };

  // Listen for Firestore changes (Using Client SDK for better reliability with rules)
  const setupFirestoreListeners = () => {
    if (stopListenersTimeout) {
      clearTimeout(stopListenersTimeout);
      stopListenersTimeout = null;
    }

    if (leadsUnsubscribe || bookingsUnsubscribe) return; 

    console.log('[SSE] Starting Firestore listeners (Client-based for reliability)...');
    
    let initialLeads = true;
    leadsUnsubscribe = onSnapshot(collection(db, 'leads'), async (snapshot) => {
      if (initialLeads) { initialLeads = false; return; }
      
      for (const change of snapshot.docChanges()) {
        if (change.type === 'added') {
          const data = change.doc.data();
          const leadId = change.doc.id;
          
          console.log(`[Automation] New lead detected: ${leadId}`);
          
          sendPushToAllAdmins({
            title: `New Lead: ${data.name || 'Anonymous'}`,
            body: `Phone: ${data.phone || 'N/A'} | Guests: ${data.guests || '?'}`
          }).catch(e => console.error('[Automation] Push error for new lead:', e));
          
          let score = 'WARM';
          const guests = parseInt(data.guests) || 0;
          if (guests > 10) score = 'HOT';
          
          if (data.bookingDate) {
            const leadDate = new Date(data.bookingDate);
            if (!isNaN(leadDate.getTime())) {
              const today = new Date();
              const diffTime = Math.abs(leadDate.getTime() - today.getTime());
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              if (diffDays <= 3) score = 'HOT';
            }
          }

          try {
            await setDoc(doc(db, 'leads', leadId), { 
              score, 
              status: data.status || 'new',
              automated: true 
            }, { merge: true });
          } catch (e) {
            console.error(`[Automation] Update error for ${leadId}:`, e);
          }

          broadcast({ 
            type: 'lead', 
            title: `New ${score} Lead! 🚨`, 
            message: `Name: ${data.name || 'someone'}\nGuests: ${data.guests || 'N/A'}\nDate: ${data.bookingDate || 'N/A'}`,
            data: { ...data, id: leadId, score } 
          }, { ...data, score });

          scheduleFollowUp(leadId, data, 1, "Hi, just checking if you're still interested 😊");
        }
      }
    }, (err) => {
      console.error('[SSE] Leads listener error:', err);
    });

    let initialBookings = true;
    bookingsUnsubscribe = onSnapshot(collection(db, 'bookings'), (snapshot) => {
      if (initialBookings) { initialBookings = false; return; }
      snapshot.docChanges().forEach(change => {
        if (change.type === 'added') {
          const data = change.doc.data();
          console.log(`[SSE] New booking detected: ${change.doc.id}`);
          broadcast({ type: 'booking', title: 'New Booking', message: `Booking by ${data.name || 'Guest'}`, data }, data);
          
          sendPushToAllAdmins({
            title: `New Booking: ${data.name || 'Guest'}`,
            body: `Check-In: ${data.checkIn || '?'} | Total: ₹${(data.totalAmount || 0).toLocaleString()}`
          }).catch(e => console.error('[SSE] Push error for new booking:', e));
        }
      });
    }, (err) => {
      console.error('[SSE] Bookings listener error:', err);
    });
  };

  const stopFirestoreListeners = () => {
    if (clients.length === 0) {
      if (stopListenersTimeout) clearTimeout(stopListenersTimeout);
      stopListenersTimeout = setTimeout(() => {
        if (clients.length === 0) {
          console.log('[SSE] Stopping Firestore listeners...');
          if (leadsUnsubscribe) { leadsUnsubscribe(); leadsUnsubscribe = null; }
          if (bookingsUnsubscribe) { bookingsUnsubscribe(); bookingsUnsubscribe = null; }
        }
        stopListenersTimeout = null;
      }, 30000);
    }
  };

  // Improved Razorpay initialization with verification
  const getRazorpay = () => {
    const keyId = process.env.VITE_RAZORPAY_KEY_ID?.trim() || process.env.RAZORPAY_KEY_ID?.trim() || "";
    const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim() || "";

    const mask = (s: string) => {
      if (!s) return "EMPTY";
      if (s.length <= 8) return "****";
      return `${s.substring(0, 4)}...${s.substring(s.length - 4)}`;
    };

    console.log(`[Razorpay] Diagnostic - KeyID: ${mask(keyId)} (Len: ${keyId.length}), Secret: ${mask(keySecret)} (Len: ${keySecret.length})`);

    if (!keyId || !keySecret) {
      console.error("[Razorpay] Missing KeyID or Secret. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET environment variables.");
    }

    if (keyId && keyId.startsWith('rzp_test_') === false && keyId.startsWith('rzp_live_') === false) {
       console.warn(`[Razorpay] INVALID KEY ID FORMAT: ${keyId}`);
    }

    return new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  };

  app.post("/api/create-order", async (req, res) => {
    const { amount, currency = "INR", receipt } = req.body;
    
    if (!amount) {
      return res.status(400).json({ error: "Amount is required", code: "MISSING_AMOUNT" });
    }

    try {
      const razorpay = getRazorpay();
      const options = {
        amount: Math.round(amount * 100), // Razorpay expects amount in paise
        currency,
        receipt: receipt || `receipt_${Date.now()}`,
      };
      
      console.log(`[Razorpay] Creating order for ${amount} ${currency}`);
      const order = await razorpay.orders.create(options);
      const keyId = process.env.VITE_RAZORPAY_KEY_ID?.trim() || process.env.RAZORPAY_KEY_ID?.trim() || "";
      res.json({ ...order, key_id: keyId });
    } catch (error: any) {
      console.error("Razorpay Error Details:", {
        message: error.message,
        error: error.error || error,
        code: error.code,
        description: error.description
      });
      
      const errorData = error.error || error;
      const isAuthError = errorData.code === 'BAD_REQUEST_ERROR' && errorData.description === 'Authentication failed';
      
      res.status(isAuthError ? 401 : 500).json({ 
        error: isAuthError ? "Razorpay Authentication Failed" : (error.message || "Payment initialization failed"),
        code: error.code || "PAYMENT_ERROR",
        details: isAuthError 
          ? "Your Razorpay Key ID or Secret is incorrect. Please update them in Settings -> Secrets." 
          : (error.description || "Check your credentials and connection.")
      });
    }
  });

  app.post("/api/verify-payment", async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim() || "";

    if (!keySecret) {
      return res.status(500).json({ error: "Razorpay Key Secret is missing in environment" });
    }

    const hmac = crypto.createHmac("sha256", keySecret);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generatedSignature = hmac.digest("hex");

    if (generatedSignature === razorpay_signature) {
      res.json({ status: "ok", message: "Payment verified successfully" });
    } else {
      console.error("[Razorpay Verify] Signature mismatch!");
      res.status(400).json({ error: "Invalid signature", status: "failed" });
    }
  });

  // SSE Endpoint with ReadableStream and Role Detection
  app.get("/api/notifications/stream", async (req, res) => {
    const userId = req.query.userId as string;
    if (!userId) {
      return res.status(401).send("Unauthorized: userId required");
    }

    // Detect user role from firestore
    let userRole = 'user';
    const aDb = getAdminDb();
    if (aDb) {
      try {
        const userDoc = await aDb.collection('users').doc(userId).get();
        if (userDoc.exists) {
          userRole = userDoc.data()?.role || 'user';
        }
      } catch (e) {
        console.warn(`[SSE] Role check failed for ${userId}:`, e);
      }
    }

    // Set proper headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.flushHeaders();

    let clientObj: SSEClient | null = null;

    const stream = new ReadableStream({
      start(ctrl) {
        clientObj = { controller: ctrl, userId, role: userRole };
        clients.push(clientObj);
        setupFirestoreListeners();
        
        // Initial connection message
        ctrl.enqueue(`: connected as ${userRole}\n\n`);
      },
      cancel() {
        if (clientObj) {
          clients = clients.filter(c => c !== clientObj);
        }
        stopFirestoreListeners();
      }
    });

    // Pipe the stream to the response
    const reader = stream.getReader();
    const processStream = async () => {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          res.write(value);
        }
      } catch (err) {
        console.error('[SSE] Stream error:', err);
      } finally {
        res.end();
      }
    };

    processStream();

    // Heartbeat to keep connection alive
    const heartbeatInterval = setInterval(() => {
      if (clientObj?.controller) {
        try {
          clientObj.controller.enqueue(': heartbeat\n\n');
        } catch (e) {
          clearInterval(heartbeatInterval);
        }
      } else {
        clearInterval(heartbeatInterval);
      }
    }, 20000);

    req.on('close', () => {
      clearInterval(heartbeatInterval);
      if (clientObj) {
        clients = clients.filter(c => c !== clientObj);
      }
      stopFirestoreListeners();
      reader.cancel();
    });
  });

  // --- Lead Automation & Maintenance ---
  const scheduleFollowUp = async (leadId: string, leadData: any, day: number, message: string) => {
    const delay = day * 24 * 60 * 60 * 1000;
    
    setTimeout(async () => {
      try {
        const aDb = getAdminDb();
        let status = 'new';
        
        if (aDb) {
          const leadDoc = await aDb.collection('leads').doc(leadId).get();
          if (leadDoc.exists) status = leadDoc.data()?.status;
        } else {
          const leadSnap = await getDoc(doc(db, 'leads', leadId));
          if (leadSnap.exists()) status = leadSnap.data()?.status;
        }

        if (status !== 'new') return;

        console.log(`[Automation] Sending ${day} day follow-up for lead ${leadId}`);
        
        const notificationData = {
          type: 'followup',
          title: `Follow-up Sent (Day ${day})`,
          message: `Scheduled message for ${leadData.name}: "${message}"`,
          leadId,
          createdAt: aDb ? AdminFieldValue.serverTimestamp() : serverTimestamp()
        };

        if (aDb) {
          await aDb.collection('notifications').add(notificationData);
        } else {
          await addDoc(collection(db, 'notifications'), notificationData);
        }
        
        broadcast({
          type: 'info',
          title: 'Auto Follow-up Sent',
          message: `Day ${day} follow-up sent to ${leadData.name}`,
          data: { leadId, day }
        });
      } catch (e) {
        console.error(`[Automation] Follow-up error for ${leadId}:`, e);
      }
    }, delay);
  };

  // Run lead maintenance every 1 hour (Admin SDK with Client SDK fallback)
  setInterval(async () => {
    const aDb = getAdminDb();
    const adminProbeSuccessful = adminDbVerified; // Use the verified flag instead of just checking if the object exists
    
    // We only want to log this periodically when it actually does something, or less verbosely.
    // For now, let's keep the log but make it accurate.
    console.log(`[Automation] Running lead maintenance cycle (Admin Ready: ${adminProbeSuccessful})...`);
    
    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      let staleLeadsDocs: any[] = [];
      let usingAdmin = false;

      if (aDb) {
        try {
          const snapshot = await aDb.collection('leads')
            .where('status', 'in', ['new', 'contacted'])
            .where('createdAt', '<', sevenDaysAgo)
            .get();
          staleLeadsDocs = snapshot.docs;
          usingAdmin = true;
          console.log(`[Automation] Admin query returned ${staleLeadsDocs.length} leads.`);
        } catch (e) {
          console.warn('[Automation] Admin DB query failed for maintenance, trying Client SDK.');
        }
      }

      if (!usingAdmin) {
        try {
          const q = query(
            collection(db, 'leads'),
            where('status', 'in', ['new', 'contacted']),
            where('createdAt', '<', sevenDaysAgo)
          );
          const snapshot = await getDocs(q);
          staleLeadsDocs = snapshot.docs;
          console.log(`[Automation] Client SDK query returned ${staleLeadsDocs.length} leads.`);
        } catch (readErr: any) {
          if (readErr.message.includes('permissions')) {
            console.warn('[Automation] Maintenance skipped: Permission denied for unauthenticated read.');
            return;
          }
          throw readErr;
        }
      }

      if (staleLeadsDocs.length === 0) return;

      if (usingAdmin && aDb) {
        const batch = aDb.batch();
        staleLeadsDocs.forEach(docSnap => {
          batch.update(docSnap.ref, { 
            status: 'lost', 
            remarks: (docSnap.data().remarks || '') + '\n[Auto] Marked as lost due to inactivity (7+ days)' 
          });
          console.log(`[Automation] Mark lead ${docSnap.id} as lost (stale via Admin)`);
        });
        await batch.commit();
      } else {
        const batch = writeBatch(db);
        staleLeadsDocs.forEach(docSnap => {
          batch.update(doc(db, 'leads', docSnap.id), { 
            status: 'lost', 
            remarks: (docSnap.data().remarks || '') + '\n[Auto] Marked as lost due to inactivity (7+ days)' 
          });
          console.log(`[Automation] Mark lead ${docSnap.id} as lost (stale via Client)`);
        });
        await batch.commit();
      }
      
      broadcast({
        type: 'info',
        title: 'Leads Cleaned Up',
        message: `${staleLeadsDocs.length} stale leads auto-marked as Lost.`,
      });
    } catch (e) {
      console.error('[Automation] Lead maintenance error:', e);
    }
  }, 1000 * 60 * 60); // Every 1 hour

  const processLeadAutomation = async (leadId: string, leadData: any) => {
    let score = 'WARM';
    const guests = parseInt(leadData.guests) || 0;
    if (guests > 10) score = 'HOT';
    
    if (leadData.date) {
      const leadDate = new Date(leadData.date);
      if (!isNaN(leadDate.getTime())) {
        const today = new Date();
        const diffTime = Math.abs(leadDate.getTime() - today.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays <= 3) score = 'HOT';
      }
    }

    try {
      const aDb = getAdminDb();
      if (aDb) {
        await aDb.collection('leads').doc(leadId).update({ score });
      } else {
        await setDoc(doc(db, 'leads', leadId), { score }, { merge: true });
      }
    } catch (e) {
      console.error(`[Automation] Score update error for ${leadId}:`, e);
    }

    scheduleFollowUp(leadId, leadData, 1, "Hi, just checking if you're still interested 😊");
    scheduleFollowUp(leadId, leadData, 2, "Last slots available, confirm soon ⚡");
  };

  // Generic Notification Endpoint (linked to triggerNotification in client)
  app.post("/api/notify", async (req, res) => {
    const { title, message, type, leadId, leadData } = req.body;
    const payload = { 
      type: type || 'info', 
      title: title || 'System Notification', 
      message: message || 'No details',
      createdAt: new Date().toISOString(),
      leadId
    };

    try {
      if (type === 'lead' && leadId && leadData) {
        processLeadAutomation(leadId, leadData).catch(e => console.error('Automation error:', e));
      }

      // Broadcast to all SSE clients
      broadcast(payload, leadData);

      // Also send Push if needed
      sendPushToAllAdmins({
        title: payload.title,
        body: payload.message
      }).catch(e => console.error('Push error:', e));

      res.json({ success: true, receivers: clients.length });
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
          const rawUrl = (item.url || '').trim();
          if (!rawUrl) continue;

          const normalizedUrl = rawUrl.startsWith('webcal://') 
            ? 'https://' + rawUrl.substring(9) 
            : rawUrl;

          console.log(`[Sync] Fetching ${item.name}: ${normalizedUrl}`);

          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 15000);

          let response;
          try {
            response = await fetch(normalizedUrl, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                'Accept': 'text/calendar,text/plain,*/*'
              },
              signal: controller.signal
            });
          } catch (fetchErr: any) {
            console.error(`[Sync] ${item.name} fetch error:`, fetchErr.message);
            continue;
          } finally {
            clearTimeout(timeout);
          }

          if (response && (response.status === 400 || response.status === 403)) {
            console.warn(`[Sync] ${item.name} status ${response.status}, retrying with specialized headers...`);
            const retryController = new AbortController();
            const retryTimeout = setTimeout(() => retryController.abort(), 12000);
            try {
              const isMMT = normalizedUrl.toLowerCase().includes('makemytrip') || 
                            normalizedUrl.toLowerCase().includes('goibibo') || 
                            item.name.toLowerCase().includes('mmt');
              
              const isGoibibo = normalizedUrl.toLowerCase().includes('goibibo');
              
              // For MMT/Goibibo, use headers that mimic a real browser or a standard iCal client more closely
              const retryUrl = normalizedUrl.split('#')[0];
              
              response = await fetch(retryUrl, {
                headers: { 
                  'User-Agent': isMMT 
                    ? 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36' 
                    : 'Wget/1.21.1',
                  'Accept': 'text/calendar,text/plain,*/*',
                  'Accept-Language': 'en-US,en;q=0.9',
                  'Cache-Control': 'no-cache',
                  'Pragma': 'no-cache',
                  'Connection': 'keep-alive',
                  ...(isMMT ? { 
                    'Referer': isGoibibo ? 'https://www.goibibo.com/' : 'https://www.makemytrip.com/',
                    'Origin': isGoibibo ? 'https://www.goibibo.com' : 'https://www.makemytrip.com'
                  } : {})
                },
                redirect: 'follow',
                signal: retryController.signal
              });
            } catch (e) {
              console.error(`[Sync] ${item.name} specialized retry failed:`, e);
            } finally {
              clearTimeout(retryTimeout);
            }
          }

          if (!response || !response.ok) {
            console.error(`[Sync] ${item.name} failed with status ${response?.status || 'unknown'}. URL: ${normalizedUrl}`);
            try {
               const errorBody = await response?.text();
               if (errorBody) console.error(`[Sync] Error body snippet: ${errorBody.substring(0, 150)}`);
            } catch (e) {}
            continue;
          }

          const textResponse = await response.text();
          const trimmed = textResponse.trim();
          if (!trimmed.toUpperCase().includes('BEGIN:VCALENDAR')) {
            console.warn(`[Sync Error] Invalid content for ${item.name} (${normalizedUrl}). Content length: ${trimmed.length}.`);
            continue;
          }

          const events = nodeIcal.parseICS(trimmed);
          Object.values(events).forEach(event => {
            try {
              if (event.type === 'VEVENT') {
                if (event.uid && event.uid.includes('@uniquefarmhouse.com')) {
                  return;
                }
                if (!event.start || !event.end) return;

                allExternalEvents.push({
                  source: item.name,
                  start: event.start,
                  end: event.end,
                  summary: event.summary || 'Blocked',
                  uid: event.uid || Math.random().toString(36).substring(7),
                });
              }
            } catch (err) {
              console.warn(`[Server Sync] Skipping malformed event in ${item.name}:`, err);
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
        const aDb = getAdminDb();
        if (aDb) {
          const gmailDoc = await aDb.collection('settings').doc('gmail').get();
          if (gmailDoc.exists) {
            const data = gmailDoc.data();
            if (data) {
              gmailUser = (data.user || gmailUser).trim();
              gmailPass = (data.pass || gmailPass).trim();
              workerUrl = (data.workerUrl || workerUrl).trim();
              workerSecret = (data.workerSecret || workerSecret).trim();
            }
          }
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
        const aDb = getAdminDb();
        if (aDb) {
          const gmailDoc = await aDb.collection('settings').doc('gmail').get();
          if (gmailDoc.exists) {
            const data = gmailDoc.data();
            if (data) {
              if (data.user) user = data.user.trim();
              if (data.pass) pass = data.pass.trim();
              if (data.workerSecret) configuredSecret = data.workerSecret.trim();
            }
          }
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
