
import { NextResponse } from 'next/server';
import db from '@/lib/firebase-admin';
import admin from 'firebase-admin';

// This is a special, one-time-use API route to ensure the admin user exists.
export async function GET() {
    const adminEmail = 'admin@gmail.com';
    const adminPassword = 'Password123'; // Use a strong password in a real app

    try {
        // Check if the admin user already exists
        let userRecord;
        try {
            userRecord = await admin.auth().getUserByEmail(adminEmail);
        } catch (error: any) {
            if (error.code === 'auth/user-not-found') {
                // User does not exist, so create them
                userRecord = await admin.auth().createUser({
                    email: adminEmail,
                    password: adminPassword,
                    displayName: 'Admin User',
                });
                
                // Set custom claims to make them an admin
                await admin.auth().setCustomUserClaims(userRecord.uid, { role: 'Admin' });
                
                // Create the user document in Firestore
                await db.collection('users').doc(userRecord.uid).set({
                    name: 'Admin User',
                    email: adminEmail,
                    role: 'Admin',
                    status: 'Active',
                });

                return NextResponse.json({ message: 'Admin user created successfully.' }, { status: 201 });
            }
            // For other errors, re-throw
            throw error;
        }

        // If user exists, ensure they have the admin claim
        if (userRecord && userRecord.customClaims?.role !== 'Admin') {
             await admin.auth().setCustomUserClaims(userRecord.uid, { role: 'Admin' });
             await db.collection('users').doc(userRecord.uid).update({ role: 'Admin' });
             return NextResponse.json({ message: 'Admin role assigned to existing user.' }, { status: 200 });
        }
        
        return NextResponse.json({ message: 'Admin user already exists.' }, { status: 200 });

    } catch (error: any) {
        console.error("Error in ensure-admin route:", error);
        return NextResponse.json({ error: 'Failed to ensure admin user exists.' }, { status: 500 });
    }
}
