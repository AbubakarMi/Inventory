
'use client';
import { initializeFirebase } from '@/firebase';
import type { User } from '@/lib/types';
import { collection, addDoc, doc, setDoc } from 'firebase/firestore';
// NOTE: User creation via email/password should be handled by a server-side function (e.g., a Genkit flow)
// for security reasons, as it requires admin privileges to create users without them being logged in.
// This client-side service is for creating the user document in Firestore after the auth user is created.

const { firestore } = initializeFirebase();
const usersCollection = collection(firestore, 'users');

// This function is intended to be called AFTER a user is created in Firebase Auth.
export const addUser = async (user: Omit<User, 'id' | 'status'> & { id: string }) => {
    const userRef = doc(firestore, 'users', user.id);
    return setDoc(userRef, {
        name: user.name,
        email: user.email,
        role: user.role,
        status: 'Active' // New users are active by default
    });
};

// A proper implementation for creating a user would look like this, using a Genkit flow:
/*
'use server';
import {flow} from 'genkit';
import * as z from 'zod';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';

export const createUserFlow = flow(
    {
        name: 'createUserFlow',
        inputSchema: z.object({
            email: z.string().email(),
            password: z.string().min(8),
            name: z.string(),
            role: z.string(),
        }),
        outputSchema: z.string(),
    },
    async (input) => {
        const auth = getAuth();
        const firestore = getFirestore();

        // Create user in Firebase Auth
        const userRecord = await auth.createUser({
            email: input.email,
            password: input.password,
            displayName: input.name,
        });

        // Set custom claims for role
        await auth.setCustomUserClaims(userRecord.uid, { role: input.role });

        // Create user document in Firestore
        await firestore.collection('users').doc(userRecord.uid).set({
            name: input.name,
            email: input.email,
            role: input.role,
            status: 'Active',
        });
        
        return userRecord.uid;
    }
);
*/
