async function verifySignature(orderId: string, paymentId: string, signature: string, secret: string) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw", 
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
  
  const data = enc.encode(`${orderId}|${paymentId}`);
  const signatureBytes = await crypto.subtle.sign("HMAC", key, data);
  
  // Convert ArrayBuffer to Hex String
  const hashArray = Array.from(new Uint8Array(signatureBytes));
  const generatedSignature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return generatedSignature === signature;
}

export async function onRequest({ request, env }: any) {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      }
    });
  }

  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: `Method ${request.method} not allowed` }), { 
      status: 405,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }

  try {
    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;
    
    const keySecret = env.RAZORPAY_KEY_SECRET;

    if (!keySecret) {
      return new Response(JSON.stringify({ error: "Razorpay Key Secret is missing in Cloudflare Environment Variables" }), { 
        status: 500,
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }

    const isValid = await verifySignature(
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature, 
      keySecret
    );

    if (isValid) {
      return new Response(JSON.stringify({ success: true, message: "Payment verified successfully" }), {
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    } else {
      return new Response(JSON.stringify({ error: "Invalid signature", success: false }), { 
        status: 400,
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 500,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
}
