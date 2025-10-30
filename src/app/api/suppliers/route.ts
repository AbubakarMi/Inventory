import { NextResponse } from 'next/server';
import db from '@/lib/firebase-admin';
import { z } from 'zod';

const supplierSchema = z.object({
  name: z.string().min(1),
  contact: z.string().min(1),
  products: z.array(z.string()),
  rating: z.number().min(0).max(5),
});

export async function GET() {
  try {
    const snapshot = await db.collection('suppliers').get();
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    return NextResponse.json({ error: 'Failed to fetch suppliers' }, { status: 500 });
  }
}

export async function POST(request: Request) {
    try {
        const json = await request.json();
        const data = supplierSchema.parse(json);
        const docRef = await db.collection('suppliers').add(data);
        return NextResponse.json({ id: docRef.id, ...data }, { status: 201 });
    } catch (error) {
        console.error("Error creating supplier:", error);
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Invalid data provided', details: error.errors }, { status: 400 });
        }
        return NextResponse.json({ error: 'Failed to create supplier' }, { status: 500 });
    }
}
