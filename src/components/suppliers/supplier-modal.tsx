
"use client"

import * as React from "react";
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import type { Supplier } from "@/lib/types"
import { Slider } from "../ui/slider";
import { useFirestore } from "@/firebase";
import { addDocument, updateDocument } from "@/firebase/firestore/mutations";
import { useToast } from "@/hooks/use-toast";

type SupplierModalProps = {
  children: React.ReactNode;
  supplierToEdit?: Supplier;
}

const supplierSchema = z.object({
  name: z.string().min(1, "Name is required"),
  contact: z.string().min(1, "Contact is required"),
  products: z.string().min(1, "At least one product is required"),
  rating: z.number().min(0).max(5),
});


export function SupplierModal({ children, supplierToEdit }: SupplierModalProps) {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [isOpen, setIsOpen] = React.useState(false);

    const defaultValues = supplierToEdit ? { ...supplierToEdit, products: supplierToEdit.products.join(', ') } : {
        name: "",
        contact: "",
        products: "",
        rating: 3,
    };

    const form = useForm<z.infer<typeof supplierSchema>>({
        resolver: zodResolver(supplierSchema),
        defaultValues,
    });
    
    async function handleSubmit(values: z.infer<typeof supplierSchema>) {
        if(!firestore) return;
        const formattedValues = { ...values, products: values.products.split(',').map(p => p.trim()).filter(Boolean) };
        try {
            if (supplierToEdit) {
                await updateDocument(firestore, 'suppliers', supplierToEdit.id, formattedValues);
                toast({ title: "Success!", description: "Supplier updated." });
            } else {
                await addDocument(firestore, 'suppliers', formattedValues);
                toast({ title: "Success!", description: "Supplier added." });
            }
            setIsOpen(false);
        } catch (e) {
            toast({ variant: 'destructive', title: "Error", description: "Something went wrong." });
        }
    };

    React.useEffect(() => {
        if(isOpen) {
            form.reset(defaultValues);
        }
    }, [isOpen, supplierToEdit, form, defaultValues]);

    const title = supplierToEdit ? "Edit Supplier" : "Add New Supplier";
    const description = supplierToEdit ? "Update the supplier's details." : "Enter the supplier's details.";

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="grid gap-4 py-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="e.g. Green Farms" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="contact"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Contact Info</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="e.g. contact@greenfarms.com" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="products"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Products Supplied</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="e.g. Organic Apples, Carrots" />
                            </FormControl>
                            <FormDescription>
                                Enter a comma-separated list of products.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="rating"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Rating: {field.value} / 5</FormLabel>
                            <FormControl>
                                <Slider 
                                    min={0}
                                    max={5}
                                    step={1}
                                    defaultValue={[field.value]}
                                    onValueChange={(value) => field.onChange(value[0])}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="submit">Save Changes</Button>
                </DialogFooter>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
