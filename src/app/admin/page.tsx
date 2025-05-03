// src/app/admin/page.tsx
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, ShieldCheck, LogOut } from 'lucide-react';
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Placeholder Cards for Admin Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Manage Stories</CardTitle>
            <CardDescription>Add, edit, or remove novels and chapters.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
                <Link href="/admin/write">Go to Editor</Link>
            </Button>
            {/* Placeholder content */}
            <p className="text-sm text-muted-foreground mt-4">Feature coming soon.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Manage Users</CardTitle>
            <CardDescription>View user list, roles, and permissions.</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Placeholder content */}
             <p className="text-sm text-muted-foreground">Feature coming soon.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Site Settings</CardTitle>
            <CardDescription>Configure general website settings.</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Placeholder content */}
             <p className="text-sm text-muted-foreground">Feature coming soon.</p>
          </CardContent>
        </Card>
         <Card>
             <CardHeader>
                <CardTitle>Analytics</CardTitle>
                <CardDescription>View website traffic and usage statistics.</CardDescription>
             </CardHeader>
             <CardContent>
                {/* Placeholder content */}
                 <p className="text-sm text-muted-foreground">Feature coming soon.</p>
             </CardContent>
         </Card>
      </div>
       {/* Important Security Note */}
        <Card className="mt-8 border-destructive bg-destructive/10">
            <CardHeader>
                <CardTitle className="text-destructive">Security Notice</CardTitle>
            </CardHeader>
            <CardContent className="text-destructive/90">
                This is a **simulated** admin panel. The login process and access control are **not secure**. Do not use this implementation in a production environment without proper backend security, authentication, and authorization.
            </CardContent>
        </Card>
    </div>
  );
}
