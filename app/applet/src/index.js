export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // =========================
    // CORS HEADERS
    // =========================
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Content-Type": "application/json",
    };

    // =========================
    // HANDLE OPTIONS REQUEST
    // =========================
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    // =========================
    // ROOT TEST ROUTE
    // =========================
    if (url.pathname === "/") {
      return new Response(
        JSON.stringify({
          success: true,
          message: "Cloudflare Worker Running Successfully",
        }),
        {
          status: 200,
          headers: corsHeaders,
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
        if (!amount || isNaN(amount)) {
          return new Response(
            JSON.stringify({
              success: false,
              error: "Valid amount is required",
            }),
            {
              status: 400,
              headers: corsHeaders,
            }
          );
        }

        // Environment variables
        const keyId =
          env.RAZORPAY_KEY_ID ||
          env.VITE_RAZORPAY_KEY_ID;

        const keySecret =
          env.RAZORPAY_KEY_SECRET;

        // Check credentials
        if (!keyId || !keySecret) {
          return new Response(
            JSON.stringify({
              success: false,
              error:
                "Razorpay credentials missing in Cloudflare Environment Variables",
            }),
            {
              status: 500,
              headers: corsHeaders,
            }
          );
        }

        // Basic Auth
        const auth = btoa(
          `${keyId.trim()}:${keySecret.trim()}`
        );

        // Create Razorpay Order
        const razorpayResponse = await fetch(
          "https://api.razorpay.com/v1/orders",
          {
            method: "POST",
            headers: {
              Authorization: `Basic ${auth}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              amount: Number(amount) * 100,
              currency,
              receipt:
                receipt ||
                `receipt_${Date.now()}`,
            }),
          }
        );

        // Safe response parsing
        const responseText =
          await razorpayResponse.text();

        let data;

        try {
          data = JSON.parse(responseText);
        } catch {
          data = {
            raw: responseText,
          };
        }

        // Razorpay API failed
        if (!razorpayResponse.ok) {
          return new Response(
            JSON.stringify({
              success: false,
              error:
                "Failed to create Razorpay order",
              details: data,
            }),
            {
              status: razorpayResponse.status,
              headers: corsHeaders,
            }
          );
        }

        // Success
        return new Response(
          JSON.stringify({
            success: true,
            order: data,
          }),
          {
            status: 200,
            headers: corsHeaders,
          }
        );
      } catch (err) {
        return new Response(
          JSON.stringify({
            success: false,
            error:
              err.message ||
              "Failed to create order",
          }),
          {
            status: 500,
            headers: corsHeaders,
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

        // Validate
        if (
          !razorpay_order_id ||
          !razorpay_payment_id ||
          !razorpay_signature
        ) {
          return new Response(
            JSON.stringify({
              success: false,
              error:
                "Missing payment verification fields",
            }),
            {
              status: 400,
              headers: corsHeaders,
            }
          );
        }

        if (!keySecret) {
          return new Response(
            JSON.stringify({
              success: false,
              error:
                "RAZORPAY_KEY_SECRET missing",
            }),
            {
              status: 500,
              headers: corsHeaders,
            }
          );
        }

        // Create signature
        const encoder = new TextEncoder();

        const keyData = encoder.encode(
          keySecret
        );

        const messageData = encoder.encode(
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

        // Match signature
        if (
          generatedSignature ===
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
              headers: corsHeaders,
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
            headers: corsHeaders,
          }
        );
      } catch (err) {
        return new Response(
          JSON.stringify({
            success: false,
            error:
              err.message ||
              "Payment verification failed",
          }),
          {
            status: 500,
            headers: corsHeaders,
          }
        );
      }
    }

    // =========================
    // 404 ROUTE
    // =========================
    return new Response(
      JSON.stringify({
        success: false,
        error: "Route not found",
      }),
      {
        status: 404,
        headers: corsHeaders,
      }
    );
  },
};