import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import admin from "firebase-admin";
import ical, { ICalCalendarMethod } from "ical-generator";
import nodeIcal from "node-ical";
import { format, parse, isValid, addDays } from "date-fns";
import { Resend } from "resend";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const resend = new Resend(process.env.RESEND_API_KEY);

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

  // Admin Email Notification
  app.post("/api/notify/booking", async (req, res) => {
    const { booking, type } = req.body;
    if (!booking) return res.status(400).json({ error: 'Booking details required' });

    try {
      // 1. Store in Firestore Notifications
      await db.collection('notifications').add({
        type: type || 'new_booking',
        bookingId: booking.id || 'new',
        message: `${type === 'update' ? 'Updated' : 'New'} booking from ${booking.name}`,
        details: booking,
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // 2. Send Email via Resend (if API key exists)
      if (process.env.RESEND_API_KEY) {
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
                  <tr><td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Guests:</td><td style="padding: 10px; border-bottom: 1px solid #eee;">${booking.guestsDay} Day / ${booking.guestsNight} Night</td></tr>
                  <tr><td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Occasion:</td><td style="padding: 10px; border-bottom: 1px solid #eee;">${booking.occasion || 'N/A'}</td></tr>
                  <tr><td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Total Amount:</td><td style="padding: 10px; border-bottom: 1px solid #eee;">₹${booking.totalAmount.toLocaleString()}</td></tr>
                  <tr><td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Payment Status:</td><td style="padding: 10px; border-bottom: 1px solid #eee;">${booking.paymentStatus.toUpperCase()}</td></tr>
                </table>
                <div style="text-align: center; margin-top: 30px;">
                  <a href="${process.env.APP_URL || '#'}" style="background: #D4AF37; color: #1a1a1a; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">View in Dashboard</a>
                </div>
              </div>
              <div style="background: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #999;">
                This is an automated notification from Unique Farmhouse Booking System.
              </div>
            </div>
          `
        });
      }

      res.json({ success: true, message: 'Notification sent' });
    } catch (error) {
      console.error('Notification error:', error);
      res.status(500).json({ error: 'Failed to send notification' });
    }
  });

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
