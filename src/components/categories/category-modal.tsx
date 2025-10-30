
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
import { Category } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { addDocument, updateDocument } from "@/firebase/firestore/mutations"
import { useFirestore } from "@/firebase"


type CategoryModalProps = {
  children: React.ReactNode;
  categoryToEdit?: Category;
  categories: Category[];
}

const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  parent: z.string().optional().nullable(),
})

export function CategoryModal({ children, categoryToEdit, categories }: CategoryModalProps) {
  const { toast } = useToast()
  const firestore = useFirestore()
  const [isOpen, setIsOpen] = React.useState(false);

  const title = categoryToEdit ? "Edit Category" : "Add New Category";
  const description = categoryToEdit ? "Update the details of the category." : "Fill in the details to add a new category.";

  const form = useForm<z.infer<typeof categorySchema>>({
    resolver: zodResolver(categorySchema),
    defaultValues: categoryToEdit || { name: "", parent: null }
  });

  React.useEffect(() => {
    if (isOpen) {
      form.reset(categoryToEdit || { name: "", parent: null });
    }
  }, [isOpen, categoryToEdit, form]);

  const handleSubmit = async (values: z.infer<typeof categorySchema>) => {
    if (!firestore) return;
    
    try {
      if (categoryToEdit) {
        await updateDocument(firestore, 'categories', categoryToEdit.id, values);
        toast({ title: "Success!", description: `Category "${values.name}" has been updated.` });
      } else {
        await addDocument(firestore, 'categories', values);
        toast({ title: "Success!", description: `Category "${values.name}" has been added.` });
      }
      setIsOpen(false);
    } catch (error) {
      toast({ variant: 'destructive', title: "Error", description: "Something went wrong." });
    }
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
        <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="grid gap-4 py-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <FormControl>
                  <Input id="name" {...field} className="col-span-3" />
                </FormControl>
                <FormMessage className="col-span-4 text-right" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="parent"
            render={({ field }) => (
              <FormItem className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="parent" className="text-right">
                  Parent Category
                </Label>
                <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                  <FormControl>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select a parent (optional)" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map(cat => (
                      cat.id !== categoryToEdit?.id && <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage className="col-span-4 text-right" />
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
