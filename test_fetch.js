const urls = [
  {"id":"mmt123", "name":"MMT", "url":"https://ingo-content-clientbackend.goibibo.com/publicv2/export_calendar/v1/9a441df9043211efb1190a58a9feae02-0"}
];
async function run() {
  const response = await fetch('http://localhost:3000/api/calendar/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ urls })
  });
  console.log(await response.json());
}
run();
