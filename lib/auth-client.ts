import { createAuthClient } from "better-auth/react";

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

// Extended user type with custom fields
type ExtendedUser = {
  id: string;
  email: string;
  name: string;
  image?: string | null;
  role?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
  emailVerified: boolean;
};

// Custom hooks for easier access
export const useUser = () => {
  const session = useSession();
  return (session.data?.user as ExtendedUser) ?? null;
};

export const useIsAuthenticated = () => {
  const session = useSession();
  return !!session.data?.user;
};

export const useIsAdmin = () => {
  const user = useUser();
  return user?.role === 'admin';
};
