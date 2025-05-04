// src/app/settings/page.tsx
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, Settings, UserCircle, Bell, Palette, Lock, ShieldAlert, Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


export default function SettingsPage() {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth(); // Check if isAdmin needed? Assume settings for all logged in users
  const { toast } = useToast();

  // Protect the route
  React.useEffect(() => {
    if (!isLoading && !user) {
      toast({
        title: "Access Denied",
        description: "Please log in to view settings.",
        variant: "destructive"
      });
      router.replace('/login');
    }
  }, [user, isLoading, router, toast]);

  // Placeholder state for settings - load from user preferences/DB
   const [emailNotifications, setEmailNotifications] = React.useState(true);
   const [pushNotifications, setPushNotifications] = React.useState(false);
   const [readingTheme, setReadingTheme] = React.useState('light');
   const [fontSize, setFontSize] = React.useState('medium');

  // Show loading state while checking auth
  if (isLoading || !user) {
    return (
      <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

   const handleSaveChanges = () => {
     // TODO: Implement saving settings to Firestore/user profile
     console.log("Saving settings (Simulated):", {
       emailNotifications,
       pushNotifications,
       readingTheme,
       fontSize,
     });
     toast({ title: "Settings Saved (Simulated)" });
   };


  return (
    <div className="container mx-auto py-8 space-y-8 max-w-4xl">
      <h1 className="text-3xl font-bold flex items-center gap-2">
        <Settings className="w-8 h-8 text-primary" /> Settings
      </h1>

      <Alert variant="warning">
         <ShieldAlert className="h-4 w-4" />
         <AlertTitle>Feature Under Development</AlertTitle>
         <AlertDescription>
           Settings are currently placeholders. Saving changes requires integration with user profiles or a settings database.
         </AlertDescription>
       </Alert>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
         {/* Sidebar/Navigation (Optional for future expansion) */}
         {/* <nav className="md:col-span-3 space-y-2">
            <Button variant="ghost" className="w-full justify-start"><UserCircle className="mr-2 h-4 w-4"/> Account</Button>
            <Button variant="ghost" className="w-full justify-start"><Bell className="mr-2 h-4 w-4"/> Notifications</Button>
            <Button variant="ghost" className="w-full justify-start"><Palette className="mr-2 h-4 w-4"/> Reading</Button>
         </nav> */}

         {/* Main Settings Content */}
         <div className="md:col-span-12 space-y-8"> {/* Changed to full width for now */}

             {/* Account Settings */}
             <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><UserCircle className="w-5 h-5" /> Account</CardTitle>
                  <CardDescription>Manage your account information and security.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                   <div className="space-y-1">
                      <Label htmlFor="email">Email Address</Label>
                      <Input id="email" type="email" value={user.email || ''} disabled />
                      <p className="text-xs text-muted-foreground">Email cannot be changed here.</p>
                   </div>
                   {/* Password Change Placeholder */}
                    <div className="space-y-1">
                      <Label>Password</Label>
                       <Button variant="outline" disabled>Change Password (Coming Soon)</Button>
                    </div>
                    {/* Linked Accounts Placeholder */}
                     <div className="space-y-1">
                        <Label>Linked Accounts</Label>
                        <p className="text-sm text-muted-foreground italic">Social login management coming soon.</p>
                        {/* Display linked providers (Google, Facebook) if applicable */}
                    </div>
                    <Separator />
                    {/* Logout Button */}
                     <Button variant="destructive" onClick={logout}>Log Out</Button>
                     <Separator />
                      {/* Delete Account Placeholder */}
                     <Button variant="destructive" className="bg-red-700 hover:bg-red-800" disabled>Delete Account (Coming Soon)</Button>
                     <p className="text-xs text-muted-foreground">Warning: This action is irreversible.</p>
                </CardContent>
             </Card>

             {/* Notification Settings */}
             <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Bell className="w-5 h-5" /> Notifications</CardTitle>
                  <CardDescription>Choose how you receive updates from Katha Vault.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between space-x-2 p-3 border rounded-md">
                       <Label htmlFor="email-notifications" className="flex flex-col space-y-1">
                         <span>Email Notifications</span>
                         <span className="font-normal leading-snug text-muted-foreground">
                           Receive updates about new chapters, comments, and announcements.
                         </span>
                       </Label>
                       <Switch
                         id="email-notifications"
                         checked={emailNotifications}
                         onCheckedChange={setEmailNotifications}
                         aria-label="Toggle email notifications"
                       />
                     </div>
                      <div className="flex items-center justify-between space-x-2 p-3 border rounded-md opacity-50 cursor-not-allowed">
                       <Label htmlFor="push-notifications" className="flex flex-col space-y-1">
                         <span>Push Notifications</span>
                         <span className="font-normal leading-snug text-muted-foreground">
                           Get real-time updates on your device (Coming Soon).
                         </span>
                       </Label>
                       <Switch
                         id="push-notifications"
                         checked={pushNotifications}
                         onCheckedChange={setPushNotifications}
                         aria-label="Toggle push notifications"
                         disabled
                       />
                     </div>
                     {/* Add more granular notification controls */}
                     <Button onClick={handleSaveChanges}>Save Notification Settings</Button>
                 </CardContent>
             </Card>

             {/* Reading Preferences */}
             <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Palette className="w-5 h-5" /> Reading Preferences</CardTitle>
                  <CardDescription>Customize your reading experience.</CardDescription>
                </CardHeader>
                 <CardContent className="space-y-4">
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div className="space-y-1">
                       <Label htmlFor="readingTheme">Default Theme</Label>
                       <Select value={readingTheme} onValueChange={setReadingTheme}>
                           <SelectTrigger id="readingTheme">
                             <SelectValue placeholder="Select theme" />
                           </SelectTrigger>
                           <SelectContent>
                               <SelectItem value="light">Light</SelectItem>
                               <SelectItem value="dark">Dark</SelectItem>
                               <SelectItem value="sepia">Sepia</SelectItem>
                               <SelectItem value="system">System Default</SelectItem>
                           </SelectContent>
                       </Select>
                     </div>
                     <div className="space-y-1">
                       <Label htmlFor="fontSize">Font Size</Label>
                        <Select value={fontSize} onValueChange={setFontSize}>
                            <SelectTrigger id="fontSize">
                              <SelectValue placeholder="Select font size" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="small">Small</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="large">Large</SelectItem>
                                <SelectItem value="xlarge">Extra Large</SelectItem>
                            </SelectContent>
                        </Select>
                     </div>
                   </div>
                     {/* Add other preferences like font style, line spacing */}
                     <Button onClick={handleSaveChanges}>Save Reading Preferences</Button>
                 </CardContent>
             </Card>

              {/* Language Settings */}
              <Card>
                 <CardHeader>
                   <CardTitle className="flex items-center gap-2"><Languages className="w-5 h-5" /> Language & Region</CardTitle>
                   <CardDescription>Set your preferred language.</CardDescription>
                 </CardHeader>
                 <CardContent className="space-y-4">
                     <div className="space-y-1">
                       <Label htmlFor="language">Interface Language</Label>
                       <Select defaultValue="en"> {/* Placeholder */}
                           <SelectTrigger id="language">
                             <SelectValue placeholder="Select language" />
                           </SelectTrigger>
                           <SelectContent>
                               <SelectItem value="en">English</SelectItem>
                               <SelectItem value="hi" disabled>हिन्दी (Hindi - Coming Soon)</SelectItem>
                               <SelectItem value="es" disabled>Español (Spanish - Coming Soon)</SelectItem>
                               {/* Add more languages */}
                           </SelectContent>
                       </Select>
                     </div>
                      <Button onClick={handleSaveChanges}>Save Language Settings</Button>
                 </CardContent>
              </Card>

         </div>
      </div>
    </div>
  );
}
