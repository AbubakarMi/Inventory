import { NextResponse } from 'next/server';
import db from '@/lib/firebase-admin';

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
