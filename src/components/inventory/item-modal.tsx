
"use client"

import * as React from "react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { categories } from "@/lib/data"
import type { InventoryItem } from "@/lib/types"
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
import { useToast } from "@/hooks/use-toast"
import { Textarea } from "../ui/textarea"

type ItemModalProps = {
  children: React.ReactNode;
  itemToEdit?: InventoryItem;
}

const itemSchema = z.object({
  name: z.string().min(1, "Item name is required"),
  category: z.string().min(1, "Category is required"),
  quantity: z.coerce.number().min(0, "Quantity cannot be negative"),
  unit: z.string().min(1, "Unit is required"),
  cost: z.coerce.number().min(0, "Cost price cannot be negative"),
  price: z.coerce.number().min(0, "Selling price cannot be negative"),
  expiry: z.string().optional(),
  supplier: z.string().optional(),
  threshold: z.coerce.number().min(0, "Threshold cannot be negative"),
})

export function ItemModal({ children, itemToEdit }: ItemModalProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = React.useState(false);
  const title = itemToEdit ? "Edit Item" : "Add New Item";
  const description = itemToEdit ? "Update the details of your inventory item." : "Fill in the details to add a new item to your inventory.";

  const form = useForm<z.infer<typeof itemSchema>>({
    resolver: zodResolver(itemSchema),
    defaultValues: itemToEdit ? {
      ...itemToEdit,
      expiry: itemToEdit.expiry ? new Date(itemToEdit.expiry).toISOString().split('T')[0] : '',
    } : {
      name: "",
      category: "",
      quantity: 0,
      unit: "",
      cost: 0,
      price: 0,
      expiry: "",
      supplier: "",
      threshold: 10,
    },
  })
  
  React.useEffect(() => {
    if (isOpen) {
      form.reset(itemToEdit ? {
        ...itemToEdit,
        expiry: itemToEdit.expiry ? new Date(itemToEdit.expiry).toISOString().split('T')[0] : '',
      } : {
        name: "",
        category: "",
        quantity: 0,
        unit: "",
        cost: 0,
        price: 0,
        expiry: "",
        supplier: "",
        threshold: 10,
      });
    }
  }, [isOpen, itemToEdit, form]);

  function onSubmit(values: z.infer<typeof itemSchema>) {
    console.log(values);
    toast({
      title: `Success!`,
      description: `Item "${values.name}" has been ${itemToEdit ? 'updated' : 'added'}.`,
    })
    setIsOpen(false);
  }


  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4">
                  <FormLabel className="text-right">Name</FormLabel>
                  <FormControl>
                    <Input {...field} className="col-span-3" />
                  </FormControl>
                  <FormMessage className="col-span-4 text-right" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4">
                  <FormLabel className="text-right">Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="col-span-4 text-right" />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Quantity</FormLabel>
                        <FormControl>
                            <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Unit (e.g. kg, lbs)</FormLabel>
                        <FormControl>
                            <Input {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
                />
            </div>
             <div className="grid grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="cost"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Cost Price</FormLabel>
                        <FormControl>
                            <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Selling Price</FormLabel>
                        <FormControl>
                            <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
                />
            </div>
             <FormField
              control={form.control}
              name="expiry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expiry Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="supplier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Supplier (Optional)</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="threshold"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Low Stock Threshold</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                   <FormDescription>
                    Receive a notification when stock drops to this level.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
                <DialogClose asChild>
                    <Button variant="outline" type="button">Cancel</Button>
                </DialogClose>
                <Button type="submit">Save changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
