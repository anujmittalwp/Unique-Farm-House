import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import fs from "fs";

const config = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
const app = initializeApp(config.firebase);
const db = getFirestore(app);

async function run() {
  const snap = await getDoc(doc(db, 'settings', 'pricing'));
  if (snap.exists()) {
     console.log('Pricing data addons:', JSON.stringify(snap.data().addons, null, 2));
  } else {
     console.log('No pricing doc found.');
  }
  process.exit(0);
}
run();
