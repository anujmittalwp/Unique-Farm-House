const fetch = require('node-fetch');

async function test() {
  const res = await fetch('http://localhost:3000/calendar.ics');
  console.log(await res.text());
}
test();
