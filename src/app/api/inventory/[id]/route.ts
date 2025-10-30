import { NextResponse } from 'next/server';
import db from '@/lib/firebase-admin';

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
