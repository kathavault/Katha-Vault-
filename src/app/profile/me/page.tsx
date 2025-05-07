// src/app/profile/me/page.tsx
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, User, Mail, Edit, Shield, Camera, Save, LogOut, Upload } from 'lucide-react'; // Added Camera, Save, Upload icons
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input'; // Added Input
import { Textarea } from '@/components/ui/textarea'; // Added Textarea
import { Label } from '@/components/ui/label'; // Added Label
import { updateProfileInfo, updateUserBio, uploadAvatar } from '@/lib/userService'; // Import user service functions

export default function MyProfilePage() {
  const router = useRouter();
  const { user, isLoading, logout, updateUserContext } = useAuth(); // Added updateUserContext
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null); // Ref for avatar file input

  // State for editable fields
  const [isEditingName, setIsEditingName] = React.useState(false);
  const [displayName, setDisplayName] = React.useState(user?.name || '');
  const [isEditingBio, setIsEditingBio] = React.useState(false);
  const [bio, setBio] = React.useState(''); // Fetch bio in useEffect

  // Loading states
  const [isSavingName, setIsSavingName] = React.useState(false);
  const [isSavingBio, setIsSavingBio] = React.useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = React.useState(false);
  const [isLoadingBio, setIsLoadingBio] = React.useState(true);

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

  // Fetch bio when component mounts
  React.useEffect(() => {
    const fetchBio = async () => {
        if (user?.id) {
            setIsLoadingBio(true);
            try {
                // TODO: Replace with actual fetch function if needed, assume bio comes with user object for now
                // const userProfile = await fetchUserProfile(user.id);
                // setBio(userProfile?.bio || '');
                // For now, assume bio might be part of the user context object or needs fetching
                // Let's simulate fetching it separately if not in context
                const fetchedBio = "This is a placeholder bio. Edit me!"; // Replace with actual fetch if needed
                setBio(fetchedBio);
            } catch (error) {
                console.error("Error fetching user bio:", error);
                toast({ title: "Error", description: "Could not load bio.", variant: "destructive" });
            } finally {
                setIsLoadingBio(false);
            }
        } else {
             setIsLoadingBio(false);
        }
    };
    if (!isLoading) {
        fetchBio();
        setDisplayName(user?.name || ''); // Ensure display name is synced on user load
    }
  }, [user, isLoading, toast]);

  // Show loading state while checking auth or loading bio
  if (isLoading || !user || isLoadingBio) {
    return (
      <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleEditNameToggle = () => {
    if (isEditingName) {
        // Save name if changed
        handleSaveName();
    } else {
        setDisplayName(user.name || ''); // Reset to current name on toggle on
        setIsEditingName(true);
    }
  };

  const handleSaveName = async () => {
    if (!user || displayName.trim() === user.name || isSavingName) return;
    if (displayName.trim().length === 0) {
        toast({ title: "Validation Error", description: "Display name cannot be empty.", variant: "destructive" });
        return;
    }
    if (displayName.trim().length > 50) {
        toast({ title: "Validation Error", description: "Display name cannot exceed 50 characters.", variant: "destructive" });
        return;
    }

    setIsSavingName(true);
    try {
        await updateProfileInfo(user.id, { displayName: displayName.trim() });
        // Update local auth context immediately
        updateUserContext({ ...user, name: displayName.trim() });
        toast({ title: "Success", description: "Display name updated." });
        setIsEditingName(false);
    } catch (error) {
        console.error("Error updating display name:", error);
        toast({ title: "Error", description: "Could not update display name.", variant: "destructive" });
    } finally {
        setIsSavingName(false);
    }
  };

  const handleEditBioToggle = () => {
      if (isEditingBio) {
          handleSaveBio();
      } else {
           // Load current bio into textarea when starting to edit
           // fetchBio(); // Re-fetch or use current state
           setIsEditingBio(true);
      }
  };

   const handleSaveBio = async () => {
       if (!user || isSavingBio) return;
        if (bio.length > 500) { // Example limit
            toast({ title: "Validation Error", description: "Bio cannot exceed 500 characters.", variant: "destructive" });
            return;
        }

       setIsSavingBio(true);
       try {
           await updateUserBio(user.id, bio); // Use the imported function
           toast({ title: "Success", description: "Bio updated." });
           setIsEditingBio(false);
       } catch (error) {
           console.error("Error updating bio:", error);
           toast({ title: "Error", description: "Could not update bio.", variant: "destructive" });
       } finally {
           setIsSavingBio(false);
       }
   };


  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0 || !user) {
      return;
    }
    const file = event.target.files[0];

    // Basic validation (size, type)
    if (!file.type.startsWith('image/')) {
      toast({ title: "Invalid File Type", description: "Please upload an image.", variant: "destructive" });
      return;
    }
    if (file.size > 2 * 1024 * 1024) { // 2MB limit example
      toast({ title: "File Too Large", description: "Image size should not exceed 2MB.", variant: "destructive" });
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const downloadURL = await uploadAvatar(user.id, file);
      await updateProfileInfo(user.id, { photoURL: downloadURL });

      // Update local auth context
      updateUserContext({ ...user, avatarUrl: downloadURL });

      toast({ title: "Avatar Updated", description: "Your profile picture has been changed." });
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast({ title: "Upload Failed", description: "Could not update avatar.", variant: "destructive" });
    } finally {
      setIsUploadingAvatar(false);
       // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-8 max-w-4xl">
      <h1 className="text-3xl font-bold flex items-center gap-2">
        <User className="w-8 h-8 text-primary" /> My Profile
      </h1>

      {/* Profile Information Card */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-center gap-4 space-y-0 pb-4">
          <div className="relative group cursor-pointer" onClick={handleAvatarClick} title="Change Avatar">
            <Avatar className="h-24 w-24 border-2 border-primary group-hover:opacity-80 transition-opacity">
              <AvatarImage src={user.avatarUrl || undefined} alt={user.name || 'User Avatar'} data-ai-hint="user profile picture large"/>
              <AvatarFallback className="text-3xl">{user.name?.substring(0, 1).toUpperCase() || user.email?.substring(0,1).toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              {isUploadingAvatar ? (
                  <Loader2 className="h-6 w-6 text-white animate-spin" />
              ) : (
                  <Camera className="h-6 w-6 text-white" />
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              style={{ display: 'none' }}
              disabled={isUploadingAvatar}
            />
          </div>
           <div className="flex-1 text-center sm:text-left">
             <CardTitle className="text-2xl mb-1">{user.name || 'User'}</CardTitle>
             <CardDescription className="flex items-center justify-center sm:justify-start gap-1 text-base">
                 <Mail className="w-4 h-4 text-muted-foreground" /> {user.email || 'No email provided'}
                 {user.emailVerified ? (
                    <span className="text-xs text-green-600 font-medium bg-green-100 px-2 py-0.5 rounded-full flex items-center gap-1 ml-2">
                        <Shield className="w-3 h-3"/> Verified
                    </span>
                 ) : (
                     <span className="text-xs text-yellow-700 font-medium bg-yellow-100 px-2 py-0.5 rounded-full flex items-center gap-1 ml-2">
                        <Shield className="w-3 h-3"/> Not Verified
                     </span>
                 )}
             </CardDescription>
           </div>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6 space-y-6">
           {/* Display Name */}
           <div className="space-y-2">
             <div className="flex justify-between items-center">
                <Label htmlFor="displayName" className="text-sm font-medium text-muted-foreground">Display Name</Label>
                 <Button variant="ghost" size="sm" onClick={handleEditNameToggle} disabled={isSavingName}>
                     {isSavingName ? <Loader2 className="h-4 w-4 animate-spin" /> : (isEditingName ? <Save className="mr-1 h-4 w-4" /> : <Edit className="mr-1 h-4 w-4" />)}
                     {isEditingName ? 'Save' : 'Edit'}
                 </Button>
              </div>
              {isEditingName ? (
                 <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter your display name"
                    disabled={isSavingName}
                    maxLength={50}
                 />
              ) : (
                 <p className="text-lg">{user.name || '(Not set)'}</p>
              )}
           </div>
           <Separator />
            {/* Bio */}
           <div className="space-y-2">
               <div className="flex justify-between items-center">
                   <Label htmlFor="bio" className="text-sm font-medium text-muted-foreground">Bio</Label>
                    <Button variant="ghost" size="sm" onClick={handleEditBioToggle} disabled={isSavingBio}>
                         {isSavingBio ? <Loader2 className="h-4 w-4 animate-spin" /> : (isEditingBio ? <Save className="mr-1 h-4 w-4" /> : <Edit className="mr-1 h-4 w-4" />)}
                         {isEditingBio ? 'Save Bio' : 'Edit Bio'}
                    </Button>
               </div>
                {isEditingBio ? (
                   <Textarea
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell us a little about yourself..."
                      rows={4}
                      disabled={isSavingBio}
                      maxLength={500}
                   />
                ) : (
                  <p className={`text-foreground/80 italic ${!bio && 'text-muted-foreground'}`}>
                    {bio || 'No bio set.'}
                  </p>
                )}
           </div>
        </CardContent>
      </Card>

      {/* Placeholder Sections - Link to Settings */}
       <Alert variant="default" className="bg-secondary/50">
         <AlertTitle>Account Settings</AlertTitle>
         <AlertDescription>
           Manage your password, linked accounts, notifications, and reading preferences in the{' '}
           <Link href="/settings" className="text-primary underline font-medium">Account Settings</Link> page.
         </AlertDescription>
       </Alert>

      <div className="pt-4">
        <Button variant="destructive" onClick={logout} disabled={isLoading}>
           {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <LogOut className="mr-2 h-4 w-4" />}
           Log Out
        </Button>
      </div>
    </div>
  );
}

