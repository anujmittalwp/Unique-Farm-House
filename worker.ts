
// Cloudflare Worker SSE Notification System
let clients = [];

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 1. SSE Stream Endpoint
    if (url.pathname === "/api/notifications/stream") {
      const responseStream = new ReadableStream({
        start(controller) {
          // Add client to global list
          clients.push(controller);
          
          // Send initial connection message
          controller.enqueue(`data: ${JSON.stringify({ type: 'system', message: 'Connected' })}\n\n`);

          // Heartbeat interval to keep connection alive
          const heartbeat = setInterval(() => {
            try {
              controller.enqueue(': heartbeat\n\n');
            } catch (e) {
              clearInterval(heartbeat);
            }
          }, 20000);
        },
        cancel(controller) {
          // Remove client on disconnect
          clients = clients.filter(c => c !== controller);
        }
      });

      return new Response(responseStream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    // 2. Broadcast/Notify Endpoint
    if (url.pathname === "/api/notify" && request.method === "POST") {
      try {
        const payload = await request.json();
        const data = `data: ${JSON.stringify(payload)}\n\n`;

        // Broadcast to all connected clients
        clients.forEach(client => {
          try {
            client.enqueue(data);
          } catch (e) {
            // Clean up stale clients
            clients = clients.filter(c => c !== client);
          }
        });

        return new Response(JSON.stringify({ success: true, receivers: clients.length }), {
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
      }
    }

    return new Response("Not Found", { status: 404 });
  }
};
