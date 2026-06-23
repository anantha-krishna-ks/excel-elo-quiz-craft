import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  usercode: string;
  custcode: string;
  orgcode: string;
  username: string;
  userrole: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      login: async (username: string, password: string) => {
        try {
          // MOCK MODE: Excelsoft API is unreachable from browser (CORS) and from
          // edge functions (DNS). Accept any non-empty credentials for now.
          await new Promise((r) => setTimeout(r, 400));
          if (!username || !password) return false;

          const user = {
            usercode: 'MOCK001',
            custcode: 'CUST001',
            orgcode: 'ORG001',
            username,
            userrole: 'Teacher',
          };
          set({ user, isAuthenticated: true });
          return true;
        } catch (error) {
          console.error('Login error:', error);
          return false;
        }
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);