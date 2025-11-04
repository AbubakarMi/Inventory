
import { NextResponse } from 'next/server';
import db from '@/lib/firebase-admin';
import admin from 'firebase-admin';

const ADMIN_EMAIL = 'admin@gmail.com';
const ADMIN_PASSWORD = 'Password123'; // Use a more secure password in a real app

export async function GET() {
  try {
    // Check if the admin user already exists in Firebase Auth
    let userRecord;
    try {
      userRecord = await admin.auth().getUserByEmail(ADMIN_EMAIL);
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        // User does not exist, so create them
        userRecord = await admin.auth().createUser({
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD,
          displayName: 'Admin User',
        });
      } else {
        // Some other error occurred
        throw error;
      }
    }

    // Now, ensure the custom claim is set
    if (userRecord.customClaims?.['role'] !== 'Admin') {
      await admin.auth().setCustomUserClaims(userRecord.uid, { role: 'Admin' });
    }

    // Finally, ensure the Firestore document exists and is correct
    const userDocRef = db.collection('users').doc(userRecord.uid);
    const userDoc = await userDocRef.get();

    const userDocData = {
      name: 'Admin User',
      email: ADMIN_EMAIL,
      role: 'Admin',
      status: 'Active',
    };

    if (!userDoc.exists || JSON.stringify(userDoc.data()) !== JSON.stringify(userDocData)) {
      await userDocRef.set(userDocData);
    }

    return NextResponse.json({ message: 'Admin user ensured.' }, { status: 200 });

  } catch (error: any) {
    console.error("Error ensuring admin user:", error);
    return NextResponse.json({ error: 'Failed to ensure admin user', details: error.message }, { status: 500 });
  }
}
