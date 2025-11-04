
"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { signInWithEmailAndPassword } from "firebase/auth"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Tractor } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/firebase"

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

export default function LoginPage() {
  const router = useRouter()
  const auth = useAuth()
  const { toast } = useToast()
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function attemptLogin(values: z.infer<typeof loginSchema>) {
    if (!auth) throw new Error("Auth not initialized");
    const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
    const user = userCredential.user;
    const idTokenResult = await user.getIdTokenResult();
    const role = idTokenResult.claims.role;

    toast({
      title: "Login Successful",
      description: `Welcome, ${role || 'User'}!`,
    });

    router.push("/dashboard");
  }

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    if (!auth) {
      toast({
        variant: "destructive",
        title: "Auth not initialized",
        description: "Firebase auth is not available. Please try again later.",
      })
      return
    }

    try {
      await attemptLogin(values);
    } catch (error: any) {
      // ONE-TIME ADMIN CREATION LOGIC
      if (
        error.code === 'auth/user-not-found' &&
        values.email === 'admin@gmail.com' &&
        values.password === 'Password123'
      ) {
        try {
          toast({ title: "Admin user not found.", description: "Attempting to create it now..." });
          
          const response = await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: 'Admin',
              email: values.email,
              role: 'Admin',
              password: values.password
            })
          });

          if (!response.ok) {
            const result = await response.json();
            throw new Error(result.error || "Failed to create admin user.");
          }
          
          toast({ title: "Admin user created!", description: "Logging you in..." });
          // Retry login after creation
          await attemptLogin(values);

        } catch (creationError: any) {
           toast({
            variant: "destructive",
            title: "Admin Creation Failed",
            description: creationError.message || "An unexpected error occurred.",
          });
        }
        return;
      }
      
      // Standard error handling
      console.error("Login Error:", error);
      let description = "An unexpected error occurred. Please try again.";
      if (error.code === 'auth/configuration-not-found') {
        description = "Authentication is not configured for this project. Please enable Email/Password sign-in in your Firebase console.";
      } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        description = "Invalid credentials. Please check your email and password.";
      }
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: description,
      });
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center gap-2 mb-2">
            <Tractor className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl font-bold">FarmSight</CardTitle>
          </div>
          <CardDescription>Enter your email below to login to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="grid gap-2">
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="m@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="grid gap-2">
                    <div className="flex items-center">
                      <FormLabel>Password</FormLabel>
                      <Link href="#" className="ml-auto inline-block text-sm underline">
                        Forgot your password?
                      </Link>
                    </div>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Logging in..." : "Login"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
