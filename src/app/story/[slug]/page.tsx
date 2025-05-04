
"use client";


import type { NextPage } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BookOpen, Eye, Users, MessageSquare, ThumbsUp, List, PlusCircle, Library, CheckCircle, Star, Share2, Send } from 'lucide-react'; // Added/updated icons
import type { Story as BaseStory } from '@/components/story/story-card'; // Rename imported Story
import React, { useEffect, useState } from 'react'; // Import React and hooks
import { useAuth } from '@/hooks/use-auth'; // Import useAuth
import { Textarea } from '@/components/ui/textarea'; // Import Textarea
import { useToast } from '@/hooks/use-toast'; // Import useToast
import { validateCommentData, validateRatingData } from '@/services/validationService'; // Import validation functions

// Re-type BaseStory author to be an object
interface Author {
    name: string;
    id: string; // Assuming an ID for linking later
    avatarUrl?: string; // Optional avatar URL
}

export interface Story extends Omit<BaseStory, 'author'> {
    author: Author;
}


// Define extended Story type for this page
interface StoryDetails extends Story {
  chaptersData: { id: string; title: string }[];
  authorFollowers: number;
  status: 'Ongoing' | 'Completed';
  lastUpdated: string;
  // Add optional fields for overall rating, comments etc. if fetched
  averageRating?: number;
  totalRatings?: number;
  comments?: any[]; // Replace 'any' with a proper Comment type later
}

