import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { UserModel } from '@/models/User';
import { auth } from '@/lib/auth';

/**
 * API route to set user role cookie after authentication
 * Called by client after successful sign-in
 */
export async function POST(request: NextRequest) {
    try {
        // Get session from Better Auth
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch user from database to get role
        await connectToDatabase();
        const user = await UserModel.findOne({ email: session.user.email });

        const role = user?.role || 'user';

        // Create response and set role cookie
        const response = NextResponse.json({ success: true, role });

        response.cookies.set('user-role', role, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/',
        });

        return response;
    } catch (error) {
        console.error('Set role error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
