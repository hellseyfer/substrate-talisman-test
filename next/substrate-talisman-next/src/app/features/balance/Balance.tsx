'use client';
import { Text } from '@chakra-ui/react';
import { useEffect } from 'react';
import { subscribeToBalanceChanges } from '@/app/lib/features/accounts/accountSlice';
import { useAppDispatch, useAppSelector } from '@/app/lib/hooks';

const Balance = () => {
  const dispatch = useAppDispatch();
  const balance = useAppSelector((state) => state.acc.selectedAccountBalance);
  const selectedAccount = useAppSelector((state) => state.acc.selectedAccount);

  useEffect(() => {
    if (!selectedAccount) return;
    dispatch(subscribeToBalanceChanges(selectedAccount?.address));
  }, [selectedAccount]);

  return (
    <Text fontSize="lg" as="b">
      Balance: {balance}
    </Text>
  );
};

export default Balance;
