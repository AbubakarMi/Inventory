
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
import { updateUser, addUser } from "@/lib/services/users";

type UserModalProps = {
  children: React.ReactNode;
  userToEdit?: User;
  onSuccess?: () => void;
}

const createUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["Admin", "Manager", "Staff", "Storekeeper"], { required_error: "Role is required" }),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const editUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["Admin", "Manager", "Staff", "Storekeeper"], { required_error: "Role is required" }),
  password: z.string().optional().or(z.literal('')),
  confirmPassword: z.string().optional().or(z.literal('')),
}).refine(data => {
    if(data.password && data.password.length > 0) {
        return data.password === data.confirmPassword;
    }
    return true;
}, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export function UserModal({ children, userToEdit, onSuccess }: UserModalProps) {
    const { toast } = useToast();
    const [isOpen, setIsOpen] = React.useState(false);
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const title = userToEdit ? "Edit User" : "Add New User";
    const description = userToEdit ? "Update the user's details." : "Create a new user account with a secure password.";

    const schema = userToEdit ? editUserSchema : createUserSchema;

    const form = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
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

    async function onSubmit(values: z.infer<typeof schema>) {
        setIsSubmitting(true);
        try {
            if (userToEdit?.id) {
                // Update existing user
                await updateUser(userToEdit.id, {
                    name: values.name,
                    role: values.role
                });
                toast({
                    title: "Success!",
                    description: `User "${values.name}" has been updated.`,
                });
            } else {
                // Create new user with password
                await addUser({
                    name: values.name,
                    email: values.email,
                    role: values.role,
                    password: values.password
                });
                toast({
                    title: "Success!",
                    description: `User "${values.name}" has been created.`,
                });
            }
            setIsOpen(false);

            // Call custom onSuccess callback if provided
            if (onSuccess) {
                onSuccess();
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
                                <Input type="email" {...field} disabled={isSubmitting || !!userToEdit} />
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
                 {!userToEdit && (
                    <>
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input type="password" {...field} disabled={isSubmitting} />
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
                                        <Input type="password" {...field} disabled={isSubmitting} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </>
                 )}
                 {userToEdit && (
                    <p className="text-sm text-muted-foreground pt-2">Password can be changed by the user in their settings.</p>
                 )}
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="outline" disabled={isSubmitting}>Cancel</Button>
                    </DialogClose>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Saving..." : userToEdit ? "Save Changes" : "Create User"}
                    </Button>
                </DialogFooter>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
