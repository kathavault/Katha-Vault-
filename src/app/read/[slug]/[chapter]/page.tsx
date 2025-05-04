// src/app/read/[slug]/[chapter]/page.tsx
"use client";

import type { NextPage } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, List, Settings, MessageSquare, BookOpenText, Share2, Star, ThumbsUp, Send } from 'lucide-react'; // Added icons
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress"; // Added Progress bar
import React, { useEffect, useState } from 'react'; // Import React and hooks
import { useAuth } from '@/hooks/use-auth'; // Import useAuth hook
import { Textarea } from '@/components/ui/textarea'; // Import Textarea
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Import Card components
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'; // For comment display
import { useToast } from '@/hooks/use-toast'; // Import useToast
import { validateCommentData, validateRatingData } from '@/services/validationService'; // Import validation functions

// Mock data structure (keep for now, will replace with actual fetching)
interface ChapterData {
  title: string;
  content: string;
  storyTitle: string;
  storyAuthor: string;
  totalChapters: number;
}

// Mock data - replace with actual chapter content fetching
const getChapterContent = async (slug: string, chapterNumber: number): Promise<ChapterData | null> => {
  console.log("Fetching chapter content for:", slug, "Chapter:", chapterNumber);
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 50));

  // Mock story details (should be fetched alongside chapter)
   const mockStories = [
      { slug: 'the-crimson-cipher', title: "The Crimson Cipher", author: "Alex Quill", totalChapters: 25 },
      { slug: 'echoes-of-starlight', title: "Echoes of Starlight", author: "Seraphina Moon", totalChapters: 40 },
      { slug: 'whispers-in-the-mist', title: "Whispers in the Mist", author: "Rowan Vale", totalChapters: 15 },
      // Add other stories if needed to match slugs
   ];

   const story = mockStories.find(s => s.slug === slug);

   if (!story || chapterNumber < 1 || chapterNumber > story.totalChapters) {
      return null; // Story or chapter out of range
   }


    return {
      storyTitle: story.title,
      storyAuthor: story.author,
      title: `Chapter ${chapterNumber}: The ${['Journey Unfolds', 'Plot Thickens', 'Danger Mounts', 'Secret Revealed', 'Turning Point', 'Climax Approaches'][chapterNumber % 6]}`, // More varied titles
      // More extensive and formatted mock content
      content: `
This is the dynamic content for **Chapter ${chapterNumber}** of *${story.title}*. The adventure continues, pushing our heroes further into the unknown.

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

> A quote or important thought might appear here. Like a sudden realization or a foreboding warning uttered by a character.

Paragraph two starts here, perhaps introducing a new challenge or character interaction. Curabitur pretium tincidunt lacus. Nulla gravida orci a odio. Nullam varius, turpis et commodo pharetra, est eros bibendum elit, nec luctus magna felis sollicitudin mauris. Integer in mauris eu nibh euismod gravida. Duis ac tellus et risus vulputate vehicula.

* Emphasized text or thoughts might be italicized.
* Bullet points could be used for lists or plans.
  * Nested points are possible too.

Donec lobortis risus a elit. Etiam tempor. Ut ullamcorper, ligula eu tempor congue, eros est euismod turpis, id tincidunt sapien risus a quam. Maecenas fermentum consequat mi. Donec fermentum. Pellentesque malesuada nulla a mi. Duis sapien sem, aliquet nec, commodo eget, consequat quis, neque.

---

A horizontal rule could signify a scene break or a shift in perspective.

Aliquam faucibus, elit ut dictum aliquet, felis nisl adipiscing sapien, sed malesuada diam lacus eget erat. Cras mollis scelerisque nunc. Nullam arcu. Aliquam erat volutpat. Duis ac turpis. Integer rutrum ante eu lacus.

**Bold text** can be used for emphasis or headings within the text if needed, though semantic HTML (like actual headings if applicable within a chapter's structure) is often better.

And a final paragraph for good measure, bringing this part of the chapter to a close, perhaps with a cliffhanger or a moment of reflection. Vestibulum libero nisl, porta vel, scelerisque eget, malesuada at, neque. Vivamus eget nibh. Etiam cursus leo vel metus. Nulla facilisi. Aenean nec eros. The end of chapter ${chapterNumber} leaves the reader wanting more.
      `,
       totalChapters: story.totalChapters,
    };
};

