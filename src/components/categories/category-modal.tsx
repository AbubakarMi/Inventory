
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
import { addCategory, updateCategory } from "@/firebase/services/categories"
import { initializeFirebase, useCollection } from "@/firebase"
import { collection, query } from "firebase/firestore"
import type { Category } from "@/lib/types"

type CategoryModalProps = {
  children: React.ReactNode;
  categoryToEdit?: Category;
}

const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  parent: z.string().nullable(),
})

export function CategoryModal({ children, categoryToEdit }: CategoryModalProps) {
  const { firestore } = initializeFirebase()
  const categoriesQuery = React.useMemo(() => firestore ? query(collection(firestore, 'categories')) : null, [firestore]);
  const { data: categories } = useCollection<Category>(categoriesQuery);
  const { toast } = useToast()
  const [isOpen, setIsOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  const form = useForm<z.infer<typeof categorySchema>>({
    resolver: zodResolver(categorySchema),
  });

  React.useEffect(() => {
    if (isOpen) {
      form.reset(categoryToEdit || {
        name: "",
        parent: null,
      });
    }
  }, [isOpen, categoryToEdit, form]);
  
  const title = categoryToEdit ? "Edit Category" : "Add New Category";
  const description = categoryToEdit ? "Update the details of the category." : "Fill in the details to add a new category.";

  async function onSubmit(values: z.infer<typeof categorySchema>) {
    setIsSubmitting(true);
    try {
      if (categoryToEdit?.id) {
        await updateCategory(categoryToEdit.id, values);
      } else {
        await addCategory(values);
      }
      toast({
        title: "Success!",
        description: `Category "${values.name}" has been ${categoryToEdit ? 'updated' : 'added'}.`
      });
      setIsOpen(false);
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
      <DialogContent className="sm:max-w-[425px]">
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
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="parent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parent Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value || ""} disabled={isSubmitting}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a parent (optional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {(categories || []).filter(c => c.id !== categoryToEdit?.id).map(cat => (
                        <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" type="button" disabled={isSubmitting}>Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
