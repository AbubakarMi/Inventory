
import { NextResponse } from 'next/server';
import db from '@/lib/firebase-admin';
import admin from 'firebase-admin';
import { z } from 'zod';

const setAdminSchema = z.object({
  uid: z.string().min(1, "UID is required"),
  email: z.string().email(),
  name: z.string().min(1),
});

// This route's only job is to set a custom claim and create the user's Firestore doc.
// It should only be callable as part of the initial admin user seeding.
export async function POST(request: Request) {
  try {
    const json = await request.json();
    const { uid, email, name } = setAdminSchema.parse(json);

    // Set custom claim for the admin role
    await admin.auth().setCustomUserClaims(uid, { role: 'Admin' });

    // Also create the user's document in Firestore to match
    const userRef = db.collection('users').doc(uid);
    
    await userRef.set({
        name: name,
        email: email,
        role: 'Admin',
        status: 'Active',
    });

    return NextResponse.json({ message: 'Admin role assigned successfully.' }, { status: 200 });

  } catch (error: any) {
    console.error("Error setting admin role:", error);
    if (error instanceof z.ZodError) {
        return NextResponse.json({ error: 'Invalid data provided', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to set admin role', details: error.message }, { status: 500 });
  }
}
