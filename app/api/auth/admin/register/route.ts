import { NextRequest, NextResponse } from 'next/server';
import { UserModel } from '@/models/User';
import { connectToDatabase } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const { username, email, password, adminCode, role } = await request.json();

    if (!username || !email || !password || !adminCode) {
      return NextResponse.json(
        { message: 'All fields required' },
        { status: 400 }
      );
    }

    // Validate admin code from environment variable
    const validAdminCode = process.env.ADMIN_CODE || 'SKYBOOK2024';
    if (adminCode !== validAdminCode) {
      return NextResponse.json(
        { message: 'Invalid admin registration code' },
        { status: 401 }
      );
    }

    // Check if email already exists
    const existingEmail = await UserModel.findOne({ email });
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

    const user = await UserModel.create({
      username,
      email,
      password: hashedPassword,
      role: role || 'admin',
    });

    return NextResponse.json(
      {
        message: 'Admin account created successfully',
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
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
