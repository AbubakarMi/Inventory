import { NextResponse } from 'next/server';
import db from '@/lib/firebase-admin';
import { z } from 'zod';

const saleSchema = z.object({
  itemName: z.string().min(1),
  quantity: z.number().min(1),
  type: z.enum(['Sale', 'Usage']),
  date: z.string().datetime(),
  total: z.number().min(0),
});

export async function GET() {
  try {
    const snapshot = await db.collection('sales').orderBy('date', 'desc').get();
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching sales:", error);
    return NextResponse.json({ error: 'Failed to fetch sales' }, { status: 500 });
  }
}

export async function POST(request: Request) {
    try {
        const json = await request.json();
        const data = saleSchema.parse(json);

        // In a real app, this should be a transaction to update inventory stock
        const docRef = await db.collection('sales').add(data);
        return NextResponse.json({ id: docRef.id, ...data }, { status: 201 });
    } catch (error) {
        console.error("Error creating sale:", error);
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Invalid data provided', details: error.errors }, { status: 400 });
        }
        return NextResponse.json({ error: 'Failed to create sale' }, { status: 500 });
    }
}
