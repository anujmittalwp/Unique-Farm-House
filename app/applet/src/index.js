export default {
  async fetch(request, env, ctx) {

    const url = new URL(request.url);

    // =========================
    // CORS
    // =========================

    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    // OPTIONS REQUEST
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    // =========================
    // ENV TEST
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
    // CREATE ORDER
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

        // VALIDATE AMOUNT

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

        // ENV VARIABLES

        const keyId =
          env.RAZORPAY_KEY_ID ||
          env.VITE_RAZORPAY_KEY_ID;

        const keySecret =
          env.RAZORPAY_KEY_SECRET;

        // DEBUG

        console.log("KEY ID:", keyId);

        console.log(
          "KEY SECRET:",
          keySecret ? "FOUND" : "MISSING"
        );

        // CHECK MISSING KEYS

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

        // CREATE AUTH

        const auth = btoa(
          `${keyId}:${keySecret}`
        );

        // CREATE ORDER

        const response = await fetch(
          "https://api.razorpay.com/v1/orders",
          {
            method: "POST",
            headers: {
              Authorization: `Basic ${auth}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              amount:
                Math.round(Number(amount) * 100),
              currency,
              receipt:
                receipt ||
                `rcpt_${Date.now()}`,
            }),
          }
        );

        const data =
          await response.json();

        // RAZORPAY ERROR

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

        // SUCCESS

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
    // VERIFY PAYMENT
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

        if (!keySecret) {
          return new Response(
            JSON.stringify({
              error:
                "Razorpay Key Secret missing",
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

        const generatedSignature =
          Array.from(
            new Uint8Array(signature)
          )
            .map((b) =>
              b.toString(16).padStart(2, "0")
            )
            .join("");

        if (
          generatedSignature ===
          razorpay_signature
        ) {

          return new Response(
            JSON.stringify({
              success: true,
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
              "Verification failed",
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
    // SERVE FRONTEND
    // =========================

    return env.ASSETS.fetch(request);

  },
};
