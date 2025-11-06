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
import type { InventoryItem, Category } from "@/lib/types"
import { addSale } from "@/lib/services/sales"

type TransactionFormProps = {
  children: React.ReactNode;
  categories: Category[];
  inventoryItems: InventoryItem[];
  onSuccess?: () => void;
}

const transactionSchema = z.object({
  type: z.enum(["Sale", "Usage"], { required_error: "You must select a transaction type." }),
  category: z.string().min(1, "Please select a category."),
  itemName: z.string().min(1, "Please select an item."),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1."),
  date: z.string().min(1, "Please select a date."),
})

export function TransactionForm({ children, categories, inventoryItems, onSuccess }: TransactionFormProps) {
  const { toast } = useToast()
  const [isOpen, setIsOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  const form = useForm<z.infer<typeof transactionSchema>>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: "Sale",
      category: "",
      itemName: "",
      quantity: 1,
      date: today,
    },
  });

  const selectedCategory = form.watch("category");
  const selectedItemName = form.watch("itemName");
  const quantity = form.watch("quantity");

  const filteredItems = React.useMemo(() => {
    if (!selectedCategory || !inventoryItems) return [];
    return inventoryItems.filter(item => item.category === selectedCategory);
  }, [selectedCategory, inventoryItems]);

  const selectedItem = React.useMemo(() => {
    if (!selectedItemName || !inventoryItems) return null;
    return inventoryItems.find(item => item.id === selectedItemName);
  }, [selectedItemName, inventoryItems]);

  // Calculate total price
  const totalPrice = React.useMemo(() => {
    if (!selectedItem || !quantity) return 0;
    return selectedItem.price * quantity;
  }, [selectedItem, quantity]);

  React.useEffect(() => {
    form.setValue("itemName", "");
  }, [selectedCategory, form]);

  React.useEffect(() => {
    if (isOpen) {
      const today = new Date().toISOString().split('T')[0];
      form.reset({
        type: "Sale",
        category: "",
        itemName: "",
        quantity: 1,
        date: today,
      })
    }
  }, [isOpen, form])

  async function onSubmit(values: z.infer<typeof transactionSchema>) {
    setIsSubmitting(true);
    try {
        const item = inventoryItems?.find(i => i.id === values.itemName);
        if (!item?.id) throw new Error("Item not found");

        const total = item.price * values.quantity;

        await addSale({
            itemName: item.name,
            quantity: values.quantity,
            type: values.type,
            date: values.date,
            total: total,
        });

        toast({
            title: "Success!",
            description: `Transaction recorded successfully. Total: ₦${total.toFixed(2)}`,
        });
        setIsOpen(false);

        if (onSuccess) {
            onSuccess();
        }
    } catch(error: any) {
        console.error(error);
        toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: error.message || "There was a problem with your request.",
        });
    } finally {
        setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Record Transaction</DialogTitle>
          <DialogDescription>
            Select an item and enter the details of the transaction
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
                      disabled={isSubmitting}
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
                  <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                    <FormControl>
                      <SelectTrigger className="text-slate-900 dark:text-slate-100">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories && categories.length > 0 ? (
                        categories.map(cat => (
                          <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                        ))
                      ) : (
                        <div className="p-2 text-sm text-muted-foreground">No categories found</div>
                      )}
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
                  <Select onValueChange={field.onChange} value={field.value} disabled={!selectedCategory || isSubmitting}>
                    <FormControl>
                      <SelectTrigger className="text-slate-900 dark:text-slate-100">
                        <SelectValue placeholder={selectedCategory ? "Select an item" : "Select a category first"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredItems.length === 0 ? (
                        <div className="p-2 text-sm text-muted-foreground">No items found in this category</div>
                      ) : (
                        filteredItems.map(item => (
                          <SelectItem key={item.id} value={item.name}>
                            {item.name} ({item.quantity} {item.unit} in stock)
                          </SelectItem>
                        ))
                      )}
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
                    <Input type="number" {...field} disabled={isSubmitting} max={selectedItem?.quantity} />
                  </FormControl>
                  {selectedItem && field.value > selectedItem.quantity && (
                    <p className="text-sm font-medium text-destructive">
                      Cannot sell more than available stock ({selectedItem.quantity}).
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedItem && quantity > 0 && (
              <div className="rounded-lg border bg-muted/50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Total Price:</span>
                  <span className="text-lg font-bold text-primary">
                    ₦{totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {quantity} {selectedItem.unit} × ₦{selectedItem.price.toFixed(2)}
                </p>
              </div>
            )}

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isSubmitting}>Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting || (selectedItem && form.getValues("quantity") > selectedItem.quantity)}>
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
