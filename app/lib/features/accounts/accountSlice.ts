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

interface AccountWithBalance extends InjectedAccountWithMeta {
  balance?: number; // Adjust the type of `balance` as needed (e.g., string, number, etc.)
}
interface AccountsState {
  accounts: InjectedAccountWithMeta[] | undefined;
  selectedAccount: AccountWithBalance | undefined;
  connectingExtension: boolean;
  extension?: string | undefined;
  jwtToken?: string;
  signedInWith?: InjectedAccountWithMeta;
  transactionMessage?: string;
  signInStatus: 'idle' | 'loading' | 'failed';
}

interface SignTransaction {
  fromAddress: string;
  toAddress: string;
  amount: number;
}

const initialState: AccountsState = {
  accounts: [],
  selectedAccount: undefined,
  connectingExtension: false,
  extension: undefined,
  jwtToken: undefined,
  signedInWith: undefined,
  transactionMessage: undefined,
  signInStatus: 'idle',
};

export const fetchBalance = createAsyncThunk(
  'acc/fetchBalance',
  async (address: string, thunkAPI) => {
    try {
      const decimalBalance = await wsAPI.fetchAccountBalance(address);
      return decimalBalance;
    } catch (error) {
      throw error;
    }
  }
);

export const fetchAccounts = createAsyncThunk(
  'acc/fetchAccounts',
  async (_, thunkAPI) => {
    try {
      const accounts = await wsAPI.fetchAccounts();
      thunkAPI.dispatch(setAccounts(accounts));
      thunkAPI.dispatch(subscribeToExtensionChanges());
      if (accounts.length === 1)
        thunkAPI.dispatch(setSelectedAccount(accounts[0]));
      return accounts;
    } catch (error) {
      throw error;
    }
  }
);

export const signTransaction = createAsyncThunk(
  'acc/signTransaction',
  async ({ fromAddress, toAddress, amount }: SignTransaction, thunkAPI) => {
    debugger;
    try {
      await wsAPI.signTx(fromAddress, toAddress, amount);
    } catch (error) {
      thunkAPI.dispatch(setTransactionMessage((error as any)?.data));
      throw error;
    }
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
      wsAPI.subscribeToBalanceChanges(address, (address, balance) => {
        thunkAPI.dispatch(setSelectedAccountBalance({ address, balance }));
      });
    } catch (error) {
      throw error;
    }
  }
);

export const signIn = createAsyncThunk(
  'acc/signIn',
  async (selectedAccount: InjectedAccountWithMeta, thunkAPI) => {
    try {
      const jwtToken = await wsAPI.signIn(selectedAccount);
      if (!jwtToken) return;
      thunkAPI.dispatch(setJwtToken(jwtToken));
      thunkAPI.dispatch(setSignedInWith(selectedAccount));
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
      action: PayloadAction<
        AccountWithBalance | InjectedAccountWithMeta | undefined
      >
    ) => {
      state.selectedAccount = action.payload;
    },
    setSelectedAccountBalance: (
      state,
      action: PayloadAction<{ address: string; balance: number }>
    ) => {
      //state.selectedAccountBalance = action.payload;
      if (!state.selectedAccount) return;
      if (state.selectedAccount.address !== action.payload.address) return;
      state.selectedAccount.balance = action.payload.balance;
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
    setTransactionMessage: (state, action: PayloadAction<string>) => {
      state.transactionMessage = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(
      fetchBalance.fulfilled,
      (state, action: PayloadAction<number>) => {
        if (!state.selectedAccount) return;
        state.selectedAccount.balance = action.payload;
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
    builder.addCase(signTransaction.fulfilled, (state) => {
      state.transactionMessage = 'Transaction finallized successfully';
    });
    builder.addCase(signTransaction.pending, (state) => {
      state.transactionMessage = 'Transaction pending..';
    });
    builder.addCase(signTransaction.rejected, (state, action) => {
      state.transactionMessage = action.error.message;
    });
    builder.addCase(signIn.fulfilled, (state) => {
      state.signInStatus = 'idle';
    });
    builder.addCase(signIn.pending, (state) => {
      state.signInStatus = 'loading';
    });
    builder.addCase(signIn.rejected, (state) => {
      state.signInStatus = 'failed';
    });
  },
});

export const {
  setAccounts,
  setSelectedAccount,
  setSelectedAccountBalance,
  setJwtToken,
  setSignedInWith,
  setTransactionMessage,
} = accountsSlice.actions;
