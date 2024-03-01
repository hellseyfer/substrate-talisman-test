import { useAppSelector } from '../../redux/hooks';
import { Box, Heading, Stack, Text } from '@chakra-ui/react';
import Balance from '../balance/Balance';

const AccountInfo = () => {
  const selectedAccountId = useAppSelector(
    (state) => state.accounts.selectedAccountId
  );
  const selectedAccount = useAppSelector((state) =>
    state.accounts.accounts.find(
      (account) => account.address === selectedAccountId
    )
  );

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
