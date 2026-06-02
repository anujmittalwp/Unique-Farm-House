const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');
content = content.replace(/showToast\('Calendar successfully synced!', 'success'\);/, "showToast(`Calendar successfully synced! Found ${data.events ? data.events.length : 0} events.`, 'success');");
fs.writeFileSync('src/App.tsx', content);
