'use client'; // Add this directive

import React, { useState, useEffect } from 'react'; // Import useState, useEffect
import Link from 'next/link';
import { BookOpen, Search, Menu, ChevronDown, Edit, LogIn, UserPlus, LogOut, UserCircle, ShieldCheck, Pencil, Library, Settings as SettingsIcon, User as UserIcon, MailWarning, Loader2 } from 'lucide-react'; // Added icons & Loader2
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel // Import DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast'; // Import useToast
import { ThemeToggle } from '@/components/layout/theme-toggle'; // Import ThemeToggle

const Header: React.FC = () => {
  const { user, isAdmin, logout, isLoading } = useAuth(); // Use the simulated auth hook
  const { toast } = useToast(); // Get toast function
  const [isMounted, setIsMounted] = useState(false); // State to track mount status

  useEffect(() => {
    setIsMounted(true); // Set to true after component mounts on client
  }, []);


  const handleLogout = async () => {
      await logout();
      // Toast is handled within the logout function in useAuth
  };

  // Placeholder for sending verification email again
  const handleResendVerification = () => {
       // In a real app, you'd call a function here to trigger
       // Firebase's sendEmailVerification again for the logged-in user.
       // This requires the user object to be available.
       toast({
           title: "Resend Verification (Simulated)",
           description: "If an account exists for this email, a new verification link will be sent.",
       });
  };


  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75 shadow-sm">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6 gap-4">
        {/* Mobile Menu Trigger */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[350px] pt-10 bg-background overflow-y-auto">
             <nav className="flex flex-col gap-4 h-full">
                {/* Mobile Logo */}
                <Link href="/" className="flex items-center gap-2 text-primary px-4 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="currentColor" className="w-8 h-8">
                   <path fillRule="evenodd" clipRule="evenodd" d="M50 0C22.385 0 0 22.385 0 50C0 77.615 22.385 100 50 100C77.615 100 100 77.615 100 50C100 22.385 77.615 0 50 0ZM84.08 71.715L50 37.635L15.92 71.715C19.53 79.725 26.46 85.845 34.8 88.965C38.89 90.495 43.3 91.305 47.87 91.305H52.13C56.7 91.305 61.11 90.495 65.2 88.965C73.54 85.845 80.47 79.725 84.08 71.715ZM50 8.685C60.65 8.685 69.99 13.465 76.18 21.095L50 47.275L23.82 21.095C30.01 13.465 39.35 8.685 50 8.685Z" />
                 </svg>
                  <span className="text-2xl font-bold text-primary">Katha Vault</span>
                </Link>
               <div className="relative mb-4 px-4">
                   <Search className="absolute left-7 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                   <Input
                     type="search"
                     placeholder="Search stories..."
                     className="w-full pl-10 rounded-full bg-secondary border-border focus:border-primary focus:bg-background" // Adjusted border
                   />
                 </div>
               <Button variant="ghost" asChild className="justify-start px-4 text-lg font-medium">
                 <Link href="/browse" className="text-foreground hover:text-primary">
                   <BookOpen className="mr-2 h-5 w-5" /> Browse
                 </Link>
               </Button>
               {/* Conditional Write/Admin Link */}
                {isMounted && isAdmin && user && ( // Only show if mounted, admin and logged in
                    <Button variant="ghost" asChild className="justify-start px-4 text-lg font-medium">
                        <Link href="/admin" className="text-foreground hover:text-primary">
                           <ShieldCheck className="mr-2 h-5 w-5" /> Admin Panel
                         </Link>
                    </Button>
                )}
                {/* Add other mobile nav links here if needed */}

               <Separator className="my-2"/>

               {/* Auth section at the bottom */}
               <div className="mt-auto pb-6">
                   {!isMounted || isLoading ? ( // Show loading state until mounted and auth is resolved
                       <div className="px-4 py-2 text-center text-muted-foreground flex items-center justify-center">
                           <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading...
                        </div>
                   ) : user ? (
                     <div className="px-4">
                        {!user.emailVerified && !isAdmin && ( // Show verification prompt for non-admin users
                              <div className="mb-4 p-3 rounded-md border border-yellow-300 bg-yellow-50 text-yellow-800 text-sm">
                                 <div className="flex items-center gap-2 mb-1 font-medium">
                                     <MailWarning className="h-5 w-5" /> Email Verification Needed
                                 </div>
                                 <p>Please check your inbox to verify your email address.</p>
                                 <Button variant="link" size="sm" className="p-0 h-auto mt-1 text-yellow-900 hover:text-yellow-700" onClick={handleResendVerification}>
                                     Resend Verification Email
                                 </Button>
                              </div>
                          )}
                        {/* Mobile Profile Button */}
                        <Button variant="ghost" asChild className="w-full justify-start text-lg mb-2">
                           <Link href="/profile/me">
                              <Avatar className="h-6 w-6 mr-2">
                                  <AvatarImage src={user.avatarUrl || undefined} alt={user.name || "User"} data-ai-hint="user avatar small"/>
                                  <AvatarFallback>{user.name?.substring(0, 1).toUpperCase() || 'U'}</AvatarFallback>
                              </Avatar>
                              My Profile
                           </Link>
                        </Button>
                         {/* Add other user-specific mobile links */}
                         {!isAdmin && (
                             <>
                                 <Button variant="ghost" asChild className="w-full justify-start text-lg mb-1">
                                      <Link href="/myworks"><Edit className="mr-2 h-5 w-5"/>My Stories</Link>
                                 </Button>
                                  <Button variant="ghost" asChild className="w-full justify-start text-lg mb-1">
                                      <Link href="/library"><Library className="mr-2 h-5 w-5"/>Library</Link>
                                 </Button>
                             </>
                         )}
                         <Button variant="ghost" asChild className="w-full justify-start text-lg mb-1">
                              <Link href="/settings"><SettingsIcon className="mr-2 h-5 w-5"/>Settings</Link>
                         </Button>
                         <Separator className="my-2"/>
                        <Button variant="ghost" onClick={handleLogout} className="w-full justify-start text-lg text-destructive hover:text-destructive/90 mt-2">
                            <LogOut className="mr-2 h-5 w-5" /> Log Out
                         </Button>
                      </div>
                   ) : (
                     <div className="flex flex-col gap-2 px-4">
                      <Button variant="outline" asChild className="w-full text-lg">
                        <Link href="/login"><LogIn className="mr-2 h-5 w-5"/> Log In</Link>
                      </Button>
                      <Button asChild className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-lg">
                        <Link href="/signup"><UserPlus className="mr-2 h-5 w-5"/> Sign Up</Link>
                      </Button>
                     </div>
                   )}
                   <div className="flex justify-center mt-4">
                     <ThemeToggle />
                   </div>
               </div>
             </nav>
          </SheetContent>
        </Sheet>

        {/* Left Section - Logo */}
        <Link href="/" className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity shrink-0">
           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="currentColor" className="w-10 h-10">
             <path fillRule="evenodd" clipRule="evenodd" d="M50 0C22.385 0 0 22.385 0 50C0 77.615 22.385 100 50 100C77.615 100 100 77.615 100 50C100 22.385 77.615 0 50 0ZM84.08 71.715L50 37.635L15.92 71.715C19.53 79.725 26.46 85.845 34.8 88.965C38.89 90.495 43.3 91.305 47.87 91.305H52.13C56.7 91.305 61.11 90.495 65.2 88.965C73.54 85.845 80.47 79.725 84.08 71.715ZM50 8.685C60.65 8.685 69.99 13.465 76.18 21.095L50 47.275L23.82 21.095C30.01 13.465 39.35 8.685 50 8.685Z" />
           </svg>
           <span className="text-2xl font-bold text-primary hidden sm:inline">Katha Vault</span>
         </Link>


        {/* Center Section - Navigation & Search */}
        <div className="flex flex-1 items-center justify-center gap-4 md:gap-6">
          <nav className="hidden md:flex items-center gap-1">
            <Button variant="ghost" asChild className="text-foreground hover:text-primary font-medium">
              <Link href="/browse">
                Browse
              </Link>
            </Button>
            {/* "Community" Dropdown */}
             <DropdownMenu>
               <DropdownMenuTrigger asChild>
                 <Button variant="ghost" className="text-foreground hover:text-primary font-medium">
                   Community <ChevronDown className="ml-1 h-4 w-4" />
                 </Button>
               </DropdownMenuTrigger>
               <DropdownMenuContent align="start">
                 <DropdownMenuItem asChild><Link href="#">Forums (Coming Soon)</Link></DropdownMenuItem>
                 <DropdownMenuItem asChild><Link href="#">Awards (Coming Soon)</Link></DropdownMenuItem>
                 <DropdownMenuItem asChild><Link href="#">Writing Contests (Coming Soon)</Link></DropdownMenuItem>
               </DropdownMenuContent>
             </DropdownMenu>
              {/* Admin-specific Write link */}
              {isMounted && isAdmin && user && ( // Only show if mounted, admin and logged in
                  <Button variant="ghost" asChild className="text-foreground hover:text-primary font-medium">
                      <Link href="/admin/write">
                         <Pencil className="mr-1 h-4 w-4" /> Write/Edit
                      </Link>
                  </Button>
              )}
          </nav>
          {/* Search Bar */}
           <div className="relative w-full max-w-xs lg:max-w-sm hidden sm:block">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
             <Input
               type="search"
               placeholder="Search stories & people..."
               className="w-full pl-10 rounded-full bg-secondary border-border focus:border-primary focus:bg-background" // Adjusted border
             />
           </div>
        </div>


        {/* Right Section - Actions */}
        <div className="flex items-center gap-2 shrink-0">
           <ThemeToggle /> {/* Add ThemeToggle here */}
           {!isMounted || isLoading ? ( // Show loader until mounted and auth is resolved
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
           ) : user ? (
               // Logged-in state: Profile Dropdown
               <DropdownMenu>
                   <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="flex items-center gap-2 px-2 sm:px-3 rounded-full h-10">
                         <Avatar className="h-8 w-8">
                           <AvatarImage src={user.avatarUrl || undefined} alt={user.name || "User"} data-ai-hint="user avatar logged in" />
                           <AvatarFallback>{user.name?.substring(0, 1).toUpperCase() || 'U'}</AvatarFallback>
                         </Avatar>
                         <span className="hidden sm:inline font-medium max-w-[100px] truncate">{user.name || user.email}</span>
                         <ChevronDown className="ml-1 h-4 w-4" />
                       </Button>
                   </DropdownMenuTrigger>
                   <DropdownMenuContent align="end" className="w-60">
                      <DropdownMenuLabel className="font-normal">
                           <div className="flex flex-col space-y-1">
                               <p className="text-sm font-medium leading-none truncate">{user.name || "User"}</p>
                               <p className="text-xs leading-none text-muted-foreground truncate">
                                   {user.email}
                                </p>
                           </div>
                       </DropdownMenuLabel>
                        {!user.emailVerified && !isAdmin && ( // Show verification prompt for non-admin users
                           <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem disabled className="text-xs text-yellow-700 focus:bg-yellow-50 focus:text-yellow-800">
                                 <MailWarning className="mr-2 h-4 w-4 text-yellow-600"/> Email not verified
                              </DropdownMenuItem>
                              <DropdownMenuItem onSelect={(e) => { e.preventDefault(); handleResendVerification(); }} className="cursor-pointer text-xs">
                                 Resend Verification Email
                              </DropdownMenuItem>
                           </>
                       )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild><Link href="/profile/me" className="flex items-center"><UserIcon className="mr-2 h-4 w-4"/>My Profile</Link></DropdownMenuItem>
                     {isAdmin ? (
                        <>
                            <DropdownMenuItem asChild><Link href="/admin" className="flex items-center"><ShieldCheck className="mr-2 h-4 w-4"/>Admin Panel</Link></DropdownMenuItem>
                            <DropdownMenuItem asChild><Link href="/admin/write" className="flex items-center"><Pencil className="mr-2 h-4 w-4"/>Write/Edit Stories</Link></DropdownMenuItem>
                        </>
                     ) : (
                        <>
                            <DropdownMenuItem asChild><Link href="/myworks" className="flex items-center"><Edit className="mr-2 h-4 w-4"/>My Stories</Link></DropdownMenuItem>
                            <DropdownMenuItem asChild><Link href="/library" className="flex items-center"><Library className="mr-2 h-4 w-4"/>Library</Link></DropdownMenuItem>
                        </>
                     )}

                     <DropdownMenuItem asChild><Link href="/settings" className="flex items-center"><SettingsIcon className="mr-2 h-4 w-4"/>Settings</Link></DropdownMenuItem>
                     <DropdownMenuSeparator />
                     <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive focus:bg-destructive/10 flex items-center cursor-pointer">
                       <LogOut className="mr-2 h-4 w-4"/> Log Out
                     </DropdownMenuItem>
                   </DropdownMenuContent>
                 </DropdownMenu>
           ) : (
             // Logged-out state: Log In, Sign Up
             <>
               <Button variant="ghost" asChild className="hidden md:inline-flex text-foreground hover:text-primary font-medium">
                 <Link href="/login"><LogIn className="mr-1 h-4 w-4" /> Log In</Link>
               </Button>
               <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium">
                 <Link href="/signup"><UserPlus className="mr-1 h-4 w-4" /> Sign Up</Link>
               </Button>
             </>
           )}
        </div>
      </div>
    </header>
  );
};

export default Header;
