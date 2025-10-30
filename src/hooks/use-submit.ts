
"use client"

import * as React from "react";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";

type UseSubmitOptions<T extends Record<string, any>> = {
    form: ReturnType<typeof useForm<T>>;
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
    const { toast } = useToast();
    const [isOpen, setIsOpen] = React.useState(false);

    const handleSubmit = (values: T) => {
        const processedValues = formatValues ? formatValues(values) : values;
        console.log({ id, ...processedValues });
        toast({
            title: "Success!",
            description: `${entity} has been ${id ? 'updated' : 'created'}.`,
        });
        setIsOpen(false);
        form.reset();
    };

    return {
        isOpen,
        setIsOpen,
        handleSubmit,
    };
}
