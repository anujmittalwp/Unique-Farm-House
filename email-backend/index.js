const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors()); // Allow cross-origin requests

const PORT = process.env.PORT || 3000;

app.post('/api/send-email', async (req, res) => {
  try {
    const apiKey = req.headers['x-api-key'];
    const secretKey = process.env.MY_SECRET_KEY;

    // Validate API Key
    if (!secretKey || apiKey !== secretKey) {
      return res.status(401).json({ success: false, error: "Unauthorized: Invalid x-api-key" });
    }

    const { to, subject, body } = req.body;

    // Validate request body
    if (!to || !subject || !body) {
      return res.status(400).json({ success: false, error: "Missing required fields: to, subject, body" });
    }

    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;

    // Validate server environment variables
    if (!user || !pass) {
      console.error("Missing EMAIL_USER or EMAIL_PASS environment variables");
      return res.status(500).json({ success: false, error: "Server misconfiguration: credentials missing" });
    }

    // Configure Nodemailer for Gmail
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465, // SSL
      secure: true,
      auth: { 
        user: user.trim(), 
        pass: pass.replace(/\s+/g, '') // remove spaces from App Password
      },
      tls: { rejectUnauthorized: false }
    });

    // Send the email
    const info = await transporter.sendMail({
      from: user,
      to,
      subject,
      html: body,
    });

    console.log(`[Email Sent] Successfully sent to ${to}, MessageId: ${info.messageId}`);
    res.json({ success: true, messageId: info.messageId });

  } catch (error) {
    console.error('[Email Send Error]', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Node.js Gmail Backend listening on port ${PORT}`);
});
