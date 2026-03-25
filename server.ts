import "./src/env.js";
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import admin from "firebase-admin";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import ical, { ICalCalendarMethod } from "ical-generator";
import nodeIcal from "node-ical";
import { format, parse, isValid, addDays } from "date-fns";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Initialize Firebase Admin
const firebaseConfig = JSON.parse(fs.readFileSync(path.join(__dirname, 'firebase-applet-config.json'), 'utf8'));
const projectId = firebaseConfig.projectId;

if (!admin.apps.length) {
  console.log(`[FIREBASE] Initializing Admin SDK with Project ID: ${projectId}`);
  admin.initializeApp({
    projectId: projectId,
    credential: admin.credential.applicationDefault()
  });
}

const defaultApp = admin.app();
const finalProjectId = defaultApp.options.projectId || projectId;
console.log(`[FIREBASE] Using Project ID: ${finalProjectId}`);

// Helper to get Firestore instance
function getFirestoreInstance(dbId?: string) {
  const targetDbId = dbId || firebaseConfig.firestoreDatabaseId || '(default)';
  console.log(`[FIREBASE] Initializing Firestore: Project=${finalProjectId}, Database=${targetDbId}`);
  return getFirestore(defaultApp, targetDbId);
}

let db: any;

// Error handling types as per instructions
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: any, operationType: OperationType, path: string | null) {
  const currentDb = (global as any).db || db;
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path,
    code: error.code,
    details: error.details,
    projectId: finalProjectId,
    databaseId: currentDb.databaseId || firebaseConfig.firestoreDatabaseId || '(default)',
    stack: error.stack
  };
  console.error('Firestore Error Details:', JSON.stringify(errInfo, null, 2));
  return new Error(JSON.stringify(errInfo));
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Robust Firestore initialization with fallback
  async function initializeDb() {
    const namedDbId = firebaseConfig.firestoreDatabaseId;
    
    console.log(`[FIREBASE] Env Project IDs: GOOGLE_CLOUD_PROJECT=${process.env.GOOGLE_CLOUD_PROJECT}, GCLOUD_PROJECT=${process.env.GCLOUD_PROJECT}, PROJECT_ID=${process.env.PROJECT_ID}`);
    console.log(`[FIREBASE] Starting DB discovery for project: ${finalProjectId}`);
    
    const databasesToTry = [];
    if (namedDbId && namedDbId !== '(default)') {
      databasesToTry.push(namedDbId);
    }
    databasesToTry.push('(default)');

    for (const dbId of databasesToTry) {
      try {
        console.log(`Testing database: ${dbId} in project: ${finalProjectId}`);
        const testDb = getFirestore(defaultApp, dbId);
        testDb.settings({ ignoreUndefinedProperties: true });
        // We use a simple query. If the database doesn't exist, this will throw NOT_FOUND (code 5).
        // If the collection doesn't exist, it will return an empty snapshot (success).
        await testDb.collection('health_check').limit(1).get();
        console.log(`SUCCESS: Connected to database: ${dbId}`);
        return testDb;
      } catch (e: any) {
        console.warn(`FAILED: Database ${dbId} - Code: ${e.code}, Message: ${e.message}`);
        // If it's a permission error, we might still want to try the next one
        // If it's NOT_FOUND, we definitely want to try the next one
      }
    }
    
    // If all tests failed, return the named one if it exists, otherwise (default)
    const finalDbId = namedDbId || '(default)';
    console.log(`All DB tests failed. Falling back to ${finalDbId} without verification.`);
    return getFirestore(defaultApp, finalDbId);
  }

  // Update global db reference initially
  (global as any).db = db;

  // Blocking Firestore initialization with fallback
  try {
    const activeDb = await initializeDb();
    (global as any).db = activeDb;
    const activeDbId = activeDb.databaseId || firebaseConfig.firestoreDatabaseId || '(default)';
    // Write status to file for verification
    fs.writeFileSync(path.join(process.cwd(), 'firestore-status.json'), JSON.stringify({
      status: 'success',
      projectId: finalProjectId,
      databaseId: activeDbId,
      env: {
        GOOGLE_CLOUD_PROJECT: process.env.GOOGLE_CLOUD_PROJECT,
        GCLOUD_PROJECT: process.env.GCLOUD_PROJECT,
        PROJECT_ID: process.env.PROJECT_ID,
        FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID
      },
      timestamp: new Date().toISOString()
    }));
    
    console.log(`[FIREBASE] Active database set to: ${activeDbId} in Project: ${finalProjectId}`);
  } catch (e) {
    // Write failure to file
    fs.writeFileSync(path.join(process.cwd(), 'firestore-status.json'), JSON.stringify({
      status: 'failed',
      error: e instanceof Error ? e.message : String(e),
      env: {
        GOOGLE_CLOUD_PROJECT: process.env.GOOGLE_CLOUD_PROJECT,
        GCLOUD_PROJECT: process.env.GCLOUD_PROJECT,
        PROJECT_ID: process.env.PROJECT_ID,
        FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID
      },
      timestamp: new Date().toISOString()
    }));
    console.error('[FIREBASE] Critical: Firestore initialization failed:', e);
  }

  app.use(express.json());

  // API routes
  app.get("/api/health", async (req, res) => {
    const path = 'bookings';
    const currentDb = (global as any).db;
    try {
      // Test query to verify connection and permissions
      const testDoc = await currentDb.collection(path).limit(1).get();
      
      // Test write/delete to verify write permissions
      const testRef = currentDb.collection('health_check').doc('test');
      await testRef.set({ timestamp: FieldValue.serverTimestamp() });
      await testRef.delete();

      // Try to list collections
      let collections: string[] = [];
      try {
        const collectionsSnapshot = await currentDb.listCollections();
        collections = collectionsSnapshot.map(c => c.id);
      } catch (e) {
        console.warn('Could not list collections:', e);
      }

      res.json({ 
        status: "ok", 
        firestore: "connected", 
        read: "ok",
        write: "ok",
        count: testDoc.size,
        collections,
        projectId: projectId,
        databaseId: currentDb.databaseId || '(default)'
      });
    } catch (error: any) {
      const wrappedError = handleFirestoreError(error, OperationType.GET, path);
      res.status(500).json(JSON.parse(wrappedError.message));
    }
  });

  // iCal Export
  app.get("/api/calendar/export", async (req, res) => {
    const path = 'bookings';
    const currentDb = (global as any).db;
    try {
      const bookingsSnapshot = await currentDb.collection(path)
        .where('status', '==', 'confirmed')
        .get();

      const calendar = ical({ name: 'Unique Farmhouse Bookings' });
      calendar.method(ICalCalendarMethod.PUBLISH);

      bookingsSnapshot.forEach(doc => {
        const data = doc.data();
        const checkIn = parse(data.checkIn, 'dd/MM/yyyy', new Date());
        const checkOut = parse(data.checkOut, 'dd/MM/yyyy', new Date());

        if (isValid(checkIn) && isValid(checkOut)) {
          calendar.createEvent({
            start: checkIn,
            end: checkOut,
            summary: `Booking: ${data.name || 'Guest'}`,
            description: `Guests: ${data.guestsDay || 0} Day / ${data.guestsNight || 0} Night\nOccasion: ${data.occasion || 'N/A'}`,
            id: doc.id,
          });
        }
      });

      res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="bookings.ics"');
      res.send(calendar.toString());
    } catch (error: any) {
      const wrappedError = handleFirestoreError(error, OperationType.GET, path);
      res.status(500).send(`Error generating calendar: ${wrappedError.message}`);
    }
  });

  // iCal Sync (Import)
  app.post("/api/calendar/sync", async (req, res) => {
    const path = 'settings/calendar_sync';
    const currentDb = (global as any).db;
    try {
      const settingsDoc = await currentDb.doc(path).get();
      if (!settingsDoc.exists) {
        return res.status(404).json({ error: 'Sync settings not found' });
      }

      const { urls } = settingsDoc.data() as { urls: { name: string, url: string }[] };
      if (!urls || urls.length === 0) {
        return res.json({ message: 'No external calendars to sync' });
      }

      const allExternalEvents: any[] = [];

      for (const item of urls) {
        try {
          const events = await nodeIcal.fromURL(item.url);
          Object.values(events).forEach(event => {
            if (event.type === 'VEVENT') {
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

      // Clear old external blocked dates and save new ones
      const batch = currentDb.batch();
      const blockedSnapshot = await currentDb.collection('blocked_dates').where('type', '==', 'external').get();
      blockedSnapshot.forEach(doc => batch.delete(doc.ref));

      allExternalEvents.forEach(event => {
        const docRef = currentDb.collection('blocked_dates').doc();
        batch.set(docRef, {
          ...event,
          type: 'external',
          status: 'confirmed',
          checkIn: format(event.start, 'dd/MM/yyyy'),
          checkOut: format(event.end, 'dd/MM/yyyy'),
          updatedAt: FieldValue.serverTimestamp(),
        });
      });

      await batch.commit();
      res.json({ message: 'Sync completed', count: allExternalEvents.length });
    } catch (error: any) {
      const wrappedError = handleFirestoreError(error, OperationType.WRITE, 'blocked_dates');
      res.status(500).json(JSON.parse(wrappedError.message));
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
    console.log(`[FIREBASE] Configured Project ID: ${firebaseConfig.projectId}`);
    console.log(`[FIREBASE] Final Project ID: ${finalProjectId}`);
  });
}

startServer();
