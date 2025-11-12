import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

// GET - Fetch user's notifications
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if ('error' in authResult) return authResult.error;

    const { user } = authResult;
    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unread_only') === 'true';

    let sql = `
      SELECT id, title, message, type, is_read, related_collection, related_document_id, created_at
      FROM notifications
      WHERE user_id = $1
    `;

    if (unreadOnly) {
      sql += ' AND is_read = FALSE';
    }

    sql += ' ORDER BY created_at DESC LIMIT 50';

    const result = await query(sql, [user.id]);

    return NextResponse.json({ notifications: result.rows || [] }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({
      error: error.message || 'Internal server error',
      notifications: []
    }, { status: 500 });
  }
}

// PUT - Mark notification(s) as read
export async function PUT(request: NextRequest) {
  const authResult = await requireAuth(request);
  if ('error' in authResult) return authResult.error;

  const { user } = authResult;

  try {
    const body = await request.json();
    const { notification_id, mark_all_read } = body;

    if (mark_all_read) {
      // Mark all user's notifications as read
      await query(
        'UPDATE notifications SET is_read = TRUE WHERE user_id = $1 AND is_read = FALSE',
        [user.id]
      );

      return NextResponse.json({ message: 'All notifications marked as read' }, { status: 200 });
    }

    if (notification_id) {
      // Mark specific notification as read (ensure it belongs to the user)
      const result = await query(
        'UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2 RETURNING id',
        [notification_id, user.id]
      );

      if (result.rows.length === 0) {
        return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
      }

      return NextResponse.json({ message: 'Notification marked as read' }, { status: 200 });
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  } catch (error: any) {
    console.error('Error updating notification:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete notification
export async function DELETE(request: NextRequest) {
  const authResult = await requireAuth(request);
  if ('error' in authResult) return authResult.error;

  const { user } = authResult;
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Notification ID is required' }, { status: 400 });
  }

  try {
    // Delete notification (ensure it belongs to the user)
    const result = await query(
      'DELETE FROM notifications WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, user.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Notification deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Error deleting notification:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
