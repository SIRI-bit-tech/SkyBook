import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and password are required' },
        { status: 400 }
      );
    }

    // Use better-auth's resetPassword method with correct parameter name
    await auth.api.resetPassword({
      body: {
        token,
        newPassword: password,
      },
    });

    return NextResponse.json({
      message: 'Password reset successfully',
    });
  } catch (error: any) {
    console.error('Reset password error:', error);
    
    // Provide user-friendly error messages
    let errorMessage = 'Failed to reset password';
    if (error.message?.includes('token')) {
      errorMessage = 'Invalid or expired reset token. Please request a new password reset link.';
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
