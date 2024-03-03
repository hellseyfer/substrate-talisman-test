import { Text } from '@chakra-ui/react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { useEffect } from 'react';
import {
  fetchBalance,
  subscribeToBalanceChanges,
} from '../account/AccountReducer';

const Balance = () => {
  const dispatch = useAppDispatch();
  const balance = useAppSelector(
    (state) => state.accounts.selectedAccountBalance
  );
  const selectedAccountId = useAppSelector(
    (state) => state.accounts.selectedAccountId
  );

  useEffect(() => {
    if (!selectedAccountId) return;
    dispatch(subscribeToBalanceChanges(selectedAccountId));
  }, [selectedAccountId]);

  return (
    <Text fontSize="lg" as="b">
      Balance: {balance}
    </Text>
  );
};

export default Balance;
