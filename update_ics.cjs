const fs = require('fs');
const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));

async function update() {
  const url = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/${config.firestoreDatabaseId || '(default)'}/documents/public/calendar?key=${config.apiKey}`;
  
  const response = await fetch(url);
  const data = await response.json();
  let icsContent = data.fields?.icsData?.stringValue;
  
  if (icsContent && !icsContent.includes('CALSCALE')) {
    icsContent = icsContent.replace('PRODID:-//Unique Farmhouse//Bookings//EN\r\n', 'PRODID:-//Unique Farmhouse//Bookings//EN\r\nCALSCALE:GREGORIAN\r\nMETHOD:PUBLISH\r\n');
    
    const patchUrl = `${url}&updateMask.fieldPaths=icsData`;
    await fetch(patchUrl, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fields: {
          icsData: { stringValue: icsContent }
        }
      })
    });
    console.log('Updated ICS in Firestore');
  } else {
    console.log('No update needed');
  }
}

update().catch(console.error);
