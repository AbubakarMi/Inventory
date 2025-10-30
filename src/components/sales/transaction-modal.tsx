
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
import { Label } from "@/components/ui/label"
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
import type { Sale, Category, InventoryItem } from "@/lib/types"
import { useCollection, useFirestore } from "@/firebase"
import { collection, doc, runTransaction, serverTimestamp } from "firebase/firestore"
import { addDocument, updateDocument } from "@/firebase/firestore/mutations"

type TransactionModalProps = {
  children: React.ReactNode;
  transactionToEdit?: Sale;
}

const transactionSchema = z.object({
  type: z.enum(["Sale", "Usage"], { required_error: "You must select a transaction type." }),
  category: z.string().min(1, "Please select a category."),
  itemName: z.string().min(1, "Please select an item."),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1."),
  customer: z.string().optional(),
})

export function TransactionModal({ children, transactionToEdit }: TransactionModalProps) {
  const { toast } = useToast()
  const firestore = useFirestore();
  const [isOpen, setIsOpen] = React.useState(false);

  const { data: categories, loading: categoriesLoading } = useCollection<Category>(
    firestore ? collection(firestore, 'categories') : null
  );
  const { data: inventoryItems, loading: itemsLoading } = useCollection<InventoryItem>(
    firestore ? collection(firestore, 'inventory') : null
  );

  const defaultCategory = transactionToEdit ? inventoryItems?.find(i => i.name === transactionToEdit.itemName)?.category : "";

  const form = useForm<z.infer<typeof transactionSchema>>({
    resolver: zodResolver(transactionSchema),
    defaultValues: transactionToEdit ? {
        type: transactionToEdit.type,
        category: defaultCategory,
        itemName: transactionToEdit.itemName,
        quantity: transactionToEdit.quantity,
        customer: "" // customer data not available in Sale type
    } : {
      type: "Sale",
      category: "",
      itemName: "",
      quantity: 1,
      customer: "",
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
      const defaultCat = transactionToEdit ? inventoryItems?.find(i => i.name === transactionToEdit.itemName)?.category : "";
      form.reset(transactionToEdit ? {
          type: transactionToEdit.type,
          category: defaultCat,
          itemName: transactionToEdit.itemName,
          quantity: transactionToEdit.quantity,
          customer: ""
      } : {
          type: "Sale",
          category: "",
          itemName: "",
          quantity: 1,
          customer: "",
      })
    }
  }, [transactionToEdit, form, isOpen, inventoryItems])


  async function onSubmit(values: z.infer<typeof transactionSchema>) {
    if (!firestore || !inventoryItems) return;

    const item = inventoryItems.find(i => i.name === values.itemName);
    if (!item) {
        toast({ variant: 'destructive', title: "Error", description: "Selected item not found." });
        return;
    }

    if (item.quantity < values.quantity) {
        toast({ variant: 'destructive', title: "Error", description: "Not enough stock available." });
        return;
    }

    const saleData: Omit<Sale, 'id'> = {
        ...values,
        date: new Date().toISOString(),
        total: values.type === 'Sale' ? item.price * values.quantity : 0,
    };

    try {
        await runTransaction(firestore, async (transaction) => {
            const itemRef = doc(firestore, 'inventory', item.id);
            const newQuantity = item.quantity - values.quantity;
            
            transaction.update(itemRef, { quantity: newQuantity });

            if (transactionToEdit) {
                const saleRef = doc(firestore, 'sales', transactionToEdit.id);
                 // We can't easily reverse the previous stock change, so we just update the sale record
                transaction.update(saleRef, saleData);
            } else {
                const saleRef = doc(collection(firestore, 'sales'));
                transaction.set(saleRef, saleData);
            }
        });
        
        toast({
            title: "Success!",
            description: `Transaction has been ${transactionToEdit ? 'updated' : 'recorded'} successfully.`,
        });
        setIsOpen(false);
        form.reset();
    } catch (e) {
        console.error(e);
        toast({ variant: 'destructive', title: "Error", description: "An error occurred during the transaction." });
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
                      disabled={!!transactionToEdit}
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
                  <Select onValueChange={field.onChange} value={field.value} disabled={!!transactionToEdit}>
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
                   <Select onValueChange={field.onChange} value={field.value} disabled={!selectedCategory || !!transactionToEdit}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={selectedCategory ? "Select an item" : "Select a category first"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        {filteredItems.map(item => (
                            <SelectItem key={item.id} value={item.name}>{item.name} (In Stock: {item.quantity})</SelectItem>
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
                        <Input type="number" {...field} disabled={!!transactionToEdit} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
              )}
            />
            {form.getValues('type') === 'Sale' && <FormField
              control={form.control}
              name="customer"
              render={({ field }) => (
                <FormItem>
                    <FormLabel>Customer (Optional)</FormLabel>
                    <FormControl>
                        <Input placeholder="Enter customer name" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
              )}
            />}
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
