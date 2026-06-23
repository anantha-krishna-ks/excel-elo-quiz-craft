import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/integrations/supabase/client';

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
          const { data, error } = await supabase.functions.invoke('excelsoft-proxy', {
            body: {
              endpoint: 'check-user',
              method: 'POST',
              payload: { username, password },
            },
          });

          if (error) {
            console.error('Login proxy error:', error);
            return false;
          }

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