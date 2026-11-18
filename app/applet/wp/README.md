# Standalone WhatsApp SaaS System (`wp`)

This folder contains a 100% independent WhatsApp SaaS system, completely separated from the main application. It has zero impact on any existing running features or functions of your main project.

## Structure
- `backend/`: Node.js Express server using `whatsapp-web.js` for Render deployment (handles WhatsApp session, QR code generation, connection status, and message sending).
- `frontend/`: Cloudflare Worker script serving a Tailwind CSS UI with Google Login and live QR code synchronization.

## Backup
A full backup of your project prior to creating this folder has been safely stored in `/backups/`.
