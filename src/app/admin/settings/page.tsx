// src/app/admin/settings/page.tsx
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, Settings, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function AdminSettingsPage() {
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

   // State for settings (example) - Load from Firestore in useEffect
   const [siteTitle, setSiteTitle] = React.useState('Katha Vault');
   const [siteDescription, setSiteDescription] = React.useState('Discover and share original stories.');
   // Add more setting states as needed

   // TODO: useEffect to fetch settings from Firestore 'siteSettings' collection

   const handleSaveChanges = () => {
     // TODO: Implement saving settings to Firestore
     console.log("Saving settings (Simulated):", { siteTitle, siteDescription });
     toast({ title: "Settings Saved (Simulated)" });
   };

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
        <Settings className="w-8 h-8 text-primary" /> Site Settings
      </h1>
      <p className="text-lg text-muted-foreground">
        Configure general website settings.
      </p>

      <Alert variant="warning">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Feature Under Development</AlertTitle>
          <AlertDescription>
            Site settings functionality is currently basic. Saving requires Firestore integration and appropriate security rules for the 'siteSettings' collection.
          </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>Update basic information about your site.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
             <Label htmlFor="siteTitle">Site Title</Label>
             <Input
                id="siteTitle"
                value={siteTitle}
                onChange={(e) => setSiteTitle(e.target.value)}
                placeholder="Enter the title for your website"
             />
          </div>
          <div className="space-y-1">
              <Label htmlFor="siteDescription">Site Description (Meta Tag)</Label>
              <Textarea
                 id="siteDescription"
                 value={siteDescription}
                 onChange={(e) => setSiteDescription(e.target.value)}
                 placeholder="Enter a short description for search engines"
                 rows={3}
              />
           </div>
           {/* Add more settings fields here (e.g., theme options, default cover image) */}

           <Button onClick={handleSaveChanges}>Save Changes</Button>
        </CardContent>
      </Card>

       <Button variant="outline" asChild>
         <Link href="/admin">Back to Admin Dashboard</Link>
       </Button>
    </div>
  );
}
