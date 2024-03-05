import { Text } from '@chakra-ui/react';
import { useEffect } from 'react';
import {
  fetchBalance,
  subscribeToBalanceChanges,
} from '@/app/lib/features/accounts/accountSlice';
import { useAppDispatch, useAppSelector } from '@/app/lib/hooks';

const Balance = () => {
  const dispatch = useAppDispatch();
  const selectedAccount = useAppSelector((state) => state.acc.selectedAccount);

  useEffect(() => {
    if (!selectedAccount) return;
    //dispatch(fetchBalance(selectedAccount?.address));
    dispatch(subscribeToBalanceChanges(selectedAccount.address));
  }, [selectedAccount?.address]);

  return (
    <Text fontSize="lg" as="b">
      Balance: {selectedAccount?.balance ?? 'None'}
    </Text>
  );
};

export default Balance;
