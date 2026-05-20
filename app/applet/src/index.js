export default {
  async fetch(request, env) {

    const url = new URL(request.url);

    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    // OPTIONS
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    // ENV TEST
    if (url.pathname === "/env-test") {
      return new Response(
        JSON.stringify({
          keyId: env.RAZORPAY_KEY_ID || "MISSING",
          keySecret: env.RAZORPAY_KEY_SECRET
            ? "FOUND"
            : "MISSING",
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

    // CREATE ORDER
    if (
      url.pathname === "/api/create-order" &&
      request.method === "POST"
    ) {

      try {

        const body = await request.json();

        const keyId = env.RAZORPAY_KEY_ID;
        const keySecret = env.RAZORPAY_KEY_SECRET;

        if (!keyId || !keySecret) {
          return new Response(
            JSON.stringify({
              error: "Razorpay credentials missing",
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

        const auth = btoa(`${keyId}:${keySecret}`);

        const response = await fetch(
          "https://api.razorpay.com/v1/orders",
          {
            method: "POST",
            headers: {
              Authorization: `Basic ${auth}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              amount: Math.round(Number(body.amount) * 100),
              currency: "INR",
              receipt: "receipt_" + Date.now(),
            }),
          }
        );

        const data = await response.json();

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
            error: err.message,
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

    // VERIFY PAYMENT
    if (
      url.pathname === "/api/verify-payment" &&
      request.method === "POST"
    ) {

      try {

        const body = await request.json();

        const {
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature
        } = body;

        const keySecret =
          env.RAZORPAY_KEY_SECRET;

        const encoder = new TextEncoder();

        const key = await crypto.subtle.importKey(
          "raw",
          encoder.encode(keySecret),
          {
            name: "HMAC",
            hash: "SHA-256",
          },
          false,
          ["sign"]
        );

        const signatureBuffer =
          await crypto.subtle.sign(
            "HMAC",
            key,
            encoder.encode(
              `${razorpay_order_id}|${razorpay_payment_id}`
            )
          );

        const generatedSignature =
          Array.from(
            new Uint8Array(signatureBuffer)
          )
            .map(b =>
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
              message:
                "Payment Verified Successfully",
            }),
            {
              status: 200,
              headers: {
                "Content-Type": "application/json",
                ...corsHeaders,
              },
            }
          );

        } else {

          return new Response(
            JSON.stringify({
              success: false,
              error: "Invalid Signature",
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

      } catch (err) {

        return new Response(
          JSON.stringify({
            success: false,
            error: err.message,
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

    // WEBSITE SPA FALLBACK
    const assetResponse = await env.ASSETS.fetch(request);
    
    // IF NOT FOUND AND GET REQUEST, SERVE INDEX.HTML (SPA Routing)
    if (assetResponse.status === 404 && request.method === 'GET') {
      const fallbackUrl = new URL(request.url);
      fallbackUrl.pathname = '/index.html';
      return env.ASSETS.fetch(new Request(fallbackUrl, request));
    }
    
    return assetResponse;

  },
};
