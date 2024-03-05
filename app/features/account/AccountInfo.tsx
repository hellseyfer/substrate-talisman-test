import { Box, HStack, Heading, Stack, Text, VStack } from '@chakra-ui/react';
import Balance from '../balance/Balance';
import { useAppSelector } from '@/app/lib/hooks';

const AccountInfo = () => {
  const selectedAccount = useAppSelector((state) => state.acc.selectedAccount);

  return (
    <>
      {selectedAccount ? (
        <VStack spacing={1} padding="4" border="1px" rounded="lg">
          <Text fontSize="lg" as="b">
            Name: {selectedAccount.meta.name}
          </Text>
          <Balance></Balance>
        </VStack>
      ) : (
        <Text fontSize="lg">No account selected</Text>
      )}
    </>
  );
};

export default AccountInfo;
