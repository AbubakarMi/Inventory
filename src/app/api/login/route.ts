
import { NextResponse } from 'next/server';
import admin from 'firebase-admin';
import db from '@/lib/firebase-admin';
import { z } from 'zod';

// We can't truly sign in with password on the admin SDK, 
// but we can verify the user exists as a first step.
// The actual sign-in will still happen on the client after this check.
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(), // Password can't be validated on the backend this way
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const data = loginSchema.parse(json);

    // Check if user exists with this email
    const userRecord = await admin.auth().getUserByEmail(data.email);

    if (userRecord.disabled) {
      return NextResponse.json({ error: 'User account is disabled.' }, { status: 403 });
    }
    
    // We cannot verify the password with the Admin SDK.
    // We are simply confirming the user exists. The client must still complete the sign-in.
    // In a full-blown custom auth system, we would create a custom token here.
    // For now, we'll return a success message to let the client proceed.
    return NextResponse.json({ success: true, uid: userRecord.uid });

  } catch (error: any) {
    console.error("Error during login API check:", error);
    if (error.code === 'auth/user-not-found') {
        return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
    }
    if (error instanceof z.ZodError) {
        return NextResponse.json({ error: 'Invalid data provided', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to login.' }, { status: 500 });
  }
}
