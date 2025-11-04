
"use client"

import * as React from "react";
import { UseFormReturn } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { initializeFirebase } from "@/firebase";
import { collection, addDoc, doc, updateDoc } from "firebase/firestore";

type UseSubmitOptions<T extends Record<string, any>> = {
    form: UseFormReturn<T>;
    formatValues?: (values: T) => any;
    entity: string;
    id?: string;
};

export function useSubmit<T extends Record<string, any>>({
    form,
    formatValues,
    entity,
    id
}: UseSubmitOptions<T>) {
    const { firestore } = initializeFirebase();
    const { toast } = useToast();
    const [isOpen, setIsOpen] = React.useState(false);
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const handleSubmit = async (values: T) => {
        setIsSubmitting(true);
        try {
            const processedValues = formatValues ? formatValues(values) : values;
            const collectionName = entity.toLowerCase() + 's';
            
            if (id) {
                const docRef = doc(firestore, collectionName, id);
                await updateDoc(docRef, processedValues);
            } else {
                const collectionRef = collection(firestore, collectionName);
                await addDoc(collectionRef, processedValues);
            }
            
            toast({
                title: "Success!",
                description: `${entity} has been ${id ? 'updated' : 'created'}.`,
            });
            setIsOpen(false);
        } catch (error: any) {
            console.error(`Failed to save ${entity}:`, error);
            toast({
                variant: "destructive",
                title: "Uh oh! Something went wrong.",
                description: error.message || `There was a problem saving the ${entity}.`,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        isOpen,
        setIsOpen,
        handleSubmit,
        isSubmitting,
    };
}
