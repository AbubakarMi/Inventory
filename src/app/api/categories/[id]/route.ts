import { NextResponse } from 'next/server';
import db from '@/lib/firebase-admin';
import { z } from 'zod';

const categoryUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  parent: z.string().nullable().optional(),
});

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const docRef = db.collection('categories').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error(`Error fetching category ${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to fetch category' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const id = params.id;
        const json = await request.json();
        const data = categoryUpdateSchema.parse(json);
        await db.collection('categories').doc(id).update(data);
        return NextResponse.json({ id, ...data });
    } catch (error) {
        console.error(`Error updating category ${params.id}:`, error);
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Invalid data provided', details: error.errors }, { status: 400 });
        }
        return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        const id = params.id;
        await db.collection('categories').doc(id).delete();
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error(`Error deleting category ${params.id}:`, error);
        return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
    }
}
