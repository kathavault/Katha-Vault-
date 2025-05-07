// src/app/settings/page.tsx
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, Settings, UserCircle, Bell, Palette, Lock, ShieldAlert, Languages, Trash2, LogOut } from 'lucide-react'; // Added Trash2, LogOut
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"; // Added Alert Dialog
import { fetchUserSettings, updateUserSettings } from '@/lib/userService'; // Import user service for settings
import { sendPasswordReset } from '@/hooks/use-auth'; // Import password reset helper

// Define type for user settings (adjust based on actual structure in Firestore)
interface UserSettings {
    emailNotifications?: boolean;
    pushNotifications?: boolean; // Keep for future
    readingTheme?: string;
    fontSize?: string;
    language?: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const { user, isLoading, logout, deleteAccount, reauthenticateUser } = useAuth(); // Added deleteAccount, reauthenticateUser
  const { toast } = useToast();

  // State for settings
  const [settings, setSettings] = React.useState<UserSettings>({});
  const [isLoadingSettings, setIsLoadingSettings] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = React.useState(false);
  const [passwordForDelete, setPasswordForDelete] = React.useState(''); // For re-authentication

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

   // Fetch settings when component mounts or user changes
   React.useEffect(() => {
     const loadSettings = async () => {
       if (user?.id) {
         setIsLoadingSettings(true);
         try {
           const fetchedSettings = await fetchUserSettings(user.id);
           setSettings(fetchedSettings || {}); // Set default empty object if null
         } catch (error) {
           console.error("Error fetching settings:", error);
           toast({ title: "Error", description: "Could not load settings.", variant: "destructive" });
         } finally {
           setIsLoadingSettings(false);
         }
       } else {
            setIsLoadingSettings(false); // Not loading if no user
       }
     };
      if (!isLoading) { // Only fetch when auth state is resolved
          loadSettings();
      }
   }, [user, isLoading, toast]);


