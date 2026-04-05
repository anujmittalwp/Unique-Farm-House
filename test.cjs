const fs = require('fs');
const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const url = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/${config.firestoreDatabaseId || '(default)'}/documents/public/calendar?key=${config.apiKey}`;
fetch(url).then(r => r.text()).then(console.log).catch(console.error);
