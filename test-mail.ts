import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import fs from 'fs';
import path from 'path';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId || '(default)');

async function test() {
  try {
    const gmailDoc = await getDoc(doc(db, 'settings', 'gmail'));
    console.log("Exists:", gmailDoc.exists());
    if (gmailDoc.exists()) {
      console.log("Data:", gmailDoc.data()?.user);
    }
  } catch (e: any) {
    console.error("Error:", e.message);
  }
}
test();
