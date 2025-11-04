
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
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
import type { Sale, InventoryItem, Category } from "@/lib/types"
import { addSale, updateSale } from "@/firebase/services/sales"
import { initializeFirebase, useCollection } from "@/firebase"
import { collection, query } from "firebase/firestore"

type TransactionModalProps = {
  children: React.ReactNode;
  transactionToEdit?: Sale;
}

const transactionSchema = z.object({
  type: z.enum(["Sale", "Usage"], { required_error: "You must select a transaction type." }),
  category: z.string().min(1, "Please select a category."),
  itemName: z.string().min(1, "Please select an item."),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1."),
})

export function TransactionModal({ children, transactionToEdit }: TransactionModalProps) {
  const { firestore } = initializeFirebase();
  const { data: inventoryItems } = useCollection<InventoryItem>(firestore ? query(collection(firestore, 'inventory')) : null);
  const { data: categories } = useCollection<Category>(firestore ? query(collection(firestore, 'categories')) : null);

  const { toast } = useToast()
  const [isOpen, setIsOpen] = React.useState(false);

  const defaultCategory = transactionToEdit && inventoryItems ? inventoryItems.find(i => i.name === transactionToEdit.itemName)?.category : "";

  const form = useForm<z.infer<typeof transactionSchema>>({
    resolver: zodResolver(transactionSchema),
    defaultValues: transactionToEdit ? {
        type: transactionToEdit.type,
        category: defaultCategory,
        itemName: transactionToEdit.itemName,
        quantity: transactionToEdit.quantity,
    } : {
      type: "Sale",
      category: "",
      itemName: "",
      quantity: 1,
    },
  });

  const selectedCategory = form.watch("category");

  const filteredItems = React.useMemo(() => {
    if (!selectedCategory || !inventoryItems) return [];
    return inventoryItems.filter(item => item.category === selectedCategory);
  }, [selectedCategory, inventoryItems]);

  React.useEffect(() => {
      if (!transactionToEdit || selectedCategory !== defaultCategory) {
        form.setValue("itemName", "");
    }
  }, [selectedCategory, form, transactionToEdit, defaultCategory]);

  React.useEffect(() => {
    if (isOpen) {
        if (transactionToEdit) {
            const defaultCat = inventoryItems?.find(i => i.name === transactionToEdit.itemName)?.category
            form.reset({
                type: transactionToEdit.type,
                category: defaultCat,
                itemName: transactionToEdit.itemName,
                quantity: transactionToEdit.quantity,
            })
        } else {
            form.reset({
                type: "Sale",
                category: "",
                itemName: "",
                quantity: 1,
            })
        }
    }
  }, [transactionToEdit, form, isOpen, inventoryItems])


  async function onSubmit(values: z.infer<typeof transactionSchema>) {
    try {
        const item = inventoryItems?.find(i => i.name === values.itemName);
        if (!item) throw new Error("Item not found");

        if (transactionToEdit?.id) {
            // Note: updating a sale does not currently re-adjust inventory.
            await updateSale(transactionToEdit.id, {
                ...values,
                total: values.quantity * item.price,
            });
        } else {
            await addSale({
                ...values,
                total: values.quantity * item.price,
            });
        }
        toast({
            title: "Success!",
            description: `Transaction has been ${transactionToEdit ? 'updated' : 'recorded'} successfully.`,
        });
        setIsOpen(false);
    } catch(error: any) {
        console.error(error);
        toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: error.message || "There was a problem with your request.",
        });
    }
  }

  const title = transactionToEdit ? "Edit Transaction" : "Record Transaction";
  const description = transactionToEdit ? "Update the details of this transaction." : "Select an item and enter the details of the transaction.";

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
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
              name="type"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Transaction Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex gap-4"
                    >
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="Sale" id="r1" />
                        </FormControl>
                        <FormLabel htmlFor="r1" className="font-normal">Sale</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="Usage" id="r2" />
                        </FormControl>
                        <FormLabel htmlFor="r2" className="font-normal">Usage</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories?.map(cat => (
                        <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="itemName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item</FormLabel>
                   <Select onValueChange={field.onChange} value={field.value} disabled={!selectedCategory}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={selectedCategory ? "Select an item" : "Select a category first"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        {filteredItems.map(item => (
                            <SelectItem key={item.id} value={item.name}>{item.name}</SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
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
            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="outline" onClick={() => form.reset()}>Cancel</Button>
                </DialogClose>
                <Button type="submit">Submit</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
