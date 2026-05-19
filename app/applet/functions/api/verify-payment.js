export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;
    const key_secret = env.RAZORPAY_KEY_SECRET;

    if (!key_secret) {
      return new Response(JSON.stringify({ error: "Razorpay Key Secret is missing in environment" }), { status: 500, headers: { "Content-Type": "application/json" } });
    }
    
    // Cloudflare Workers use Web Crypto API
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(key_secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify", "sign"]
    );

    const signatureBytes = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(razorpay_order_id + "|" + razorpay_payment_id)
    );

    const generatedSignature = Array.from(new Uint8Array(signatureBytes))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    if (generatedSignature === razorpay_signature) {
      return new Response(JSON.stringify({ success: true, message: "Payment verified successfully" }), { status: 200, headers: { "Content-Type": "application/json" } });
    } else {
      return new Response(JSON.stringify({ error: "Invalid signature", success: false }), { status: 400, headers: { "Content-Type": "application/json" } });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: "Payment verification failed", details: error.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
