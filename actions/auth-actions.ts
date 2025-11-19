"use server";

import { connectToDatabase } from "@/lib/mongodb";
import { UserModel } from "@/models/User";
import bcrypt from "bcryptjs";
import { generateBookingReference } from "@/config/constants";

export async function registerUser(email: string, password: string, firstName: string, lastName: string) {
  try {
    await connectToDatabase();

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return { error: "User already exists" };
    }

    // Password will be hashed by the User model's pre-save hook
    const user = await UserModel.create({
      email,
      password,
      firstName,
      lastName,
      role: "user",
    });

    return { success: true, user: { email: user.email, firstName: user.firstName } };
  } catch (error) {
    console.error("[Register Error]", error);
    return { error: "Failed to register user" };
  }
}

export async function loginUser(email: string, password: string) {
  try {
    await connectToDatabase();

    const user = await UserModel.findOne({ email });
    if (!user || !user.password) {
      return { error: "Invalid credentials" };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return { error: "Invalid credentials" };
    }

    return { success: true, user: { email: user.email, firstName: user.firstName, role: user.role } };
  } catch (error) {
    console.error("[Login Error]", error);
    return { error: "Failed to login" };
  }
}
