// src/store/auth-store.ts
import { create } from "zustand";
import { User } from "firebase/auth";
import type { AppUser } from "@/types/user";

type AuthState = {
  firebaseUser: User | null;
  profile: AppUser | null;
  initializing: boolean;
  setFirebaseUser: (user: User | null) => void;
  setProfile: (profile: AppUser | null) => void;
  signOut: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  firebaseUser: null,
  profile: null,
  initializing: true,
  setFirebaseUser: (user) => set({ 
    firebaseUser: user, 
    initializing: false,
    ...(user === null && { profile: null })
  }),
  setProfile: (profile) => set({ profile }),
  signOut: async () => {
    const { auth } = await import("@/lib/firebase");
    const { signOut } = await import("firebase/auth");
    try {
      await signOut(auth);
      set({ firebaseUser: null, profile: null });
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  },
}));