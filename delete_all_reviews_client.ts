import { initializeApp } from 'firebase/app';
import { initializeFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));

const app = initializeApp(config);
const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, config.firestoreDatabaseId || '(default)');

async function deleteAllReviews() {
  const querySnapshot = await getDocs(collection(db, 'reviews'));
  for (const document of querySnapshot.docs) {
    console.log('Deleting', document.id);
    await deleteDoc(doc(db, 'reviews', document.id));
  }
  console.log('Done');
}
deleteAllReviews();
