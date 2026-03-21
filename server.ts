import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for sending booking confirmation email
  app.post("/api/send-booking-email", async (req, res) => {
    const { email, name, checkIn, checkOut, guests, totalAmount, bookingId } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Configure nodemailer with environment variables
    // For demo purposes, we'll use a mock or real SMTP if provided
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.ethereal.email",
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: `"Unique Farmhouse" <${process.env.SMTP_USER || "noreply@uniquefarmhouse.com"}>`,
      to: email,
      subject: `Booking Confirmation - ${bookingId}`,
      html: `
        <div style="font-family: serif; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e5e5; border-radius: 12px;">
          <h1 style="color: #b8860b; text-align: center;">Booking Confirmed!</h1>
          <p>Dear ${name || "Guest"},</p>
          <p>Thank you for choosing <strong>Unique Farmhouse</strong>. Your booking has been successfully confirmed.</p>
          
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; border-bottom: 1px solid #e5e5e5; padding-bottom: 10px;">Stay Details</h3>
            <p><strong>Booking ID:</strong> ${bookingId}</p>
            <p><strong>Check-In:</strong> ${checkIn} (2:00 PM)</p>
            <p><strong>Check-Out:</strong> ${checkOut} (11:00 AM)</p>
            <p><strong>Guests:</strong> ${guests}</p>
            <p><strong>Total Amount:</strong> ₹${totalAmount.toLocaleString()}</p>
          </div>
          
          <p>We look forward to hosting you for your celebration!</p>
          <p>Best regards,<br>The Unique Farmhouse Team</p>
          
          <hr style="border: 0; border-top: 1px solid #e5e5e5; margin: 20px 0;">
          <p style="font-size: 12px; color: #666; text-align: center;">
            Unique Farmhouse, Noida, Uttar Pradesh<br>
            Contact: +91 98100 00000
          </p>
        </div>
      `,
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log("Email sent: %s", info.messageId);
      res.json({ success: true, messageId: info.messageId });
    } catch (error) {
      console.error("Error sending email:", error);
      res.status(500).json({ error: "Failed to send email" });
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
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
