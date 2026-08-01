const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
const http = require('http');

(async () => {
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const email = 'webhook-test@example.com';
  const password = 'Test123456!';
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { source: 'webhook-test' },
  });

  if (error) {
    console.error('createUser error', error);
    process.exit(1);
  }

  const userId = data.user.id;
  const body = JSON.stringify({
    event: 'charge.success',
    data: {
      reference: `wallet-${userId}-12345`,
      amount: 50000,
      status: 'success',
      email,
    },
  });

  const signature = crypto.createHmac('sha512', process.env.PAYSTACK_SECRET_KEY).update(body).digest('hex');
  const req = http.request({
    hostname: '127.0.0.1',
    port: 3001,
    path: '/api/webhook/payments',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-paystack-signature': signature,
    },
  }, (res) => {
    let out = '';
    res.on('data', (chunk) => {
      out += chunk;
    });
    res.on('end', () => {
      console.log('STATUS', res.statusCode);
      console.log(out);
    });
  });

  req.on('error', (err) => {
    console.error(err);
    process.exit(1);
  });

  req.write(body);
  req.end();
})();
