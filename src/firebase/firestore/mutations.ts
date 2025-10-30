
'use client'

import { addDoc, collection, doc, updateDoc, deleteDoc, Firestore } from "firebase/firestore";

// Add a new document to a collection
export const addDocument = async (db: Firestore, collectionName: string, data: any) => {
    try {
        const collectionRef = collection(db, collectionName);
        return await addDoc(collectionRef, data);
    } catch (e) {
        console.error("Error adding document: ", e);
        throw e;
    }
};

// Update an existing document
export const updateDocument = async (db: Firestore, collectionName: string, id: string, data: any) => {
    try {
        const docRef = doc(db, collectionName, id);
        return await updateDoc(docRef, data);
    } catch (e) {
        console.error("Error updating document: ", e);
        throw e;
    }
};

// Delete a document
export const deleteDocument = async (db: Firestore, collectionName: string, id: string) => {
    try {
        const docRef = doc(db, collectionName, id);
        return await deleteDoc(docRef);
    } catch (e) {
        console.error("Error deleting document: ", e);
        throw e;
    }
};
