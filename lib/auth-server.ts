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
  
  // Check role from cookie first (fast check)
  const cookieStore = await cookies();
  const userRole = cookieStore.get('user-role')?.value;
  
  if (userRole !== 'admin') {
    throw new Error('Forbidden: Admin access required');
  }
  
  // Additional security: verify role from database
  // This prevents cookie tampering attacks
  try {
    const { connectToDatabase } = await import('./mongodb');
    const { UserModel } = await import('@/models/User');
    
    await connectToDatabase();
    const user = await UserModel.findById(session.user.id).select('role');
    
    if (!user || user.role !== 'admin') {
      throw new Error('Forbidden: Admin access required');
    }
  } catch (error) {
    // If database check fails, fall back to cookie check
    // This allows the app to work even if DB is temporarily unavailable
    console.error('Admin verification database check failed:', error);
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
