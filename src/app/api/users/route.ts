import { NextResponse } from 'next/server';
import db from '@/lib/firebase-admin';
import admin from 'firebase-admin';
import { z } from 'zod';

const userSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  role: z.enum(['Admin', 'Manager', 'Staff', 'Storekeeper']),
  status: z.enum(['Active', 'Inactive', 'Suspended']),
});

export async function GET() {
  try {
    const snapshot = await db.collection('users').get();
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request: Request) {
    try {
        const json = await request.json();
        // Password should be handled separately for creation
        const { password, ...userData } = json;
        const data = userSchema.parse(userData);

        // In a real app, you would use Firebase Auth to create the user
        // For now, we just add to firestore
        const docRef = await db.collection('users').add(data);
        
        // Example of how you would set custom claims with Auth
        // const userRecord = await admin.auth().getUserByEmail(data.email);
        // await admin.auth().setCustomUserClaims(userRecord.uid, { role: data.role });

        return NextResponse.json({ id: docRef.id, ...data }, { status: 201 });
    } catch (error) {
        console.error("Error creating user:", error);
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Invalid data provided', details: error.errors }, { status: 400 });
        }
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }
}
