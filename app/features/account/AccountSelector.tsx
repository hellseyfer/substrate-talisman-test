import React, { MouseEventHandler, useCallback, useEffect } from 'react';
import {
  setSelectedAccount,
  fetchAccounts,
} from '@/app/lib/features/accounts/accountSlice';
import { Heading, VStack, Text, Box, HStack } from '@chakra-ui/react';
import { useAppDispatch, useAppSelector } from '@/app/lib/hooks';
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';

const AccountSelector: React.FC = () => {
  const dispatch = useAppDispatch();
  const { accounts, extension, selectedAccount } = useAppSelector(
    (state) => state.acc
  );

  useEffect(() => {
    extension && dispatch(fetchAccounts());
  }, [extension]);

  const handleAccountClick = useCallback(
    (account: InjectedAccountWithMeta) => {
      dispatch(setSelectedAccount(account));
    },
    [dispatch, selectedAccount]
  );

  return (
    <>
      <VStack spacing={4}>
        <Heading size="lg">Addres Selector</Heading>
        <Text color="stone.500">Select an account to see public features:</Text>
        <HStack
          my="3"
          height="full"
          overflowY="auto"
          spacing="3"
          padding="2"
          rounded="lg"
          border="1px"
          borderColor="stone.800"
        >
          {accounts && accounts.length > 0 ? (
            accounts.map((a) => (
              <Box
                key={a.address}
                onClick={() => handleAccountClick(a)}
                cursor="pointer"
                padding="4"
                border="1px"
                rounded="lg"
                bgColor={selectedAccount?.address === a.address ? 'black' : ''}
                color={
                  selectedAccount?.address === a.address ? 'white' : 'gray.400'
                }
              >
                <Text>{a.meta.name ?? a.address}</Text>
              </Box>
            ))
          ) : (
            <Text color="stone.500" textAlign="center" mt="4">
              No account connected.
              <br />
              Connect at least 1 account to sign in with.
            </Text>
          )}
        </HStack>
      </VStack>
    </>
  );
};

export default AccountSelector;
