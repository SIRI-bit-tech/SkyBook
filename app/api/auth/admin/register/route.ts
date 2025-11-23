import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
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
    const existingEmail = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existingEmail) {
      return NextResponse.json(
        { message: 'Email already registered' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Hard-code role as 'admin' since this is admin registration endpoint
    const user = await prisma.user.create({
      data: {
        name: username,
        email: normalizedEmail,
        password: hashedPassword,
        role: 'admin',
        emailVerified: true, // Auto-verify admin accounts
      },
    });

    return NextResponse.json(
      {
        message: 'Admin account created successfully',
        user: {
          id: user.id,
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
