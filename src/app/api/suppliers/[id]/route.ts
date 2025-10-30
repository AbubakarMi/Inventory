import { NextResponse } from 'next/server';
import db from '@/lib/firebase-admin';
import { z } from 'zod';

const supplierUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  contact: z.string().min(1).optional(),
  products: z.array(z.string()).optional(),
  rating: z.number().min(0).max(5).optional(),
});

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const docRef = db.collection('suppliers').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: 'Supplier not found' }, { status: 404 });
    }

    return NextResponse.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error(`Error fetching supplier ${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to fetch supplier' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const id = params.id;
        const json = await request.json();
        const data = supplierUpdateSchema.parse(json);
        await db.collection('suppliers').doc(id).update(data);
        return NextResponse.json({ id, ...data });
    } catch (error) {
        console.error(`Error updating supplier ${params.id}:`, error);
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Invalid data provided', details: error.errors }, { status: 400 });
        }
        return NextResponse.json({ error: 'Failed to update supplier' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        const id = params.id;
        await db.collection('suppliers').doc(id).delete();
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error(`Error deleting supplier ${params.id}:`, error);
        return NextResponse.json({ error: 'Failed to delete supplier' }, { status: 500 });
    }
}
