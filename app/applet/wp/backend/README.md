# WP Backend (Render Service)

This is the Node.js Express backend with `whatsapp-web.js` for managing WhatsApp Web sessions, QR code generation, and message sending.

## Deployment on Render
1. Push this `wp` folder (or separate `wp/backend` repo) to GitHub.
2. Go to [Render](https://render.com) -> New + -> Web Service.
3. Connect your GitHub repository.
4. Set:
   - **Root Directory:** `wp/backend` (if in monorepo) or root.
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Click **Create Web Service**.
