// src/app/myworks/page.tsx
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, Edit3, PlusCircle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import StoryCard, { type Story } from '@/components/story/story-card'; // Assuming StoryCard can be reused
import { fetchAdminStories } from '@/lib/firebaseService'; // Fetch stories (reusing admin function for now)


export default function MyWorksPage() {
  const router = useRouter();
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [stories, setStories] = React.useState<Story[]>([]);
  const [isLoadingStories, setIsLoadingStories] = React.useState(true);

  // Fetch user's stories
  React.useEffect(() => {
    const loadStories = async () => {
      if (user?.id && !authLoading) {
        setIsLoadingStories(true);
        try {
          // Reusing fetchAdminStories - ideally, create a fetchUserStories function
          // that filters by authorId specifically.
          const fetchedStories = await fetchAdminStories(user.id);
          setStories(fetchedStories);
        } catch (error) {
          console.error("Error fetching user stories:", error);
          toast({
            title: "Error Fetching Stories",
            description: "Could not load your stories. Please try again.",
            variant: "destructive",
          });
        } finally {
          setIsLoadingStories(false);
        }
      } else if (!authLoading) {
         // If auth loaded but no user, clear stories
         setStories([]);
         setIsLoadingStories(false);
      }
    };

    loadStories();
  }, [user, authLoading, toast]);

  // Protect the route
  React.useEffect(() => {
    if (!authLoading && !user) {
      toast({
        title: "Access Denied",
        description: "Please log in to view your stories.",
        variant: "destructive"
      });
      router.replace('/login');
    }
  }, [user, authLoading, router, toast]);

  if (authLoading || isLoadingStories) {
    return (
      <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Admins are redirected to the main editor for now
  // In future, could show their stories here too, but link edit button to /admin/write
  if (isAdmin) {
     return (
         <div className="container mx-auto py-8 space-y-6 text-center">
             <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
               <Edit3 className="w-8 h-8 text-primary" /> My Stories
             </h1>
             <p className="text-lg text-muted-foreground">
                 As an admin, please use the Admin Story Editor to manage all stories.
             </p>
             <Button asChild>
                 <Link href="/admin/write">Go to Admin Editor</Link>
             </Button>
          </div>
     );
  }


  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center">
         <h1 className="text-3xl font-bold flex items-center gap-2">
           <Edit3 className="w-8 h-8 text-primary" /> My Stories
         </h1>
         {/* Non-admins don't have write access directly here yet */}
         {/* Link to a future dedicated user writing interface or prompt */}
          <Button variant="outline" disabled> {/* Disable for now */}
             <PlusCircle className="mr-2 h-4 w-4" /> Create New Story (Coming Soon)
           </Button>
       </div>
       <p className="text-lg text-muted-foreground">
         Manage your published and draft stories.
       </p>

       <Alert variant="info" className="bg-blue-50 border-blue-200 text-blue-800">
         <AlertTitle>Writer Access</AlertTitle>
         <AlertDescription>
           Currently, only administrators can create and edit stories using the Admin Editor. User story creation is planned for a future update.
         </AlertDescription>
       </Alert>

       {/* Display User's Stories */}
       {stories.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {stories.map((story) => (
              // Reuse StoryCard, potentially add edit/manage buttons overlayed or below
              <div key={story.id} className="relative group">
                 <StoryCard story={story} />
                 {/* Add overlay buttons for quick actions later */}
                 {/* <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                     <Button size="sm" variant="secondary">Edit</Button>
                     <Button size="sm" variant="destructive">Delete</Button>
                 </div> */}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-muted-foreground border-2 border-dashed border-border rounded-lg">
            <FileText className="mx-auto h-12 w-12 mb-4" />
            <p>You haven't created any stories yet.</p>
            <p className="text-sm mt-1">(User story creation coming soon)</p>
          </div>
        )}

    </div>
  );
}
