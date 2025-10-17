import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const DriverStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,

      // Add or update user info
      addUser: (userData) =>
        set((state) => ({
          user: userData,
        })),

      // Add token
      addToken: (token) =>
        set((state) => ({
          token: token,
        })),

      // Remove token only
      removeToken: () =>
        set((state) => ({
          token: null,
        })),

      // Logout: remove token and user data
      logout: () =>
        set((state) => ({
          token: null,
          user: null,
        })),
    }),
    {
      name: "DriverStore", // key for localStorage
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default DriverStore;
