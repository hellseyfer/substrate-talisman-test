import { web3Enable } from '@polkadot/extension-dapp';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { setExtension } from './extensionReducer';
import { Button, Text } from '@chakra-ui/react';
import log from 'loglevel';

const ExtensionInfo = () => {
  const extension = useAppSelector((state) => state.extension);
  const dispatch = useAppDispatch();

  const connectExtension = async () => {
    let extensions = await web3Enable('encode hackaton app');
    if (extensions.length === 0) {
      // no extension installed, or the user did not accept the authorization
      // in this case we should inform the use and give a link to the extension
      log.info('[ExtensionInfo] No extension installed');
      alert('Please install a wallet extension');
      return;
    }
    dispatch(setExtension(extensions[0].name));
  };

  return (
    <>
      {!extension.name ? (
        <Button variant="primary" onClick={() => connectExtension()}>
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
