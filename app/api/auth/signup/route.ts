import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { registerSchema } from '@/lib/auth/validation';
import clientPromise from '@/lib/db';
import { sanitizeInput } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validationResult = registerSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { name, email, password, role } = validationResult.data;

    // Sanitize inputs
    const sanitizedName = sanitizeInput(name);
    const sanitizedEmail = sanitizeInput(email.toLowerCase());

    try {
      // Connect to MongoDB
      const client = await clientPromise;
      const db = client.db('artify');
      const usersCollection = db.collection('users');

      // Check if user exists
      const existingUser = await usersCollection.findOne({ email: sanitizedEmail });
      if (existingUser) {
        return NextResponse.json(
          { error: 'User already exists' },
          { status: 400 }
        );
      }

      // Hash password
      const hashedPassword = await hash(password, 12);

      // Create user document
      const result = await usersCollection.insertOne({
        name: sanitizedName,
        email: sanitizedEmail,
        password: hashedPassword,
        role,
        loginAttempts: 0,
        lastLoginAttempt: null,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Return success response
      return NextResponse.json(
        {
          message: 'User created successfully',
          user: {
            id: result.insertedId,
            name: sanitizedName,
            email: sanitizedEmail,
            role
          }
        },
        { 
          status: 201,
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
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}