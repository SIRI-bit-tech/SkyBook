import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import mongoose from "mongoose";
import { connectToDatabase } from "./mongodb";

// Security: Validate required environment variables at startup
if (!process.env.BETTER_AUTH_SECRET) {
  throw new Error(
    'CRITICAL SECURITY ERROR: BETTER_AUTH_SECRET environment variable is not set. ' +
    'This is required for secure session management. ' +
    'Generate a secure random string (32+ characters) and set it in your .env.local file. ' +
    'Example: BETTER_AUTH_SECRET=your-secure-random-string-here'
  );
}

if (process.env.BETTER_AUTH_SECRET.length < 32) {
  throw new Error(
    'CRITICAL SECURITY ERROR: BETTER_AUTH_SECRET must be at least 32 characters long. ' +
    'Current length: ' + process.env.BETTER_AUTH_SECRET.length + '. ' +
    'Generate a stronger secret for production security.'
  );
}

// Ensure MongoDB connection
connectToDatabase();

export const auth = betterAuth({
  database: mongodbAdapter(mongoose.connection.db!),
  emailAndPassword: {
    enabled: true,
    /**
     * Email Verification Configuration
     * 
     * SECURITY: Email verification is REQUIRED in production to prevent:
     * - Fake account creation
     * - Email enumeration attacks
     * - Unauthorized access
     * 
     * Environment-based configuration:
     * - Production (NODE_ENV=production): ALWAYS enabled
     * - Development: Disabled by default for easier testing
     * - Override: Set REQUIRE_EMAIL_VERIFICATION=true to enable in any environment
     * 
     * Before deploying to production, ensure email service is configured!
     */
    requireEmailVerification: process.env.NODE_ENV === 'production' || 
                              process.env.REQUIRE_EMAIL_VERIFICATION === 'true',
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      enabled: !!process.env.GOOGLE_CLIENT_ID,
    },
    facebook: {
      clientId: process.env.FACEBOOK_CLIENT_ID || "",
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || "",
      enabled: !!process.env.FACEBOOK_CLIENT_ID,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Update session every 24 hours
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // Cache for 5 minutes
    },
  },
  user: {
    additionalFields: {
      firstName: {
        type: "string",
        required: false,
      },
      lastName: {
        type: "string",
        required: false,
      },
      phone: {
        type: "string",
        required: false,
      },
      role: {
        type: "string",
        required: false,
        defaultValue: "user",
      },
    },
  },
  // Note: Role-based access control is handled via:
  // 1. User role stored in database (users collection)
  // 2. Middleware checks session cookie for authentication
  // 3. Server-side components verify role from database
  // 4. Role cookie set via API route after sign-in (see /api/auth/session)
  secret: process.env.BETTER_AUTH_SECRET, // No fallback - must be set in environment
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  basePath: "/api/auth",
  trustedOrigins: [
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ],
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
