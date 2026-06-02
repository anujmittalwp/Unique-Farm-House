export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;
    
    const keySecret = env.RAZORPAY_KEY_SECRET;

    if (!keySecret) {
      return new Response(JSON.stringify({ error: "Razorpay Key Secret is missing in Cloudflare Environment Variables" }), { 
        status: 500,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    }

    // Web Crypto API HMAC Verification for Cloudflare Worker
    const encoder = new TextEncoder();
    const keyData = encoder.encode(keySecret);
    const messageData = encoder.encode(`${razorpay_order_id}|${razorpay_payment_id}`);

    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const signature = await crypto.subtle.sign("HMAC", cryptoKey, messageData);
    const signatureHex = Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");

    if (signatureHex === razorpay_signature) {
      return new Response(JSON.stringify({ success: true, message: "Payment verified successfully" }), {
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    } else {
      return new Response(JSON.stringify({ error: "Invalid signature", success: false }), { 
        status: 400,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    }
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || "Failed to verify payment" }), { 
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    }
  });
}
