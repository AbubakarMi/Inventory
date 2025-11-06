import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

// GET - Fetch all categories
export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if ('error' in authResult) return authResult.error;

  try {
    const result = await query(`
      SELECT c.*,
             p.name as parent,
             COUNT(i.id) as item_count,
             COALESCE(SUM(i.quantity), 0) as total_stock
      FROM categories c
      LEFT JOIN categories p ON c.parent_id = p.id
      LEFT JOIN inventory i ON c.id = i.category_id
      GROUP BY c.id, p.name
      ORDER BY c.name ASC
    `);

    return NextResponse.json({ categories: result.rows }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new category
export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request, ['Admin', 'Manager']);
  if ('error' in authResult) return authResult.error;

  const { user } = authResult;

  try {
    const body = await request.json();
    const { name, parent, parent_id } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Determine parent_id
    let finalParentId = parent_id || null;
    if (!finalParentId && parent) {
      const parentResult = await query('SELECT id FROM categories WHERE name = $1', [parent]);
      finalParentId = parentResult.rows[0]?.id || null;
    }

    // Prevent self-referencing
    if (finalParentId) {
      const checkResult = await query('SELECT id FROM categories WHERE id = $1', [finalParentId]);
      if (checkResult.rows.length === 0) {
        return NextResponse.json({ error: 'Parent category does not exist' }, { status: 400 });
      }
    }

    const result = await query(
      'INSERT INTO categories (name, parent_id) VALUES ($1, $2) RETURNING *',
      [name, finalParentId]
    );

    await query(
      `INSERT INTO activity_logs (action, collection, document_id, user_id, user_name, user_role, details)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      ['create', 'categories', result.rows[0].id, user.id, user.name, user.role, `Created category: ${name}`]
    );

    return NextResponse.json({ category: result.rows[0], message: 'Category created successfully' }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update category
export async function PUT(request: NextRequest) {
  const authResult = await requireAuth(request, ['Admin', 'Manager']);
  if ('error' in authResult) return authResult.error;

  const { user } = authResult;

  try {
    const body = await request.json();
    const { id, name, parent, parent_id } = body;

    if (!id || !name) {
      return NextResponse.json({ error: 'ID and name are required' }, { status: 400 });
    }

    // Determine parent_id
    let finalParentId = parent_id !== undefined ? parent_id : null;
    if (finalParentId === null && parent) {
      const parentResult = await query('SELECT id FROM categories WHERE name = $1', [parent]);
      finalParentId = parentResult.rows[0]?.id || null;
    }

    // Prevent self-referencing
    if (finalParentId && finalParentId == id) {
      return NextResponse.json({ error: 'Category cannot be its own parent' }, { status: 400 });
    }

    // Prevent circular references
    if (finalParentId) {
      let currentParentId = finalParentId;
      const visited = new Set([parseInt(id as string)]);

      while (currentParentId) {
        if (visited.has(currentParentId)) {
          return NextResponse.json({ error: 'Circular reference detected' }, { status: 400 });
        }
        visited.add(currentParentId);

        const parentCheck = await query('SELECT parent_id FROM categories WHERE id = $1', [currentParentId]);
        currentParentId = parentCheck.rows[0]?.parent_id || null;
      }
    }

    const result = await query(
      'UPDATE categories SET name = $1, parent_id = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
      [name, finalParentId, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    await query(
      `INSERT INTO activity_logs (action, collection, document_id, user_id, user_name, user_role, details)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      ['update', 'categories', id, user.id, user.name, user.role, `Updated category: ${name}`]
    );

    return NextResponse.json({ category: result.rows[0], message: 'Category updated successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Error updating category:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete category
export async function DELETE(request: NextRequest) {
  const authResult = await requireAuth(request, ['Admin']);
  if ('error' in authResult) return authResult.error;

  const { user } = authResult;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
    }

    const categoryResult = await query('SELECT name FROM categories WHERE id = $1', [id]);

    if (categoryResult.rows.length === 0) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    const categoryName = categoryResult.rows[0].name;

    await query('DELETE FROM categories WHERE id = $1', [id]);

    await query(
      `INSERT INTO activity_logs (action, collection, document_id, user_id, user_name, user_role, details)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      ['delete', 'categories', parseInt(id), user.id, user.name, user.role, `Deleted category: ${categoryName}`]
    );

    return NextResponse.json({ message: 'Category deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
