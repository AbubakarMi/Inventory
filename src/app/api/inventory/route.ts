import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

// GET - Fetch all inventory items
export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if ('error' in authResult) return authResult.error;

  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const statusFilter = searchParams.get('status');
    const search = searchParams.get('search');

    let sql = `
      SELECT i.*,
             c.name as category,
             s.name as supplier
      FROM inventory i
      LEFT JOIN categories c ON i.category_id = c.id
      LEFT JOIN suppliers s ON i.supplier_id = s.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 0;

    if (category) {
      paramCount++;
      sql += ` AND i.category_id = $${paramCount}`;
      params.push(category);
    }

    if (search) {
      paramCount++;
      sql += ` AND i.name ILIKE $${paramCount}`;
      params.push(`%${search}%`);
    }

    sql += ' ORDER BY i.created_at DESC';

    const result = await query(sql, params);

    // Recalculate status for each item based on current quantity and threshold
    const items = result.rows.map((item: any) => {
      const qty = Number(item.quantity) || 0;
      const thresh = Number(item.threshold) || 10;
      let status;
      if (qty === 0) {
        status = 'Out of Stock';
      } else if (qty <= thresh) {
        status = 'Low Stock';
      } else {
        status = 'In Stock';
      }
      return { ...item, status };
    });

    // Filter by status if specified
    const filteredItems = statusFilter
      ? items.filter((item: any) => item.status === statusFilter)
      : items;

    return NextResponse.json({ items: filteredItems }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching inventory:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new inventory item
export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request, ['Admin', 'Manager', 'Storekeeper']);
  if ('error' in authResult) return authResult.error;

  const { user } = authResult;

  try {
    const body = await request.json();
    const { name, category, quantity, unit, cost, price, expiry, supplier, threshold } = body;

    if (!name || !unit) {
      return NextResponse.json({ error: 'Name and unit are required' }, { status: 400 });
    }

    // Calculate status based on quantity and threshold
    const qty = Number(quantity) || 0;
    const thresh = Number(threshold) || 10;
    let status;
    if (qty === 0) {
      status = 'Out of Stock';
    } else if (qty <= thresh) {
      status = 'Low Stock';
    } else {
      status = 'In Stock';
    }

    // Get category_id and supplier_id from names
    let category_id = null;
    let supplier_id = null;

    if (category) {
      const catResult = await query('SELECT id FROM categories WHERE name = $1', [category]);
      category_id = catResult.rows[0]?.id || null;
    }

    if (supplier) {
      const suppResult = await query('SELECT id FROM suppliers WHERE name = $1', [supplier]);
      supplier_id = suppResult.rows[0]?.id || null;
    }

    const result = await query(
      `INSERT INTO inventory (name, category_id, quantity, unit, status, cost, price, expiry, supplier_id, threshold, created_by, updated_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [name, category_id, qty, unit, status, cost || 0, price || 0, expiry || null, supplier_id, thresh, user.id, user.id]
    );

    await query(
      `INSERT INTO activity_logs (action, collection, document_id, user_id, user_name, user_role, details)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      ['create', 'inventory', result.rows[0].id, user.id, user.name, user.role, `Created inventory item: ${name}`]
    );

    return NextResponse.json({ item: result.rows[0], message: 'Item created successfully' }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating inventory item:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update inventory item
export async function PUT(request: NextRequest) {
  const authResult = await requireAuth(request, ['Admin', 'Manager', 'Storekeeper']);
  if ('error' in authResult) return authResult.error;

  const { user } = authResult;

  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
    }

    // If quantity or threshold is being updated, recalculate status
    if ('quantity' in updateData || 'threshold' in updateData) {
      // Get current item data
      const currentItem = await query('SELECT quantity, threshold FROM inventory WHERE id = $1', [id]);
      if (currentItem.rows.length > 0) {
        const qty = Number(updateData.quantity ?? currentItem.rows[0].quantity) || 0;
        const thresh = Number(updateData.threshold ?? currentItem.rows[0].threshold) || 10;

        if (qty === 0) {
          updateData.status = 'Out of Stock';
        } else if (qty <= thresh) {
          updateData.status = 'Low Stock';
        } else {
          updateData.status = 'In Stock';
        }
      }
    }

    const fields = Object.keys(updateData).filter(key => updateData[key] !== undefined);
    if (fields.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
    const values = [id, ...fields.map(field => updateData[field]), user.id];

    const result = await query(
      `UPDATE inventory SET ${setClause}, updated_by = $${values.length}, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    await query(
      `INSERT INTO activity_logs (action, collection, document_id, user_id, user_name, user_role, details)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      ['update', 'inventory', id, user.id, user.name, user.role, `Updated inventory item: ${result.rows[0].name}`]
    );

    return NextResponse.json({ item: result.rows[0], message: 'Item updated successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Error updating inventory item:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete inventory item
export async function DELETE(request: NextRequest) {
  const authResult = await requireAuth(request, ['Admin']);
  if ('error' in authResult) return authResult.error;

  const { user } = authResult;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
    }

    const itemResult = await query('SELECT name FROM inventory WHERE id = $1', [id]);

    if (itemResult.rows.length === 0) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    const itemName = itemResult.rows[0].name;

    await query('DELETE FROM inventory WHERE id = $1', [id]);

    await query(
      `INSERT INTO activity_logs (action, collection, document_id, user_id, user_name, user_role, details)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      ['delete', 'inventory', parseInt(id), user.id, user.name, user.role, `Deleted inventory item: ${itemName}`]
    );

    return NextResponse.json({ message: 'Item deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Error deleting inventory item:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
