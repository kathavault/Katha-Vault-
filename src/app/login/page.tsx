// src/app/login/page.tsx
'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth'; // Use the updated hook
import { LogIn, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator'; // Import Separator

// Social Icons (simple SVGs for example)
const GoogleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="20px" height="20px"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l0.001-0.001l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/></svg>
);
const FacebookIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="20px" height="20px"><path fill="#3b5998" d="M25,3C12.85,3,3,12.85,3,25c0,11.03,8.125,20.137,18.712,21.728V30.831h-5.443v-5.783h5.443v-4.211c0-5.387,3.158-8.348,8.107-8.348c2.336,0,4.74,0.408,4.74,0.408v5.019h-2.798c-2.688,0-3.524,1.678-3.524,3.465v3.667h6.23L34.89,30.83h-6.23v15.899C38.875,45.137,47,36.03,47,25C47,12.85,37.15,3,25,3z"/></svg>
);


const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

type LoginFormValues = z.infer<typeof formSchema>;

export default function LoginPage() {
  const router = useRouter();
  // Use the updated auth hook
  const { loginWithEmail, loginWithGoogle, loginWithFacebook, isLoading, isAdmin, isVerifyingAdminOtp } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Handle Email/Password Login
  const onEmailSubmit = async (values: LoginFormValues) => {
    setIsSubmitting(true);
    const loggedInUser = await loginWithEmail(values.email, values.password);
    setIsSubmitting(false); // Set submitting false after attempt

    if (loggedInUser) {
      // Check if admin needs OTP verification
      if (loggedInUser.email === ADMIN_EMAIL) {
         // The useAuth hook now sets isAdmin and isVerifyingAdminOtp
         // We rely on the hook's state to trigger the redirect logic below
         // toast is now handled within the hook for admin OTP flow start
      } else {
        toast({ title: "Login Successful", description: "Welcome back!" });
        router.push('/'); // Redirect regular users to homepage
      }
    }
    // Error toast is handled within the loginWithEmail function
  };

 // Redirect admin to OTP page if login was successful and OTP is required
  React.useEffect(() => {
    if (isAdmin && isVerifyingAdminOtp) {
       toast({
           title: "Admin Login",
           description: "Please enter the OTPs sent to your phone and email.",
        });
      router.push('/login/otp');
    }
  }, [isAdmin, isVerifyingAdminOtp, router, toast]);

  // Handle Google Login
  const handleGoogleLogin = async () => {
    const user = await loginWithGoogle();
    if (user) {
      // Redirect to homepage after successful Google login
      // Admin check is handled by onAuthStateChanged in the hook
      router.push('/');
    }
    // Error toasts handled in the hook
  };

  // Handle Facebook Login
  const handleFacebookLogin = async () => {
     const user = await loginWithFacebook();
     if (user) {
       // Redirect to homepage after successful Facebook login
       router.push('/');
     }
     // Error toasts handled in the hook
  };


  return (
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center py-12">
      <Card className="w-full max-w-md mx-auto shadow-lg">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-2xl font-bold">Log In</CardTitle>
          <CardDescription>
            Access your Katha Vault account.
          </CardDescription>
        </CardHeader>
        <CardContent>
           {/* Social Logins */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <Button variant="outline" className="w-full flex-1" onClick={handleGoogleLogin} disabled={isLoading || isSubmitting}>
                    <GoogleIcon /> <span className="ml-2">Log in with Google</span>
                </Button>
                <Button variant="outline" className="w-full flex-1" onClick={handleFacebookLogin} disabled={isLoading || isSubmitting}>
                    <FacebookIcon /> <span className="ml-2">Log in with Facebook</span>
                </Button>
            </div>

            <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                    </span>
                </div>
            </div>

          {/* Email/Password Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onEmailSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="you@example.com" {...field} />
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
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isSubmitting || isLoading}>
                 {isSubmitting || isLoading ? (
                   <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                 ) : (
                    <LogIn className="mr-2 h-4 w-4" />
                 )}
                 Log In with Email
              </Button>
            </form>
          </Form>
          <div className="mt-6 text-center text-sm">
            Don't have an account?{' '}
            <Link href="/signup" className="font-medium text-primary hover:underline">
              Sign Up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
