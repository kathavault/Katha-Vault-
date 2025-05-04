// src/app/profile/me/page.tsx
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth'; // Ensure this path is correct
import { Loader2, User, Mail, Edit, Shield, Bell, BookOpen, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function MyProfilePage() {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();
  const { toast } = useToast();

  // Protect the route - Redirect if not logged in
  React.useEffect(() => {
    if (!isLoading && !user) {
      toast({
        title: "Access Denied",
        description: "Please log in to view your profile.",
        variant: "destructive"
      });
      router.replace('/login');
    }
  }, [user, isLoading, router, toast]);

  // Show loading state while checking auth
  if (isLoading || !user) {
    return (
      <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Placeholder handlers for future implementation
  const handleEditName = () => {
      toast({ title: "Feature Coming Soon", description: "Name editing will be available soon." });
  };

  const handleUploadAvatar = () => {
      toast({ title: "Feature Coming Soon", description: "Avatar uploading will be available soon." });
  };

  return (
    <div className="container mx-auto py-8 space-y-8 max-w-4xl">
      <h1 className="text-3xl font-bold flex items-center gap-2">
        <User className="w-8 h-8 text-primary" /> My Profile
      </h1>

      {/* Profile Information Card */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-4">
           <Avatar className="h-20 w-20 border-2 border-primary">
              <AvatarImage src={user.avatarUrl || undefined} alt={user.name || 'User Avatar'} data-ai-hint="user profile picture large"/>
              <AvatarFallback className="text-2xl">{user.name?.substring(0, 1).toUpperCase() || user.email?.substring(0,1).toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
           <div className="flex-1">
             <CardTitle className="text-2xl">{user.name || 'User'}</CardTitle>
             <CardDescription className="flex items-center gap-1 text-base">
                 <Mail className="w-4 h-4 text-muted-foreground" /> {user.email || 'No email provided'}
             </CardDescription>
           </div>
           <Button variant="outline" size="sm" onClick={handleUploadAvatar}>
              <Edit className="mr-2 h-4 w-4" /> Change Avatar
           </Button>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6 space-y-4">
           <div className="flex justify-between items-center">
              <div>
                 <p className="text-sm font-medium text-muted-foreground">Display Name</p>
                 <p className="text-lg">{user.name || '(Not set)'}</p>
               </div>
               <Button variant="ghost" size="sm" onClick={handleEditName}>
                  <Edit className="mr-1 h-4 w-4" /> Edit
               </Button>
           </div>
           <Separator />
           <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Email Address</p>
                <p className="text-lg flex items-center gap-2">
                   {user.email}
                   {user.emailVerified ? (
                      <span className="text-xs text-green-600 font-medium bg-green-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                         <Shield className="w-3 h-3"/> Verified
                      </span>
                   ) : (
                       <span className="text-xs text-yellow-700 font-medium bg-yellow-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Shield className="w-3 h-3"/> Not Verified
                       </span>
                   )}
                </p>
            </div>
            {/* Add more profile fields here (e.g., Bio, Location - placeholder) */}
            <Separator />
            <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Bio</p>
                <p className="text-muted-foreground italic">Bio editing coming soon.</p>
             </div>
        </CardContent>
      </Card>

      {/* Placeholder Sections */}
       <Alert variant="default" className="bg-secondary/50">
         <AlertTitle>More Features Coming Soon!</AlertTitle>
         <AlertDescription>
           Sections for managing linked accounts, privacy settings, and more profile customization options will be added in the future.
         </AlertDescription>
       </Alert>

       {/* Example placeholder cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
             <CardHeader>
               <CardTitle className="flex items-center gap-2"><Lock className="w-5 h-5" /> Account Security</CardTitle>
               <CardDescription>Manage password and linked accounts.</CardDescription>
             </CardHeader>
             <CardContent>
                 <Button variant="secondary" disabled>Change Password</Button>
                 <p className="text-sm text-muted-foreground mt-3">Linked accounts management coming soon.</p>
             </CardContent>
          </Card>
           <Card>
             <CardHeader>
               <CardTitle className="flex items-center gap-2"><Bell className="w-5 h-5" /> Notification Settings</CardTitle>
               <CardDescription>Control how we notify you.</CardDescription>
             </CardHeader>
             <CardContent>
                 <p className="text-sm text-muted-foreground">Notification preferences coming soon.</p>
             </CardContent>
          </Card>
       </div>


      <div className="pt-4">
        <Button variant="destructive" onClick={logout}>
          <LogOut className="mr-2 h-4 w-4" /> Log Out
        </Button>
      </div>
    </div>
  );
}
