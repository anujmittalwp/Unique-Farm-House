const http = require('http');
http.get('http://localhost:3000/api/calendar/export.ics', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => console.log('Status:', res.statusCode, '\nHeaders:', res.headers, '\nBody:', data.substring(0, 500)));
}).on('error', console.error);
