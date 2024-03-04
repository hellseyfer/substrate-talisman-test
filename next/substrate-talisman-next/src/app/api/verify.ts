import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { verifySIWS } from '@talismn/siws';

type Data = {
  error?: string;
  jwtToken?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    // make sure the session is valid and has a nonce from previous request
    const nonce = req.cookies['siws-nonce'];
    if (!nonce)
      return res
        .status(401)
        .json({ error: ' Invalid session! Please try again.' });

    // get the key params from the request body
    const { signature, message, address } = JSON.parse(req.body);

    // verify that signature is valid
    const siwsMessage = await verifySIWS(message, signature, address);

    // validate that nonce is correct to prevent replay attack
    if (nonce !== siwsMessage.nonce)
      res.status(401).json({ error: 'Invalid nonce! Please try again.' });

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
    res.status(200).json({ jwtToken });
  } catch (e: any) {
    res.status(401).json({ error: e.message ?? 'Invalid signature!' });
  }
}
