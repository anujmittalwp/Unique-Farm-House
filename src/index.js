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

        const keyId =
          env.RAZORPAY_KEY_ID;

        const keySecret =
          env.RAZORPAY_KEY_SECRET;

        if (!keyId || !keySecret) {
          return new Response(
            JSON.stringify({
              error:
                "Razorpay credentials missing",
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

        const auth = btoa(
          `${keyId}:${keySecret}`
        );

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
                Math.round(
                  Number(body.amount) * 100
                ),
              currency: "INR",
              receipt:
                "receipt_" + Date.now(),
            }),
          }
        );

        const data =
          await response.json();

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

    // WEBSITE
    return env.ASSETS.fetch(request);
  },
};
