import { NextResponse } from 'next/server';
import db from '@/lib/firebase-admin';
import { z } from 'zod';

const categorySchema = z.object({
  name: z.string().min(1),
  parent: z.string().nullable().optional(),
});

export async function GET() {
  try {
    const snapshot = await db.collection('categories').get();
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request: Request) {
    try {
        const json = await request.json();
        const data = categorySchema.parse(json);
        const docRef = await db.collection('categories').add(data);
        return NextResponse.json({ id: docRef.id, ...data }, { status: 201 });
    } catch (error) {
        console.error("Error creating category:", error);
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Invalid data provided', details: error.errors }, { status: 400 });
        }
        return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
    }
}
