import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

type Data = {
  nonce: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  // 1. create a random string, you may use other approach if you like
  const nonce = crypto.randomUUID();

  // 2. tie the nonce to user's session as cookie so it can be used for verification later
  /** This is just an example. In production, you should encrypt your cookies. */
  res.setHeader(
    'Set-Cookie',
    `siws-nonce=${nonce}; Path=/; HttpOnly; Secure; SameSite=Strict`
  );
  res.status(200).json({ nonce });
}
