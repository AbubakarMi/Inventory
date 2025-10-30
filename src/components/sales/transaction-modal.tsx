"use client"

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
import { inventoryItems } from "@/lib/data"

type TransactionModalProps = {
  children: React.ReactNode;
}

export function TransactionModal({ children }: TransactionModalProps) {
  const { toast } = useToast()

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    toast({
        title: "Success!",
        description: "Transaction has been recorded successfully.",
    });
    // Here you would typically close the dialog
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
                    <Label htmlFor="item" className="text-right">
                    Item
                    </Label>
                    <Select>
                    <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select an item" />
                    </SelectTrigger>
                    <SelectContent>
                        {inventoryItems.map(item => (
                        <SelectItem key={item.id} value={item.name}>{item.name}</SelectItem>
                        ))}
                    </SelectContent>
                    </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="quantity" className="text-right">
                    Quantity
                    </Label>
                    <Input id="quantity" type="number" className="col-span-3" />
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
