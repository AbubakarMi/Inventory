import { NextResponse } from 'next/server';
import db from '@/lib/firebase-admin';
import { z } from 'zod';

const itemUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  category: z.string().min(1).optional(),
  quantity: z.number().min(0).optional(),
  unit: z.string().min(1).optional(),
  cost: z.number().min(0).optional(),
  price: z.number().min(0).optional(),
  expiry: z.string().optional().nullable(),
  supplier: z.string().optional(),
  threshold: z.number().min(0).optional(),
});


export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    if (!id) {
        return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
    }

    const docRef = db.collection('inventory').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error(`Error fetching item ${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to fetch item' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const id = params.id;
        const json = await request.json();
        const data = itemUpdateSchema.parse(json);

        const docRef = db.collection('inventory').doc(id);
        await docRef.update(data);

        return NextResponse.json({ id, ...data });
    } catch (error) {
        console.error(`Error updating item ${params.id}:`, error);
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Invalid data provided', details: error.errors }, { status: 400 });
        }
        return NextResponse.json({ error: 'Failed to update item' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        const id = params.id;
        await db.collection('inventory').doc(id).delete();
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error(`Error deleting item ${params.id}:`, error);
        return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
    }
}
