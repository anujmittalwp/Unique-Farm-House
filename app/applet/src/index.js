export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      });
    }

    // CORS headers for all responses
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (url.pathname === '/api/create-order' && request.method === 'POST') {
      try {
        const body = await request.json();
        const { amount, currency = 'INR', receipt } = body;

        if (!amount) {
          return new Response(JSON.stringify({ error: 'Amount is required' }), { 
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }

        const keyId = env.RAZORPAY_KEY_ID || env.VITE_RAZORPAY_KEY_ID;
        const keySecret = env.RAZORPAY_KEY_SECRET;

        if (!keyId || !keySecret) {
          return new Response(JSON.stringify({ error: 'Razorpay credentials missing in Cloudflare Environment Variables' }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }

        const auth = btoa(`${keyId}:${keySecret}`);
        const response = await fetch('https://api.razorpay.com/v1/orders', {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: Math.round(amount * 100), // amount in paise
            currency,
            receipt: receipt || `rcpt_${Date.now()}`,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          return new Response(JSON.stringify({ 
            error: 'Failed to create Razorpay order',
            details: data
          }), { 
            status: response.status,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }

        return new Response(JSON.stringify(data), { 
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message || 'Failed to create order' }), { 
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }
    }

    if (url.pathname === '/api/verify-payment' && request.method === 'POST') {
      try {
        const body = await request.json();
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;
        
        const keySecret = env.RAZORPAY_KEY_SECRET;

        if (!keySecret) {
          return new Response(JSON.stringify({ error: 'Razorpay Key Secret is missing in Cloudflare Environment Variables' }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }

        // Web Crypto API HMAC Verification for Cloudflare Worker
        const encoder = new TextEncoder();
        const keyData = encoder.encode(keySecret);
        const messageData = encoder.encode(`${razorpay_order_id}|${razorpay_payment_id}`);

        const cryptoKey = await crypto.subtle.importKey(
          'raw',
          keyData,
          { name: 'HMAC', hash: 'SHA-256' },
          false,
          ['sign']
        );

        const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
        const signatureHex = Array.from(new Uint8Array(signature))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');

        if (signatureHex === razorpay_signature) {
          return new Response(JSON.stringify({ success: true, message: 'Payment verified successfully' }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        } else {
          return new Response(JSON.stringify({ error: 'Invalid signature', success: false }), { 
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message || 'Failed to verify payment' }), { 
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }
    }

    return new Response(JSON.stringify({ error: 'Not Found' }), { 
      status: 404,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
};
