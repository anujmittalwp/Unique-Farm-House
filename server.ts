import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import { ICalCalendar, ICalCalendarMethod } from "ical-generator";
import nodeIcal from "node-ical";
import { format, parse, isValid, addDays } from "date-fns";
import { Resend } from "resend";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const resend = new Resend(process.env.RESEND_API_KEY || 're_4zWip7uS_HvzE8i5v91eudf2KKS5Hmyp1');
if (!process.env.RESEND_API_KEY) {
  console.warn('RESEND_API_KEY not found in environment, using provided key from context.');
}

// Initialize Firebase Admin
const firebaseConfig = JSON.parse(fs.readFileSync(path.join(__dirname, 'firebase-applet-config.json'), 'utf8'));

console.log('Initializing Firebase Admin...');
console.log('Project ID:', firebaseConfig.projectId);
console.log('Database ID:', firebaseConfig.firestoreDatabaseId || '(default)');

const adminApp = admin.apps.length 
  ? admin.app() 
  : admin.initializeApp();

// Use the named database if provided, otherwise use the default
const db = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)' 
  ? getFirestore(adminApp, firebaseConfig.firestoreDatabaseId) 
  : getFirestore(adminApp);

// Test database connection
async function testDb() {
  try {
    // Try a simple read to verify connection and permissions
    const testSnapshot = await db.collection('bookings').limit(1).get();
    console.log('Firebase Admin: Successfully connected to database. Found', testSnapshot.size, 'bookings.');
  } catch (error) {
    console.error('Firebase Admin: Database connection test failed.');
    if (error instanceof Error) {
      console.error('Error Message:', error.message);
      console.error('Error Stack:', error.stack);
      
      if (error.message.includes('PERMISSION_DENIED')) {
        console.error('CRITICAL: Permission Denied. This usually means the service account does not have "Cloud Datastore User" or "Firebase Admin" roles, or the Database ID is incorrect.');
      }
    } else {
      console.error('Unknown Error:', error);
    }
  }
}
testDb();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Admin Email Notification
  app.post("/api/notify/booking", async (req, res) => {
    const { booking, type } = req.body;
    if (!booking) return res.status(400).json({ error: 'Booking details required' });

    try {
      console.log('Attempting to add notification to Firestore');
      // 1. Store in Firestore Notifications
      await db.collection('notifications').add({
        type: type || 'new_booking',
        bookingId: booking.id || 'new',
        message: `${type === 'update' ? 'Updated' : 'New'} booking from ${booking.name}`,
        details: booking,
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log('Notification added to Firestore successfully');

      // 2. Send Email via Resend (if API key exists)
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
  app.get("/api/calendar/export", async (req, res) => {
    try {
      console.log('Generating iCal export for database:', firebaseConfig.firestoreDatabaseId || '(default)');
      
      const bookingsRef = db.collection('bookings');
      console.log('Collection path: bookings');
      
      const query = bookingsRef.where('status', '==', 'confirmed');
      console.log('Executing query: status == confirmed');
      
      const bookingsSnapshot = await query.get();
      console.log(`Found ${bookingsSnapshot.size} confirmed bookings`);

      const calendar = new ICalCalendar({ name: 'Unique Farmhouse Bookings' });
      calendar.method(ICalCalendarMethod.PUBLISH);

      bookingsSnapshot.forEach(doc => {
        try {
          const data = doc.data();
          if (!data.checkIn || !data.checkOut || typeof data.checkIn !== 'string' || typeof data.checkOut !== 'string') {
            return;
          }

          const checkIn = parse(data.checkIn, 'dd/MM/yyyy', new Date());
          const checkOut = parse(data.checkOut, 'dd/MM/yyyy', new Date());

          if (isValid(checkIn) && isValid(checkOut)) {
            // Ensure checkOut is after checkIn for ical-generator
            const endDate = checkOut <= checkIn ? addDays(checkIn, 1) : checkOut;
            
            calendar.createEvent({
              start: checkIn,
              end: endDate,
              summary: `Booking: ${data.name || 'Guest'}`,
              description: `Guests: ${data.dayGuestAdults || 0}A ${data.dayGuestChildren?.length || 0}C (Day) / ${data.nightGuestAdults || 0}A ${data.nightGuestChildren?.length || 0}C (Night)\nOccasion: ${data.occasion || 'N/A'}\nMobile: ${data.mobile || 'N/A'}`,
              location: 'Unique Farmhouse, Sector 135, Noida',
              url: process.env.APP_URL,
              id: doc.id,
            });
          }
        } catch (err) {
          console.error(`Error processing booking ${doc.id} for calendar:`, err);
        }
      });

      res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="bookings.ics"');
      res.send(calendar.toString());
    } catch (error) {
      console.error('Export error:', error);
      res.status(500).send('Error generating calendar: ' + (error instanceof Error ? error.message : String(error)));
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
