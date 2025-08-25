"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Palette } from "lucide-react"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { registerSchema } from "@/lib/auth/validation"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

// Define form validation schema using the same rules as the server, plus confirmPassword check
const formSchema = registerSchema
  .extend({
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

// Type for form data based on the schema
type SignUpFormData = z.infer<typeof formSchema>

/**
 * SignUpPage Component
 * 
 * A function component that handles user registration through a signup form.
 * Uses react-hook-form for form management and validation.
 * Integrates with the API for user creation.
 */
function SignUpPage() {
  // State to manage loading status during form submission
  const [isLoading, setIsLoading] = useState(false)
  
  // Hooks for navigation and toast notifications
  const router = useRouter()
  const { toast } = useToast()

  // Initialize form with validation schema and default values
  const form = useForm<SignUpFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "CUSTOMER",
    },
  })

  /**
   * Handle form submission
   * @param values - Form data containing user registration details
   */
  async function onSubmit(values: SignUpFormData) {
    setIsLoading(true)
    try {
      // Prepare payload expected by the API (exclude confirmPassword; lowercase email)
      const payload = {
        name: values.name,
        email: values.email.toLowerCase(),
        password: values.password,
        role: values.role,
      }

      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        // If server-side Zod validation failed, surface field-specific messages
        if (response.status === 400 && Array.isArray(data?.details)) {
          const genericMessages: string[] = []
          for (const err of data.details) {
            const path = Array.isArray(err?.path) ? (err.path as string[]) : []
            const field = path[0] as keyof Pick<SignUpFormData, 'name' | 'email' | 'password' | 'role' | 'confirmPassword'> | undefined
            if (field && ["name", "email", "password", "role", "confirmPassword"].includes(field)) {
              // Map server error to the matching form field
              form.setError(field, { type: 'server', message: err.message || 'Invalid value' })
            } else if (err?.message) {
              genericMessages.push(err.message)
            }
          }
          if (genericMessages.length) {
            throw new Error(genericMessages.join("\n"))
          }
          // If all errors were mapped to fields, show a small toast and return
          throw new Error(data.error || 'Validation failed')
        }

        throw new Error(data.error || 'Something went wrong')
      }

      toast({
        title: "Success",
        description: "Account created successfully",
      })
      
      router.push('/login')
  } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : 'Something went wrong',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header section with logo and welcome message */}
      <div className="flex flex-col items-center space-y-2 text-center">
        <Link href="/" className="flex items-center space-x-2">
          <Palette className="h-8 w-8" />
          <span className="text-2xl font-bold">Artify</span>
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">
          Create an account
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your details to get started
        </p>
      </div>

      {/* Registration form with user details fields */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Full name input field */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
          {/* Confirm password input field */}
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
          {/* Role selection field */}
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>I want to</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="CUSTOMER">Buy Artwork</SelectItem>
                    <SelectItem value="ARTIST">Sell My Artwork</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Submit button with loading state */}
          <Button className="w-full" type="submit" disabled={isLoading}>
            {isLoading ? "Creating account..." : "Create account"}
          </Button>
        </form>
      </Form>

      {/* Login link for existing users */}
      <div className="text-center text-sm">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold hover:text-primary">
          Sign in
        </Link>
      </div>
    </div>
  )
}

export default SignUpPage