import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { User } from '@fluxo/shared';
import type { RootState } from '@/app/store';

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isInitialized: boolean;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isInitialized: false,
};

interface CredentialsPayload {
  user: User;
  accessToken: string;
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<CredentialsPayload>) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isInitialized = true;
    },
    clearCredentials: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isInitialized = true;
    },
    setInitialized: (state) => {
      state.isInitialized = true;
    },
  },
});

export const { setCredentials, clearCredentials, setInitialized } =
  authSlice.actions;

export default authSlice.reducer;

export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectAccessToken = (state: RootState) => state.auth.accessToken;
export const selectIsAuthenticated = (state: RootState) =>
  state.auth.user !== null;
export const selectIsInitialized = (state: RootState) =>
  state.auth.isInitialized;