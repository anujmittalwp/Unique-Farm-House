export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // =========================
    // HANDLE CORS PREFLIGHT
    // =========================
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    // =========================
    // COMMON CORS HEADERS
    // =========================
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    // =========================
    // ENV TEST ROUTE
    // =========================
    if (url.pathname === "/env-test") {
      return new Response(
        JSON.stringify({
          keyId: env.RAZORPAY_KEY_ID || "MISSING",
          keySecret: env.RAZORPAY_KEY_SECRET
            ? "FOUND"
            : "MISSING",
          viteKey:
            env.VITE_RAZORPAY_KEY_ID || "MISSING",
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

    // =========================
    // CREATE ORDER API
    // =========================
    if (
      url.pathname === "/api/create-order" &&
      request.method === "POST"
    ) {
      try {
        const body = await request.json();

        const {
          amount,
          currency = "INR",
          receipt,
        } = body;

        // Validate amount
        if (!amount) {
          return new Response(
            JSON.stringify({
              error: "Amount is required",
            }),
            {
              status: 400,
              headers: {
                "Content-Type": "application/json",
                ...corsHeaders,
              },
            }
          );
        }

        // Razorpay Keys
        const keyId =
          env.RAZORPAY_KEY_ID ||
          env.VITE_RAZORPAY_KEY_ID;

        const keySecret =
          env.RAZORPAY_KEY_SECRET;

        // Debug log
        console.log("KEY ID:", keyId);
        console.log(
          "KEY SECRET:",
          keySecret ? "FOUND" : "MISSING"
        );

        // Check missing credentials
        if (!keyId || !keySecret) {
          return new Response(
            JSON.stringify({
              error:
                "Razorpay credentials missing in Cloudflare Environment Variables",
              debug: {
                keyId: keyId || "MISSING",
                keySecret: keySecret
                  ? "FOUND"
                  : "MISSING",
              },
            }),
            {
              status: 500,
              headers: {
                "Content-Type": "application/json",
                ...corsHeaders,
              },
            }
          );
        }

        // Create Razorpay Auth
        const auth = btoa(
          `${keyId}:${keySecret}`
        );

        // Create Razorpay Order
        const response = await fetch(
          "https://api.razorpay.com/v1/orders",
          {
            method: "POST",
            headers: {
              Authorization: `Basic ${auth}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              amount: Math.round(
                Number(amount) * 100
              ),
              currency,
              receipt:
                receipt ||
                `rcpt_${Date.now()}`,
            }),
          }
        );

        const data =
          await response.json();

        // Razorpay API error
        if (!response.ok) {
          return new Response(
            JSON.stringify({
              error:
                "Failed to create Razorpay order",
              details: data,
            }),
            {
              status: response.status,
              headers: {
                "Content-Type": "application/json",
                ...corsHeaders,
              },
            }
          );
        }

        // Success response
        return new Response(
          JSON.stringify(data),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders,
            },
          }
        );
      } catch (err) {
        return new Response(
          JSON.stringify({
            error:
              err.message ||
              "Failed to create order",
          }),
          {
            status: 500,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders,
            },
          }
        );
      }
    }

    // =========================
    // VERIFY PAYMENT API
    // =========================
    if (
      url.pathname === "/api/verify-payment" &&
      request.method === "POST"
    ) {
      try {
        const body = await request.json();

        const {
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
        } = body;

        const keySecret =
          env.RAZORPAY_KEY_SECRET;

        // Check missing secret
        if (!keySecret) {
          return new Response(
            JSON.stringify({
              error:
                "Razorpay Key Secret is missing in Cloudflare Environment Variables",
            }),
            {
              status: 500,
              headers: {
                "Content-Type": "application/json",
                ...corsHeaders,
              },
            }
          );
        }

        // Verify Signature
        const encoder =
          new TextEncoder();

        const keyData =
          encoder.encode(keySecret);

        const messageData =
          encoder.encode(
            `${razorpay_order_id}|${razorpay_payment_id}`
          );

        const cryptoKey =
          await crypto.subtle.importKey(
            "raw",
            keyData,
            {
              name: "HMAC",
              hash: "SHA-256",
            },
            false,
            ["sign"]
          );

        const signature =
          await crypto.subtle.sign(
            "HMAC",
            cryptoKey,
            messageData
          );

        const signatureHex =
          Array.from(
            new Uint8Array(signature)
          )
            .map((b) =>
              b
                .toString(16)
                .padStart(2, "0")
            )
            .join("");

        // Match Signature
        if (
          signatureHex ===
          razorpay_signature
        ) {
          return new Response(
            JSON.stringify({
              success: true,
              message:
                "Payment verified successfully",
            }),
            {
              status: 200,
              headers: {
                "Content-Type": "application/json",
                ...corsHeaders,
              },
            }
          );
        }

        // Invalid Signature
        return new Response(
          JSON.stringify({
            success: false,
            error: "Invalid signature",
          }),
          {
            status: 400,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders,
            },
          }
        );
      } catch (err) {
        return new Response(
          JSON.stringify({
            error:
              err.message ||
              "Failed to verify payment",
          }),
          {
            status: 500,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders,
            },
          }
        );
      }
    }

    // =========================
    // SERVE FRONTEND WEBSITE
    // =========================
    return env.ASSETS.fetch(request);
  },
};