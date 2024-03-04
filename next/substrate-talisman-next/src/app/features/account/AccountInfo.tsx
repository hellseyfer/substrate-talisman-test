"use client";
import { Box, Heading, Stack, Text } from '@chakra-ui/react';
import Balance from '../balance/Balance';
import { useAppSelector } from '@/app/lib/hooks';

const AccountInfo = () => {
  const selectedAccount = useAppSelector((state) => state.acc.selectedAccount);

  return (
    <Box marginY={4}>
      <Heading size="lg" marginY={4}>
        Selected Address
      </Heading>
      {selectedAccount ? (
        <Stack spacing={1}>
          <Text fontSize="lg" as="b">
            Name: {selectedAccount.meta.name}
          </Text>
          <Balance></Balance>
        </Stack>
      ) : (
        <Text fontSize="lg">No account selected</Text>
      )}
    </Box>
  );
};

export default AccountInfo;
