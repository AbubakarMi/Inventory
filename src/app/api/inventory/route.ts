import { NextResponse } from 'next/server';
import db from '@/lib/firebase-admin';
import { z } from 'zod';

const itemSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  quantity: z.number().min(0),
  unit: z.string().min(1),
  cost: z.number().min(0),
  price: z.number().min(0),
  expiry: z.string().optional().nullable(),
  supplier: z.string().optional(),
  threshold: z.number().min(0),
});

export async function GET() {
  try {
    const inventorySnapshot = await db.collection('inventory').get();
    const inventory = inventorySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json(inventory);
  } catch (error) {
    console.error("Error fetching inventory:", error);
    return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 });
  }
}

export async function POST(request: Request) {
    try {
        const json = await request.json();
        const data = itemSchema.parse(json);
        const docRef = await db.collection('inventory').add(data);
        return NextResponse.json({ id: docRef.id, ...data }, { status: 201 });
    } catch (error) {
        console.error("Error creating item:", error);
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Invalid data provided', details: error.errors }, { status: 400 });
        }
        return NextResponse.json({ error: 'Failed to create item' }, { status: 500 });
    }
}
