/**
 * Auth Store
 *
 * Global authentication state management.
 */

import { create } from "zustand";


export type AuthStatus = "signed-out" | "awaiting-mfa" | "authenticated";
export type UserRole = "read-only" | "read-write";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface MfaChallenge {
  challengeId: string;
  maskedEmail: string;
}

interface AuthState {
  user: User | null;
  pendingChallenge: MfaChallenge | null;
  status: AuthStatus;

  beginMfa: (challenge: MfaChallenge) => void;
  completeMfa: (user: User) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  // Initial state
  user: null,
  pendingChallenge: null,
  status: 'signed-out',

  // Actions
  signOut: () => {
    set({
      user: null,
      pendingChallenge: null,
      status: 'signed-out',
    });
  },

  beginMfa: (challenge) => {
    set({
      user: null,
      pendingChallenge: challenge,
      status: 'awaiting-mfa',
    })
  },

  completeMfa: (user) => {
    set({
      user: user,
      pendingChallenge: null,
      status: 'authenticated',
    })
  }

}));
