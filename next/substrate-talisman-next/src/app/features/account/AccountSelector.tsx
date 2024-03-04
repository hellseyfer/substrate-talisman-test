'use client';
import React, { useEffect } from 'react';
import {
  setSelectedAccount,
  setAccounts,
  setJwtToken,
  setSignedInWith,
} from '@/app/lib/features/accounts/accountSlice';
import { web3Accounts } from '@polkadot/extension-dapp';
import { Heading, Select, VStack, Text, Box, Button } from '@chakra-ui/react';
import SignIn from './SignIn';
import { useAppDispatch, useAppSelector } from '@/app/lib/hooks';
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';

const AccountSelector: React.FC = () => {
  const dispatch = useAppDispatch();
  const { accounts, extension, selectedAccount } = useAppSelector(
    (state) => state.acc
  );

  const fetchAccounts = async () => {
    let accounts = await web3Accounts();
    dispatch(setAccounts(accounts));
  };

  useEffect(() => {
    extension && fetchAccounts();
  }, [extension]);

  useEffect(() => {
    if (accounts && accounts.length == 1) {
      dispatch(setSelectedAccount(accounts[0]));
    }
  }, [accounts]);

  const onCancel = () => {
    dispatch(setSelectedAccount(undefined));
  };

  const handleSignedIn = (
    selectedAccount: InjectedAccountWithMeta,
    jwtToken: string
  ) => {
    dispatch(setJwtToken(jwtToken));
    dispatch(setSignedInWith(selectedAccount));
  };

  return (
    <>
      <VStack height="full" flex="1" flexDirection="column">
        <Heading as="p" color="white" fontSize="lg">
          Sign In
        </Heading>
        <Text color="stone.500">Select an account to sign in with.</Text>
        <VStack
          my="4"
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
                onClick={() => dispatch(setSelectedAccount(a))}
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
        </VStack>
        <VStack spacing="3">
          {accounts && (
            <SignIn onCancel={onCancel} onSignedIn={handleSignedIn} />
          )}
        </VStack>
      </VStack>
    </>
  );
};

export default AccountSelector;
