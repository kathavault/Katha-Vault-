import type { FC } from 'react';
import Link from 'next/link';
import { BookOpen, Search, Menu, ChevronDown, Edit } from 'lucide-react'; // Keep Edit icon for potential future use by logged-in users
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // Added for profile placeholder

const Header: FC = () => {
  // Placeholder for user authentication status
  const isLoggedIn = false; // Change this based on actual auth state

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background shadow-sm">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6 gap-4">
        {/* Mobile Menu Trigger (Keep first for mobile layout) */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[350px] pt-10 bg-background">
             <nav className="flex flex-col gap-4">
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
                     className="w-full pl-10 rounded-full bg-secondary border-transparent focus:border-border focus:bg-background"
                   />
                 </div>
               <Button variant="ghost" asChild className="justify-start px-4 text-lg">
                 <Link href="/browse" className="text-foreground hover:text-primary">
                   <BookOpen className="mr-2 h-5 w-5" /> Browse
                 </Link>
               </Button>
                {/* Removed "Write" button from mobile menu */}
               {/* Add more mobile navigation links here */}
               <Separator className="my-2"/>
               {isLoggedIn ? (
                 <div className="px-4">
                    {/* Mobile Profile Button Placeholder */}
                    <Button variant="ghost" className="w-full justify-start text-lg">
                      <Avatar className="h-6 w-6 mr-2">
                          <AvatarImage src="https://picsum.photos/seed/profile/100/100" alt="User" data-ai-hint="user avatar" />
                          <AvatarFallback>U</AvatarFallback>
                      </Avatar>
                      My Profile
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-lg text-destructive hover:text-destructive/90 mt-2">
                       Log Out
                     </Button>
                  </div>
               ) : (
                 <div className="flex flex-col gap-2 px-4">
                  {/* These buttons are still placeholders */}
                  <Button variant="outline" className="w-full text-lg">Log In</Button>
                  <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-lg">Sign Up</Button>
                 </div>
               )}
             </nav>
          </SheetContent>
        </Sheet>

        {/* Left Section - Logo */}
        <Link href="/" className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity shrink-0">
           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="currentColor" className="w-10 h-10">
             {/* Wattpad-like W logo */}
             <path fillRule="evenodd" clipRule="evenodd" d="M50 0C22.385 0 0 22.385 0 50C0 77.615 22.385 100 50 100C77.615 100 100 77.615 100 50C100 22.385 77.615 0 50 0ZM84.08 71.715L50 37.635L15.92 71.715C19.53 79.725 26.46 85.845 34.8 88.965C38.89 90.495 43.3 91.305 47.87 91.305H52.13C56.7 91.305 61.11 90.495 65.2 88.965C73.54 85.845 80.47 79.725 84.08 71.715ZM50 8.685C60.65 8.685 69.99 13.465 76.18 21.095L50 47.275L23.82 21.095C30.01 13.465 39.35 8.685 50 8.685Z" />
           </svg>
           {/* Hide text on smaller screens if needed */}
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
                 <DropdownMenuItem asChild><Link href="/community/forums">Forums</Link></DropdownMenuItem>
                 <DropdownMenuItem asChild><Link href="/community/awards">Awards</Link></DropdownMenuItem>
                 <DropdownMenuItem asChild><Link href="/community/contests">Writing Contests</Link></DropdownMenuItem>
               </DropdownMenuContent>
             </DropdownMenu>
             {/* Removed "Write" button from main navigation */}
             {/* <Button variant="ghost" asChild className="text-foreground hover:text-primary font-medium">
              <Link href="/write">
                Write
              </Link>
            </Button> */}
          </nav>
          {/* Search Bar */}
           <div className="relative w-full max-w-xs lg:max-w-sm hidden sm:block">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
             <Input
               type="search"
               placeholder="Search stories & people..."
               className="w-full pl-10 rounded-full bg-secondary border-transparent focus:border-border focus:bg-background"
             />
           </div>
        </div>


        {/* Right Section - Actions */}
        <div className="flex items-center gap-2 shrink-0">
           {isLoggedIn ? (
              // Logged-in state: Notifications, Profile Dropdown
               <>
                 {/* Notification Bell Placeholder */}
                 {/* <Button variant="ghost" size="icon">
                   <Bell className="h-5 w-5" />
                   <span className="sr-only">Notifications</span>
                 </Button> */}

                 {/* Profile Dropdown */}
                 <DropdownMenu>
                   <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="flex items-center gap-2">
                         <Avatar className="h-8 w-8">
                           <AvatarImage src="https://picsum.photos/seed/profile/100/100" alt="User" data-ai-hint="user avatar logged in" />
                           <AvatarFallback>U</AvatarFallback>
                         </Avatar>
                         <span className="hidden sm:inline">Username</span>
                         <ChevronDown className="ml-1 h-4 w-4" />
                       </Button>
                   </DropdownMenuTrigger>
                   <DropdownMenuContent align="end">
                     <DropdownMenuItem asChild><Link href="/profile/me">My Profile</Link></DropdownMenuItem>
                     <DropdownMenuItem asChild><Link href="/myworks">My Stories</Link></DropdownMenuItem>
                     <DropdownMenuItem asChild><Link href="/library">Library</Link></DropdownMenuItem>
                     {/* Optionally add "Write" link here for logged-in users */}
                     {/* <DropdownMenuItem asChild><Link href="/write">Write</Link></DropdownMenuItem> */}
                     <DropdownMenuItem asChild><Link href="/settings">Settings</Link></DropdownMenuItem>
                     <Separator />
                     <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">
                       Log Out
                     </DropdownMenuItem>
                   </DropdownMenuContent>
                 </DropdownMenu>
               </>
           ) : (
             // Logged-out state: Log In, Sign Up
             <>
               {/* These buttons are still placeholders - functionality needs implementation */}
               <Button variant="ghost" className="hidden md:inline-flex text-foreground hover:text-primary font-medium">Log In</Button>
               <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium">Sign Up</Button>
             </>
           )}


        </div>
      </div>
    </header>
  );
};

export default Header;
