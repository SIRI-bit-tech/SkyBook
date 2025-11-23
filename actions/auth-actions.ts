"use server";

import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function registerUser(email: string, password: string, firstName: string, lastName: string) {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: "User already exists" };
    }

    // Hash password before storing
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        name: `${firstName} ${lastName}`,
        password: hashedPassword,
        firstName,
        lastName,
        emailVerified: false,
      },
    });

    return { success: true, user: { email: user.email, name: user.name } };
  } catch (error) {
    console.error("[Register Error]", error);
    return { error: "Failed to register user" };
  }
}

export async function loginUser(email: string, password: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { error: "Invalid credentials" };
    }

    // Verify password exists
    if (!user.password) {
      return { error: "Invalid credentials" };
    }

    // Verify password matches
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return { error: "Invalid credentials" };
    }

    return { success: true, user: { email: user.email, name: user.name } };
  } catch (error) {
    console.error("[Login Error]", error);
    return { error: "Failed to login" };
  }
}
