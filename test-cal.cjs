const http = require('http');

http.get('http://localhost:3000/calendar.ics', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log(data));
});
