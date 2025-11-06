
"use client"

import * as React from "react";
import { UseFormReturn } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api-client";

type UseSubmitOptions<T extends Record<string, any>> = {
    form: UseFormReturn<T>;
    formatValues?: (values: T) => any;
    entity: string;
    id?: string | number;
    onSuccess?: () => void;
};

export function useSubmit<T extends Record<string, any>>({
    form,
    formatValues,
    entity,
    id,
    onSuccess
}: UseSubmitOptions<T>) {
    const { toast } = useToast();
    const [isOpen, setIsOpen] = React.useState(false);
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const handleSubmit = async (values: T) => {
        setIsSubmitting(true);
        try {
            const processedValues = formatValues ? formatValues(values) : values;
            const endpoint = `/${entity.toLowerCase()}s`;

            if (id) {
                await api.put(endpoint, { id, ...processedValues });
            } else {
                await api.post(endpoint, processedValues);
            }

            toast({
                title: "Success!",
                description: `${entity} has been ${id ? 'updated' : 'created'}.`,
            });
            setIsOpen(false);

            // Call custom onSuccess callback if provided
            if (onSuccess) {
                onSuccess();
            }
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
