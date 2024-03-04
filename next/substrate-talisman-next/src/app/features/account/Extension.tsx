'use client';
import { Button, Text } from '@chakra-ui/react';
import { connectWallet } from '@/app/lib/features/accounts/accountSlice';
import { useAppDispatch, useAppSelector } from '@/app/lib/hooks';

const ExtensionInfo = () => {
  const { extension, connectingExtension } = useAppSelector(
    (state) => state.acc
  );
  const dispatch = useAppDispatch();

  const handlerConnectExtension = () => {
    dispatch(connectWallet());
  };

  return (
    <>
      {!extension ? (
        <Button
          variant="primary"
          onClick={() => handlerConnectExtension()}
          disabled={connectingExtension}
        >
          {connectingExtension ? 'Connecting wallet...' : 'Connect Wallet'}
        </Button>
      ) : (
        <>{extension && <Text fontSize="xl">Connected to: {extension}</Text>}</>
      )}
    </>
  );
};

export default ExtensionInfo;
