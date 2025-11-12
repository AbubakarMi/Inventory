import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { createAdminNotification } from '@/lib/notifications';

// GET - Fetch all sales
export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if ('error' in authResult) return authResult.error;

  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let sql = 'SELECT * FROM sales WHERE 1=1';
    const params: any[] = [];
    let paramCount = 0;

    if (type) {
      paramCount++;
      sql += ` AND type = $${paramCount}`;
      params.push(type);
    }

    if (startDate) {
      paramCount++;
      sql += ` AND date >= $${paramCount}`;
      params.push(startDate);
    }

    if (endDate) {
      paramCount++;
      sql += ` AND date <= $${paramCount}`;
      params.push(endDate);
    }

    sql += ' ORDER BY date DESC, created_at DESC';

    const result = await query(sql, params);

    return NextResponse.json({ sales: result.rows }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching sales:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new sale
export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request, ['Admin', 'Manager', 'Storekeeper']);
  if ('error' in authResult) return authResult.error;

  const { user } = authResult;

  try {
    const body = await request.json();
    const { item_id, item_name, quantity, type, total, date } = body;

    if (!item_name || !quantity || !type || !total) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const result = await query(
      'INSERT INTO sales (item_id, item_name, quantity, type, total, date, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [item_id || null, item_name, quantity, type, total, date || new Date().toISOString().split('T')[0], user.id]
    );

    // Update inventory quantity if item_id is provided
    if (item_id) {
      await query('UPDATE inventory SET quantity = quantity - $1 WHERE id = $2', [quantity, item_id]);
    }

    await query(
      `INSERT INTO activity_logs (action, collection, document_id, user_id, user_name, user_role, details)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      ['create', 'sales', result.rows[0].id, user.id, user.name, user.role, `Recorded ${type}: ${item_name}`]
    );

    // Create notification for admins/managers
    await createAdminNotification({
      title: `New ${type} Recorded`,
      message: `${user.name} recorded ${type.toLowerCase()} of ${item_name} (${quantity} units, ₦${total})`,
      type: 'info',
      relatedCollection: 'sales',
      relatedDocumentId: result.rows[0].id,
    });

    return NextResponse.json({ sale: result.rows[0], message: 'Sale recorded successfully' }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating sale:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete sale
export async function DELETE(request: NextRequest) {
  const authResult = await requireAuth(request, ['Admin']);
  if ('error' in authResult) return authResult.error;

  const { user } = authResult;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Sale ID is required' }, { status: 400 });
    }

    const saleResult = await query('SELECT * FROM sales WHERE id = $1', [id]);

    if (saleResult.rows.length === 0) {
      return NextResponse.json({ error: 'Sale not found' }, { status: 404 });
    }

    const sale = saleResult.rows[0];

    // Restore inventory quantity if item_id exists
    if (sale.item_id) {
      await query('UPDATE inventory SET quantity = quantity + $1 WHERE id = $2', [sale.quantity, sale.item_id]);
    }

    await query('DELETE FROM sales WHERE id = $1', [id]);

    await query(
      `INSERT INTO activity_logs (action, collection, document_id, user_id, user_name, user_role, details)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      ['delete', 'sales', parseInt(id), user.id, user.name, user.role, `Deleted sale: ${sale.item_name}`]
    );

    return NextResponse.json({ message: 'Sale deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Error deleting sale:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
