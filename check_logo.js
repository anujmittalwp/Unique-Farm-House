import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import fetch from "node-fetch";

const firebaseConfig = {
  projectId: "ai-studio-f7380372-aa21-47e5-a700-4543b093cb2e"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
async function run() {
  const docRef = doc(db, "settings", "site");
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    console.log("Document data:", docSnap.data());
  } else {
    console.log("No such document!");
  }
}
run();
