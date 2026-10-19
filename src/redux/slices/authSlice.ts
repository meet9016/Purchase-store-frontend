import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, getDatabase } from '@/lib/storeData';

interface AuthState {
  currentUser: User | null;
  token: string | null;
  isAuthenticated: boolean;
  activeRole: string;
}

const getInitialAuthState = (): AuthState => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    const active = localStorage.getItem('active_user');

    if (token && token !== 'null' && token !== 'undefined' && !token.startsWith('local_') && active) {
      try {
        const user = JSON.parse(active);
        return {
          currentUser: user,
          token,
          isAuthenticated: true,
          activeRole: user.role || 'Admin',
        };
      } catch (e) {}
    }
  }

  return {
    currentUser: null,
    token: null,
    isAuthenticated: false,
    activeRole: 'Admin',
  };
};

const initialState: AuthState = getInitialAuthState();

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<{ user: User; token?: string }>) => {
      state.currentUser = action.payload.user;
      state.activeRole = action.payload.user.role;
      state.isAuthenticated = true;
      if (action.payload.token) {
        state.token = action.payload.token;
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_token', action.payload.token);
          localStorage.setItem('active_user', JSON.stringify(action.payload.user));
        }
      }
    },
    switchRole: (state, action: PayloadAction<string>) => {
      const targetRole = action.payload;
      const db = typeof window !== 'undefined' ? getDatabase() : null;
      const matched = db?.users?.find(u => u.role.toLowerCase() === targetRole.toLowerCase()) || {
        id: 'usr-' + targetRole.toLowerCase(),
        name: targetRole + ' User',
        email: `${targetRole.toLowerCase()}@purchase.internal`,
        role: targetRole as any,
        department: 'Operations',
        active: true,
      };
      state.currentUser = matched;
      state.activeRole = targetRole;
      if (typeof window !== 'undefined') {
        localStorage.setItem('active_user', JSON.stringify(matched));
      }
    },
    logout: (state) => {
      state.currentUser = null;
      state.token = null;
      state.isAuthenticated = false;
      state.activeRole = 'Admin';
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('active_user');
      }
    },
  },
});

export const { setUser, switchRole, logout } = authSlice.actions;
export default authSlice.reducer;
