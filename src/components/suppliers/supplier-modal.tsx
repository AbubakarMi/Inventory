
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
import { useSubmit } from "@/hooks/use-submit";

type SupplierModalProps = {
  children: React.ReactNode;
  supplierToEdit?: Supplier;
  onSuccess?: () => void;
}

const supplierSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(1, "Phone number is required"),
  address: z.string().min(1, "Address is required"),
  products: z.string().min(1, "At least one product is required"),
  rating: z.number().min(0).max(5),
});

export function SupplierModal({ children, supplierToEdit, onSuccess }: SupplierModalProps) {
    const form = useForm<z.infer<typeof supplierSchema>>({
        resolver: zodResolver(supplierSchema),
    });

    const { isOpen, setIsOpen, handleSubmit, isSubmitting } = useSubmit({
        form,
        formatValues: (values) => ({ ...values, products: values.products.split(',').map(p => p.trim()).filter(Boolean) }),
        entity: 'Supplier',
        id: supplierToEdit?.id,
        onSuccess
    });

    React.useEffect(() => {
        if(isOpen) {
            const defaultValues = supplierToEdit ? { ...supplierToEdit, products: supplierToEdit.products.join(', ') } : {
                name: "",
                phone: "",
                address: "",
                products: "",
                rating: 3,
            };
            form.reset(defaultValues);
        }
    }, [isOpen, supplierToEdit, form]);

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
                                <Input {...field} placeholder="e.g. Green Farms" disabled={isSubmitting} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="e.g. +1 234 567 8900" disabled={isSubmitting} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="e.g. 123 Farm Road, City" disabled={isSubmitting} />
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
                                <Input {...field} placeholder="e.g. Organic Apples, Carrots" disabled={isSubmitting} />
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
                                    disabled={isSubmitting}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="outline" disabled={isSubmitting}>Cancel</Button>
                    </DialogClose>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Saving..." : "Save Changes"}
                    </Button>
                </DialogFooter>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
