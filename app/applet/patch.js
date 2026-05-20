const fs = require('fs');
let code = fs.readFileSync('src/index.js', 'utf-8');
const search = `    // WEBSITE
    return env.ASSETS.fetch(request);
  },
};`;
const replace = `    // VERIFY PAYMENT
    if (url.pathname === "/api/verify-payment" && request.method === "POST") {
      try {
        const body = await request.json();
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;
        const keySecret = env.RAZORPAY_KEY_SECRET;
        const encoder = new TextEncoder();
        const key = await crypto.subtle.importKey("raw", encoder.encode(keySecret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
        const signatureBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(razorpay_order_id + "|" + razorpay_payment_id));
        const generatedSignature = Array.from(new Uint8Array(signatureBuffer)).map(b => b.toString(16).padStart(2, "0")).join("");
        if (generatedSignature === razorpay_signature) {
          return new Response(JSON.stringify({ success: true, message: "Payment Verified Successfully" }), { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } });
        } else {
          return new Response(JSON.stringify({ success: false, error: "Invalid Signature" }), { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } });
        }
      } catch (err) {
        return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } });
      }
    }

    // WEBSITE SPA FALLBACK
    const assetResponse = await env.ASSETS.fetch(request);
    if (assetResponse.status === 404 && request.method === "GET") {
      const fallbackUrl = new URL(request.url);
      fallbackUrl.pathname = "/index.html";
      return env.ASSETS.fetch(new Request(fallbackUrl, request));
    }
    return assetResponse;
  },
};`;
code = code.replace(search, replace);
fs.writeFileSync('src/index.js', code);
