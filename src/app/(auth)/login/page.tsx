"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Loader2, Eye, EyeOff, CheckCircle2 } from "lucide-react"
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
  const [showWelcomeModal, setShowWelcomeModal] = useState(false)
  const [loginData, setLoginData] = useState<{ name: string; role: string } | null>(null)
  const shouldBlockRedirect = useRef(false)

  // Redirect if already logged in (but not during login flow)
  useEffect(() => {
    console.log('[LOGIN] useEffect check:', {
      loading,
      hasUser: !!currentUser,
      shouldBlock: shouldBlockRedirect.current,
      showModal: showWelcomeModal
    })
    if (!loading && currentUser && !shouldBlockRedirect.current) {
      console.log('[LOGIN] Redirecting to dashboard (already logged in)')
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
      // Block automatic redirect during login flow
      console.log('[LOGIN] Setting shouldBlockRedirect = true')
      shouldBlockRedirect.current = true

      console.log('[LOGIN] Calling login function...')
      const result = await login(values.email, values.password)
      console.log('[LOGIN] Login successful, result:', result)

      // Store login data and show welcome modal
      const userName = result?.user?.name || 'User'
      const userRole = result?.user?.role || ''

      console.log('[LOGIN] Setting login data:', { userName, userRole })
      setLoginData({ name: userName, role: userRole })
      setIsLoading(false)

      // Show modal
      console.log('[LOGIN] Setting showWelcomeModal = true')
      setShowWelcomeModal(true)
      console.log('[LOGIN] Welcome modal should now be visible')
    } catch (error: any) {
      console.error('[LOGIN] Login error:', error)
      setIsLoading(false)
      shouldBlockRedirect.current = false

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

  const handleContinueToDashboard = () => {
    setShowWelcomeModal(false)
    shouldBlockRedirect.current = false
    router.push("/dashboard")
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

  // Don't show login form if already logged in (but show modal if it's open)
  if (currentUser && !showWelcomeModal) {
    console.log('[LOGIN] User logged in and modal closed, returning null')
    return null
  }

  console.log('[LOGIN] Rendering login form/modal', {
    hasUser: !!currentUser,
    showModal: showWelcomeModal
  })

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
              <div className="w-40 h-40 bg-white rounded-2xl p-6 shadow-xl">
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
                  <div className="w-24 h-24 bg-white rounded-xl p-4 shadow-lg">
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

      {/* Welcome Modal */}
      <Dialog open={showWelcomeModal} onOpenChange={setShowWelcomeModal}>
        <DialogContent className="sm:max-w-lg border-2 border-green-200 dark:border-green-800">
          <DialogHeader className="text-center space-y-6 pt-4">
            {/* Logo with animation */}
            <div className="flex justify-center">
              <div className="relative group">
                <div className="absolute inset-0 bg-green-200/50 dark:bg-green-600/50 rounded-2xl blur-2xl opacity-50"></div>
                <div className="relative w-32 h-32 bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-2xl border-2 border-green-200 dark:border-green-700">
                  <div className="relative w-full h-full">
                    <Image
                      src="/albarka-logo.jpg"
                      alt="Albarka PS Intertrade Logo"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
                {/* Success checkmark overlay */}
                <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-green-600 dark:bg-green-500 rounded-full flex items-center justify-center shadow-lg border-4 border-white dark:border-slate-900">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <DialogTitle className="text-3xl md:text-4xl font-bold text-green-900 dark:text-green-100">
                Welcome back, {loginData?.name}!
              </DialogTitle>
              <div className="h-1 w-24 mx-auto bg-green-500 rounded-full"></div>
            </div>

            <DialogDescription className="text-base text-slate-600 dark:text-slate-400">
              You have successfully logged in as <span className="font-bold text-green-700 dark:text-green-400">{loginData?.role}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4">
            <div className="bg-green-50 dark:bg-green-950/30 rounded-xl p-5 border border-green-200 dark:border-green-800 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-green-600 dark:bg-green-500 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300 pt-1">
                  {loginData?.role === 'Admin' && 'You have full access to all system features including user management, reports, and system configuration.'}
                  {loginData?.role === 'Manager' && 'You can manage inventory, sales, reports, and oversee daily operations.'}
                  {loginData?.role === 'Storekeeper' && 'You can manage inventory items, record sales and usage transactions.'}
                  {loginData?.role === 'Staff' && 'You can view inventory and record sales transactions.'}
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="sm:justify-center pt-2">
            <Button
              onClick={handleContinueToDashboard}
              className="w-full sm:w-auto px-10 py-6 text-base font-semibold bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 shadow-lg text-white"
              size="lg"
            >
              Continue to Dashboard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
