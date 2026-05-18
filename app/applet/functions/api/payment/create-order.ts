export async function onRequestPost({ request, env }: any) {
  try {
    const body = await request.json();
    const { amount, currency = "INR", receipt } = body;
    
    if (!amount) {
      return new Response(JSON.stringify({ error: "Amount is required" }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const keyId = env.RAZORPAY_KEY_ID || env.VITE_RAZORPAY_KEY_ID;
    const keySecret = env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return new Response(JSON.stringify({ error: "Razorpay credentials missing in Cloudflare Environment Variables" }), { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    const auth = btoa(`${keyId}:${keySecret}`);

    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${auth}`
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // convert to paise
        currency: currency,
        receipt: receipt || `receipt_${Date.now()}`
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return new Response(JSON.stringify({ 
        error: data.error?.description || data.error?.message || data.error || "Failed to create Razorpay order",
        details: data
      }), { 
        status: response.status,
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({ ...data, key_id: keyId }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
