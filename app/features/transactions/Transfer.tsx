import {
  Input,
  Button,
  Heading,
  HStack,
  VStack,
  Text,
  Box,
} from '@chakra-ui/react';
import {
  setTransactionMessage,
  signTransaction,
} from '@/app/lib/features/accounts/accountSlice';
import { useAppDispatch, useAppSelector } from '@/app/lib/hooks';
import React from 'react';
import { z } from 'zod';
import log from 'loglevel';
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import { wsAPI } from '@/app/lib/features/accounts/wsAPI';

type Props = {
  jwtToken: string;
};

const schema = z.object({
  amount: z.number({
    invalid_type_error: 'Invalid amount',
  }),
  addressTo: z.string({
    invalid_type_error: 'Invalid address',
  }),
});

const Transfer: React.FC<Props> = ({ jwtToken }) => {
  const dispatch = useAppDispatch();
  const ref = React.useRef<HTMLFormElement>(null);

  const selectedAccount = useAppSelector((state) => state.acc.selectedAccount);

  const signedInWith = useAppSelector((state) => state.acc.signedInWith);
  const transactionMessage = useAppSelector(
    (state) => state.acc.transactionMessage
  );

  const isValidSession = async (jwtToken?: string) => {
    try {
      if (!jwtToken) return { account: null, error: 'Not logged in' };
      const res = await fetch('/api/protected', {
        headers: {
          Authorisation: `Bearer ${jwtToken}`,
        },
      });
      const data: { account: InjectedAccountWithMeta; error: string } =
        await res.json();
      log.info('[isValidSession] res: ', data);
      if (data.error) throw new Error(data.error);
      return data;
    } catch (e: any) {
      log.info('[isValidSession] error: ', e);
      return { account: null, error: e as string };
    }
  };

  const doTransaction = async (formData: FormData) => {
    const validSession = await isValidSession(jwtToken);
    if (!validSession.account) return;

    const validatedFields = schema.safeParse({
      amount: parseFloat(formData.get('amount') as string),
      addressTo: formData.get('addressTo'),
    });

    // Return early if the form data is invalid
    if (!validatedFields.success) {
      /*       return {
        message: validatedFields.error.flatten().fieldErrors,
      }; */
      const errors =
        validatedFields.error.flatten().fieldErrors.amount?.join(', ') ??
        'unknown error';
      errors?.concat(
        validatedFields.error.flatten().fieldErrors.addressTo?.join(', ') ?? ''
      );
      dispatch(setTransactionMessage(errors));
      return;
    }

    const balance = await wsAPI.fetchAccountBalance(
      validSession.account.address
    );

    if (validatedFields.data.amount > balance) {
      dispatch(setTransactionMessage('Insufficient balance'));
      return;
    }

    dispatch(
      signTransaction({
        fromAddress: validSession.account.address,
        toAddress: validatedFields.data.addressTo as string,
        amount: validatedFields.data.amount as number,
      })
    );
  };

  return (
    <VStack
      padding="4"
      marginY={4}
      border="1px"
      rounded="lg"
      borderStyle="dashed"
    >
      <Heading size="lg">Transfer</Heading>

      <Text color="stone.500">
        Signed In with: {signedInWith?.meta.name} account
      </Text>

      <form ref={ref} action={doTransaction}>
        <HStack padding="4" border="1px" rounded="lg">
          <VStack>
            <Input
              errorBorderColor="red.200"
              width={'300px'}
              placeholder="Address"
              name="addressTo"
              required
            />
          </VStack>
          <VStack>
            <Input
              errorBorderColor="red.200"
              width={'150px'}
              placeholder="Amount"
              type="float"
              name="amount"
              required
            />
          </VStack>
          <Button variant="primary" type="submit" disabled={!selectedAccount}>
            Send
          </Button>
        </HStack>
        {transactionMessage && <Text>{transactionMessage}</Text>}
      </form>
    </VStack>
  );
};

export default Transfer;
