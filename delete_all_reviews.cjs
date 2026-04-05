const fs = require('fs');
const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));

async function deleteAllReviews() {
  const url = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/${config.firestoreDatabaseId || '(default)'}/documents/reviews?key=${config.apiKey}`;
  const response = await fetch(url);
  const data = await response.json();
  
  if (data.documents) {
    for (const doc of data.documents) {
      console.log('Deleting', doc.name);
      await fetch(`https://firestore.googleapis.com/v1/${doc.name}?key=${config.apiKey}`, {
        method: 'DELETE'
      });
    }
  }
  console.log('Done');
}
deleteAllReviews();
