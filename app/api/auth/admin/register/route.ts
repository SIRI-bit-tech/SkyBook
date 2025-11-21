import { NextRequest, NextResponse } from 'next/server';
import { UserModel } from '@/models/User';
import { connectToDatabase } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const { username, email, password, adminCode } = await request.json();

    if (!username || !email || !password || !adminCode) {
      return NextResponse.json(
        { message: 'All fields required' },
        { status: 400 }
      );
    }

    // Validate admin code - REQUIRED in production for security
    const validAdminCode = process.env.ADMIN_CODE;
    if (!validAdminCode) {
      console.error('SECURITY ERROR: ADMIN_CODE environment variable is not set');
      return NextResponse.json(
        { message: 'Admin registration is not configured' },
        { status: 503 }
      );
    }

    if (adminCode !== validAdminCode) {
      return NextResponse.json(
        { message: 'Invalid admin registration code' },
        { status: 401 }
      );
    }

    // Normalize email for consistent comparison (matches schema and login behavior)
    const normalizedEmail = email.toLowerCase();

    // Check if email already exists (using normalized email)
    const existingEmail = await UserModel.findOne({ email: normalizedEmail });
    if (existingEmail) {
      return NextResponse.json(
        { message: 'Email already registered' },
        { status: 400 }
      );
    }

    // Check if username already exists
    const existingUsername = await UserModel.findOne({ username });
    if (existingUsername) {
      return NextResponse.json(
        { message: 'Username already taken' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Hard-code role as 'admin' since this is admin registration endpoint
    const user = await UserModel.create({
      username,
      email: normalizedEmail,
      password: hashedPassword,
      role: 'admin',
    });

    return NextResponse.json(
      {
        message: 'Admin account created successfully',
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Admin registration error:', error);
    return NextResponse.json(
      { message: 'Registration failed' },
      { status: 500 }
    );
  }
}
