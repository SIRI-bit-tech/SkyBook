import { createAuthClient } from "better-auth/react";
import type { User } from "./auth";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  $fetch,
} = authClient;

// Custom hooks for easier access
export const useUser = () => {
  const session = useSession();
  return (session.data?.user as User) ?? null;
};

export const useIsAuthenticated = () => {
  const session = useSession();
  return !!session.data?.user;
};

export const useIsAdmin = () => {
  const user = useUser();
  return user?.role === 'admin';
};
