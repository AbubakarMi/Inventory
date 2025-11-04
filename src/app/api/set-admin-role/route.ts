
import { NextResponse } from 'next/server';
import db from '@/lib/firebase-admin';
import admin from 'firebase-admin';
import { z } from 'zod';

const setAdminSchema = z.object({
  uid: z.string().min(1, "UID is required"),
});

// This route is specifically for the one-time seeding of the first admin user.
// In a production environment, this should be heavily secured or removed after first use.
export async function POST(request: Request) {
  try {
    const json = await request.json();
    const { uid } = setAdminSchema.parse(json);

    // Set custom claim for the admin role
    await admin.auth().setCustomUserClaims(uid, { role: 'Admin' });

    // Also create the user's document in Firestore to match
    const userRef = db.collection('users').doc(uid);
    const userRecord = await admin.auth().getUser(uid);
    
    await userRef.set({
        name: userRecord.displayName || 'Admin',
        email: userRecord.email,
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
