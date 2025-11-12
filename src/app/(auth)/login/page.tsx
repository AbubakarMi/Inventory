"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Loader2, Eye, EyeOff } from "lucide-react"
import Image from "next/image"
import { toast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export default function LoginPage() {
  const router = useRouter()
  const { login, currentUser, loading } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && currentUser) {
      console.log('[LOGIN] User already logged in, redirecting to dashboard')
      router.replace("/dashboard")
    }
  }, [currentUser, loading, router])

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    console.log('[LOGIN] Form submitted')
    setIsLoading(true)
    try {
      console.log('[LOGIN] Calling login function...')
      const result = await login(values.email, values.password)
      console.log('[LOGIN] Login successful, result:', result)

      // Store welcome data in sessionStorage to show on dashboard
      const userName = result?.user?.name || 'User'
      const userRole = result?.user?.role || ''

      sessionStorage.setItem('showWelcome', JSON.stringify({
        name: userName,
        role: userRole
      }))

      console.log('[LOGIN] Redirecting to dashboard...')
      router.push("/dashboard")
    } catch (error: any) {
      console.error('[LOGIN] Login error:', error)
      setIsLoading(false)

      // Extract meaningful error message
      let errorMessage = "Invalid credentials. Please try again."
      if (error?.message) {
        if (error.message.includes('timeout') || error.message.includes('408')) {
          errorMessage = "Request timeout. Please check your connection and try again."
        } else if (error.message.includes('Network error')) {
          errorMessage = "Network error. Please check your internet connection."
        } else {
          errorMessage = error.message
        }
      }

      toast({
        variant: "destructive",
        title: "Login Failed",
        description: errorMessage,
      })
    }
  }

  // Show loading while checking auth
  if (loading) {
    console.log('[LOGIN] Rendering loading state')
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    )
  }

  // Don't show login form if already logged in
  if (currentUser) {
    return null
  }

  return (
    <div className="flex min-h-screen">
      {/* Left side - Branding (No Gradient) */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10"></div>
        <div className="relative z-10 flex flex-col justify-center items-center p-12 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-6"
          >
            <div className="flex flex-col justify-center items-center gap-6 mb-8">
              {/* Logo */}
              <div className="w-32 h-32 rounded-full bg-white p-6 shadow-2xl">
                <div className="relative w-full h-full">
                  <Image
                    src="/albarka-logo.jpg"
                    alt="Albarka PS Intertrade Logo"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              </div>

              {/* Company Name */}
              <h1 className="text-5xl font-bold text-white">
                Albarka PS Intertrade
              </h1>
            </div>
            <p className="text-xl max-w-md opacity-90">
              Streamline your inventory management with intelligent insights and real-time tracking
            </p>
            <div className="grid grid-cols-3 gap-8 mt-12 max-w-2xl">
              <div className="text-center">
                <div className="text-4xl font-bold">10K+</div>
                <div className="text-sm opacity-80 mt-1">Items Tracked</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold">99.9%</div>
                <div className="text-sm opacity-80 mt-1">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold">500+</div>
                <div className="text-sm opacity-80 mt-1">Happy Users</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex items-center justify-center bg-background p-4">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="border rounded-lg p-8">
            <div className="space-y-1 pb-6">
              <div className="flex justify-center lg:hidden mb-6">
                <div className="flex flex-col items-center gap-3">
                  {/* Logo */}
                  <div className="w-24 h-24 rounded-full bg-white p-5 shadow-xl">
                    <div className="relative w-full h-full">
                      <Image
                        src="/albarka-logo.jpg"
                        alt="Albarka PS Intertrade Logo"
                        fill
                        className="object-contain"
                        priority
                      />
                    </div>
                  </div>
                  {/* Company Name */}
                  <span className="text-2xl font-bold">Albarka PS Intertrade</span>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-center">Welcome Back</h2>
              <p className="text-center text-sm text-muted-foreground">
                Sign in to your account to continue
              </p>
            </div>
            <div>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="you@example.com"
                            disabled={isLoading}
                            className="h-11"
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
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel>Password</FormLabel>
                          <Link
                            href="/forgot-password"
                            className="text-sm text-primary hover:underline"
                          >
                            Forgot password?
                          </Link>
                        </div>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter your password"
                              disabled={isLoading}
                              className="h-11 pr-10"
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full h-11 text-base"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
