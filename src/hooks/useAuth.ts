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
          const response = await fetch('https://ai.excelsoftcorp.com/aiapps/AIToolKit/UnitPlanGen/check-user', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
          });

          const data = await response.json();

          if (data.status === 'S001') {
            const user = {
              usercode: data.usercode,
              custcode: data.custcode,
              orgcode: data.orgcode,
              username: data.username,
              userrole: data.userrole,
            };

            set({ user, isAuthenticated: true });
            return true;
          }
          return false;
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