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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { categories } from "@/lib/data"
import { InventoryItem } from "@/lib/types"

type ItemModalProps = {
  children: React.ReactNode;
  itemToEdit?: InventoryItem;
}

export function ItemModal({ children, itemToEdit }: ItemModalProps) {
  const title = itemToEdit ? "Edit Item" : "Add New Item";
  const description = itemToEdit ? "Update the details of your inventory item." : "Fill in the details to add a new item to your inventory.";

  return (
    <Dialog>
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
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input id="name" defaultValue={itemToEdit?.name} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              Category
            </Label>
            <Select defaultValue={itemToEdit?.category}>
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
            <Label htmlFor="quantity" className="text-right">
              Quantity
            </Label>
            <Input id="quantity" type="number" defaultValue={itemToEdit?.quantity} className="col-span-3" />
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="unit" className="text-right">
              Unit
            </Label>
            <Input id="unit" defaultValue={itemToEdit?.unit} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="cost" className="text-right">
              Cost Price
            </Label>
            <Input id="cost" type="number" defaultValue={itemToEdit?.cost} className="col-span-3" />
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="price" className="text-right">
              Selling Price
            </Label>
            <Input id="price" type="number" defaultValue={itemToEdit?.price} className="col-span-3" />
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="expiry" className="text-right">
              Expiry Date
            </Label>
            <Input id="expiry" type="date" defaultValue={itemToEdit?.expiry} className="col-span-3" />
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="supplier" className="text-right">
              Supplier
            </Label>
            <Input id="supplier" defaultValue={itemToEdit?.supplier} className="col-span-3" />
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="threshold" className="text-right">
              Threshold
            </Label>
            <Input id="threshold" type="number" defaultValue={itemToEdit?.threshold} className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" variant="default">Save changes</Button>
          <Button variant="outline">Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