interface ReadPageProps {
  params: {
    slug: string;
    chapter: string; // Chapter number as string initially
  };
}

// Helper function to format content (keep basic version)
const formatContent = (text: string): React.ReactNode => {
   // Basic replacements - VERY limited markdown support
   const paragraphs = text.trim().split(/\n\s*\n/); // Split by double newlines
   return paragraphs.map((p, i) => {
     let content: React.ReactNode = p;
     // Simple bold/italic - can be improved significantly
     content = p.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
     content = (content as string).replace(/\*(.*?)\*/g, '<em>$1</em>'); // Cast needed here
     // Basic blockquote
     if (p.startsWith('> ')) {
       return <blockquote key={i} className="pl-4 italic border-l-4 my-4">{p.substring(2)}</blockquote>;
     }
     // Basic horizontal rule
     if (p === '---') {
       return <hr key={i} className="my-6" />;
     }
     // Handle list items (very basic)
     if (p.startsWith('* ')) {
        const listItems = [p];
        let j = i + 1;
        while (j < paragraphs.length && paragraphs[j].startsWith('* ')) {
          listItems.push(paragraphs[j]);
          j++;
        }
        i = j - 1;

        return (
          <ul key={i} className="list-disc pl-6 my-4">
            {listItems.map((item, itemIndex) => (
              <li key={itemIndex}>{item.substring(2)}</li>
            ))}
          </ul>
        );
     }

     // Insert <br /> for single newlines within a paragraph block for poetry etc.
     const lines = p.split('\n').map((line, lineIndex) => (
       <React.Fragment key={lineIndex}>
         {line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>')}
         {lineIndex < p.split('\n').length - 1 && <br />}
       </React.Fragment>
     ));

     return <p key={i}>{lines}</p>; // Safer approach
   });
};

const ReadingPage: NextPage<ReadPageProps> = ({ params }) => {
  const { slug } = params;
  const chapterNumber = parseInt(params.chapter, 10);
  const { user, isLoading: authLoading } = useAuth(); // Get user state
  const { toast } = useToast(); // Initialize toast
  const [chapterData, setChapterData] = useState<ChapterData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [commentText, setCommentText] = useState(''); // State for comment input
  const [rating, setRating] = useState(0); // State for rating (0-5)

  // Fetch chapter data on mount or when params change
   useEffect(() => {
    const fetchChapter = async () => {
      if (isNaN(chapterNumber) || chapterNumber < 1) {
        setChapterData(null); // Set to null for invalid chapter
         setIsLoading(false);
        return;
      }
      setIsLoading(true);
      const data = await getChapterContent(slug, chapterNumber);
      setChapterData(data);
      setIsLoading(false);
    };
    fetchChapter();
  }, [slug, chapterNumber]);

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

      console.log(`Submitting comment for chapter ${chapterNumber}:`, commentText);
      // Add actual comment submission logic here (API call)
      toast({ title: "Comment Posted (Simulated)", description: "Your comment has been added." });
      setCommentText(''); // Clear input after submit
  };

   // Handle rating submission (placeholder)
   const handleRate = (newRating: number) => {
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
       console.log(`Submitting rating for chapter ${chapterNumber}:`, newRating);
       // Add actual rating submission logic here (API call)
       toast({ title: "Rating Submitted (Simulated)", description: `You rated this chapter ${newRating} stars.` });
   };

    // Handle Share (placeholder)
   const handleShare = () => {
      console.log("Sharing chapter:", chapterData?.title);
      // Implement actual sharing logic (e.g., using Web Share API or social links)
      toast({ title: "Share Feature (Coming Soon)", description: "Sharing options will be available here." });
   };


  // Loading state while fetching chapter or checking auth
  if (isLoading || authLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!chapterData) {
     // Handle invalid chapter number or chapter not found
     return (
       <div className="text-center py-20 flex flex-col items-center gap-4">
         <p className="text-xl text-destructive">
             {isNaN(chapterNumber) || chapterNumber < 1 ? "Invalid Chapter Number" : "Chapter Not Found"}
         </p>
         <p className="text-muted-foreground">
            {isNaN(chapterNumber) || chapterNumber < 1
                ? "The chapter number specified in the URL is not valid."
                : "We couldn't find the chapter you were looking for."
            }
          </p>
         <Button variant="outline" asChild>
            <Link href={`/story/${slug}`}>Go to Story Details</Link>
          </Button>
       </div>
     );
  }

  const { title, content, storyTitle, storyAuthor, totalChapters } = chapterData;
  const hasPreviousChapter = chapterNumber > 1;
  const hasNextChapter = chapterNumber < totalChapters;
  const progress = Math.round((chapterNumber / totalChapters) * 100);

  return (
    <div className="flex flex-col min-h-screen"> {/* Ensure full height */}
       {/* Reading Header - Sticky */}
       <header className="sticky top-0 z-40 w-full border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75 shadow-sm">
         <div className="container flex h-14 items-center justify-between px-4 md:px-6 gap-2">
           {/* Left: Previous Chapter & Story Info Dropdown */}
           <div className="flex items-center gap-1 md:gap-2">
             <Button variant="ghost" size="icon" asChild disabled={!hasPreviousChapter}>
                <Link href={hasPreviousChapter ? `/read/${slug}/${chapterNumber - 1}` : '#'} aria-label="Previous Chapter" className={!hasPreviousChapter ? 'opacity-50 cursor-not-allowed' : 'hover:text-primary'}>
                  <ChevronLeft className="h-5 w-5" />
                </Link>
             </Button>
              {/* Story Title Dropdown */}
              <DropdownMenu>
                 <DropdownMenuTrigger asChild>
                   <Button variant="ghost" className="px-2 py-1 h-auto flex items-center gap-1 text-left">
                       <div className="flex flex-col">
                         <span className="text-sm font-medium truncate max-w-[150px] sm:max-w-xs md:max-w-sm">{storyTitle}</span>
                         <span className="text-xs text-muted-foreground truncate">{title}</span>
                       </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    </Button>
                 </DropdownMenuTrigger>
                 <DropdownMenuContent align="start">
                   <DropdownMenuItem asChild>
                     <Link href={`/story/${slug}`} className="flex items-center gap-2">
                        <BookOpenText className="h-4 w-4" /> Story Details
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                     <Link href={`/story/${slug}#chapters`} className="flex items-center gap-2">
                        <List className="h-4 w-4" /> Table of Contents
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled>
                      <span className="text-xs text-muted-foreground">By {storyAuthor}</span>
                    </DropdownMenuItem>
                 </DropdownMenuContent>
               </DropdownMenu>
           </div>

           {/* Right: Actions & Next Chapter */}
           <div className="flex items-center gap-1 md:gap-2">
             {/* Reading Settings */}
             <DropdownMenu>
               <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                      <Settings className="h-5 w-5" />
                      <span className="sr-only">Reading Settings</span>
                    </Button>
               </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                   <DropdownMenuItem>Font Size (Coming Soon)</DropdownMenuItem>
                   <DropdownMenuItem>Theme (Coming Soon)</DropdownMenuItem>
                </DropdownMenuContent>
             </DropdownMenu>

             {/* Share Button */}
              <Button variant="ghost" size="icon" onClick={handleShare}>
                 <Share2 className="h-5 w-5" />
                  <span className="sr-only">Share</span>
              </Button>

             {/* Next Chapter */}
             <Button variant="ghost" size="icon" asChild disabled={!hasNextChapter}>
                <Link href={hasNextChapter ? `/read/${slug}/${chapterNumber + 1}` : '#'} aria-label="Next Chapter" className={!hasNextChapter ? 'opacity-50 cursor-not-allowed' : 'hover:text-primary'}>
                  <ChevronRight className="h-5 w-5" />
                </Link>
             </Button>
           </div>
         </div>
         {/* Progress Bar */}
          <Progress value={progress} className="w-full h-1 rounded-none" />
       </header>

       {/* Chapter Content */}
       <main className="flex-grow container max-w-3xl mx-auto px-4 py-8 md:py-12">
          <article className="prose prose-lg dark:prose-invert max-w-none prose-p:text-foreground/90 prose-strong:text-foreground" style={{fontFamily: "'Georgia', 'Times New Roman', Times, serif", lineHeight: '1.8'}}>
              {formatContent(content)}
          </article>
       </main>

        {/* Interaction Footer (Rating & Comments) */}
        <footer className="w-full border-t bg-secondary/50 mt-8 py-6">
            <div className="container max-w-3xl mx-auto px-4 space-y-6">
                {/* Rating Section */}
                <div>
                    <h3 className="text-lg font-semibold mb-2">Rate this chapter</h3>
                    <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Button
                                key={star}
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRate(star)}
                                disabled={!user} // Disable if not logged in
                                className={`h-8 w-8 p-0 ${!user ? 'cursor-not-allowed opacity-50' : ''}`}
                                aria-label={`Rate ${star} stars`}
                            >
                                <Star
                                    className={`h-6 w-6 transition-colors ${
                                        star <= rating
                                        ? 'fill-primary text-primary' // Use primary color for selected stars
                                        : 'text-muted-foreground/50' // Muted for unselected
                                    } ${user ? 'hover:text-primary/80' : ''}`}
                                />
                            </Button>
                        ))}
                    </div>
                    {!user && <p className="text-xs text-muted-foreground mt-1">You must be logged in to rate.</p>}
                </div>

                <Separator />

                {/* Comments Section */}
                <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                       <MessageSquare className="w-5 h-5" /> Comments
                    </h3>
                    {user ? (
                        <div className="space-y-4">
                        {/* Comment Input Area */}
                        <div className="flex gap-3 items-start">
                             <Avatar className="mt-1">
                                <AvatarImage src={user.avatarUrl || undefined} alt={user.name || 'User'} data-ai-hint="user avatar small"/>
                                <AvatarFallback>{user.name?.substring(0, 1).toUpperCase() || 'U'}</AvatarFallback>
                            </Avatar>
                           <div className="flex-1 space-y-2">
                                <Textarea
                                    placeholder="Add your comment..."
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    rows={3}
                                    className="w-full"
                                />
                                <Button onClick={handleCommentSubmit} size="sm" disabled={commentText.trim() === ''}>
                                    <Send className="h-4 w-4 mr-1"/> Post Comment
                                </Button>
                           </div>
                        </div>
                        {/* Placeholder for existing comments */}
                        <div className="space-y-4 pt-4">
                             <p className="text-center text-sm text-muted-foreground italic">No comments yet. Be the first!</p>
                              {/* Example comment structure (would be mapped from data) */}
                             {/*
                             <div className="flex gap-3 items-start">
                                 <Avatar>...</Avatar>
                                 <div className="p-3 rounded-md bg-background border w-full">
                                     <p className="font-semibold text-sm">Another User</p>
                                     <p className="text-sm text-foreground/80 mt-1">This was a great chapter!</p>
                                     <p className="text-xs text-muted-foreground mt-2">2 days ago</p>
                                 </div>
                             </div>
                             */}
                         </div>
                        </div>
                    ) : (
                        <div className="text-center p-6 border border-dashed rounded-md">
                           <p className="text-muted-foreground">
                             <Link href="/login" className="text-primary font-medium underline">Log in</Link> or{' '}
                             <Link href="/signup" className="text-primary font-medium underline">Sign up</Link> to leave a comment.
                           </p>
                        </div>
                    )}
                </div>

                 {/* Bottom Pagination (Simplified) */}
                 <Separator className="mt-8"/>
                 <div className="flex items-center justify-between pt-4">
                     <Button variant="outline" asChild disabled={!hasPreviousChapter}>
                       <Link href={hasPreviousChapter ? `/read/${slug}/${chapterNumber - 1}` : '#'} className={!hasPreviousChapter ? 'opacity-60 cursor-not-allowed' : ''}>
                          <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                       </Link>
                    </Button>
                    <span className="text-sm text-muted-foreground hidden sm:inline">
                       Chapter {chapterNumber} / {totalChapters}
                    </span>
                    <Button variant="outline" asChild disabled={!hasNextChapter}>
                       <Link href={hasNextChapter ? `/read/${slug}/${chapterNumber + 1}` : '#'} className={!hasNextChapter ? 'opacity-60 cursor-not-allowed' : ''}>
                          Next <ChevronRight className="ml-2 h-4 w-4" />
                       </Link>
                    </Button>
                  </div>
            </div>
        </footer>
    </div>
  );
};

export default ReadingPage;
