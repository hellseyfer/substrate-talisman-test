import {
  createAsyncThunk,
  createSelector,
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit';
import { RootState } from '../../redux/store';
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import { polkadotAPI } from '../polkadot/polkadotAPI';

interface AccountsState {
  accounts: InjectedAccountWithMeta[];
  selectedAccountId?: string;
  selectedAccountBalance?: number;
}

interface SignTransaction {
  fromAddress: string;
  toAddress: string;
  amount: number;
}

const initialState: AccountsState = {
  accounts: [],
  selectedAccountId: undefined,
  selectedAccountBalance: undefined,
};

export const fetchBalance = createAsyncThunk(
  'accounts/fetchBalance',
  async (accountId: string, thunkAPI) => {
    try {
      const response = await polkadotAPI.fetchAccountBalance(accountId);
      return response;
    } catch (error) {
      // Handle the error or rethrow it
      throw error;
    }
  }
);

export const signTransaction = createAsyncThunk(
  'accounts/signTransaction',
  async ({ fromAddress, toAddress, amount }: SignTransaction, thunkAPI) => {
    try {
      await polkadotAPI.signTx(fromAddress, toAddress, amount);
      await thunkAPI.dispatch(fetchBalance(fromAddress));
    } catch (error) {
      // Handle the error or rethrow it
      throw error;
    }
  }
);

const accountsSlice = createSlice({
  name: 'accounts',
  initialState,
  reducers: {
    setAccounts: (state, action: PayloadAction<InjectedAccountWithMeta[]>) => {
      state.accounts = action.payload;
    },
    selectAccount: (state, action: PayloadAction<string>) => {
      state.selectedAccountId = action.payload;
    },
    setSelectedAccountBalance: (state, action: PayloadAction<number>) => {
      state.selectedAccountBalance = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchBalance.fulfilled, (state, action) => {
      // Add user to the state array
      state.selectedAccountBalance = action.payload;
    });
  },
});

// Define a selector to retrieve the selected account based on its id
export const selectSelectedAccount = createSelector(
  (state: RootState) => state.accounts.accounts,
  (state: RootState) => state.accounts.selectedAccountId,
  (accounts, selectedAccountId) => {
    return accounts.find((account) => account.address === selectedAccountId);
  }
);

export const { setAccounts, selectAccount } = accountsSlice.actions;
export default accountsSlice.reducer;
