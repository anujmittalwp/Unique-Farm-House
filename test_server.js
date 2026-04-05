fetch('http://localhost:3000/api/calendar/export').then(async r => {
  console.log('Status:', r.status);
  console.log('Headers:', Object.fromEntries(r.headers.entries()));
  console.log('Body:', await r.text());
}).catch(console.error);
