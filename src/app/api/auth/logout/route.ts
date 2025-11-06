import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    if (user) {
      // Log activity
      await query(
        `INSERT INTO activity_logs (action, collection, user_id, user_name, user_role, details)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        ['logout', 'auth', user.id, user.name, user.role, 'User logged out']
      );
    }

    const response = NextResponse.json({
      message: 'Logout successful',
    }, { status: 200 });

    // Clear cookie
    response.cookies.delete('token');

    return response;
  } catch (error: any) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
