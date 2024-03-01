// src/app/store.js

import { configureStore } from '@reduxjs/toolkit';
import extensionReducer from '../features/extension/extensionReducer';
import accountReducer from '../features/account/AccountReducer';
import logger from 'redux-logger';
export const store = configureStore({
  reducer: {
    accounts: accountReducer,
    extension: extensionReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),
  // Other configuration options
  // ...
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
