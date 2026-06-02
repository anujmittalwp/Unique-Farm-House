const fs = require('fs');

let workerContent = fs.readFileSync('worker.ts', 'utf-8');

const newSyncLogic = `    // 4. Manual Sync Trigger
    if (url.pathname === "/api/calendar/sync" && request.method === "POST") {
      try {
        const body = await request.json();
        const urlsToSync = body.urls || [];
        
        const parsedEvents = [];
        
        for (const u of urlsToSync) {
          if (u.url) {
            try {
              console.log("Fetching OTA calendar:", u.url);
              const res = await fetch(u.url, { 
                headers: { 'User-Agent': 'UniqueFarms-SyncBot/1.0', 'Accept': '*/*' }
              });
              const icsText = await res.text();
              
              // Simple iCal parser
              const lines = icsText.split(/\\r\\n|\\n|\\r/);
              let inEvent = false;
              let currentEvent = null;
              
              for (const line of lines) {
                if (line.startsWith('BEGIN:VEVENT')) {
                  inEvent = true;
                  currentEvent = { source: u.name, type: 'external' };
                } else if (line.startsWith('END:VEVENT') && inEvent) {
                  if (currentEvent.checkIn && currentEvent.checkOut) {
                    parsedEvents.push(currentEvent);
                  }
                  inEvent = false;
                  currentEvent = null;
                } else if (inEvent) {
                  if (line.startsWith('DTSTART')) {
                    const match = line.match(/:(\\d{4})(\\d{2})(\\d{2})/);
                    if (match) {
                      currentEvent.checkIn = \`\${match[3]}/\${match[2]}/\${match[1]}\`; // DD/MM/YYYY
                    }
                  } else if (line.startsWith('DTEND')) {
                    const match = line.match(/:(\\d{4})(\\d{2})(\\d{2})/);
                    if (match) {
                      // Note: iCal DTEND is exclusive. If someone books 1st Jan to 2nd Jan, DTEND is 2nd Jan.
                      // Our standard is the same, so we can just use the date.
                      currentEvent.checkOut = \`\${match[3]}/\${match[2]}/\${match[1]}\`;
                    }
                  } else if (line.startsWith('SUMMARY')) {
                    currentEvent.guestName = line.substring(line.indexOf(':') + 1) || 'OTA Booking';
                  }
                }
              }
            } catch (err) {
              console.error("Failed to fetch", u.url, err.message);
            }
          }
        }
        
        return new Response(JSON.stringify({ success: true, message: "Sync successful", events: parsedEvents }), {
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
      } catch (error) {
        return new Response(JSON.stringify({ success: false, error: "Sync failed" }), {
          status: 500,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
      }
    }`;

workerContent = workerContent.replace(/\/\/ 4\. Manual Sync Trigger[\s\S]*?(?=return new Response\("Not Found", \{ status: 404 \}\);)/, newSyncLogic + '\n\n    ');

fs.writeFileSync('worker.ts', workerContent);
