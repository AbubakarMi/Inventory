
import { NextResponse } from 'next/server';
import db from '@/lib/firebase-admin';
import admin from 'firebase-admin';
import { z } from 'zod';
import { headers } from 'next/headers';

const userSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  role: z.enum(['Admin', 'Manager', 'Staff', 'Storekeeper']),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

async function verifyIdToken(token: string) {
  try {
    return await admin.auth().verifyIdToken(token);
  } catch (error) {
    return null;
  }
}

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
    const data = userSchema.parse(json);

    // Check if this is the first user. If so, they become admin.
    const userList = await admin.auth().listUsers(1);
    const isFirstUser = userList.users.length === 0;
    const userRole = isFirstUser ? 'Admin' : data.role;

    // If not the first user, verify the request is from an admin
    if (!isFirstUser) {
        const authorization = headers().get('Authorization');
        const token = authorization?.split('Bearer ')[1];
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
        }
        const decodedToken = await verifyIdToken(token);
        if (decodedToken?.role !== 'Admin') {
            return NextResponse.json({ error: 'Forbidden: You do not have permission to create users.' }, { status: 403 });
        }
    }
    
    // Create user in Firebase Auth
    const userRecord = await admin.auth().createUser({
      email: data.email,
      password: data.password,
      displayName: data.name,
    });

    // Set custom claims for role-based access
    await admin.auth().setCustomUserClaims(userRecord.uid, { role: userRole });

    // Create user document in Firestore, using the UID from Auth as the document ID
    const userDocData = {
      name: data.name,
      email: data.email,
      role: userRole,
      status: 'Active',
    };
    await db.collection('users').doc(userRecord.uid).set(userDocData);

    // Re-fetch the user to ensure claims are applied before returning
    const updatedUserRecord = await admin.auth().getUser(userRecord.uid);

    return NextResponse.json({ id: updatedUserRecord.uid, ...userDocData }, { status: 201 });

  } catch (error: any) {
    console.error("Error creating user:", error);
    if (error instanceof z.ZodError) {
        return NextResponse.json({ error: 'Invalid data provided', details: error.errors }, { status: 400 });
    }
    if (error.code === 'auth/email-already-exists') {
        return NextResponse.json({ error: 'A user with this email already exists.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
