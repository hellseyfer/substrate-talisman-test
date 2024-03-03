import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { selectAccount, setAccounts } from './AccountReducer';
import AccountInfo from './AccountInfo';
import { web3Accounts } from '@polkadot/extension-dapp';
import { Heading, Select } from '@chakra-ui/react';

const AccountSelector: React.FC = () => {
  const dispatch = useAppDispatch();
  const { addresses, extension, selectedAccountId } = useAppSelector(
    (state) => state.accounts
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
    extension && fetchAccounts();
  }, [extension]);

  useEffect(() => {
    if (addresses.length > 0) {
      dispatch(selectAccount(addresses[0].address));
    }
  }, [addresses]);

  return (
    selectedAccountId && (
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
          {addresses.map((a) => (
            <option key={a.address} value={a.address}>
              {a.meta.name}
            </option>
          ))}
        </Select>
        <AccountInfo></AccountInfo>
      </>
    )
  );
};

export default AccountSelector;
