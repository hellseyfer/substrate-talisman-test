import {
  createAsyncThunk,
  createSelector,
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit';
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import { RootState } from '../../store';
import { createAppSlice } from '@/app/lib/createAppSlice';
import { wsAPI } from './wsAPI';
interface AccountsState {
  accounts: InjectedAccountWithMeta[] | undefined;
  selectedAccount: InjectedAccountWithMeta | undefined;
  selectedAccountBalance?: number | undefined;
  connectingExtension: boolean;
  extension?: string | undefined;
  jwtToken?: string;
  signedInWith?: InjectedAccountWithMeta;
}

interface SignTransaction {
  fromAddress: string;
  toAddress: string;
  amount: number;
}

const initialState: AccountsState = {
  accounts: [],
  selectedAccount: undefined,
  selectedAccountBalance: undefined,
  connectingExtension: false,
  extension: undefined,
  jwtToken: undefined,
  signedInWith: undefined,
};

export const fetchBalance = createAsyncThunk(
  'acc/fetchBalance',
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
  'acc/signTransaction',
  async ({ fromAddress, toAddress, amount }: SignTransaction, thunkAPI) => {
    await wsAPI.signTx(fromAddress, toAddress, amount);
  }
);

export const connectWallet = createAsyncThunk(
  'acc/connectWallet',
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
  'acc/subscribeToExtensionChanges',
  async (_, thunkAPI) => {
    try {
      const state = thunkAPI.getState() as RootState;
      const accounts = state.acc.accounts;
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
  'acc/subscribeToBalanceChanges',
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

export const accountsSlice = createAppSlice({
  name: 'acc',
  initialState,
  reducers: {
    setAccounts: (
      state,
      action: PayloadAction<InjectedAccountWithMeta[] | undefined>
    ) => {
      state.accounts = action.payload;
      if (action.payload?.length) {
        state.extension = action.payload[0].meta.source;
      }
    },
    setSelectedAccount: (
      state,
      action: PayloadAction<InjectedAccountWithMeta | undefined>
    ) => {
      state.selectedAccount = action.payload;
    },
    setSelectedAccountBalance: (state, action: PayloadAction<number>) => {
      state.selectedAccountBalance = action.payload;
    },
    setJwtToken: (state, action: PayloadAction<string>) => {
      state.jwtToken = action.payload;
    },
    setSignedInWith: (
      state,
      action: PayloadAction<InjectedAccountWithMeta>
    ) => {
      state.signedInWith = action.payload;
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
      state.accounts = [];
    });
    builder.addCase(
      connectWallet.fulfilled,
      (state, action: PayloadAction<InjectedAccountWithMeta[]>) => {
        state.connectingExtension = false;
        state.accounts = action.payload;
      }
    );
  },
});

export const {
  setAccounts,
  setSelectedAccount,
  setSelectedAccountBalance,
  setJwtToken,
  setSignedInWith,
} = accountsSlice.actions;
