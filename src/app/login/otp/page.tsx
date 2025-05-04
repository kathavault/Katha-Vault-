// src/app/login/otp/page.tsx
'use client';

import * as React from 'react';
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
  FormDescription, // Import FormDescription
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth'; // Use the updated auth hook
import { ShieldCheck, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Import Alert

// Define the OTP form schema
const otpFormSchema = z.object({
  phoneOtp: z.string().min(4, { message: 'Enter the 4-6 digit code from your phone.' }).max(6),
  emailOtp: z.string().min(4, { message: 'Enter the 4-6 digit code from your email.' }).max(6),
});

type OtpFormValues = z.infer<typeof otpFormSchema>;

export default function OtpVerificationPage() {
  const router = useRouter();
  // Use the updated hook, including verifyAdminOtp and isVerifyingAdminOtp state
  const { user, isAdmin, verifyAdminOtp, logout, isLoading, isVerifyingAdminOtp } = useAuth();
  const { toast } = useToast();
  const [isVerifyingLocally, setIsVerifyingLocally] = React.useState(false); // Local submitting state

  // Protect route: Only accessible if logged in as admin AND OTP verification is pending
  React.useEffect(() => {
     if (!isLoading) {
         if (!user || !isAdmin || !isVerifyingAdminOtp) {
            toast({
                title: "Access Denied",
                description: "This page is only for admin OTP verification after login.",
                variant: "destructive"
            });
           // If not admin but somehow landed here, log out. If admin but OTP not pending, redirect.
            if (!isAdmin) logout();
            router.replace(isAdmin ? '/admin' : '/login'); // Redirect admin to dash if OTP not needed, others to login
         }
     }
   }, [user, isAdmin, isLoading, isVerifyingAdminOtp, router, logout, toast]);


  const form = useForm<OtpFormValues>({
    resolver: zodResolver(otpFormSchema),
    defaultValues: {
      phoneOtp: '',
      emailOtp: '',
    },
  });

  const onSubmit = async (values: OtpFormValues) => {
    setIsVerifyingLocally(true);
    try {
      // Use the verifyAdminOtp function from the hook
      // WARNING: This is a simulated OTP verification. Not secure for production.
      const isVerified = await verifyAdminOtp(values.phoneOtp, values.emailOtp);

      if (isVerified) {
         // Toast is handled within verifyAdminOtp on success
        router.push('/admin'); // Redirect admin to their dashboard
      } else {
         // Error Toast is handled within verifyAdminOtp on failure
          setIsVerifyingLocally(false); // Allow retry
      }
    } catch (error) {
      console.error("Admin OTP verification failed:", error);
      toast({
        title: "Verification Error",
        description: "An unexpected error occurred during OTP verification.",
        variant: "destructive",
      });
      setIsVerifyingLocally(false);
    }
  };

   // Show loading state while checking auth or verifying OTP
   if (isLoading || !user || !isAdmin || !isVerifyingAdminOtp) {
       return (
           <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center">
               <Loader2 className="h-8 w-8 animate-spin text-primary" />
           </div>
       );
   }

  return (
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center py-12">
      <Card className="w-full max-w-md mx-auto shadow-lg">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-2xl font-bold">Admin OTP Verification</CardTitle>
           <CardDescription>
              {/* Security Warning */}
               <Alert variant="warning" className="mb-4 text-left">
                   <AlertTitle>Security Simulation</AlertTitle>
                   <AlertDescription>
                       This OTP verification is a simulation for demonstration purposes only and is **not secure**. A real application requires a proper backend OTP system.
                   </AlertDescription>
               </Alert>
               Enter the codes sent to your registered phone number (*** *** 5653) and email addresses.
           </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="phoneOtp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone OTP</FormLabel>
                     <FormDescription>Check number ending in 5653. (Simulated OTP: 123456)</FormDescription>
                    <FormControl>
                      <Input placeholder="123456" {...field} maxLength={6} inputMode="numeric" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="emailOtp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email OTP</FormLabel>
                     <FormDescription>Check superworth00@gmail.com or rajputkritika87555@gmail.com. (Simulated OTP: 654321)</FormDescription>
                    <FormControl>
                      <Input placeholder="654321" {...field} maxLength={6} inputMode="numeric" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isVerifyingLocally || isLoading}>
                 {isVerifyingLocally || isLoading ? (
                   <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                 ) : (
                    <ShieldCheck className="mr-2 h-4 w-4" />
                 )}
                 Verify OTP
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
