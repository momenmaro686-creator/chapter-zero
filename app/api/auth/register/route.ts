import { NextRequest, NextResponse } from 'next/server';
import { createUser, getUserByPhoneNumber, getUserByUsername } from '@/lib/auth';
import { RegisterSchema } from '@/lib/validators';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = RegisterSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { phoneNumber, username, password } = validation.data;

    // Check if user already exists
    const existingPhone = await getUserByPhoneNumber(phoneNumber);
    if (existingPhone) {
      return NextResponse.json(
        { error: 'Phone number already registered' },
        { status: 409 }
      );
    }

    const existingUsername = await getUserByUsername(username);
    if (existingUsername) {
      return NextResponse.json(
        { error: 'Username already taken' },
        { status: 409 }
      );
    }

    // Create user
    const user = await createUser(phoneNumber, username, password);

    return NextResponse.json(
      {
        message: 'User created successfully',
        user: {
          id: user.id,
          phoneNumber: user.phoneNumber,
          username: user.username,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
