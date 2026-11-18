const express = require('express');
const cors = require('cors');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

let clientState = {
  status: 'disconnected', // disconnected, qr_ready, connected
  qrCodeDataUrl: null,
  info: null
};

let whatsappClient = null;

function initWhatsApp() {
  if (whatsappClient) return;

  clientState.status = 'initializing';

  whatsappClient = new Client({
    authStrategy: new LocalAuth({ clientId: 'saas-whatsapp-session' }),
    puppeteer: {
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    }
  });

  whatsappClient.on('qr', async (qr) => {
    console.log('QR Code received');
    try {
      const dataUrl = await qrcode.toDataURL(qr);
      clientState.qrCodeDataUrl = dataUrl;
      clientState.status = 'qr_ready';
    } catch (err) {
      console.error('Failed to generate QR data URL', err);
    }
  });

  whatsappClient.on('ready', () => {
    console.log('WhatsApp Client is ready and connected!');
    clientState.status = 'connected';
    clientState.qrCodeDataUrl = null;
    clientState.info = whatsappClient.info;
  });

  whatsappClient.on('authenticated', () => {
    console.log('WhatsApp Authenticated!');
  });

  whatsappClient.on('auth_failure', (msg) => {
    console.error('WhatsApp Authentication failure', msg);
    clientState.status = 'disconnected';
    clientState.qrCodeDataUrl = null;
  });

  whatsappClient.on('disconnected', (reason) => {
    console.log('WhatsApp Disconnected', reason);
    clientState.status = 'disconnected';
    clientState.qrCodeDataUrl = null;
    clientState.info = null;
    whatsappClient = null;
  });

  whatsappClient.initialize().catch(err => {
    console.error('Failed to initialize whatsapp client:', err);
    clientState.status = 'disconnected';
  });
}

app.get('/', (req, res) => {
  res.json({ message: 'WhatsApp Render Backend is running!', state: clientState.status });
});

app.get('/api/status', (req, res) => {
  res.json({
    status: clientState.status,
    qr: clientState.qrCodeDataUrl,
    info: clientState.info
  });
});

app.post('/api/connect', (req, res) => {
  if (clientState.status === 'disconnected') {
    initWhatsApp();
    res.json({ success: true, message: 'WhatsApp initialization started' });
  } else {
    res.json({ success: true, message: 'Already initializing or connected', status: clientState.status });
  }
});

app.post('/api/logout', async (req, res) => {
  try {
    if (whatsappClient) {
      await whatsappClient.logout();
      await whatsappClient.destroy();
      whatsappClient = null;
    }
    clientState = { status: 'disconnected', qrCodeDataUrl: null, info: null };
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/send-message', async (req, res) => {
  const { phone, message } = req.body;
  if (clientState.status !== 'connected' || !whatsappClient) {
    return res.status(400).json({ success: false, error: 'WhatsApp is not connected' });
  }
  try {
    const chatId = phone.includes('@c.us') ? phone : `${phone.replace(/\D/g, '')}@c.us`;
    const response = await whatsappClient.sendMessage(chatId, message);
    res.json({ success: true, response });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`WhatsApp Backend server running on port ${PORT}`);
  // Auto-start WhatsApp client initialization
  initWhatsApp();
});
