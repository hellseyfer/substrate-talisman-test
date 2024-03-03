import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { Button, Text } from '@chakra-ui/react';
import { connectWallet } from './AccountReducer';

const ExtensionInfo = () => {
  const { extension, connectingExtension } = useAppSelector(
    (state) => state.accounts
  );
  const dispatch = useAppDispatch();

  const handlerConnectExtension = async () => {
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
