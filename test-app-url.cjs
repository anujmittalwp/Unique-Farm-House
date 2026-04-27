const https = require('https');

https.get('https://ais-pre-ykn7bjgmz6crhpfzu6mjl4-44044545959.asia-southeast1.run.app/api/calendar/export.ics', (res) => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => console.log('Status:', res.statusCode, 'Body:', body.substring(0, 500)));
}).on('error', console.error);
