
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
import { updateUser } from "@/firebase/services/users";
// NOTE: We don't import addUser because that requires a server-side flow for security.

type UserModalProps = {
  children: React.ReactNode;
  userToEdit?: User;
}

const userSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["Admin", "Manager", "Staff", "Storekeeper"], { required_error: "Role is required" }),
  // For new users, password is required. For edits, it's optional.
  password: z.string().min(8, "Password must be at least 8 characters long").optional().or(z.literal('')),
  confirmPassword: z.string().optional(),
}).refine(data => {
    // If there is a password, it must match confirmPassword
    if(data.password && data.password.length > 0) {
        return data.password === data.confirmPassword;
    }
    return true;
}, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});


export function UserModal({ children, userToEdit }: UserModalProps) {
    const { toast } = useToast();
    const [isOpen, setIsOpen] = React.useState(false);
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const title = userToEdit ? "Edit User" : "Add New User";
    const description = userToEdit ? "Update the user's details." : "To add a user, use your Firebase console for security. This form is for editing existing users.";

    // Adjust schema for editing - password is not required
    const editUserSchema = userSchema.extend({
        password: z.string().min(8, "Password must be at least 8 characters").optional().or(z.literal('')),
    });
    
    const form = useForm<z.infer<typeof userSchema>>({
        resolver: zodResolver(userToEdit ? editUserSchema : userSchema),
        defaultValues: userToEdit ? { ...userToEdit, password: '', confirmPassword: ''} : {
            name: "",
            email: "",
            role: "Staff",
            password: "",
            confirmPassword: "",
        },
    });

    React.useEffect(() => {
        if(isOpen) {
            form.reset(userToEdit ? { ...userToEdit, password: '', confirmPassword: ''} : {
                name: "",
                email: "",
                role: "Staff",
                password: "",
                confirmPassword: "",
            });
        }
    }, [userToEdit, form, isOpen]);

    async function onSubmit(values: z.infer<typeof userSchema>) {
        if (!userToEdit) {
            toast({
                variant: "destructive",
                title: "Not Implemented",
                description: "User creation must be done via a secure backend process. This form is for edits only.",
            })
            return;
        }

        setIsSubmitting(true);
        try {
            if (userToEdit?.id) {
                // We only need to send fields that can be changed.
                // Password changes would require a separate, more secure flow.
                await updateUser(userToEdit.id, {
                    name: values.name,
                    role: values.role
                });
                toast({
                    title: "Success!",
                    description: `User "${values.name}" has been updated.`,
                });
                setIsOpen(false);
            }
        } catch (error: any) {
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
                                <Input {...field} disabled={isSubmitting} />
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
                                <Input type="email" {...field} disabled={true} />
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
                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
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
                 {userToEdit && (
                    <p className="text-sm text-muted-foreground pt-2">Password can be changed by the user in their settings.</p>
                 )}
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="outline" disabled={isSubmitting}>Cancel</Button>
                    </DialogClose>
                    <Button type="submit" disabled={isSubmitting || !userToEdit}>
                        {isSubmitting ? "Saving..." : "Save Changes"}
                    </Button>
                </DialogFooter>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
