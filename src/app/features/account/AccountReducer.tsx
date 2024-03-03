import {
  createAsyncThunk,
  createSelector,
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit';
import { RootState } from '../../redux/store';
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import { wsAPI } from '../ws/wsAPI';

interface AccountsState {
  addresses: InjectedAccountWithMeta[];
  selectedAccountId: string | null;
  selectedAccountBalance?: number | null;
  connectingExtension: boolean;
  extension?: string | null;
}

interface SignTransaction {
  fromAddress: string;
  toAddress: string;
  amount: number;
}

const initialState: AccountsState = {
  addresses: [],
  selectedAccountId: null,
  selectedAccountBalance: null,
  connectingExtension: false,
  extension: null,
};

export const fetchBalance = createAsyncThunk(
  'accounts/fetchBalance',
  async (address: string, thunkAPI) => {
    try {
      const decimalBalance = await wsAPI.fetchAccountBalance(address);
      thunkAPI.dispatch(subscribeToBalanceChanges(address));
      return decimalBalance;
    } catch (error) {
      throw error;
    }
  }
);

export const signTransaction = createAsyncThunk(
  'accounts/signTransaction',
  async ({ fromAddress, toAddress, amount }: SignTransaction, thunkAPI) => {
    await wsAPI.signTx(fromAddress, toAddress, amount);
  }
);

export const connectWallet = createAsyncThunk(
  'accounts/connectWallet',
  async (_, thunkAPI) => {
    try {
      const accounts = await wsAPI.connectWallet();
      thunkAPI.dispatch(subscribeToExtensionChanges());
      return accounts;
    } catch (error) {
      throw error;
    }
  }
);

export const subscribeToExtensionChanges = createAsyncThunk(
  'accounts/subscribeToExtensionChanges',
  async (_, thunkAPI) => {
    try {
      const state = thunkAPI.getState() as RootState;
      const accounts = state.accounts.addresses;
      wsAPI.subscribeToExtensionChanges(accounts, (accounts) => {
        thunkAPI.dispatch(setAccounts(accounts));
      });
      return accounts;
    } catch (error) {
      throw error;
    }
  }
);

export const subscribeToBalanceChanges = createAsyncThunk(
  'accounts/subscribeToBalanceChanges',
  async (address: string, thunkAPI) => {
    try {
      wsAPI.subscribeToBalanceChanges(address, (balance) => {
        thunkAPI.dispatch(setSelectedAccountBalance(balance));
      });
    } catch (error) {
      throw error;
    }
  }
);

const accountsSlice = createSlice({
  name: 'accounts',
  initialState,
  reducers: {
    setAccounts: (state, action: PayloadAction<InjectedAccountWithMeta[]>) => {
      state.addresses = action.payload;
      state.extension = action.payload[0].meta.source;
    },
    selectAccount: (state, action: PayloadAction<string>) => {
      state.selectedAccountId = action.payload;
    },
    setSelectedAccountBalance: (state, action: PayloadAction<number>) => {
      state.selectedAccountBalance = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(
      fetchBalance.fulfilled,
      (state, action: PayloadAction<number>) => {
        state.selectedAccountBalance = action.payload;
      }
    );
    builder.addCase(connectWallet.pending, (state, action) => {
      state.connectingExtension = true;
    });
    builder.addCase(connectWallet.rejected, (state, action) => {
      state.connectingExtension = false;
      state.addresses = [];
    });
    builder.addCase(
      connectWallet.fulfilled,
      (state, action: PayloadAction<InjectedAccountWithMeta[]>) => {
        state.connectingExtension = false;
        state.addresses = action.payload;
      }
    );
  },
});

// Define a selector to retrieve the selected account based on its id
export const selectSelectedAccount = createSelector(
  (state: RootState) => state.accounts.addresses,
  (state: RootState) => state.accounts.selectedAccountId,
  (accounts, selectedAccountId) => {
    return accounts.find((account) => account.address === selectedAccountId);
  }
);

export const { setAccounts, selectAccount, setSelectedAccountBalance } =
  accountsSlice.actions;
export default accountsSlice.reducer;
