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
    console.log("Found hashes:", hashes.length);
    const yasir = hashes.find((h: string) => h.toLowerCase().includes('yasir'));
    console.log("Is Yasir already synced in hash memory?:", yasir ? "YES" : "NO");
    const gaurav = hashes.find((h: string) => h.toLowerCase().includes('gaurav bhatt'));
    console.log("Is Gaurav already synced in hash memory?:", gaurav ? "YES" : "NO");
  }
}
main().then(() => process.exit(0)).catch(() => process.exit(1));
