import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const configPath = path.join(__dirname, '..', 'firebase-applet-config.json');

const originalProjectId = process.env.GOOGLE_CLOUD_PROJECT;
console.log(`[ENV] Original GOOGLE_CLOUD_PROJECT: ${originalProjectId}`);

if (fs.existsSync(configPath)) {
  const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const projectId = firebaseConfig.projectId;
  
  if (projectId) {
    // Force these variables to ensure the Admin SDK uses the correct project
    process.env.GOOGLE_CLOUD_PROJECT = projectId;
    process.env.GCLOUD_PROJECT = projectId;
    process.env.PROJECT_ID = projectId;
    process.env.FIREBASE_PROJECT_ID = projectId;
    console.log(`[ENV] Forced Project ID to: ${projectId} (Original was: ${originalProjectId})`);
  }
} else {
  console.warn('[ENV] firebase-applet-config.json not found');
}
