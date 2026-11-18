# WP Frontend (Cloudflare Worker)

This is the serverless frontend for the WhatsApp SaaS system, built as a Cloudflare Worker serving a modern Tailwind CSS UI with Google Login and live WhatsApp QR code polling.

## Deployment on Cloudflare Worker
1. Install Wrangler CLI: `npm install -g wrangler`
2. Login to Cloudflare: `wrangler login`
3. Open `wrangler.toml` and update `BACKEND_URL` with your live Render backend URL (`https://your-service.onrender.com`).
4. Deploy: `wrangler deploy`
