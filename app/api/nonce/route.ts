import crypto from 'crypto';

export async function GET() {
  // 1. create a random string, you may use other approach if you like
  const nonce = crypto.randomUUID();

  const body = JSON.stringify({
    nonce: nonce,
  });
  return new Response(body, {
    status: 200,
    headers: {
      'Set-Cookie': `siws-nonce=${nonce}; Path=/; HttpOnly; Secure; SameSite=Strict`,
    },
  });
}
