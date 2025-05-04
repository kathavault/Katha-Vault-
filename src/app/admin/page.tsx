// src/app/admin/page.tsx
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, ShieldCheck, LogOut, Edit3, Users, Settings, BarChart3 } from 'lucide-react'; // Added new icons
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, isAdmin, logout, isLoading } = useAuth();
  const { toast } = useToast();

  // Protect the route - Redirect if not admin or not logged in
   React.useEffect(() => {
       // Wait for loading to finish before checking auth state
       if (!isLoading) {
           if (!user || !isAdmin) {
               toast({
                   title: "Access Denied",
                   description: "You do not have permission to access the admin dashboard.",
                   variant: "destructive"
               });
               router.replace('/login'); // Redirect non-admins to login
           }
       }
   }, [user, isAdmin, isLoading, router, toast]);


  // Show loading state while checking auth
   if (isLoading || !user || !isAdmin) {
    return (
      <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Render dashboard content if admin is logged in
  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-2">
           <ShieldCheck className="w-8 h-8 text-primary" /> Admin Dashboard
        </h1>
         <Button variant="outline" onClick={logout} size="sm">
             <LogOut className="mr-2 h-4 w-4" /> Logout
         </Button>
      </div>

      <p className="text-lg text-muted-foreground">
        Welcome, Admin ({user.email}). Manage Katha Vault content and settings here.
      </p>

       {/* Important Security Note */}
       <Card className="mt-8 border-destructive bg-destructive/10">
           <CardHeader>
               <CardTitle className="text-destructive">Security Notice</CardTitle>
           </CardHeader>
           <CardContent className="text-destructive/90 space-y-2">
               <p>This is a **simulated** admin panel with basic functionality.</p>
               <p>While login and OTP are simulated, the story editor now interacts with **live Firestore data**.</p>
               <p>Ensure your **Firestore Security Rules** are correctly configured to only allow administrators to write/delete data in the relevant collections (`stories`, `chapters`, `users`, `siteSettings`).</p>
                <p><strong>Do not rely solely on client-side checks. Secure all data modification actions with robust backend validation and authorization (e.g., Firebase Security Rules, Firebase Functions with role checks).</strong></p>
           </CardContent>
       </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Link to Story Editor */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Edit3 className="w-5 h-5" /> Manage Stories</CardTitle>
            <CardDescription>Add, edit, or remove novels and chapters.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
                <Link href="/admin/write">Go to Editor</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Link to Manage Users (Placeholder Page) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5" /> Manage Users</CardTitle>
            <CardDescription>View user list and roles.</CardDescription>
          </CardHeader>
          <CardContent>
             <Button asChild variant="secondary">
                 <Link href="/admin/users">Manage Users</Link>
             </Button>
            <p className="text-sm text-muted-foreground mt-4">User role management coming soon.</p>
          </CardContent>
        </Card>

        {/* Link to Site Settings (Placeholder Page) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Settings className="w-5 h-5" /> Site Settings</CardTitle>
            <CardDescription>Configure general website settings.</CardDescription>
          </CardHeader>
          <CardContent>
             <Button asChild variant="secondary">
                 <Link href="/admin/settings">Site Settings</Link>
             </Button>
            <p className="text-sm text-muted-foreground mt-4">Feature coming soon.</p>
          </CardContent>
        </Card>

         {/* Analytics Card (Still Placeholder) */}
         <Card>
             <CardHeader>
                <CardTitle className="flex items-center gap-2"><BarChart3 className="w-5 h-5" /> Analytics</CardTitle>
                <CardDescription>View website traffic and usage statistics.</CardDescription>
             </CardHeader>
             <CardContent>
                 <p className="text-sm text-muted-foreground">Integration coming soon.</p>
             </CardContent>
         </Card>
      </div>

    </div>
  );
}
