import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { UserModel } from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Normalize email consistently
    const normalizedEmail = email.toLowerCase();

    // Connect to database and check if user exists
    await connectToDatabase();
    const user = await UserModel.findOne({ email: normalizedEmail });

    // Always call forgetPassword if user exists, but don't reveal if account exists
    if (user) {
      await auth.api.forgetPassword({
        body: { email: normalizedEmail },
      });
    }

    // Always return the same generic success response to prevent user enumeration
    return NextResponse.json({
      message: 'If an account exists with this email, a password reset link has been sent',
    });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    
    // Provide user-friendly error messages
    let errorMessage = 'Failed to send password reset email';
    if (error.message?.includes('email')) {
      errorMessage = 'Invalid email address';
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
