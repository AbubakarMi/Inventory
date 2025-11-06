import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

// GET - Fetch activity logs
export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request, ['Admin', 'Manager']);
  if ('error' in authResult) return authResult.error;

  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');
    const action = searchParams.get('action');
    const collection = searchParams.get('collection');
    const userId = searchParams.get('userId');

    let sql = 'SELECT * FROM activity_logs WHERE 1=1';
    const params: any[] = [];
    let paramCount = 0;

    if (action) {
      paramCount++;
      sql += ` AND action = $${paramCount}`;
      params.push(action);
    }

    if (collection) {
      paramCount++;
      sql += ` AND collection = $${paramCount}`;
      params.push(collection);
    }

    if (userId) {
      paramCount++;
      sql += ` AND user_id = $${paramCount}`;
      params.push(userId);
    }

    sql += ' ORDER BY timestamp DESC';

    paramCount++;
    sql += ` LIMIT $${paramCount}`;
    params.push(limit);

    paramCount++;
    sql += ` OFFSET $${paramCount}`;
    params.push(offset);

    const result = await query(sql, params);

    // Get total count
    let countSql = 'SELECT COUNT(*) FROM activity_logs WHERE 1=1';
    const countParams: any[] = [];
    let countParamCount = 0;

    if (action) {
      countParamCount++;
      countSql += ` AND action = $${countParamCount}`;
      countParams.push(action);
    }

    if (collection) {
      countParamCount++;
      countSql += ` AND collection = $${countParamCount}`;
      countParams.push(collection);
    }

    if (userId) {
      countParamCount++;
      countSql += ` AND user_id = $${countParamCount}`;
      countParams.push(userId);
    }

    const countResult = await query(countSql, countParams);
    const total = parseInt(countResult.rows[0].count);

    return NextResponse.json({
      logs: result.rows,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching activity logs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
