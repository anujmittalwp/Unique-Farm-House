const http = require('http');

const data = JSON.stringify({
  urls: [{ name: 'Test', url: 'https://www.airbnb.com/calendar/ical/12345.ics?s=foo' }]
});

const req = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/api/calendar/sync',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
}, (res) => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => console.log('Status:', res.statusCode, 'Body:', body));
});

req.on('error', console.error);
req.write(data);
req.end();
