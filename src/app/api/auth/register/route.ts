import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';
import { generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, role } = body;

    // Validate input
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ['Admin', 'Manager', 'Storekeeper', 'Staff'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await query(
      `INSERT INTO users (name, email, password, role, status, email_verified)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, email, role, status, email_verified, created_at`,
      [name, email.toLowerCase(), hashedPassword, role, 'Active', true]
    );

    const newUser = result.rows[0];

    // Generate JWT token
    const token = generateToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
    });

    // Log activity
    await query(
      `INSERT INTO activity_logs (action, collection, user_id, user_name, user_role, details)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      ['create', 'users', newUser.id, newUser.name, newUser.role, 'User registered']
    );

    // Return user data and token
    const userData = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      status: newUser.status,
      email_verified: newUser.email_verified,
    };

    const response = NextResponse.json({
      user: userData,
      token,
      message: 'Registration successful',
    }, { status: 201 });

    // Set cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
