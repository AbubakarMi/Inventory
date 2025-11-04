
import { NextResponse } from 'next/server';
import db from '@/lib/firebase-admin';
import admin from 'firebase-admin';
import { z } from 'zod';

const setAdminSchema = z.object({
  uid: z.string().min(1, "UID is required"),
});

// This route should only be callable once in a secure way,
// but for the purpose of seeding the first admin, it is left open.
// In a production environment, this should be heavily secured or removed after first use.
export async function POST(request: Request) {
  try {
    const json = await request.json();
    const { uid } = setAdminSchema.parse(json);

    // Set custom claim
    await admin.auth().setCustomUserClaims(uid, { role: 'Admin' });

    // Ensure the user document exists in Firestore and has the correct role
    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();

    if (userDoc.exists) {
        await userRef.update({ role: 'Admin', status: 'Active' });
    } else {
        const userRecord = await admin.auth().getUser(uid);
        await userRef.set({
            name: userRecord.displayName || 'Admin',
            email: userRecord.email,
            role: 'Admin',
            status: 'Active',
        });
    }

    return NextResponse.json({ message: 'Admin role assigned successfully.' }, { status: 200 });

  } catch (error: any) {
    console.error("Error setting admin role:", error);
    if (error instanceof z.ZodError) {
        return NextResponse.json({ error: 'Invalid data provided', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to set admin role' }, { status: 500 });
  }
}
