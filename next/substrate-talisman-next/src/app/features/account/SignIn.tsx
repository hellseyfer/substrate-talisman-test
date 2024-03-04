'use client';
import { useAppSelector } from '@/app/lib/hooks';
import { Button } from '@chakra-ui/react';
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import { Address, SiwsMessage } from '@talismn/siws';
import { handleSignIn } from './actions';

type Props = {
  onCancel: () => void;
  onSignedIn: (account: InjectedAccountWithMeta, jwtToken: string) => void;
};

const SignIn = ({ onCancel, onSignedIn }: Props) => {
  const selectedAccount = useAppSelector((state) => state.acc.selectedAccount);
  // ...
  // and call this when "Sign In" button is clicked
  return (
    <Button
      variant="primary"
      disabled={!selectedAccount}
      onClick={() => handleSignIn({ selectedAccount, onSignedIn })}
    >
      Sign In
    </Button>
  );
};

export default SignIn;
