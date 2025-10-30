
"use client"

import * as React from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { useToast } from "@/hooks/use-toast"
import type { User } from "@/lib/types"
import { useFirestore } from "@/firebase";
import { addDocument } from "@/firebase/firestore/mutations";

type UserModalProps = {
  children: React.ReactNode;
  userToEdit?: User;
}

const userSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  role: z.string().min(1, "Role is required"),
  // Note: Password handling should be done via a secure backend function in a real app
  // For this prototype, we'll just log it.
  password: z.string().min(8, "Password must be at least 8 characters long").optional().or(z.literal('')),
  confirmPassword: z.string().optional(),
}).refine(data => {
    if(data.password) {
        return data.password === data.confirmPassword;
    }
    return true;
}, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});


export function UserModal({ children, userToEdit }: UserModalProps) {
    const { toast } = useToast();
    const firestore = useFirestore();
    const [isOpen, setIsOpen] = React.useState(false);

    // This modal should only be for adding users. Editing users is more complex.
    const title = "Add New User";
    const description = "Enter the user's details to grant them access.";


    const form = useForm<z.infer<typeof userSchema>>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            name: "",
            email: "",
            role: "Staff",
            password: "",
            confirmPassword: "",
        },
    });

    React.useEffect(() => {
        if(isOpen) {
            form.reset();
        }
    }, [form, isOpen]);

    async function onSubmit(values: z.infer<typeof userSchema>) {
        if (!firestore) return;
        // In a real app, you would use a Cloud Function to create the user in Firebase Auth
        // and set their custom claims. Here we just add to Firestore.
        const userData: Omit<User, 'id'> = {
          name: values.name,
          email: values.email,
          role: values.role as User['role'],
          status: 'Active'
        }
        
        try {
          await addDocument(firestore, 'users', userData);
          toast({
              title: "Success!",
              description: `User "${values.name}" has been created. They need to be assigned a password.`,
          });
          setIsOpen(false);
        } catch (error) {
          toast({ variant: 'destructive', title: "Error", description: "Failed to create user."})
        }
    }


  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
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
                                <Input {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input type="email" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Role</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a role" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="Admin">Admin</SelectItem>
                                    <SelectItem value="Manager">Manager</SelectItem>
                                    <SelectItem value="Staff">Staff</SelectItem>
                                    <SelectItem value="Storekeeper">Storekeeper</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                                <Input type="password" {...field} placeholder={userToEdit ? "Leave blank to keep current password" : ""}/>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl>
                                <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="submit">Save Changes</Button>
                </DialogFooter>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
