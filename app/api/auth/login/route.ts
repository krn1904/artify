import { NextRequest, NextResponse } from 'next/server';
import { compare } from 'bcryptjs';
import { loginSchema } from '@/lib/auth/validation';
import { rateLimit } from '@/lib/auth/rate-limit';
import { generateToken } from '@/lib/auth/tokens';
import clientPromise from '@/lib/db';
import { sanitizeInput } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitPass = await rateLimit(request);
    if (!rateLimitPass) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = loginSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { email, password } = validationResult.data;
    const sanitizedEmail = sanitizeInput(email.toLowerCase());

    try {
      // Connect to MongoDB
      const client = await clientPromise;
      const db = client.db('artify');
      const usersCollection = db.collection('users');

      // Get user
      const user = await usersCollection.findOne({ email: sanitizedEmail });

      if (!user) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        );
      }

      // Check account lockout
      if (
        user.loginAttempts >= MAX_LOGIN_ATTEMPTS &&
        user.lastLoginAttempt &&
        Date.now() - new Date(user.lastLoginAttempt).getTime() < LOCKOUT_DURATION
      ) {
        const remainingLockout = Math.ceil(
          (LOCKOUT_DURATION - (Date.now() - new Date(user.lastLoginAttempt).getTime())) / 60000
        );
        return NextResponse.json(
          { error: `Account temporarily locked. Please try again in ${remainingLockout} minutes.` },
          { status: 429 }
        );
      }

      // Verify password
      const isValidPassword = await compare(password, user.password);

      if (!isValidPassword) {
        // Increment login attempts
        await usersCollection.updateOne(
          { email: sanitizedEmail },
          {
            $inc: { loginAttempts: 1 },
            $set: { lastLoginAttempt: new Date() }
          }
        );

        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        );
      }

      // Reset login attempts on successful login
      await usersCollection.updateOne(
        { email: sanitizedEmail },
        {
          $set: {
            loginAttempts: 0,
            lastLoginAttempt: null,
            lastLogin: new Date()
          }
        }
      );

      // Generate authentication token
      const token = await generateToken({
        userId: user._id.toString(),
        email: sanitizedEmail,
        role: user.role
      });

      // Return success response
      return NextResponse.json(
        {
          message: 'Login successful',
          user: {
            id: user._id,
            name: user.name,
            email: sanitizedEmail,
            role: user.role
          },
          token
        },
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store, max-age=0'
          }
        }
      );
    } catch (dbError) {
      console.error('Database operation failed:', dbError);
      return NextResponse.json(
        { error: 'Database operation failed' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}