import { NextResponse } from 'next/server';
import db from '@/lib/firebase-admin';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const docRef = db.collection('sales').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: 'Sale not found' }, { status: 404 });
    }

    return NextResponse.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error(`Error fetching sale ${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to fetch sale' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        const id = params.id;
        await db.collection('sales').doc(id).delete();
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error(`Error deleting sale ${params.id}:`, error);
        return NextResponse.json({ error: 'Failed to delete sale' }, { status: 500 });
    }
}
