
import { NextResponse } from 'next/server';
import db from '@/lib/firebase-admin';
import admin from 'firebase-admin';
import { z } from 'zod';
import { headers } from 'next/headers';

const userUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  role: z.enum(['Admin', 'Manager', 'Staff', 'Storekeeper']).optional(),
  status: z.enum(['Active', 'Inactive', 'Suspended']).optional(),
});

async function verifyIdToken(token: string) {
  try {
    return await admin.auth().verifyIdToken(token);
  } catch (error) {
    return null;
  }
}

async function requireAdmin(request: Request) {
    const authorization = headers().get('Authorization');
    const token = authorization?.split('Bearer ')[1];
    if (!token) {
        return { authorized: false, response: NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 }) };
    }
    const decodedToken = await verifyIdToken(token);
    if (decodedToken?.role !== 'Admin') {
        return { authorized: false, response: NextResponse.json({ error: 'Forbidden: You do not have permission.' }, { status: 403 }) };
    }
    return { authorized: true, response: null };
}


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
    const { authorized, response } = await requireAdmin(request);
    if (!authorized) return response;

    try {
        const id = params.id;
        const json = await request.json();
        const data = userUpdateSchema.parse(json);

        // Update Firestore document
        await db.collection('users').doc(id).update(data);
        
        // If role is being updated, update custom claims as well
        if (data.role) {
            await admin.auth().setCustomUserClaims(id, { role: data.role });
        }

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
    const { authorized, response } = await requireAdmin(request);
    if (!authorized) return response;

    try {
        const id = params.id;
        
        // Delete from Firebase Auth
        await admin.auth().deleteUser(id);
        
        // Delete from Firestore
        await db.collection('users').doc(id).delete();

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error(`Error deleting user ${params.id}:`, error);
        return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
    }
}
