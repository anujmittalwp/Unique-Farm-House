import { initializeApp as initializeAdminApp, getApps as getAdminApps, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as dotenv from "dotenv";

dotenv.config();

let adminApp;
if (getAdminApps().length === 0) {
  try {
    adminApp = initializeAdminApp({
      credential: applicationDefault()
    });
  } catch (e) {
    console.error(e);
  }
} else {
  adminApp = getAdminApps()[0];
}

const db = getFirestore();

async function check() {
  const snapshot = await db.collection('leads').orderBy('createdAt', 'desc').limit(20).get();
  snapshot.forEach(doc => {
    const data = doc.data();
    console.log(`Lead ID: ${doc.id}, Name: ${data.name}, Phone: ${data.phone}, Email: ${data.email}, Dup: ${data.isDuplicate}, Source: ${data.source}, Status: ${data.status}`);
  });
}

check().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
