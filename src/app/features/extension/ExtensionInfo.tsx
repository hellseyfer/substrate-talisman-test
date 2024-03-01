import { web3Enable } from '@polkadot/extension-dapp';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { setExtension } from './extensionReducer';
import { Button, Text } from '@chakra-ui/react';

const ExtensionInfo = () => {
  const extension = useAppSelector((state) => state.extension);
  const dispatch = useAppDispatch();

  const connectExtension = async () => {
    let activeExtension = await web3Enable('encode hackaton app');
    dispatch(setExtension(activeExtension[0].name));
  };

  return (
    <>
      {!extension.name ? (
        <Button
          variant="outline"
          _hover={{ bg: 'black', color: 'white' }}
          onClick={() => connectExtension()}
        >
          Connect wallet
        </Button>
      ) : (
        <>
          <Text fontSize="xl">Connected to: {extension.name}</Text>
        </>
      )}
    </>
  );
};

export default ExtensionInfo;
