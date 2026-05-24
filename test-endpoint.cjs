const http = require('http');
const req = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/api/reviews/sync',
  method: 'POST',
}, (res) => {
  console.log('STATUS: ' + res.statusCode);
  res.on('data', (d) => {
    process.stdout.write(d);
  });
});
req.end();
