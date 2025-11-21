import { NextRequest, NextResponse } from 'next/server';
import { UserModel } from '@/models/User';
import { connectToDatabase } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email/Username and password required' },
        { status: 400 }
      );
    }

    // Check if input is email or username
    // Try to find user by email first, then by username
    let user = await UserModel.findOne({ 
      email: email.toLowerCase(), 
      role: 'admin' 
    });

    // If not found by email, try finding by username
    if (!user) {
      user = await UserModel.findOne({ 
        username: email, 
        role: 'admin' 
      });
    }

    if (!user) {
      return NextResponse.json(
        { message: 'Invalid admin credentials' },
        { status: 401 }
      );
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return NextResponse.json(
        { message: 'Invalid admin credentials' },
        { status: 401 }
      );
    }

    // In production, use proper session/JWT
    return NextResponse.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { message: 'Login failed' },
      { status: 500 }
    );
  }
}
