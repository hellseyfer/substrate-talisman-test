'use server';
import jwt from 'jsonwebtoken';
import { Address, verifySIWS } from '@talismn/siws';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const cookieStore = cookies();
    // make sure the session is valid and has a nonce from previous request
    const nonce = cookieStore.get('siws-nonce')?.value;

    if (!nonce) {
      const body = JSON.stringify({
        error: ' Invalid session! Please try again.',
      });
      return new Response(body, { status: 401 });
    }

    // get the key params from the request body
    const body = await req.json();
    const { signature, message, address } = body;

    // verify that signature is valid
    const siwsMessage = await verifySIWS(message, signature, address);

    // validate that nonce is correct to prevent replay attack
    if (nonce !== siwsMessage.nonce) {
      const body = JSON.stringify({
        error: 'Invalid nonce! Please try again.',
      });
      return new Response(body, { status: 401 });
    }

    // only accept SIWS requests where the domain is what you allow to prevent phishing attack!
    // validate that domain is correct to prevent phishing attack
    if (siwsMessage.domain !== 'localhost')
      throw new Error('SIWS Error: Signature was meant for different domain.');

    // ... add additional validation as necessary

    // now that user has proved their ownership to the signing address
    // we can create a JWT token that allows users to authenticate themselves
    // so they don't have to sign in again

    const jwtPayload = {
      address: siwsMessage.address,
      // ... typically you will also query the user's id from your database and encode it in the payload
    };

    // sign the JWT token. Remember to keep your JWT secret securely.
    const jwtToken = jwt.sign(jwtPayload, 'JWT_SECRET', {
      algorithm: 'HS256',
    });

    // to securely store the JWT token, you should set it as an httpOnly cookie
    // we're returning this to store client side for demonstration purposes only
    return new Response(JSON.stringify({ jwtToken }), { status: 200 });
  } catch (e: any) {
    const body = JSON.stringify({
      error: 'Invalid signature!',
    });
    return new Response(body, { status: 401 });
  }
}
