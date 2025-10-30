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
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { inventoryItems, categories } from "@/lib/data"

type TransactionModalProps = {
  children: React.ReactNode;
}

export function TransactionModal({ children }: TransactionModalProps) {
  const { toast } = useToast()
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);
  const [selectedItem, setSelectedItem] = React.useState<string | null>(null);
  
  const filteredItems = selectedCategory 
    ? inventoryItems.filter(item => item.category === selectedCategory)
    : [];

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!selectedItem) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Please select an item.",
        });
        return;
    }

    toast({
        title: "Success!",
        description: "Transaction has been recorded successfully.",
    });
    // Here you would typically close the dialog
  }

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setSelectedItem(null); // Reset item selection when category changes
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
            <DialogHeader>
            <DialogTitle>Record Transaction</DialogTitle>
            <DialogDescription>
                Select an item and enter the details of the transaction.
            </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                 <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="category" className="text-right">
                    Category
                    </Label>
                    <Select onValueChange={handleCategoryChange}>
                    <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                        {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                        ))}
                    </SelectContent>
                    </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="item" className="text-right">
                    Item
                    </Label>
                    <Select onValueChange={setSelectedItem} disabled={!selectedCategory}>
                    <SelectTrigger className="col-span-3">
                        <SelectValue placeholder={selectedCategory ? "Select an item" : "Select category first"} />
                    </SelectTrigger>
                    <SelectContent>
                        {filteredItems.map(item => (
                        <SelectItem key={item.id} value={item.name}>{item.name}</SelectItem>
                        ))}
                    </SelectContent>
                    </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="quantity" className="text-right">
                    Quantity
                    </Label>
                    <Input id="quantity" type="number" className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="customer" className="text-right">
                    Customer
                    </Label>
                    <Input id="customer" placeholder="Optional" className="col-span-3" />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">
                    Type
                    </Label>
                    <RadioGroup defaultValue="sale" className="col-span-3 flex gap-4">
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="sale" id="r1" />
                            <Label htmlFor="r1">Sale</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="usage" id="r2" />
                            <Label htmlFor="r2">Usage</Label>
                        </div>
                    </RadioGroup>
                </div>
            </div>
            <DialogFooter>
            <Button type="submit" variant="accent">Submit</Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
