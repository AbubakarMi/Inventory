import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { createAdminNotification } from '@/lib/notifications';

// GET - Fetch all suppliers
export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if ('error' in authResult) return authResult.error;

  try {
    const result = await query('SELECT * FROM suppliers ORDER BY name ASC');

    return NextResponse.json({ suppliers: result.rows }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching suppliers:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new supplier
export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request, ['Admin', 'Manager']);
  if ('error' in authResult) return authResult.error;

  const { user } = authResult;

  try {
    const body = await request.json();
    const { name, contact, products, rating } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const result = await query(
      'INSERT INTO suppliers (name, contact, products, rating) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, contact || '', products || [], rating || 0]
    );

    await query(
      `INSERT INTO activity_logs (action, collection, document_id, user_id, user_name, user_role, details)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      ['create', 'suppliers', result.rows[0].id, user.id, user.name, user.role, `Created supplier: ${name}`]
    );

    // Create notification for admins/managers
    await createAdminNotification({
      title: 'New Supplier Added',
      message: `${user.name} added supplier "${name}"`,
      type: 'success',
      relatedCollection: 'suppliers',
      relatedDocumentId: result.rows[0].id,
    });

    return NextResponse.json({ supplier: result.rows[0], message: 'Supplier created successfully' }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating supplier:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update supplier
export async function PUT(request: NextRequest) {
  const authResult = await requireAuth(request, ['Admin', 'Manager']);
  if ('error' in authResult) return authResult.error;

  const { user } = authResult;

  try {
    const body = await request.json();
    const { id, name, contact, products, rating } = body;

    if (!id || !name) {
      return NextResponse.json({ error: 'ID and name are required' }, { status: 400 });
    }

    const result = await query(
      'UPDATE suppliers SET name = $1, contact = $2, products = $3, rating = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *',
      [name, contact, products, rating, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Supplier not found' }, { status: 404 });
    }

    await query(
      `INSERT INTO activity_logs (action, collection, document_id, user_id, user_name, user_role, details)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      ['update', 'suppliers', id, user.id, user.name, user.role, `Updated supplier: ${name}`]
    );

    return NextResponse.json({ supplier: result.rows[0], message: 'Supplier updated successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Error updating supplier:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete supplier
export async function DELETE(request: NextRequest) {
  const authResult = await requireAuth(request, ['Admin']);
  if ('error' in authResult) return authResult.error;

  const { user } = authResult;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Supplier ID is required' }, { status: 400 });
    }

    const supplierResult = await query('SELECT name FROM suppliers WHERE id = $1', [id]);

    if (supplierResult.rows.length === 0) {
      return NextResponse.json({ error: 'Supplier not found' }, { status: 404 });
    }

    const supplierName = supplierResult.rows[0].name;

    await query('DELETE FROM suppliers WHERE id = $1', [id]);

    await query(
      `INSERT INTO activity_logs (action, collection, document_id, user_id, user_name, user_role, details)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      ['delete', 'suppliers', parseInt(id), user.id, user.name, user.role, `Deleted supplier: ${supplierName}`]
    );

    return NextResponse.json({ message: 'Supplier deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Error deleting supplier:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
