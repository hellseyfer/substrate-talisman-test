import './App.css';
import ExtensionInfo from './app/features/extension/ExtensionInfo';
import AccountSelector from './app/features/account/AccountSelector';
import Transfer from './app/features/transactions/Transfer';
import { StackDivider, VStack } from '@chakra-ui/react';
import { Heading } from '@chakra-ui/react';

function App() {
  return (
    <>
      <Heading size="3xl" marginY={4}>
        Encode hackaton app
      </Heading>
      <main>
        <VStack spacing={2} divider={<StackDivider borderColor="gray.200" />}>
          <ExtensionInfo></ExtensionInfo>
          <AccountSelector></AccountSelector>
          <Transfer></Transfer>
        </VStack>
      </main>
    </>
  );
}

export default App;
