import { create } from "zustand";
import { authApi } from "../infrastructure/api/middleware/auth";

type AuthState = {
  isAuthenticated: boolean;
  user: null | { name: string; role: string };
  isLoading: boolean;
};

type AuthAction = {
  login: (user: { name: string; role: string }) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
};

export const useAuth = create<AuthState & AuthAction>((set, get) => ({
  isAuthenticated: false,
  user: null,
  isLoading: true,

  login: (user) =>
    set(() => ({ isAuthenticated: true, user, isLoading: false })),
  logout: () =>
    set(() => ({ isAuthenticated: false, user: null, isLoading: false })),

  checkAuth: async () => {
    try {
      const result = await authApi.checkAuth();
      if (result.isValid) {
        set(() => ({
          isAuthenticated: true,
          isLoading: false,
          user: result.user
            ? { name: result.user.username, role: result.user.role }
            : null,
        }));
      } else {
        set(() => ({ isAuthenticated: false, user: null, isLoading: false }));
      }
    } catch (error) {
      set(() => ({ isAuthenticated: false, user: null, isLoading: false }));
    }
  },
}));
