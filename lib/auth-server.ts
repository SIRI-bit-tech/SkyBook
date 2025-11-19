import { cookies } from 'next/headers';
import { auth } from './auth';

/**
 * Server-side authentication utilities
 * Use these in Server Components and API routes
 */

export async function getSession() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('better-auth.session_token')?.value;
    
    if (!sessionToken) {
      return null;
    }

    const session = await auth.api.getSession({
      headers: new Headers({
        cookie: `better-auth.session_token=${sessionToken}`,
      }),
    });
    return session;
  } catch (error) {
    return null;
  }
}

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user ?? null;
}

export async function requireAuth() {
  const session = await getSession();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }
  return session;
}

export async function requireAdmin() {
  const session = await requireAuth();
  const cookieStore = await cookies();
  const userRole = cookieStore.get('user-role')?.value;
  
  if (userRole !== 'admin') {
    throw new Error('Forbidden: Admin access required');
  }
  
  return session;
}

export async function isAdmin() {
  try {
    await requireAdmin();
    return true;
  } catch {
    return false;
  }
}
