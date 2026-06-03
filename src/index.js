export default {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url);
      const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, x-api-key",
      };

      if (request.method === "OPTIONS") {
        return new Response(null, { status: 204, headers: corsHeaders });
      }

      if (url.pathname.startsWith("/api") || url.pathname === "/env-test") {
        if (url.pathname === "/api/health" || url.pathname === "/env-test") {
          return new Response(
            JSON.stringify({
              success: true,
              message: "Worker API Running",
              keyId: env.RAZORPAY_KEY_ID ? "FOUND" : "MISSING",
              keySecret: env.RAZORPAY_KEY_SECRET ? "FOUND" : "MISSING",
            }),
            {
              status: 200,
              headers: { "Content-Type": "application/json", ...corsHeaders },
            },
          );
        }

        if (url.pathname === "/api/proxy/fetch" && request.method === "POST") {
          try {
            const body = await request.json();
            const fetchRes = await fetch(body.url);
            const text = await fetchRes.text();
            return new Response(text, {
              status: fetchRes.status,
              headers: corsHeaders,
            });
          } catch (e) {
            return new Response(e.message, {
              status: 500,
              headers: corsHeaders,
            });
          }
        }

        if (
          url.pathname === "/api/calendar/sync" &&
          request.method === "POST"
        ) {
          try {
            const body = await request.json();
            const urls = body.urls || [];
            const events = [];
            for (let u of urls) {
              try {
                const r = await fetch(u);
                if (r.ok) {
                  const text = await r.text();
                  const lines = text.split(/\r?\n/);
                  let ev = null;
                  for (let line of lines) {
                    if (line.startsWith("BEGIN:VEVENT")) ev = {};
                    else if (line.startsWith("END:VEVENT")) {
                      if (ev && ev.start && ev.end) events.push(ev);
                      ev = null;
                    } else if (ev) {
                      if (line.startsWith("DTSTART")) {
                        const val = line.split(":")[1];
                        if (val) {
                          if (val.length === 8)
                            ev.start =
                              val.slice(0, 4) +
                              "-" +
                              val.slice(4, 6) +
                              "-" +
                              val.slice(6, 8) +
                              "T00:00:00Z";
                          else if (val.includes("T"))
                            ev.start = val.replace(
                              /([0-9]{4})([0-9]{2})([0-9]{2})T([0-9]{2})([0-9]{2})([0-9]{2})/,
                              "--T::",
                            );
                        }
                      } else if (line.startsWith("DTEND")) {
                        const val = line.split(":")[1];
                        if (val) {
                          if (val.length === 8)
                            ev.end =
                              val.slice(0, 4) +
                              "-" +
                              val.slice(4, 6) +
                              "-" +
                              val.slice(6, 8) +
                              "T00:00:00Z";
                          else if (val.includes("T"))
                            ev.end = val.replace(
                              /([0-9]{4})([0-9]{2})([0-9]{2})T([0-9]{2})([0-9]{2})([0-9]{2})/,
                              "--T::",
                            );
                        }
                      } else if (line.startsWith("SUMMARY")) {
                        ev.summary = (line.split(":")[1] || "").trim();
                      }
                    }
                  }
                }
              } catch (ex) {}
            }
            return new Response(JSON.stringify({ events }), {
              status: 200,
              headers: { "Content-Type": "application/json", ...corsHeaders },
            });
          } catch (e) {
            return new Response(JSON.stringify({ error: e.message }), {
              status: 500,
              headers: { "Content-Type": "application/json", ...corsHeaders },
            });
          }
        }

        if (url.pathname === "/api/reviews/sync" && request.method === "POST") {
          return new Response(
            JSON.stringify({
              success: true,
              newCount: 0,
              message:
                "Google Reviews Sync disabled or returning 0 for now (Worker mode)",
            }),
            {
              status: 200,
              headers: { "Content-Type": "application/json", ...corsHeaders },
            },
          );
        }

        if (url.pathname === "/api/create-order" && request.method === "POST") {
          const body = await request.json();
          const keyId = env.RAZORPAY_KEY_ID;
          const keySecret = env.RAZORPAY_KEY_SECRET;

          if (!keyId || !keySecret) {
            return new Response(
              JSON.stringify({ error: "Razorpay credentials missing" }),
              {
                status: 500,
                headers: { "Content-Type": "application/json", ...corsHeaders },
              },
            );
          }

          const auth = btoa(keyId + ":" + keySecret);
          const response = await fetch("https://api.razorpay.com/v1/orders", {
            method: "POST",
            headers: {
              Authorization: "Basic " + auth,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              amount: Math.round(Number(body.amount) * 100),
              currency: "INR",
              receipt: "receipt_" + Date.now(),
            }),
          });

          const data = await response.json();
          return new Response(JSON.stringify(data), {
            status: 200,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          });
        }

        if (
          url.pathname === "/api/verify-payment" &&
          request.method === "POST"
        ) {
          const body = await request.json();
          const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
            body;
          const keySecret = env.RAZORPAY_KEY_SECRET;

          if (!keySecret) {
            return new Response(
              JSON.stringify({
                success: false,
                error: "Razorpay credentials missing",
              }),
              {
                status: 500,
                headers: { "Content-Type": "application/json", ...corsHeaders },
              },
            );
          }

          const encoder = new TextEncoder();
          const key = await crypto.subtle.importKey(
            "raw",
            encoder.encode(keySecret),
            { name: "HMAC", hash: "SHA-256" },
            false,
            ["sign"],
          );

          const signatureBuffer = await crypto.subtle.sign(
            "HMAC",
            key,
            encoder.encode(razorpay_order_id + "|" + razorpay_payment_id),
          );

          const generatedSignature = Array.from(new Uint8Array(signatureBuffer))
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");

          if (generatedSignature === razorpay_signature) {
            return new Response(
              JSON.stringify({
                success: true,
                message: "Payment Verified Successfully",
              }),
              {
                status: 200,
                headers: { "Content-Type": "application/json", ...corsHeaders },
              },
            );
          } else {
            return new Response(
              JSON.stringify({ success: false, error: "Invalid Signature" }),
              {
                status: 400,
                headers: { "Content-Type": "application/json", ...corsHeaders },
              },
            );
          }
        }

        return new Response(JSON.stringify({ error: "API Route Not Found" }), {
          status: 404,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      if (env.ASSETS) {
        try {
          let response = await env.ASSETS.fetch(request);
          if (response.status === 404 && request.method === "GET") {
            const indexUrl = new URL(request.url);
            indexUrl.pathname = "/";
            const fallbackRequest = new Request(indexUrl, request);
            response = await env.ASSETS.fetch(fallbackRequest);
          }
          return response;
        } catch (e) {
          return new Response(
            "Frontend asset or index.html missing from Worker ASSETS.",
            { status: 404 },
          );
        }
      } else {
        return new Response(
          "Missing ASSETS bindings for Cloudflare Worker. Make sure you have configured wrangler.toml with [assets] section.",
          { status: 500 },
        );
      }
    } catch (err) {
      return new Response(
        JSON.stringify({
          error: "Internal Server Error in Worker",
          details: err.message,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        },
      );
    }
  },
};
