import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));

// Initialize with applicationDefault()
import { applicationDefault } from 'firebase-admin/app';
initializeApp({ credential: applicationDefault(), projectId: firebaseConfig.projectId });

const db = getFirestore();

async function run() {
  const doc = await db.collection('settings').doc('cloudinary').get();
  console.log("Exists:", doc.exists);
  if (doc.exists) {
    console.log("Data:", doc.data());
  }
}
run().catch(console.error);
