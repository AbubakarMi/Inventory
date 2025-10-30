
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { categories } from "@/lib/data"
import { Category } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

type CategoryModalProps = {
  children: React.ReactNode;
  categoryToEdit?: Category;
}

export function CategoryModal({ children, categoryToEdit }: CategoryModalProps) {
  const { toast } = useToast()
  const [isOpen, setIsOpen] = React.useState(false);

  const title = categoryToEdit ? "Edit Category" : "Add New Category";
  const description = categoryToEdit ? "Update the details of the category." : "Fill in the details to add a new category.";

  const handleSubmit = () => {
    // In a real app, you'd get the form values here
    toast({
      title: "Success!",
      description: `Category has been ${categoryToEdit ? 'updated' : 'added'}.`
    });
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
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
            <Input id="name" defaultValue={categoryToEdit?.name} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="parent" className="text-right">
              Parent Category
            </Label>
            <Select defaultValue={categoryToEdit?.parent || undefined}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a parent (optional)" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
           <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
            </DialogClose>
          <Button type="submit" onClick={handleSubmit}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
