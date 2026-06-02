# Node.js Gmail Backend target

This is a standalone Node.js server that you can deploy anywhere (Render, Heroku, DigitalOcean, a VPS, etc.) to handle sending Gmail emails via Nodemailer. 

Because Cloudflare Pages/Workers do not support standard Node.js TCP connections out-of-the-box for Nodemailer, deploying this separate service solves the "Preview works, Cloudflare fails" issue.

## Environment Variables to set on your server:
- `MY_SECRET_KEY`: A secure password/token (matches the 'Relay Secret' in the frontend)
- `EMAIL_USER`: Your Gmail address
- `EMAIL_PASS`: Your 16-character Gmail App Password

## How to use:
1. Deploy this folder (`email-backend`) to any Node hosting provider (like Render.com).
2. Grab the URL (e.g. `https://my-email-app.onrender.com`).
3. In the Frontend App (the one deployed on Cloudflare Pages):
    - When connecting Gmail, use `https://my-email-app.onrender.com/api/send-email` as the "Worker URL" (it accepts the same format!).
    - Put your `MY_SECRET_KEY` into the "Worker Secret" field.
