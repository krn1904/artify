"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn, signOut } from "next-auth/react"
import { Palette } from "lucide-react"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { loginSchema } from "@/lib/auth/validation"

// Define form validation schema using Zod
const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

// Type for form data based on the schema
type LoginFormData = z.infer<typeof formSchema>

/**
 * LoginPage Component
 * 
 * A function component that handles user authentication through a login form.
 * Uses react-hook-form for form management and validation.
 * Integrates with NextAuth.js for authentication.
 */
function LoginPage() {
  // State to manage loading status during form submission
  const [isLoading, setIsLoading] = useState(false)
  
  // Hooks for navigation and toast notifications
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  // Initialize form with validation schema and default values
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  /**
   * Handle form submission
   * @param values - Form data containing email and password
   */
  async function onSubmit(values: LoginFormData) {
    setIsLoading(true)
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: values.email.toLowerCase(),
        password: values.password,
      })

      if (!result) {
        throw new Error('Authentication failed')
      }

      if (result.error) {
        throw new Error(result.error)
      }

      toast({
        title: "Success",
        description: "Logged in successfully",
      })

      // Add a small delay to ensure session is set
      await new Promise(resolve => setTimeout(resolve, 100))

      // Determine redirect target from callbackUrl (if same-origin), else fall back to /explore
      const cb = searchParams.get('callbackUrl')
      let target = "/explore"
      if (cb) {
        try {
          const url = new URL(cb, window.location.origin)
          if (url.origin === window.location.origin) {
            target = url.pathname + url.search + url.hash
          }
        } catch {
          // If it's a relative path that starts with '/', allow it (avoid open redirect via //)
          if (cb.startsWith('/') && !cb.startsWith('//')) {
            target = cb
          }
        }
      }
      router.push(target)
      router.refresh()

    } catch (error) {
      console.error('Login error:', error)
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error instanceof Error ? error.message : "Authentication failed",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Logout handler
  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' }); // Redirect to home after logout
  };

  return (
    <div className="space-y-6">
      {/* Auth required banner */}
      {searchParams.get('reason') === 'auth' && (
        <Alert>
          <AlertTitle>Authentication required</AlertTitle>
          <AlertDescription>Please log in to continue.</AlertDescription>
        </Alert>
      )}
      {/* Header section with logo and welcome message */}
      <div className="flex flex-col items-center space-y-2 text-center">
        <Link href="/" className="flex items-center space-x-2">
          <Palette className="h-8 w-8" />
          <span className="text-2xl font-bold">Artify</span>
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome back
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your email to sign in to your account
        </p>
      </div>

      {/* Login form with email and password fields */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Email input field */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="name@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Password input field */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Submit button with loading state */}
          <Button className="w-full" type="submit" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </Form>

      {/* Logout Button */}
      <Button className="w-full" onClick={handleLogout}>
        Logout
      </Button>

      {/* Sign up link for new users */}
      <div className="text-center text-sm">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-semibold hover:text-primary">
          Sign up
        </Link>
      </div>
    </div>
  )
}

export default LoginPage