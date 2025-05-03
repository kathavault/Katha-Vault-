import type { FC } from 'react';
import Link from 'next/link';
import { BookOpen, Search, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';

const Header: FC = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card shadow-sm">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        {/* Left Section - Logo and Desktop Nav */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
              <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0 8c-1.65 0-3-1.35-3-3s1.35-3 3-3 3 1.35 3 3-1.35 3-3 3z"/>
            </svg>
            <span className="text-xl font-bold text-primary">StoryVerse</span>
          </Link>
          <nav className="hidden md:flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/browse" className="text-foreground hover:text-primary">
                <BookOpen className="mr-2 h-4 w-4" /> Browse
              </Link>
            </Button>
            {/* Add more navigation links here if needed */}
          </nav>
        </div>

        {/* Center Section - Search Bar */}
        <div className="flex-1 mx-4 hidden sm:block max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search stories & people..."
              className="w-full pl-10 rounded-full"
            />
          </div>
        </div>

        {/* Right Section - Actions & Mobile Menu */}
        <div className="flex items-center gap-2">
           {/* Placeholder for Login/Signup/Profile */}
           <Button variant="outline" className="hidden md:inline-flex">Log In</Button>
           <Button className="hidden md:inline-flex bg-accent text-accent-foreground hover:bg-accent/90">Sign Up</Button>

           {/* Mobile Menu */}
           <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px] pt-10">
                 <nav className="flex flex-col gap-4">
                   <div className="relative mb-4 px-4">
                       <Search className="absolute left-7 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                       <Input
                         type="search"
                         placeholder="Search stories & people..."
                         className="w-full pl-10 rounded-full"
                       />
                     </div>
                   <Button variant="ghost" asChild className="justify-start px-4">
                     <Link href="/browse" className="text-foreground hover:text-primary">
                       <BookOpen className="mr-2 h-4 w-4" /> Browse
                     </Link>
                   </Button>
                   {/* Add more mobile navigation links here */}
                   <Separator className="my-2"/>
                   <div className="flex flex-col gap-2 px-4">
                    <Button variant="outline" className="w-full">Log In</Button>
                    <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90">Sign Up</Button>
                   </div>
                 </nav>
              </SheetContent>
            </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
