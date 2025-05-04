// src/app/library/page.tsx
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, Library, Search, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import StoryCard, { type Story } from '@/components/story/story-card'; // Reuse StoryCard
import { Input } from '@/components/ui/input';

// Mock data for library stories - replace with actual data fetching
const mockLibraryStories: Story[] = [
    // Example: Add stories the user might have saved
    { id: '3', title: 'Whispers in the Mist', author: 'Rowan Vale', description: 'A forgotten village holds a dark secret...', coverImageUrl: 'https://picsum.photos/seed/mist/400/600', genre: 'Horror', reads: 5401, chapters: 15, tags: ['Supernatural', 'Suspense'], slug: 'whispers-in-the-mist', dataAiHint: 'horror book cover' },
    { id: '5', title: 'Dragon\'s Heir', author: 'Kenji Tanaka', description: 'The last dragon chooses an unlikely successor...', coverImageUrl: 'https://picsum.photos/seed/dragon/400/600', genre: 'Fantasy', reads: 18777, chapters: 30, tags: ['High Fantasy', 'Magic'], slug: 'dragons-heir', dataAiHint: 'fantasy dragon book cover' },
    { id: '7', title: 'Beneath the Willow Tree', author: 'Clara Meadows', description: 'A heartwarming tale of friendship...', coverImageUrl: 'https://picsum.photos/seed/willow/400/600', genre: 'Contemporary', reads: 15200, chapters: 22, tags: ['Friendship', 'Slice of Life'], slug: 'beneath-the-willow-tree', dataAiHint: 'contemporary book cover' },
];


export default function LibraryPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [libraryStories, setLibraryStories] = React.useState<Story[]>([]);
  const [isLoadingLibrary, setIsLoadingLibrary] = React.useState(true); // Separate loading state for library data
  const [searchTerm, setSearchTerm] = React.useState('');

  // Protect the route
  React.useEffect(() => {
    if (!isLoading && !user) {
      toast({
        title: "Access Denied",
        description: "Please log in to view your library.",
        variant: "destructive"
      });
      router.replace('/login');
    }
  }, [user, isLoading, router, toast]);

   // Fetch library data (placeholder)
   React.useEffect(() => {
       const fetchLibrary = async () => {
           if (user) {
               setIsLoadingLibrary(true);
               // TODO: Implement actual fetching of user's library from Firestore
               // This would involve querying a 'libraries' collection or a subcollection under the user
               console.log("Fetching library for user:", user.id);
               await new Promise(resolve => setTimeout(resolve, 700)); // Simulate fetch delay
               setLibraryStories(mockLibraryStories); // Use mock data for now
               setIsLoadingLibrary(false);
           }
       };
       if (!isLoading) { // Fetch only when auth state is resolved
           fetchLibrary();
       }
   }, [user, isLoading]);

  // Filter stories based on search term
  const filteredStories = libraryStories.filter(story =>
      story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      story.author.toLowerCase().includes(searchTerm.toLowerCase())
  );


  if (isLoading || (!user && !isLoading)) { // Show loader until auth resolved or redirecting
    return (
      <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }


  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
         <h1 className="text-3xl font-bold flex items-center gap-2">
           <Library className="w-8 h-8 text-primary" /> My Library
         </h1>
         <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search library..."
              className="w-full pl-10 rounded-full bg-secondary border-border focus:border-primary focus:bg-background"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
       </div>
       <p className="text-lg text-muted-foreground">
         Stories you've saved to read later.
       </p>

        <Alert variant="info" className="bg-blue-50 border-blue-200 text-blue-800">
          <AlertTitle>Feature Status</AlertTitle>
          <AlertDescription>
            This library currently shows sample data. Adding and removing stories from your actual library requires database integration.
          </AlertDescription>
        </Alert>

       {/* Display Library Stories */}
       {isLoadingLibrary ? (
           <div className="flex justify-center items-center py-20">
               <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
           </div>
       ) : filteredStories.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {filteredStories.map((story) => (
              // Reuse StoryCard, potentially add remove button
              <div key={story.id} className="relative group">
                 <StoryCard story={story} />
                 {/* Add overlay button to remove from library later */}
                 {/* <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 z-10 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                      // onClick={() => handleRemoveFromLibrary(story.id)}
                      title="Remove from Library"
                    >
                      <X className="h-4 w-4" />
                    </Button> */}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-muted-foreground border-2 border-dashed border-border rounded-lg">
            <FileText className="mx-auto h-12 w-12 mb-4" />
            {libraryStories.length === 0 && searchTerm === '' ? (
               <>
                 <p>Your library is empty.</p>
                 <p className="text-sm mt-1">
                   <Link href="/browse" className="text-primary hover:underline">Browse stories</Link> and add them to your library.
                 </p>
               </>
            ) : (
               <p>No stories found matching "{searchTerm}".</p>
            )}
          </div>
        )}
    </div>
  );
}
