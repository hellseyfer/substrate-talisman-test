import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { selectAccount, setAccounts } from './AccountReducer';
import AccountInfo from './AccountInfo';
import { web3Accounts } from '@polkadot/extension-dapp';
import { Heading, Select } from '@chakra-ui/react';

const AccountSelector: React.FC = () => {
  const dispatch = useAppDispatch();
  const accounts = useAppSelector((state) => state.accounts.accounts);
  const extension = useAppSelector((state) => state.extension);
  const selectedAccountId = useAppSelector(
    (state) => state.accounts.selectedAccountId
  );
  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedAccount = event.target.value;
    dispatch(selectAccount(selectedAccount));
  };

  const fetchAccounts = async () => {
    let accounts = await web3Accounts();
    dispatch(setAccounts(accounts));
  };

  useEffect(() => {
    extension.name && fetchAccounts();
  }, [extension]);

  useEffect(() => {
    if (accounts.length > 0) {
      dispatch(selectAccount(accounts[0].address));
    }
  }, [accounts]);

  return (
    <>
      <Heading size="lg" marginY={4}>
        Select Address
      </Heading>
      <Select
        margin={'auto'}
        onChange={handleSelectChange}
        value={selectedAccountId}
        width={'212px'}
      >
        <option>Select an address</option>
        {accounts.map((account) => (
          <option key={account.address} value={account.address}>
            {account.meta.name}
          </option>
        ))}
      </Select>
      <AccountInfo></AccountInfo>
    </>
  );
};

export default AccountSelector;
