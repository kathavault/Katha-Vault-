// src/app/read/[slug]/[chapter]/page.tsx
"use client";

import type { NextPage } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, List, Settings, MessageSquare, BookOpenText, Share2, Star, ThumbsUp, Send, Loader2 } from 'lucide-react'; // Added icons & Loader2
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Progress } from "@/components/ui/progress"; // Added Progress bar
import React, { useEffect, useState, Suspense } from 'react'; // Import React and hooks
import { useAuth } from '@/hooks/use-auth'; // Import useAuth hook
import { Textarea } from '@/components/ui/textarea'; // Import Textarea
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Import Card components
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'; // For comment display
import { useToast } from '@/hooks/use-toast'; // Import useToast
import { validateCommentData, validateRatingData } from '@/services/validationService'; // Import validation functions
import { fetchChapterDetails, submitComment, submitRating } from '@/lib/readerService'; // Import reader-specific services

// Define the shape of detailed chapter data fetched from the backend
interface ChapterDetails {
  title: string;
  content: string;
  storyTitle: string;
  storyAuthor: string;
  totalChapters: number;
  storyId: string; // Needed for submitting comments/ratings specific to the story
  chapterId: string; // Needed for submitting comments/ratings specific to the chapter
  comments?: CommentData[]; // Optional comments array
  userRating?: number; // User's existing rating for this chapter (0 if none)
  // Add other relevant fields fetched like average rating for chapter etc.
}

// Define the shape of a comment
interface CommentData { 
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string | null;
  text: string;
  timestamp: Date; // Use Date object
}

interface ReadPageProps {
  params: {
    slug: string;
    chapter: string; // Chapter number as string initially
  };
}

