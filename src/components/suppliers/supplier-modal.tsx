
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useToast } from "@/hooks/use-toast"
import type { Supplier } from "@/lib/types"
import { Textarea } from "../ui/textarea";
import { Slider } from "../ui/slider";
import { useSubmit } from "@/hooks/use-submit";

type SupplierModalProps = {
  children: React.ReactNode;
  supplierToEdit?: Supplier;
}

const supplierSchema = z.object({
  name: z.string().min(1, "Name is required"),
  contact: z.string().min(1, "Contact is required"),
  products: z.string().min(1, "Products are required"),
  rating: z.number().min(0).max(5),
});


export function SupplierModal({ children, supplierToEdit }: SupplierModalProps) {
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
    
    const { isOpen, setIsOpen, handleSubmit } = useSubmit({
        form,
        formatValues: (values) => ({ ...values, products: values.products.split(',').map(p => p.trim()) }),
        entity: 'Supplier',
        id: supplierToEdit?.id
    });

    React.useEffect(() => {
        if(isOpen) {
            form.reset(defaultValues);
        }
    }, [isOpen, form]);

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
                                <Input {...field} />
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
                            <FormLabel>Contact Info (Email or Phone)</FormLabel>
                            <FormControl>
                                <Input {...field} />
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
                                <Textarea {...field} placeholder="Enter comma-separated products" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="rating"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Rating: {field.value}</FormLabel>
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
