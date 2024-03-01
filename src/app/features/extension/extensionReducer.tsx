import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { InjectedExtension } from '@polkadot/extension-inject/types';
interface Extension {
  name?: string;
}
const initialState: Extension = {
  name: undefined,
};
const extensionSlice = createSlice({
  name: 'extension',
  initialState: initialState,
  reducers: {
    setExtension: (state, action: PayloadAction<string | undefined>) => {
      state.name = action.payload;
    },
  },
});

export const { setExtension } = extensionSlice.actions;

export default extensionSlice.reducer;
