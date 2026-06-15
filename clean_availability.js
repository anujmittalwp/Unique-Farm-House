import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, deleteDoc, query, where, getDoc } from "firebase/firestore";
import fs from "fs";

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function clean() {
  const qCancelled = query(collection(db, 'bookings'), where('status', 'in', ['cancelled', 'abandoned']));
  const snapshot = await getDocs(qCancelled);
  let count = 0;
  for (const docSnap of snapshot.docs) {
    const availRef = doc(db, 'availability', docSnap.id);
    const availSnap = await getDoc(availRef);
    if (availSnap.exists()) {
       await deleteDoc(availRef);
       count++;
    }
  }
  console.log(`Cleaned up ${count} stale availability records.`);
  process.exit(0);
}
clean();