  // Show loading state while checking auth or loading settings
  if (isLoading || !user || isLoadingSettings) {
    return (
      <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleSettingChange = (key: keyof UserSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveChanges = async (section: string) => {
    if (!user?.id || isSaving) return;
    setIsSaving(true);
    try {
        // Only send the changed settings relevant to the section if needed
        // Or just send the whole settings object
        await updateUserSettings(user.id, settings);
        toast({ title: "Settings Saved", description: `${section} preferences updated.` });
    } catch (error) {
        console.error(`Error saving ${section} settings:`, error);
        toast({ title: "Error Saving Settings", description: `Could not save ${section} preferences.`, variant: "destructive" });
    } finally {
        setIsSaving(false);
    }
  };

   const handleChangePassword = async () => {
       if (!user?.email) {
           toast({ title: "Error", description: "User email not found.", variant: "destructive" });
           return;
       }
       try {
           await sendPasswordReset(user.email);
           toast({
               title: "Password Reset Email Sent",
               description: `A link to reset your password has been sent to ${user.email}. Please check your inbox.`,
               duration: 7000,
           });
       } catch (error: any) {
           console.error("Error sending password reset email:", error);
            toast({ title: "Error", description: error.message || "Could not send password reset email.", variant: "destructive" });
       }
   };

    const handleDeleteAccountConfirm = async () => {
        if (!user || !passwordForDelete) {
            toast({ title: "Password Required", description: "Please enter your password to confirm account deletion.", variant: "destructive" });
            return;
        }
        setIsDeletingAccount(true);
        try {
            // Re-authenticate first
            const reauthSuccess = await reauthenticateUser(passwordForDelete);
            if (!reauthSuccess) {
                 toast({ title: "Authentication Failed", description: "Incorrect password. Account not deleted.", variant: "destructive" });
                 setIsDeletingAccount(false);
                 setPasswordForDelete(''); // Clear password field
                 return;
            }

            // Proceed with deletion if re-authentication succeeds
            await deleteAccount();
            toast({ title: "Account Deleted", description: "Your account has been permanently deleted.", variant: "destructive" });
            // Logout should happen automatically via onAuthStateChanged
            // router.push('/'); // Navigate away after deletion
        } catch (error: any) {
            console.error("Error deleting account:", error);
            toast({ title: "Deletion Failed", description: error.message || "Could not delete account.", variant: "destructive" });
             setIsDeletingAccount(false);
             setPasswordForDelete(''); // Clear password field
        }
    };


  return (
    <div className="container mx-auto py-8 space-y-8 max-w-4xl">
      <h1 className="text-3xl font-bold flex items-center gap-2">
        <Settings className="w-8 h-8 text-primary" /> Settings
      </h1>

      {/* Account Settings */}
       <Card>
         <CardHeader>
           <CardTitle className="flex items-center gap-2"><UserCircle className="w-5 h-5" /> Account</CardTitle>
           <CardDescription>Manage your account information and security.</CardDescription>
         </CardHeader>
         <CardContent className="space-y-6">
           <div className="space-y-1">
             <Label htmlFor="email">Email Address</Label>
             <Input id="email" type="email" value={user.email || ''} disabled />
             <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
           </div>
           {/* Password Change */}
           <div className="space-y-1">
              <Label>Password</Label>
               <Button variant="outline" onClick={handleChangePassword}>Send Password Reset Email</Button>
           </div>
           {/* Linked Accounts Placeholder */}
           <div className="space-y-1">
             <Label>Linked Accounts</Label>
             <p className="text-sm text-muted-foreground italic">
                 {/* TODO: Check auth provider data to list linked accounts */}
                 Google/Facebook linking management coming soon.
             </p>
           </div>
           <Separator />
           {/* Delete Account */}
           <div>
             <h3 className="text-lg font-medium text-destructive mb-2">Danger Zone</h3>
              <AlertDialog>
                 <AlertDialogTrigger asChild>
                    <Button variant="destructive" disabled={isDeletingAccount}>
                       {isDeletingAccount ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Trash2 className="mr-2 h-4 w-4" />}
                       Delete Account
                    </Button>
                 </AlertDialogTrigger>
                 <AlertDialogContent>
                   <AlertDialogHeader>
                     <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                     <AlertDialogDescription>
                       This action cannot be undone. This will permanently delete your account,
                       stories, comments, and all associated data. Please enter your password to confirm.
                     </AlertDialogDescription>
                   </AlertDialogHeader>
                    <div className="py-2">
                        <Label htmlFor="password-delete" className="sr-only">Password</Label>
                        <Input
                           id="password-delete"
                           type="password"
                           placeholder="Enter your password"
                           value={passwordForDelete}
                           onChange={(e) => setPasswordForDelete(e.target.value)}
                         />
                    </div>
                   <AlertDialogFooter>
                     <AlertDialogCancel onClick={() => setPasswordForDelete('')}>Cancel</AlertDialogCancel>
                     <AlertDialogAction
                        onClick={handleDeleteAccountConfirm}
                        disabled={isDeletingAccount || !passwordForDelete}
                        className="bg-destructive hover:bg-destructive/90"
                       >
                       {isDeletingAccount ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                       Delete Account Permanently
                     </AlertDialogAction>
                   </AlertDialogFooter>
                 </AlertDialogContent>
               </AlertDialog>
               <p className="text-xs text-muted-foreground mt-2">Warning: This action is irreversible.</p>
            </div>
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
             <Label htmlFor="email-notifications" className="flex flex-col space-y-1 cursor-pointer">
               <span>Email Notifications</span>
               <span className="font-normal leading-snug text-muted-foreground">
                 Receive updates about new chapters, comments, and announcements.
               </span>
             </Label>
             <Switch
               id="email-notifications"
               checked={settings.emailNotifications ?? true} // Default to true if undefined
               onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
               aria-label="Toggle email notifications"
               disabled={isSaving}
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
               checked={settings.pushNotifications ?? false}
               onCheckedChange={(checked) => handleSettingChange('pushNotifications', checked)}
               aria-label="Toggle push notifications"
               disabled // Always disabled for now
             />
           </div>
           <Button onClick={() => handleSaveChanges('Notification')} disabled={isSaving}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
              Save Notification Settings
            </Button>
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
               <Select
                  value={settings.readingTheme || 'system'} // Default to system
                  onValueChange={(value) => handleSettingChange('readingTheme', value)}
                  disabled={isSaving}
                >
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
               <Select
                  value={settings.fontSize || 'medium'} // Default to medium
                  onValueChange={(value) => handleSettingChange('fontSize', value)}
                  disabled={isSaving}
                >
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
           <Button onClick={() => handleSaveChanges('Reading')} disabled={isSaving}>
               {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
               Save Reading Preferences
            </Button>
         </CardContent>
       </Card>

      {/* Language Settings */}
       <Card>
         <CardHeader>
           <CardTitle className="flex items-center gap-2"><Languages className="w-5 h-5" /> Language</CardTitle>
           <CardDescription>Set your preferred interface language.</CardDescription>
         </CardHeader>
         <CardContent className="space-y-4">
           <div className="space-y-1">
             <Label htmlFor="language">Interface Language</Label>
             <Select
                value={settings.language || 'en'} // Default to English
                onValueChange={(value) => handleSettingChange('language', value)}
                disabled={isSaving}
              >
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
           <Button onClick={() => handleSaveChanges('Language')} disabled={isSaving}>
               {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
               Save Language Settings
            </Button>
         </CardContent>
       </Card>

    </div>
  );
}

