// Cloudflare Worker SSE Notification System
let clients = [];

export default {
  async scheduled(event, env, ctx) {
    console.log("Cron trigger sync event fired at", event.cron);
  },

  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Handle CORS preflight requests
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };

    // 1. SSE Stream Endpoint
    if (url.pathname === "/api/notifications/stream") {
      const responseStream = new ReadableStream({
        start(controller) {
          clients.push(controller);
          controller.enqueue(`data: ${JSON.stringify({ type: 'system', message: 'Connected' })}\n\n`);
          const heartbeat = setInterval(() => {
            try {
              controller.enqueue(': heartbeat\\n\\n');
            } catch (e) {
              clearInterval(heartbeat);
            }
          }, 20000);
        },
        cancel(controller) {
          clients = clients.filter(c => c !== controller);
        }
      });

      return new Response(responseStream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
          ...corsHeaders
        },
      });
    }

    // 2. Broadcast/Notify Endpoint
    if (url.pathname === "/api/notify" && request.method === "POST") {
      try {
        const payload = await request.json();
        const data = `data: ${JSON.stringify(payload)}\n\n`;

        clients.forEach(client => {
          try {
            client.enqueue(data);
          } catch (e) {
            clients = clients.filter(c => c !== client);
          }
        });

        return new Response(JSON.stringify({ success: true, receivers: clients.length }), {
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
      }
    }

    // 3. Calendar ICS Export Endpoint
    if (url.pathname === "/calendar.ics" && request.method === "GET") {
      try {
        const PROJECT_ID = env.FIREBASE_PROJECT_ID || "gen-lang-client-0648775775";
        const DB_ID = env.FIREBASE_DB_ID || "ai-studio-f7380372-aa21-47e5-a700-4543b093cb2e";
        
        const baseUrl = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/${DB_ID}/documents`;
        
        const [blockedRes, bookingsRes] = await Promise.all([
          fetch(`${baseUrl}/blocked_dates?pageSize=1000`),
          fetch(`${baseUrl}/availability?pageSize=1000`)
        ]);
        
        const blockedData = await blockedRes.json();
        const bookingsData = await bookingsRes.json();
        
        let icsData = "BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//UniqueFarms//Calendar Sync//EN\r\nCALSCALE:GREGORIAN\r\nMETHOD:PUBLISH\r\n";
        
        const processDocs = (data, prefix) => {
          if (data.documents && Array.isArray(data.documents)) {
            data.documents.forEach((doc) => {
              const fields = doc.fields;
              const status = fields.status?.stringValue;
              
              // Only include confirmed bookings or booked blocks
              if (prefix === 'booking' && status && status !== 'confirmed') return;

              if (fields && fields.checkIn && fields.checkOut) {
                const ci = fields.checkIn.stringValue; 
                const co = fields.checkOut.stringValue;
                if (ci && co) {
                  const partsIn = ci.split('/');
                  const partsOut = co.split('/');
                  
                  if (partsIn.length === 3 && partsOut.length === 3) {
                    const startStr = `${partsIn[2]}${partsIn[1].padStart(2,'0')}${partsIn[0].padStart(2,'0')}`;

                    // In VALUE=DATE, DTEND is exclusive
                    const outDate = new Date(parseInt(partsOut[2]), parseInt(partsOut[1]) - 1, parseInt(partsOut[0]));
                    const endStr = `${outDate.getFullYear()}${String(outDate.getMonth() + 1).padStart(2,'0')}${String(outDate.getDate()).padStart(2,'0')}`;

                    const dtstamp = new Date().toISOString().replace(/[:-]/g, '').substring(0, 15) + 'Z';
                    const uid = (doc.name.split('/').pop() || "event") + `-${prefix}@uniquefarms`;

                    icsData += "BEGIN:VEVENT\r\n";
                    icsData += `UID:${uid}\r\n`;
                    icsData += `DTSTAMP:${dtstamp}\r\n`;
                    icsData += `DTSTART;VALUE=DATE:${startStr}\r\n`;
                    icsData += `DTEND;VALUE=DATE:${endStr}\r\n`;
                    icsData += "SUMMARY:Reserved - Unique Farmhouse\r\n";
                    icsData += "STATUS:CONFIRMED\r\n";
                    icsData += "END:VEVENT\r\n";
                  }
                }
              }
            });
          }
        };

        processDocs(blockedData, 'block');
        processDocs(bookingsData, 'booking');
        
        icsData += "END:VCALENDAR\r\n";
        
        return new Response(icsData, {
          headers: {
            "Content-Type": "text/calendar; charset=utf-8",
            "Content-Disposition": "attachment; filename=\"calendar.ics\"",
            "Cache-Control": "no-cache",
            ...corsHeaders
          },
        });
      } catch (e) {
        return new Response("Error generating calendar", { status: 500, headers: corsHeaders });
      }
    }

    // 4. Manual Sync Trigger (MMT / Airbnb bypass)
    if (url.pathname === "/api/calendar/sync" && request.method === "POST") {
      try {
        const body = await request.json();
        const urlsToSync = body.urls || [];
        
        const parsedEvents = [];
        
        for (const u of urlsToSync) {
          try {
            const rawUrl = u.url || '';
            const normalizedUrl = rawUrl.startsWith('webcal://') ? 'https://' + rawUrl.substring(9) : rawUrl;
            
            if (!normalizedUrl) continue;
            
            console.log("Fetching OTA calendar:", normalizedUrl);
            
            // Bypass script: Fetch directly from OTA (avoids GCP IP blocks)
            const res = await fetch(normalizedUrl, { 
              headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                'Accept': 'text/calendar,text/plain,*/*' 
              }
            });
            const icsText = await res.text();
            
            // Simple iCal parser for DTSTART / DTEND
            const lines = icsText.split(/\\r\\n|\\n|\\r/);
            let inEvent = false;
            let currentEvent = null;
            
            for (const line of lines) {
              if (line.startsWith('BEGIN:VEVENT')) {
                inEvent = true;
                currentEvent = { source: u.name, type: 'external' };
              } else if (line.startsWith('END:VEVENT') && inEvent) {
                if (currentEvent.checkIn && currentEvent.checkOut) {
                  currentEvent.uid = currentEvent.uid || Math.random().toString(36).substring(7);
                  parsedEvents.push(currentEvent);
                }
                inEvent = false;
                currentEvent = null;
              } else if (inEvent) {
                if (line.startsWith('DTSTART')) {
                  const match = line.match(/:(\\d{4})(\\d{2})(\\d{2})/);
                  if (match) {
                    currentEvent.checkIn = `${match[3]}/${match[2]}/${match[1]}`; // DD/MM/YYYY
                  }
                } else if (line.startsWith('DTEND')) {
                  const match = line.match(/:(\d{4})(\d{2})(\d{2})/);
                  if (match) {
                    currentEvent.checkOut = `${match[3]}/${match[2]}/${match[1]}`;
                  }
                } else if (line.startsWith('SUMMARY')) {
                  currentEvent.summary = line.substring(line.indexOf(':') + 1) || 'OTA Booking';
                } else if (line.startsWith('UID')) {
                  currentEvent.uid = line.substring(line.indexOf(':') + 1) || Math.random().toString(36).substring(7);
                }
              }
            }
          } catch (err) {
            console.error("Failed to fetch", u.url, err.message);
          }
        }
        
        return new Response(JSON.stringify({ success: true, message: "Sync successful", events: parsedEvents }), {
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      } catch (error) {
        return new Response(JSON.stringify({ success: false, error: "Sync failed" }), {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }
    }

    return new Response("Not Found", { status: 404, headers: corsHeaders });
  }
};
