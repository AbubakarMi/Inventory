import { NextResponse } from 'next/server';
import admin from 'firebase-admin';
import { headers } from 'next/headers';
import db from '@/lib/firebase-admin';

async function verifyIdToken(token: string) {
  try {
    return await admin.auth().verifyIdToken(token);
  } catch (error) {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const authorization = headers().get('Authorization');
    const token = authorization?.split('Bearer ')[1];

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
    }

    const decodedToken = await verifyIdToken(token);

    if (!decodedToken || !decodedToken.uid) {
        return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    const uid = decodedToken.uid;
    const newRole = 'Admin';

    // Set custom claims for role-based access
    await admin.auth().setCustomUserClaims(uid, { role: newRole });

    // Also update the user's document in Firestore
    const userRef = db.collection('users').doc(uid);
    await userRef.update({ role: newRole });

    return NextResponse.json({ message: `Admin role assigned to user ${uid}` });

  } catch (error: any) {
    console.error("Error assigning admin role:", error);
    return NextResponse.json({ error: 'Failed to assign admin role', details: error.message }, { status: 500 });
  }
}