// Basic content formatting (can be enhanced)
const formatContent = (text: string): React.ReactNode => {
  const paragraphs = text.trim().split(/\n\s*\n/);
  return paragraphs.map((p, i) => { 
    let content: string = p;
    content = p.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    content = content.replace(/\*(.*?)\*/g, '<em>$1</em>');
    if (p.startsWith('&gt; ')) return <blockquote key={i} className="pl-4 italic border-l-4 my-4">{p.substring(2)}</blockquote>;
    if (p === '---') return <hr key={i} className="my-6" />;

      const lines = p.split('\n').map((line, lineIndex) => (
      <React.Fragment key={lineIndex}>
        {line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>')}
        {lineIndex < p.split('\n').length - 1 && <br />}

      </React.Fragment>
    ));
    return <p key={i} dangerouslySetInnerHTML={{ __html: lines.join('') }}></p>;
  });
};

const ReadingPage: NextPage<ReadPageProps> = ({ params }) => {
  const { slug } = params;
  const chapterNumber = parseInt(params.chapter, 10);
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [chapterData, setChapterData] = useState&lt;ChapterDetails | null&gt;(null);
  const [isLoading, setIsLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [rating, setRating] = useState(0); // User's current rating selection
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [comments, setComments] = useState<CommentData[]>([]); // Local state for comments


  useEffect(() => {
    const fetchChapter = async () => {
      if (isNaN(chapterNumber) || chapterNumber < 1) {
        setChapterData(null)
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const data = await fetchChapterDetails(slug, chapterNumber);
        setChapterData(data);
        setRating(data?.userRating || 0); // Set initial rating based on fetched data
        setComments(data?.comments || []); // Set initial comments
      } catch (error) {
        console.error("Error fetching chapter details:", error);
        setChapterData(null); // Handle fetch error
        toast({
          title: "Error Loading Chapter",
          description: "Could not load the chapter content. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchChapter();
  }, [slug, chapterNumber, toast]); // Add toast to dependency array

  const handleCommentSubmit = async () => {
    if (!user || !chapterData) {
      toast({ title: "Login Required", description: "Please log in to leave a comment.", variant: "destructive" });
      return;
    }
    const validationError = validateCommentData({ text: commentText });
    if (validationError) {
      toast({ title: "Validation Error", description: validationError, variant: "destructive" });
      return;
    }


        setIsSubmittingComment(true);
    try {
      const newComment = await submitComment({
        storyId: chapterData.storyId,
        chapterId: chapterData.chapterId, // Assuming chapterId is fetched
        userId: user.id,
        text: commentText,
      });

      // Add the new comment to the local state immediately for optimistic update
      setComments(prevComments => [{
        id: newComment.id, // Use the ID returned from the service
        userId: user.id,
        userName: user.name || 'User',
        userAvatar: user.avatarUrl,
        text: commentText,
        timestamp: new Date() // Use current time for optimistic update
      }, ...prevComments]);

      toast({ title: "Comment Posted", description: "Your comment has been added." });
      setCommentText(''); // Clear input
    } catch (error) {
      console.error("Error submitting comment:", error);
      toast({ title: "Error Posting Comment", description: "Could not post your comment. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleRate = async (newRating: number) => {
    if (!user || !chapterData || isSubmittingRating) {
      if (!user) {
        toast({ title: "Login Required", description: "Please log in to rate.", variant: "destructive" });
      }
      return;
    }
    const validationError = validateRatingData({ rating: newRating });
    if (validationError) {
      toast({ title: "Validation Error", description: validationError, variant: "destructive" });
      return;
    }

    setIsSubmittingRating(true);
    const previousRating = rating; // Store previous rating in case of failure
    setRating(newRating); // Optimistic UI update

    try {
      await submitRating({
        storyId: chapterData.storyId,
        chapterId: chapterData.chapterId, // Assuming chapterId is available
        userId: user.id,
        rating: newRating,
      });
      toast({ title: "Rating Submitted", description: `You rated this chapter ${newRating} stars.` });
    } catch (error) {
      console.error("Error submitting rating:", error);
      toast({ title: "Error Submitting Rating", description: "Could not save your rating. Please try again.", variant: "destructive" });
      setRating(previousRating); // Revert optimistic update on failure
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const handleShare = () => {
    console.log("Sharing chapter:", chapterData?.title);
    // TODO: Implement actual sharing logic (e.g., Web Share API)
    toast({ title: "Share Feature (Coming Soon)", description: "Sharing options will be available here." });
  };

  if (isLoading || authLoading) {
    return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!chapterData) {
    return (
        
      <div className="text-center py-20 flex flex-col items-center gap-4">
        <p className="text-xl text-destructive">
        </p>
        <p className="text-muted-foreground">
          {isNaN(chapterNumber) || chapterNumber &lt; 1
            ? 'The chapter number specified in the URL is not valid.'
            : "We couldn't find the chapter you were looking for."
          }
        </p>
        <Button variant="outline" asChild>
          <Link href={slug ? `/story/${slug}` : '/browse'}>Go to Story Details</Link>
        </Button>
    </div>
    );
  }

  const { title, content, storyTitle, storyAuthor, totalChapters } = chapterData;
  const hasPreviousChapter = chapterNumber > 1;
  const hasNextChapter = chapterNumber < totalChapters;
  const progress = Math.round((chapterNumber / totalChapters) * 100);

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-40 w-full border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75 shadow-sm">
        <div className="container flex h-14 items-center justify-between px-4 md:px-6 gap-2">
          <div className="flex items-center gap-1 md:gap-2">
            <Button variant="ghost" size="icon" asChild disabled={!hasPreviousChapter}>
              <Link href={hasPreviousChapter ? `/read/${slug}/${chapterNumber - 1}` : '#'} aria-label="Previous Chapter" className={!hasPreviousChapter ? 'opacity-50 cursor-not-allowed' : 'hover:text-primary'}>
                <ChevronLeft className="h-5 w-5" />
              </Link>
            </Button>
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
          <div className="flex items-center gap-1 md:gap-2">
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
            <Button variant="ghost" size="icon" onClick={handleShare}>
              <Share2 className="h-5 w-5" />
              <span className="sr-only">Share</span>
            </Button>
            <Button variant="ghost" size="icon" asChild disabled={!hasNextChapter}>
              <Link href={hasNextChapter ? `/read/${slug}/${chapterNumber + 1}` : '#'} aria-label="Next Chapter" className={!hasNextChapter ? 'opacity-50 cursor-not-allowed' : 'hover:text-primary'}>
                <ChevronRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
        <Progress value={progress} className="w-full h-1 rounded-none" />
      </header>

      <main className="flex-grow container max-w-3xl mx-auto px-4 py-8 md:py-12">
        <article className="prose prose-lg dark:prose-invert max-w-none prose-p:text-foreground/90 prose-strong:text-foreground" style={{ fontFamily: "'Georgia', 'Times New Roman', Times, serif", lineHeight: '1.8' }}>
          {formatContent(content)}
        </article>
      </main>

      <footer className="w-full border-t bg-secondary/50 mt-8 py-6">
        <div className="container max-w-3xl mx-auto px-4 space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Rate this chapter</h3>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Button
                  key={star}
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRate(star)}
                  disabled={!user || isSubmittingRating}
                  className={`h-8 w-8 p-0 ${!user ? 'cursor-not-allowed opacity-50' : ''}`}
                  aria-label={`Rate ${star} stars`}>
                  <Star
                    className={`h-6 w-6 transition-colors ${star <= rating ? 'fill-primary text-primary' : 'text-muted-foreground/50'} ${user ? 'hover:text-primary/80' : ''}`}
                  />
                </Button>
              ))}
              {isSubmittingRating && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground ml-2" />}
            </div>
            {!user && <p className="text-xs text-muted-foreground mt-1">You must be logged in to rate.</p>}
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" /> Comments ({comments.length})
            </h3>
            {user ? (
              <div className="space-y-4">
                <div className="flex gap-3 items-start">
                  <Avatar className="mt-1">
                    <AvatarImage src={user.avatarUrl || undefined} alt={user.name || 'User'} data-ai-hint="user avatar small" />
                    <AvatarFallback>{user.name?.substring(0, 1).toUpperCase() || 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <Textarea
                      placeholder="Add your comment..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      rows={3}
                      className="w-full"
                      disabled={isSubmittingComment}
                    />
                    <Button onClick={handleCommentSubmit} size="sm" disabled={commentText.trim() === '' || isSubmittingComment}>
                      {isSubmittingComment ? <Loader2 className="h-4 w-4 mr-1 animate-spin"/> : <Send className="h-4 w-4 mr-1" />}
                      Post Comment
                    </Button>
                  </div>
                </div>
                <div className="space-y-4 pt-4">
                  {comments.length === 0 && (
                    <p className="text-center text-sm text-muted-foreground italic">No comments yet. Be the first!</p>
                  )}
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3 items-start">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={comment.userAvatar || undefined} alt={comment.userName || 'User'} data-ai-hint="commenter avatar" />
                        <AvatarFallback>{comment.userName?.substring(0, 1).toUpperCase() || 'U'}</AvatarFallback>
                      </Avatar>
                      <div className="p-3 rounded-md bg-background border w-full">
                        <p className="font-semibold text-sm">{comment.userName}</p>
                        <p className="text-sm text-foreground/80 mt-1 whitespace-pre-line">{comment.text}</p>
                        <p className="text-xs text-muted-foreground mt-2">{new Date(comment.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
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

          <Separator className="mt-8" />
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

// Wrap with Suspense for client components that might use hooks like useSearchParams
const SuspendedReadingPage: NextPage<ReadPageProps> = (props) => (
  <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <ReadingPage {...props} />
  </Suspense>
);


export default SuspendedReadingPage;
