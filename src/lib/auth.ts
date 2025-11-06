import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { query } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface JWTPayload {
  userId: number;
  email: string;
  role: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'Admin' | 'Manager' | 'Storekeeper' | 'Staff';
  status: 'Active' | 'Inactive' | 'Suspended';
  email_verified: boolean;
  created_at: Date;
  updated_at: Date;
}

// Generate JWT token
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// Verify JWT token
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

// Extract token from request
export function extractToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');

  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Also check cookies
  const cookieToken = request.cookies.get('token')?.value;
  return cookieToken || null;
}

// Get current user from request
export async function getCurrentUser(request: NextRequest): Promise<User | null> {
  try {
    const token = extractToken(request);

    if (!token) {
      return null;
    }

    const payload = verifyToken(token);

    if (!payload) {
      return null;
    }

    // Fetch user from database
    const result = await query(
      'SELECT id, name, email, role, status, email_verified, created_at, updated_at FROM users WHERE id = $1 AND status = $2',
      [payload.userId, 'Active']
    );

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0] as User;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

// Check if user has required role
export function hasRole(user: User | null, allowedRoles: string[]): boolean {
  if (!user) return false;
  return allowedRoles.includes(user.role);
}

// Middleware to protect API routes
export async function requireAuth(
  request: NextRequest,
  allowedRoles?: string[]
): Promise<{ user: User; error?: never } | { user?: never; error: Response }> {
  const user = await getCurrentUser(request);

  if (!user) {
    return {
      error: new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }),
    };
  }

  if (allowedRoles && !hasRole(user, allowedRoles)) {
    return {
      error: new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      }),
    };
  }

  return { user };
}
