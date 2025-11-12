import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

// GET - Fetch all users
export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request, ['Admin', 'Manager']);
  if ('error' in authResult) return authResult.error;

  try {
    const result = await query(
      'SELECT id, name, email, role, status, email_verified, created_at, updated_at FROM users ORDER BY created_at DESC'
    );

    return NextResponse.json({ users: result.rows }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new user
export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request, ['Admin']);
  if ('error' in authResult) return authResult.error;

  const { user } = authResult;

  try {
    const body = await request.json();
    const { name, email, password, role, status } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);

    if (existingUser.rows.length > 0) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await query(
      `INSERT INTO users (name, email, password, role, status, email_verified)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, email, role, status, email_verified, created_at`,
      [name, email.toLowerCase(), hashedPassword, role, status || 'Active', true]
    );

    await query(
      `INSERT INTO activity_logs (action, collection, document_id, user_id, user_name, user_role, details)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      ['create', 'users', result.rows[0].id, user.id, user.name, user.role, `Created user: ${name}`]
    );

    return NextResponse.json({ user: result.rows[0], message: 'User created successfully' }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update user
export async function PUT(request: NextRequest) {
  const authResult = await requireAuth(request, ['Admin', 'Manager']);
  if ('error' in authResult) return authResult.error;

  const { user: currentUser } = authResult;

  try {
    const body = await request.json();
    const { id, name, email, role, status, password } = body;

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Build update query dynamically
    const updates: string[] = [];
    const params: any[] = [id];
    let paramCount = 1;

    if (name) {
      paramCount++;
      updates.push(`name = $${paramCount}`);
      params.push(name);
    }

    if (email) {
      // Check if email already exists (excluding current user)
      const existingUser = await query('SELECT id FROM users WHERE email = $1 AND id != $2', [email.toLowerCase(), id]);
      if (existingUser.rows.length > 0) {
        return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
      }

      paramCount++;
      updates.push(`email = $${paramCount}`);
      params.push(email.toLowerCase());
    }

    if (role && currentUser.role === 'Admin') {
      // Check if trying to change an Admin user's role
      const targetUser = await query('SELECT role FROM users WHERE id = $1', [id]);
      if (targetUser.rows.length > 0 && targetUser.rows[0].role === 'Admin') {
        return NextResponse.json({ error: 'Cannot change Admin user role' }, { status: 403 });
      }

      paramCount++;
      updates.push(`role = $${paramCount}`);
      params.push(role);
    }

    if (status && currentUser.role === 'Admin') {
      paramCount++;
      updates.push(`status = $${paramCount}`);
      params.push(status);
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      paramCount++;
      updates.push(`password = $${paramCount}`);
      params.push(hashedPassword);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');

    const result = await query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $1 RETURNING id, name, email, role, status, email_verified`,
      params
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await query(
      `INSERT INTO activity_logs (action, collection, document_id, user_id, user_name, user_role, details)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      ['update', 'users', id, currentUser.id, currentUser.name, currentUser.role, `Updated user: ${result.rows[0].name}`]
    );

    return NextResponse.json({ user: result.rows[0], message: 'User updated successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete user
export async function DELETE(request: NextRequest) {
  const authResult = await requireAuth(request, ['Admin']);
  if ('error' in authResult) return authResult.error;

  const { user } = authResult;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Prevent deleting yourself
    if (parseInt(id) === user.id) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
    }

    const userResult = await query('SELECT name FROM users WHERE id = $1', [id]);

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userName = userResult.rows[0].name;

    await query('DELETE FROM users WHERE id = $1', [id]);

    await query(
      `INSERT INTO activity_logs (action, collection, document_id, user_id, user_name, user_role, details)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      ['delete', 'users', parseInt(id), user.id, user.name, user.role, `Deleted user: ${userName}`]
    );

    return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
