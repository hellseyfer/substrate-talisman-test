import './App.css';
import ExtensionInfo from './app/features/extension/ExtensionInfo';
import AccountSelector from './app/features/account/AccountSelector';
import Transfer from './app/features/transactions/Transfer';
import { ChakraProvider, StackDivider, VStack } from '@chakra-ui/react';
import { Heading } from '@chakra-ui/react';
import log from 'loglevel';
log.setLevel('debug');
function App() {
  return (
    <ChakraProvider>
      <>
        <header>
          <Heading size="3xl" marginY={4}>
            Encode hackaton app
          </Heading>
        </header>
        <main>
          <VStack spacing={2} divider={<StackDivider borderColor="gray.200" />}>
            <ExtensionInfo></ExtensionInfo>
            <AccountSelector></AccountSelector>
            <Transfer></Transfer>
          </VStack>
        </main>
      </>
    </ChakraProvider>
  );
}

export default App;
