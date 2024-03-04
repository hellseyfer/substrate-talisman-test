import { Text } from '@chakra-ui/react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { useEffect } from 'react';
import {
  fetchBalance,
  subscribeToBalanceChanges,
} from '../account/AccountReducer';

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
