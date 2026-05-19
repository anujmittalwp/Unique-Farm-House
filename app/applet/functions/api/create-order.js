export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json();
    const { amount, currency = "INR", receipt } = body;
    
    if (!amount) {
      return new Response(JSON.stringify({ error: "Amount is required" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    const key_id = env.VITE_RAZORPAY_KEY_ID || env.RAZORPAY_KEY_ID;
    const key_secret = env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
      return new Response(JSON.stringify({ error: "Razorpay keys are missing in environment" }), { status: 500, headers: { "Content-Type": "application/json" } });
    }

    const auth = btoa(`${key_id}:${key_secret}`);
    
    const rpResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100),
        currency: currency,
        receipt: receipt || `rcpt_${Date.now()}`
      })
    });

    const data = await rpResponse.json();
    
    if (!rpResponse.ok) {
       return new Response(JSON.stringify({ error: "Razorpay API error", details: data }), { status: rpResponse.status, headers: { "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({
      id: data.id,
      amount: data.amount,
      currency: data.currency,
      key_id: key_id
    }), { status: 200, headers: { "Content-Type": "application/json" } });
    
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to create order", details: error.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
