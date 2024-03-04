import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

type Data = {
  randomText?: string;
  error?: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const authorisationHeader = req.headers['authorisation'];
  if (typeof authorisationHeader !== 'string')
    return res.status(401).json({ error: 'You are not logged in!' });

  const jwtToken = authorisationHeader.split(' ')[1];

  try {
    // verify that JWT is correct
    jwt.verify(jwtToken, 'JWT_SECRET');

    // ... typically you would encode a user's ID in the JWT token
    // then decode the JWT to get the user's ID so you can query data for that user ID

    res.status(200).json({ randomText: crypto.randomBytes(8).toString('hex') });
  } catch (e) {
    res.status(401).json({ error: 'You are not logged in!' });
  }
}
