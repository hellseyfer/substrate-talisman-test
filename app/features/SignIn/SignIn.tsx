import { signIn } from '@/app/lib/features/accounts/accountSlice';
import { useAppDispatch, useAppSelector } from '@/app/lib/hooks';
import { Button, Text } from '@chakra-ui/react';
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import { useCallback } from 'react';

const SignIn = () => {
  const dispatch = useAppDispatch();
  const selectedAccount = useAppSelector((state) => state.acc.selectedAccount);
  const signInStatus = useAppSelector((state) => state.acc.signInStatus);

  const handleSignIn = useCallback(
    (selectedAccount: InjectedAccountWithMeta) => {
      dispatch(signIn(selectedAccount));
    },
    [selectedAccount?.address, dispatch]
  );

  return (
    <>
      <Button
        isLoading={signInStatus === 'loading'}
        variant="primary"
        disabled={!selectedAccount || signInStatus === 'loading'}
        onClick={() => handleSignIn(selectedAccount!)}
      >
        Sign In
      </Button>
      {signInStatus === 'failed' && <Text>failed</Text>}
    </>
  );
};

export default SignIn;
