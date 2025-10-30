import { NextResponse } from 'next/server';
import db from '@/lib/firebase-admin';
import { z } from 'zod';

const userUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  role: z.enum(['Admin', 'Manager', 'Staff', 'Storekeeper']).optional(),
  status: z.enum(['Active', 'Inactive', 'Suspended']).optional(),
});

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const docRef = db.collection('users').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error(`Error fetching user ${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const id = params.id;
        const json = await request.json();
        const data = userUpdateSchema.parse(json);
        await db.collection('users').doc(id).update(data);
        return NextResponse.json({ id, ...data });
    } catch (error) {
        console.error(`Error updating user ${params.id}:`, error);
         if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Invalid data provided', details: error.errors }, { status: 400 });
        }
        return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        const id = params.id;
        // Also delete from Firebase Auth in a real app
        await db.collection('users').doc(id).delete();
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error(`Error deleting user ${params.id}:`, error);
        return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
    }
}
