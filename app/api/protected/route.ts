'use server';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const authorisationHeader = req.headers.get('authorisation');
  if (typeof authorisationHeader !== 'string') {
    const body = JSON.stringify({
      error: 'You are not logged in!',
    });
    return new Response(body, {
      status: 401,
    });
  }

  const jwtToken = authorisationHeader.split(' ')[1];
  try {
    // verify that JWT is correct
    jwt.verify(jwtToken, 'JWT_SECRET');
    const decodedJWT = jwt.decode(jwtToken);
    // ... typically you would encode a user's ID in the JWT token
    // then decode the JWT to get the user's ID so you can query data for that user ID
    const body = JSON.stringify({
      account: decodedJWT,
    });
    return new Response(body, { status: 200 });
  } catch (e) {
    const body = JSON.stringify({
      error: 'You are not logged in!',
    });
    return new Response(body, {
      status: 401,
    });
  }
}
