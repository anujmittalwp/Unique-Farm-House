const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

initializeApp({
  projectId: "ai-studio-f7380372-aa21-47e5-a700-4543b093cb2e"
});
const db = getFirestore();
db.settings({ databaseId: "ai-studio-f7380372-aa21-47e5-a700-4543b093cb2e" });

async function run() {
  const docRef = db.collection('settings').doc('site');
  const doc = await docRef.get();
  if (doc.exists) {
    const data = doc.data();
    console.log("DB logoUrl:", data.logoUrl);
    if (data.logoUrl && data.logoUrl.includes('res.cloudinary.com')) {
      await docRef.update({ logoUrl: "https://ik.imagekit.io/gqmm5bldg/Unique_Farm_House_Logo.png?updatedAt=1785825689134" });
      console.log("Updated DB logoUrl to ImageKit");
    }
  } else {
    console.log("No site document in DB");
  }
}
run().catch(console.error);