// Mock data - replace with actual data fetching based on slug
const getStoryBySlug = async (slug: string): Promise<StoryDetails | null> => {
  console.log("Fetching story for slug:", slug);
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 50));

  // Find story in mock data (replace with actual DB query)
   const mockStories: Story[] = [
     { id: '1', title: 'The Crimson Cipher', author: { name: 'Alex Quill', id: 'alex-quill' }, description: 'A thrilling adventure into the unknown depths of ancient ruins, where secrets lie buried and danger lurks around every corner. Join Elara as she deciphers the ancient texts.', coverImageUrl: 'https://picsum.photos/seed/crimson/400/600', genre: 'Adventure', reads: 12567, chapters: 25, tags: ['Mystery', 'Action', 'Ancient', 'Puzzles'], slug: 'the-crimson-cipher', dataAiHint: 'adventure mystery book cover detail' },
     { id: '2', title: 'Echoes of Starlight', author: { name: 'Seraphina Moon', id: 'seraphina-moon' }, description: 'In a galaxy torn by war, a young pilot discovers a power that could change everything. Battling empires and falling in love, Lyra\'s journey is epic.', coverImageUrl: 'https://picsum.photos/seed/starlight/400/600', genre: 'Sci-Fi', reads: 8930, chapters: 40, tags: ['Space Opera', 'Romance', 'Conflict', 'Chosen One'], slug: 'echoes-of-starlight', dataAiHint: 'sci-fi space opera book cover detail' },
     { id: '3', title: 'Whispers in the Mist', author: { name: 'Rowan Vale', id: 'rowan-vale' }, description: 'A forgotten village holds a dark secret, awakened by the arrival of a curious outsider. The fog never truly lifts, and neither does the dread.', coverImageUrl: 'https://picsum.photos/seed/mist/400/600', genre: 'Horror', reads: 5401, chapters: 15, tags: ['Supernatural', 'Suspense', 'Folk Horror', 'Isolation'], slug: 'whispers-in-the-mist', dataAiHint: 'horror suspense book cover detail' },
     { id: '4', title: 'The Gilded Cage', author: { name: 'Eleanor Vance', id: 'eleanor-vance' }, description: 'Trapped in high society, a young woman fights for her freedom and forbidden love. Balls, secrets, and societal expectations clash.', coverImageUrl: 'https://picsum.photos/seed/gilded/400/600', genre: 'Romance', reads: 21050, chapters: 55, tags: ['Historical', 'Drama', 'Forbidden Love', 'Regency'], slug: 'the-gilded-cage', dataAiHint: 'romance historical drama book cover detail' },
     { id: '5', title: 'Dragon\'s Heir', author: { name: 'Kenji Tanaka', id: 'kenji-tanaka' }, description: 'The last dragon chooses an unlikely successor to protect the realm from encroaching darkness. Training, prophecies, and epic battles await.', coverImageUrl: 'https://picsum.photos/seed/dragon/400/600', genre: 'Fantasy', reads: 18777, chapters: 30, tags: ['High Fantasy', 'Magic', 'Dragons', 'Coming of Age'], slug: 'dragons-heir', dataAiHint: 'fantasy dragon magic book cover detail' },
     { id: '6', title: 'City of Neon Dreams', author: { name: 'Jax Ryder', id: 'jax-ryder' }, description: 'A detective navigates the rain-slicked streets of a futuristic city to solve a complex case involving rogue AI and corporate espionage.', coverImageUrl: 'https://picsum.photos/seed/neon/400/600', genre: 'Cyberpunk', reads: 7500, chapters: 20, tags: ['Dystopian', 'Noir', 'Technology', 'Investigation'], slug: 'city-of-neon-dreams', dataAiHint: 'cyberpunk detective book cover detail' },
      { id: '7', title: 'Beneath the Willow Tree', author: { name: 'Clara Meadows', id: 'clara-meadows' }, description: 'A heartwarming tale of friendship and finding home in the most unexpected places.', coverImageUrl: 'https://picsum.photos/seed/willow/400/600', genre: 'Contemporary', reads: 15200, chapters: 22, tags: ['Friendship', 'Slice of Life', 'Rural'], slug: 'beneath-the-willow-tree', dataAiHint: 'contemporary friendship book cover detail' },
      { id: '8', title: 'The Alchemist\'s Secret', author: { name: 'Marcus Thorne', id: 'marcus-thorne' }, description: 'Unraveling a centuries-old mystery, a historian discovers the key to eternal life... or eternal damnation.', coverImageUrl: 'https://picsum.photos/seed/alchemist/400/600', genre: 'Thriller', reads: 9850, chapters: 35, tags: ['Historical Thriller', 'Alchemy', 'Conspiracy'], slug: 'the-alchemists-secret', dataAiHint: 'thriller historical mystery book cover detail' },
      { id: '9', title: 'Academy of Shadows', author: { name: 'Nyx Sterling', id: 'nyx-sterling' }, description: 'At a school for the magically gifted, dark secrets and dangerous rivalries threaten to consume a new student.', coverImageUrl: 'https://picsum.photos/seed/academy/400/600', genre: 'Urban Fantasy', reads: 11300, chapters: 28, tags: ['Magic School', 'Young Adult', 'Paranormal'], slug: 'academy-of-shadows', dataAiHint: 'urban fantasy magic school book cover detail' },
       { id: '10', title: 'The Last Stand', author: { name: 'General Rex', id: 'general-rex' }, description: 'Outnumbered and outgunned, a squad of soldiers must hold the line against overwhelming odds.', coverImageUrl: 'https://picsum.photos/seed/laststand/400/600', genre: 'Military Fiction', reads: 6100, chapters: 18, tags: ['War', 'Action', 'Survival'], slug: 'the-last-stand', dataAiHint: 'military action war book cover detail' },
       { id: '11', title: 'Poetry for the Soul', author: { name: 'Luna Whisperwind', id: 'luna-whisperwind' }, description: 'A collection of verses exploring love, loss, and the beauty found in everyday moments.', coverImageUrl: 'https://picsum.photos/seed/poetry/400/600', genre: 'Poetry', reads: 25000, chapters: 50, tags: ['Emotional', 'Reflective', 'Verse'], slug: 'poetry-for-the-soul', dataAiHint: 'poetry collection book cover detail' },
       { id: '12', title: 'Werewolf Next Door', author: { name: 'Fang Nightshade', id: 'fang-nightshade' }, description: 'Moving to a new town is hard, especially when your neighbor howls at the moon.', coverImageUrl: 'https://picsum.photos/seed/werewolf/400/600', genre: 'Paranormal Romance', reads: 17800, chapters: 32, tags: ['Werewolf', 'Romance', 'Humor'], slug: 'werewolf-next-door', dataAiHint: 'paranormal romance werewolf book cover detail' },
   ];

   const story = mockStories.find(s => s.slug === slug);

  if (!story) {
    return null;
  }

  // Add mock chapter data and other details
  const chaptersData = Array.from({ length: story.chapters }, (_, i) => ({
    id: `ch-${story.id}-${i + 1}`,
    title: i === 0 ? `Chapter 1: The Beginning` : `Chapter ${i + 1}: ${['Unexpected Turn', 'Rising Action', 'A New Clue', 'Confrontation', 'Secrets Revealed', 'The Plot Twist'][i % 6]}`,
  }));
  const authorFollowers = Math.floor(Math.random() * 5000) + 50;
  const status = story.chapters > 30 ? 'Ongoing' : 'Completed';
  const lastUpdated = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  const averageRating = Math.random() * 1.5 + 3.5; // Mock rating between 3.5 and 5
  const totalRatings = Math.floor(Math.random() * 500) + 10;


  return { ...story, chaptersData, authorFollowers, status, lastUpdated, averageRating, totalRatings, comments: [] }; // Add empty comments array
};

