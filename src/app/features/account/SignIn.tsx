import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import { Address, SiwsMessage } from '@talismn/siws';

type Props = {
  accounts: InjectedAccountWithMeta[];
  onCancel: () => void;
  onSignedIn: (account: InjectedAccountWithMeta, jwtToken: string) => void;
};

export function SignIn({ accounts, onCancel, onSignedIn }: Props) {
  // ...

  const handleSignIn = async () => {
    try {
      if (!selectedAccount) return;

      const address = Address.fromSs58(selectedAccount.address ?? '');

      // invalid address
      if (!address) return;

      // request nonce from server, we will implement this API in the next page
      const nonceRes = await fetch('/api/nonce');
      const data = await nonceRes.json();
      const { nonce } = data;

      // you need to sign a message consisting the nonce so the backend can
      // validate your sign in request.
      // authentication will fail if you do not sign the nonce back.
      // SIWS helps you construct the message with the nonce in a way that
      // is user friendly and human readable
      const siwsMessage = new SiwsMessage({
        nonce,
        domain: 'localhost',
        uri: 'https://localhost:3000',
        statement: 'Welcome to SIWS! Sign in to see how it works.',
        // use prefix of chain your dapp is on:
        address: address.toSs58(0),
        chainName: 'Polkadot',
      });

      // get the injector of your account to create a Signature prompt
      const { web3FromSource } = await import('@polkadot/extension-dapp');
      const injectedExtension = await web3FromSource(
        selectedAccount.meta.source
      );

      // sign the SIWS message
      const signed = await siwsMessage.sign(injectedExtension);

      // send the signature and signed message to backend for verification
      const verifyRes = await fetch('/api/verify', {
        method: 'POST',
        body: JSON.stringify({ ...signed, address: address.toSs58(0) }),
      });
      const verified = await verifyRes.json();
      if (verified.error) throw new Error(verified.error);

      // Hooray we're signed in! The backend should return a JWT so you can authenticate yourself for any future request
      onSignedIn(selectedAccount, verified.jwtToken);
    } catch (e: any) {
      // ... invalid signature
    }
  };

  // ...
  // and call this when "Sign In" button is clicked
  <button disabled={!selectedAccount} onClick={handleSignIn}>
    Sign In
  </button>;
}
