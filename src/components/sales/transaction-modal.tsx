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
import { inventoryItems, categories } from "@/lib/data"
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

type TransactionModalProps = {
  children: React.ReactNode;
}

const transactionSchema = z.object({
  type: z.enum(["sale", "usage"], { required_error: "You must select a transaction type." }),
  category: z.string().min(1, "Please select a category."),
  item: z.string().min(1, "Please select an item."),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1."),
  customer: z.string().optional(),
})

export function TransactionModal({ children }: TransactionModalProps) {
  const { toast } = useToast()
  const [isOpen, setIsOpen] = React.useState(false);

  const form = useForm<z.infer<typeof transactionSchema>>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: "sale",
      category: "",
      item: "",
      quantity: 1,
      customer: "",
    },
  });

  const selectedCategory = form.watch("category");

  const filteredItems = React.useMemo(() => {
    if (!selectedCategory) return [];
    return inventoryItems.filter(item => item.category === selectedCategory);
  }, [selectedCategory]);

  // Reset item when category changes
  React.useEffect(() => {
    form.setValue("item", "");
  }, [selectedCategory, form]);


  function onSubmit(values: z.infer<typeof transactionSchema>) {
    console.log(values);
    toast({
        title: "Success!",
        description: "Transaction has been recorded successfully.",
    });
    setIsOpen(false);
    form.reset();
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
            Select an item and enter the details of the transaction.
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
                          <RadioGroupItem value="sale" id="r1" />
                        </FormControl>
                        <FormLabel htmlFor="r1" className="font-normal">Sale</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="usage" id="r2" />
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map(cat => (
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
              name="item"
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
            <FormField
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
