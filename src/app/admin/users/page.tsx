// src/app/admin/users/page.tsx
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, Users, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function AdminUsersPage() {
  const router = useRouter();
  const { user, isAdmin, isLoading } = useAuth();
  const { toast } = useToast();

  // Protect the route
  React.useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      toast({
        title: "Access Denied",
        description: "You do not have permission to access this page.",
        variant: "destructive",
      });
      router.replace('/login');
    }
  }, [user, isAdmin, isLoading, router, toast]);

  if (isLoading || !isAdmin) {
    return (
      <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-2">
        <Users className="w-8 h-8 text-primary" /> Manage Users
      </h1>
      <p className="text-lg text-muted-foreground">
        View users and manage their roles (functionality coming soon).
      </p>

      <Alert variant="warning">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Feature Under Development</AlertTitle>
          <AlertDescription>
            User management features, including role assignment and user details, are currently under development. Implementing role changes requires secure backend logic (e.g., Firebase Functions).
          </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>User List</CardTitle>
          <CardDescription>A list of registered users will appear here.</CardDescription>
        </CardHeader>
        <CardContent>
           {/* Placeholder for user table/list */}
          <div className="text-center py-12 text-muted-foreground border-2 border-dashed border-border rounded-lg">
             <p>User list loading or feature coming soon...</p>
             {/* Example structure: */}
             {/* <Table>...</Table> */}
           </div>
        </CardContent>
      </Card>

       <Button variant="outline" asChild>
         <Link href="/admin">Back to Admin Dashboard</Link>
       </Button>
    </div>
  );
}
