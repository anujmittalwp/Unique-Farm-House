import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import admin from "firebase-admin";
import ical, { ICalCalendarMethod } from "ical-generator";
import nodeIcal from "node-ical";
import { format, parse, isValid, addDays } from "date-fns";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Initialize Firebase Admin
const firebaseConfig = JSON.parse(fs.readFileSync(path.join(__dirname, 'firebase-applet-config.json'), 'utf8'));
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: firebaseConfig.projectId,
  });
}
const db = admin.firestore();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // iCal Export
  app.get("/api/calendar/export", async (req, res) => {
    try {
      const bookingsSnapshot = await db.collection('bookings')
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
    } catch (error) {
      console.error('Export error:', error);
      res.status(500).send('Error generating calendar');
    }
  });

  // iCal Sync (Import)
  app.post("/api/calendar/sync", async (req, res) => {
    try {
      const settingsDoc = await db.collection('settings').doc('calendar_sync').get();
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
      const batch = db.batch();
      const blockedSnapshot = await db.collection('blocked_dates').where('type', '==', 'external').get();
      blockedSnapshot.forEach(doc => batch.delete(doc.ref));

      allExternalEvents.forEach(event => {
        const docRef = db.collection('blocked_dates').doc();
        batch.set(docRef, {
          ...event,
          type: 'external',
          status: 'confirmed',
          checkIn: format(event.start, 'dd/MM/yyyy'),
          checkOut: format(event.end, 'dd/MM/yyyy'),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      });

      await batch.commit();
      res.json({ message: 'Sync completed', count: allExternalEvents.length });
    } catch (error) {
      console.error('Sync error:', error);
      res.status(500).json({ error: 'Sync failed' });
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
