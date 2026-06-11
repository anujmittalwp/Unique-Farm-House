import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "gen-lang-client-0648775775",
  appId: "1:184624704421:web:fd699bf6cea2bc0362564c",
  apiKey: "AIzaSyBWtRZJYKaFyix-eY5Up2QQWoTB07y7zAk",
  authDomain: "auth.uniquefarms.in",
  firestoreDatabaseId: "ai-studio-f7380372-aa21-47e5-a700-4543b093cb2e"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function main() {
  const syncSnap = await getDoc(doc(db, 'settings', 'leadSync'));
  if (syncSnap.exists()) {
    const data = syncSnap.data();
    const hashes = data.processedHashes || [];
    console.log("Processed hashes count:", hashes.length);
    // Find if gaurav bhatt is there
    hashes.filter(h => h.toLowerCase().includes('gaurav bhatt')).forEach(h => console.log('Found:', h));
    hashes.filter(h => h.toLowerCase().includes('yasir')).forEach(h => console.log('Found:', h));
  }
}
main();