interface StoryPageProps {
  params: {
    slug: string;
  };
}

const StoryDetailPage: NextPage<StoryPageProps> = ({ params }) => {
  const { user, isLoading: authLoading } = useAuth(); // Get user state
  const { toast } = useToast(); // Initialize toast
  const [story, setStory] = useState<StoryDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [rating, setRating] = useState(0); // User's rating for the *overall story*
  const [isInLibrary, setIsInLibrary] = useState(false); // Placeholder state


  // Fetch story data
  useEffect(() => {
    const fetchStory = async () => {
      setIsLoading(true);
      const data = await getStoryBySlug(params.slug);
      setStory(data);
      setIsLoading(false);
       // TODO: Check if story is in user's library after fetching user/story
       // setIsInLibrary(checkIfInLibrary(user, data));
    };
    fetchStory();
  }, [params.slug]);

  // Handle comment submission (placeholder)
  const handleCommentSubmit = () => {
      if (!user) {
         toast({ title: "Login Required", description: "Please log in to leave a comment.", variant: "destructive" });
         return;
      }
      // Validate comment
       const validationError = validateCommentData({ text: commentText });
       if (validationError) {
           toast({ title: "Validation Error", description: validationError, variant: "destructive" });
           return;
       }

      console.log(`Submitting comment for story ${story?.title}:`, commentText);
      // Add actual comment submission logic here (API call)
       toast({ title: "Comment Posted (Simulated)", description: "Your comment has been added." });
      setCommentText('');
  };

  // Handle overall story rating submission (placeholder)
   const handleRateStory = (newRating: number) => {
       if (!user) {
           toast({ title: "Login Required", description: "Please log in to rate.", variant: "destructive" });
           return;
       }
        // Validate rating
        const validationError = validateRatingData({ rating: newRating });
        if (validationError) {
            toast({ title: "Validation Error", description: validationError, variant: "destructive" });
            return;
        }

       setRating(newRating);
       console.log(`Submitting overall rating for story ${story?.title}:`, newRating);
       // Add actual rating submission logic here (API call)
       toast({ title: "Rating Submitted (Simulated)", description: `You rated this story ${newRating} stars.` });
   };

   // Handle Share (placeholder)
   const handleShareStory = () => {
      console.log("Sharing story:", story?.title);
      // Implement actual sharing logic
      toast({ title: "Share Feature (Coming Soon)", description: "Sharing options will be available here." });
   };

    // Handle Add/Remove from Library (placeholder)
   const handleToggleLibrary = () => {
       if (!user) {
           toast({ title: "Login Required", description: "Please log in to manage your library.", variant: "destructive" });
           return;
       }
       console.log(isInLibrary ? "Removing from library" : "Adding to library");
       // Add actual API call here
        toast({ title: `Story ${isInLibrary ? 'Removed From' : 'Added To'} Library (Simulated)` });
       setIsInLibrary(!isInLibrary);
   };


  // Loading state
  if (isLoading || authLoading) {
     return <div className="text-center py-20">Loading story details...</div>;
  }

  if (!story) {
    // Handle story not found
    return <div className="text-center py-20">Story not found.</div>;
  }

  // Calculate average rating display
   const displayRating = story.averageRating ? story.averageRating.toFixed(1) : 'N/A';
   const fullStars = Math.floor(story.averageRating || 0);
   const hasHalfStar = (story.averageRating || 0) % 1 >= 0.5;


  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

      {/* Left Column (on large screens): Cover, Actions, Details */}
      <div className="lg:col-span-4 xl:col-span-3 space-y-6">
        {/* Sticky container */}
        <div className="sticky top-20 space-y-6">
          <Card className="overflow-hidden shadow-lg border border-border/80">
            <div className="relative aspect-[2/3] w-full">
              <Image
                src={story.coverImageUrl}
                alt={`Cover for ${story.title}`}
                fill
                sizes="(max-width: 1024px) 100vw, 33vw"
                className="object-cover"
                priority
                data-ai-hint={story.dataAiHint || "book cover story detail"}
              />
            </div>
          </Card>

          <div className="flex flex-col gap-3">
             <Button size="lg" asChild className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-base font-semibold">
               <Link href={`/read/${story.slug}/1`}>
                 <BookOpen className="mr-2 h-5 w-5" /> Read First Chapter
               </Link>
             </Button>
             <Button
                variant={isInLibrary ? "secondary" : "outline"}
                size="lg"
                className="w-full text-base font-semibold"
                onClick={handleToggleLibrary}
                disabled={!user} // Disable if logged out
             >
               {isInLibrary ? (
                  <>
                    <CheckCircle className="mr-2 h-5 w-5 text-green-600" /> In Your Library
                  </>
                ) : (
                  <>
                    <PlusCircle className="mr-2 h-5 w-5" /> Add to Library
                  </>
                )}
                 {!user && <span className="text-xs ml-2">(Log in)</span>}
             </Button>
          </div>

          {/* Story Stats Card */}
          <Card className="border border-border/80">
            <CardContent className="p-4 space-y-3 text-sm">
               {/* Reads, Votes, Parts */}
               <div className="flex items-center justify-between">
                   <span className="text-muted-foreground font-medium flex items-center gap-2"><Eye className="w-4 h-4" /> Reads</span>
                   <span className="font-bold">{story.reads.toLocaleString()}</span>
               </div>
               <Separator />
               <div className="flex items-center justify-between">
                  <span className="text-muted-foreground font-medium flex items-center gap-2"><ThumbsUp className="w-4 h-4" /> Votes</span>
                  <span className="font-bold">{(story.reads / 10).toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                </div>
               <Separator />
               <div className="flex items-center justify-between">
                   <span className="text-muted-foreground font-medium flex items-center gap-2"><List className="w-4 h-4" /> Parts</span>
                   <span className="font-bold">{story.chapters}</span>
               </div>
               <Separator />
                {/* Rating */}
                <div className="flex items-center justify-between">
                    <span className="text-muted-foreground font-medium flex items-center gap-2"><Star className="w-4 h-4" /> Rating</span>
                    <div className="flex items-center gap-1">
                        <span className="font-bold">{displayRating}</span>
                        <span className="text-xs text-muted-foreground">({story.totalRatings})</span>
                    </div>
                </div>
                <Separator />
                {/* Status & Updated */}
                 <div className="flex items-center justify-between">
                   <span className="text-muted-foreground font-medium">Status</span>
                    <Badge variant={story.status === 'Completed' ? "secondary" : "outline"} className={story.status === 'Completed' ? "text-green-700 border-green-300 bg-green-50" : "text-blue-700 border-blue-300 bg-blue-50"}>
                     {story.status}
                   </Badge>
                 </div>
                 <Separator />
                 <div className="flex items-center justify-between">
                   <span className="text-muted-foreground font-medium">Updated</span>
                   <span className="font-semibold">{story.lastUpdated}</span>
                 </div>
            </CardContent>
          </Card>

          {/* Tags Card */}
          {story.tags && story.tags.length > 0 && (
            <Card className="border border-border/80">
                <CardHeader className="p-4 pb-2">
                   <CardTitle className="text-base font-semibold">Tags</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                    <div className="flex flex-wrap gap-2">
                      {story.tags.map(tag => (
                        <Link key={tag} href={`/browse?tags=${encodeURIComponent(tag)}`}>
                          <Badge variant="secondary" className="cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors">
                            #{tag.toLowerCase()}
                          </Badge>
                        </Link>
                      ))}
                    </div>
                </CardContent>
             </Card>
          )}
           {/* Share Button */}
           <Button variant="outline" className="w-full" onClick={handleShareStory}>
              <Share2 className="mr-2 h-4 w-4" /> Share Story
           </Button>
        </div>
      </div>


      {/* Right Column: Title, Author, Desc, Chapters, Comments */}
      <div className="lg:col-span-8 xl:col-span-9 space-y-8">
        {/* Title, Author, Rating */}
        <div className="space-y-3">
          <h1 className="text-3xl md:text-4xl font-bold leading-tight text-foreground">{story.title}</h1>
           {/* Author Info */}
           <div className="flex items-center gap-3">
              <Link href={`/user/${story.author.id}`} className="flex items-center gap-3 group">
                 <Avatar className="h-11 w-11 border-2 border-border group-hover:border-primary transition-colors">
                    <AvatarImage src={story.author.avatarUrl || `https://picsum.photos/seed/${story.author.name}/100/100`} alt={story.author.name} data-ai-hint="author profile picture large" />
                     <AvatarFallback>{story.author.name.substring(0, 1).toUpperCase()}</AvatarFallback>
                 </Avatar>
                 <div>
                    <p className="font-semibold text-lg group-hover:text-primary transition-colors">{story.author.name}</p>
                    <p className="text-sm text-muted-foreground">{story.authorFollowers.toLocaleString()} Followers</p>
                </div>
              </Link>
              {/* Follow Button Placeholder */}
               {user && user.id !== story.author.id && ( // Don't show follow for self
                  <Button variant="outline" size="sm" className="ml-4">Follow</Button>
               )}
           </div>
            {/* Overall Story Rating Input */}
            <div className="flex items-center gap-2 pt-2">
                 <span className="text-sm font-medium text-muted-foreground">Your Rating:</span>
                 {[1, 2, 3, 4, 5].map((star) => (
                     <Button
                         key={star}
                         variant="ghost"
                         size="icon"
                         onClick={() => handleRateStory(star)}
                         disabled={!user}
                         className={`h-7 w-7 p-0 ${!user ? 'cursor-not-allowed opacity-50' : ''}`}
                         aria-label={`Rate story ${star} stars`}
                     >
                         <Star
                             className={`h-5 w-5 transition-colors ${
                                 star <= rating
                                 ? 'fill-primary text-primary'
                                 : 'text-muted-foreground/50'
                             } ${user ? 'hover:text-primary/80' : ''}`}
                         />
                     </Button>
                 ))}
                 {!user && <Link href="/login" className="text-xs text-primary underline ml-1">Log in to rate</Link>}
            </div>
        </div>

        {/* Story Description */}
        <Card className="border border-border/80 shadow-sm">
           <CardContent className="p-5">
             <p className="text-base md:text-lg leading-relaxed whitespace-pre-line text-foreground/90">{story.description}</p>
           </CardContent>
        </Card>


        {/* Table of Contents */}
        <Card id="chapters" className="border border-border/80 shadow-sm scroll-mt-20">
          <CardHeader className="border-b border-border/80">
            <CardTitle className="flex items-center gap-2 text-xl font-semibold">
               <List className="w-5 h-5" /> Table of Contents ({story.chapters} Parts)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
             <ul className="divide-y divide-border/60">
               {story.chaptersData.map((chapter, index) => (
                  <li key={chapter.id}>
                     <Link href={`/read/${story.slug}/${index + 1}`} className="flex justify-between items-center p-4 hover:bg-secondary transition-colors duration-150 group">
                       <span className="font-medium group-hover:text-primary">{chapter.title}</span>
                       <span className="text-sm text-muted-foreground"></span>
                     </Link>
                  </li>
               ))}
             </ul>
          </CardContent>
        </Card>

         {/* Comments Section */}
         <Card className="border border-border/80 shadow-sm">
             <CardHeader className="border-b border-border/80">
                <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                  <MessageSquare className="w-5 h-5" /> Comments
                </CardTitle>
             </CardHeader>
             <CardContent className="p-5 space-y-6">
                 {user ? (
                     <div className="flex gap-3 items-start">
                         <Avatar className="mt-1">
                           <AvatarImage src={user.avatarUrl || undefined} alt={user.name || 'User'} data-ai-hint="user avatar comment"/>
                           <AvatarFallback>{user.name?.substring(0, 1).toUpperCase() || 'U'}</AvatarFallback>
                          </Avatar>
                         <div className="flex-1 space-y-2">
                             <Textarea
                                 placeholder="Add a comment about the story..."
                                 value={commentText}
                                 onChange={(e) => setCommentText(e.target.value)}
                                 rows={3}
                                 className="w-full"
                             />
                             <Button onClick={handleCommentSubmit} size="sm" disabled={commentText.trim() === ''}>
                               <Send className="h-4 w-4 mr-1" /> Post Comment
                             </Button>
                         </div>
                     </div>
                 ) : (
                     <div className="text-center p-4 border border-dashed rounded-md">
                         <p className="text-muted-foreground">
                            <Link href="/login" className="text-primary font-medium underline">Log in</Link> or{' '}
                            <Link href="/signup" className="text-primary font-medium underline">Sign up</Link> to leave a comment.
                         </p>
                     </div>
                 )}

                 {/* Display existing comments */}
                 <div className="space-y-4 pt-4">
                    <p className="text-center text-sm text-muted-foreground italic">Story comments coming soon.</p>
                    {/* Map through actual story.comments array here */}
                 </div>
             </CardContent>
         </Card>
      </div>
    </div>
  );
};



export default StoryDetailPage;
