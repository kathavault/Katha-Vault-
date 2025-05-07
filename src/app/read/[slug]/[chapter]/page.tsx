// src/app/read/[slug]/[chapter]/page.tsx
"use client";

import type { NextPage } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
<<<<<<< HEAD
import { ChevronLeft, ChevronRight, List, Settings, MessageSquare, BookOpenText, Share2, Star, ThumbsUp, Send, Loader2 } from 'lucide-react';
=======
import { ChevronLeft, ChevronRight, List, Settings, MessageSquare, BookOpenText, Share2, Star, ThumbsUp, Send, Loader2 } from 'lucide-react'; // Added icons & Loader2
>>>>>>> eeac1358d3ae1f112a5aa4ef27eebeb43ae4c6bf
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
<<<<<<< HEAD
} from '@/components/ui/dropdown-menu';
import { Progress } from "@/components/ui/progress";
import React, { useEffect, useState, Suspense, use } from 'react'; // Import use
import { useAuth } from '@/hooks/use-auth';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { validateCommentData, validateRatingData } from '@/services/validationService';
import { fetchChapterDetails, submitComment, submitRating } from '@/lib/readerService';
import type { Timestamp } from 'firebase/firestore';

=======
} from "@/components/ui/dropdown-menu";
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
>>>>>>> eeac1358d3ae1f112a5aa4ef27eebeb43ae4c6bf
interface ChapterDetails {
  title: string;
  content: string;
  storyTitle: string;
  storyAuthor: string;
  totalChapters: number;
<<<<<<< HEAD
  storyId: string;
  chapterId: string;
  comments?: CommentData[];
  userRating?: number;
}

interface CommentData {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string | null;
  text: string;
  timestamp: Date;
}

// Define the shape of the resolved params
interface ReadPageResolvedParams {
  slug: string;
  chapter: string; // Chapter number as string initially
}

// params prop is now a Promise
interface ReadPageProps {
  params: Promise<ReadPageResolvedParams>;
}

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
    const htmlContent = lines.map(lineElement => {
        if (React.isValidElement(lineElement) && lineElement.props.children) {
            return React.Children.toArray(lineElement.props.children).join('');
        }
        return '';
    }).join('');
    return <p key={i} dangerouslySetInnerHTML={{ __html: htmlContent }}></p>;
  });
};

const ReadingPage: NextPage<ReadPageProps> = (props) => {
  const resolvedParams = use(props.params); // Unwrap the promise
  const { slug, chapter: chapterString } = resolvedParams;
  const chapterNumber = parseInt(chapterString, 10);

  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [chapterData, setChapterData] = useState<ChapterDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [rating, setRating] = useState(0);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [comments, setComments] = useState<CommentData[]>([]);
=======
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
     let content: React.ReactNode = p;
     content = p.replace(/\*\*(.*?)\*\*/g, '&lt;strong&gt;$1&lt;/strong&gt;');
     content = (content as string).replace(/\*(.*?)\*/g, '&lt;em&gt;$1&lt;/em&gt;');
     if (p.startsWith('&gt; ')) return &lt;blockquote key={i} className="pl-4 italic border-l-4 my-4"&gt;{p.substring(2)}&lt;/blockquote&gt;;
     if (p === '---') return &lt;hr key={i} className="my-6" /&gt;;

     const lines = p.split('\n').map((line, lineIndex) => (
       &lt;React.Fragment key={lineIndex}&gt;
         {line.replace(/\*\*(.*?)\*\*/g, '&lt;strong&gt;$1&lt;/strong&gt;').replace(/\*(.*?)\*/g, '&lt;em&gt;$1&lt;/em&gt;')}
         {lineIndex &lt; p.split('\n').length - 1 &amp;&amp; &lt;br /&gt;}
       &lt;/React.Fragment&gt;
     ));
     return &lt;p key={i}&gt;{lines}&lt;/p&gt;;
   });
};

const ReadingPage: NextPage&lt;ReadPageProps&gt; = ({ params }) => {
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
  const [comments, setComments] = useState&lt;CommentData[]&gt;([]); // Local state for comments
>>>>>>> eeac1358d3ae1f112a5aa4ef27eebeb43ae4c6bf


  useEffect(() => {
    const fetchChapter = async () => {
<<<<<<< HEAD
      if (!slug || isNaN(chapterNumber) || chapterNumber < 1) {
=======
      if (isNaN(chapterNumber) || chapterNumber &lt; 1) {
>>>>>>> eeac1358d3ae1f112a5aa4ef27eebeb43ae4c6bf
        setChapterData(null);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const data = await fetchChapterDetails(slug, chapterNumber);
        setChapterData(data);
<<<<<<< HEAD
        setRating(data?.userRating || 0);
        setComments(data?.comments || []);
      } catch (error) {
        console.error("Error fetching chapter details:", error);
        setChapterData(null);
=======
        setRating(data?.userRating || 0); // Set initial rating based on fetched data
        setComments(data?.comments || []); // Set initial comments
      } catch (error) {
        console.error("Error fetching chapter details:", error);
        setChapterData(null); // Handle fetch error
>>>>>>> eeac1358d3ae1f112a5aa4ef27eebeb43ae4c6bf
        toast({
          title: "Error Loading Chapter",
          description: "Could not load the chapter content. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
<<<<<<< HEAD
    if (slug && !isNaN(chapterNumber)) { // Ensure slug and chapterNumber are valid before fetching
        fetchChapter();
    }
  }, [slug, chapterNumber, toast]);
=======
    fetchChapter();
  }, [slug, chapterNumber, toast]); // Add toast to dependency array
>>>>>>> eeac1358d3ae1f112a5aa4ef27eebeb43ae4c6bf

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

<<<<<<< HEAD

        setIsSubmittingComment(true);
    try {
      const newComment = await submitComment({
        storyId: chapterData.storyId,
        chapterId: chapterData.chapterId,
=======
    setIsSubmittingComment(true);
    try {
      const newComment = await submitComment({
        storyId: chapterData.storyId,
        chapterId: chapterData.chapterId, // Assuming chapterId is fetched
>>>>>>> eeac1358d3ae1f112a5aa4ef27eebeb43ae4c6bf
        userId: user.id,
        text: commentText,
      });

<<<<<<< HEAD
      setComments(prevComments => [{
        id: newComment.id,
        userId: user.id,
        userName: user.name || 'User',
        userAvatar: user.avatarUrl,
        text: commentText,
        timestamp: new Date()
      }, ...prevComments]);

      toast({ title: "Comment Posted", description: "Your comment has been added." });
      setCommentText('');
    } catch (error) {
      console.error("Error submitting comment:", error);
      toast({ title: "Error Posting Comment", description: "Could not post your comment. Please try again later.", variant: "destructive" });
=======
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
>>>>>>> eeac1358d3ae1f112a5aa4ef27eebeb43ae4c6bf
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleRate = async (newRating: number) => {
    if (!user || !chapterData || isSubmittingRating) {
<<<<<<< HEAD
      if (!user) {
        toast({ title: "Login Required", description: "Please log in to rate.", variant: "destructive" });
      }
=======
      if(!user) toast({ title: "Login Required", description: "Please log in to rate.", variant: "destructive" });
>>>>>>> eeac1358d3ae1f112a5aa4ef27eebeb43ae4c6bf
      return;
    }
    const validationError = validateRatingData({ rating: newRating });
    if (validationError) {
      toast({ title: "Validation Error", description: validationError, variant: "destructive" });
      return;
    }

    setIsSubmittingRating(true);
<<<<<<< HEAD
    const previousRating = rating;
    setRating(newRating);

    try {
      await submitRating({
        storyId: chapterData.storyId,
        chapterId: chapterData.chapterId,
        userId: user.id,
        rating: newRating,
      });
      toast({ title: "Rating Submitted", description: `You rated this chapter ${newRating} stars.` });
    } catch (error) {
      console.error("Error submitting rating:", error);
      toast({ title: "Error Submitting Rating", description: "Could not save your rating. Please try again.", variant: "destructive" });
      setRating(previousRating);
    } finally {
      setIsSubmittingRating(false);
=======
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
>>>>>>> eeac1358d3ae1f112a5aa4ef27eebeb43ae4c6bf
    }
  };

  const handleShare = () => {
    console.log("Sharing chapter:", chapterData?.title);
<<<<<<< HEAD
    toast({ title: "Share Feature (Coming Soon)", description: "Sharing options will be available here." });
  };

  if (isLoading || authLoading || !slug || isNaN(chapterNumber)) { // Add checks for slug and chapterNumber validity
    return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
=======
    // TODO: Implement actual sharing logic (e.g., Web Share API)
    toast({ title: "Share Feature (Coming Soon)", description: "Sharing options will be available here." });
  };

  if (isLoading || authLoading) {
    return &lt;div className="flex items-center justify-center min-h-screen"&gt;&lt;Loader2 className="h-8 w-8 animate-spin text-primary" /&gt;&lt;/div&gt;;
>>>>>>> eeac1358d3ae1f112a5aa4ef27eebeb43ae4c6bf
  }

  if (!chapterData) {
    return (
<<<<<<< HEAD
      <div className="text-center py-20 flex flex-col items-center gap-4">
        <p className="text-xl text-destructive">
          Chapter Not Found
        </p>
        <p className="text-muted-foreground">
          {isNaN(chapterNumber) || chapterNumber < 1
            ? 'The chapter number specified in the URL is not valid.'
            : "We couldn't find the chapter you were looking for."
          }
        </p>
        <Button variant="outline" asChild>
          <Link href={slug ? `/story/${slug}` : '/browse'}>Go to Story Details</Link>
        </Button>
    </div>
=======
      &lt;div className="text-center py-20 flex flex-col items-center gap-4"&gt;
        &lt;p className="text-xl text-destructive"&gt;
          {isNaN(chapterNumber) || chapterNumber &lt; 1 ? "Invalid Chapter Number" : "Chapter Not Found"}
        &lt;/p&gt;
        &lt;p className="text-muted-foreground"&gt;
          {isNaN(chapterNumber) || chapterNumber &lt; 1
            ? "The chapter number specified in the URL is not valid."
            : "We couldn't find the chapter you were looking for."
          }
        &lt;/p&gt;
        &lt;Button variant="outline" asChild&gt;
          &lt;Link href={slug ? `/story/${slug}` : '/browse'}&gt;Go to Story Details&lt;/Link&gt;
        &lt;/Button&gt;
      &lt;/div&gt;
>>>>>>> eeac1358d3ae1f112a5aa4ef27eebeb43ae4c6bf
    );
  }

  const { title, content, storyTitle, storyAuthor, totalChapters } = chapterData;
  const hasPreviousChapter = chapterNumber &gt; 1;
  const hasNextChapter = chapterNumber &lt; totalChapters;
  const progress = Math.round((chapterNumber / totalChapters) * 100);

  return (
<<<<<<< HEAD
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
=======
    &lt;div className="flex flex-col min-h-screen"&gt;
      &lt;header className="sticky top-0 z-40 w-full border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75 shadow-sm"&gt;
        &lt;div className="container flex h-14 items-center justify-between px-4 md:px-6 gap-2"&gt;
          &lt;div className="flex items-center gap-1 md:gap-2"&gt;
            &lt;Button variant="ghost" size="icon" asChild disabled={!hasPreviousChapter}&gt;
              &lt;Link href={hasPreviousChapter ? `/read/${slug}/${chapterNumber - 1}` : '#'} aria-label="Previous Chapter" className={!hasPreviousChapter ? 'opacity-50 cursor-not-allowed' : 'hover:text-primary'}&gt;
                &lt;ChevronLeft className="h-5 w-5" /&gt;
              &lt;/Link&gt;
            &lt;/Button&gt;
            &lt;DropdownMenu&gt;
              &lt;DropdownMenuTrigger asChild&gt;
                &lt;Button variant="ghost" className="px-2 py-1 h-auto flex items-center gap-1 text-left"&gt;
                  &lt;div className="flex flex-col"&gt;
                    &lt;span className="text-sm font-medium truncate max-w-[150px] sm:max-w-xs md:max-w-sm"&gt;{storyTitle}&lt;/span&gt;
                    &lt;span className="text-xs text-muted-foreground truncate"&gt;{title}&lt;/span&gt;
                  &lt;/div&gt;
                  &lt;ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" /&gt;
                &lt;/Button&gt;
              &lt;/DropdownMenuTrigger&gt;
              &lt;DropdownMenuContent align="start"&gt;
                &lt;DropdownMenuItem asChild&gt;
                  &lt;Link href={`/story/${slug}`} className="flex items-center gap-2"&gt;
                    &lt;BookOpenText className="h-4 w-4" /&gt; Story Details
                  &lt;/Link&gt;
                &lt;/DropdownMenuItem&gt;
                &lt;DropdownMenuItem asChild&gt;
                  &lt;Link href={`/story/${slug}#chapters`} className="flex items-center gap-2"&gt;
                    &lt;List className="h-4 w-4" /&gt; Table of Contents
                  &lt;/Link&gt;
                &lt;/DropdownMenuItem&gt;
                &lt;DropdownMenuItem disabled&gt;
                  &lt;span className="text-xs text-muted-foreground"&gt;By {storyAuthor}&lt;/span&gt;
                &lt;/DropdownMenuItem&gt;
              &lt;/DropdownMenuContent&gt;
            &lt;/DropdownMenu&gt;
          &lt;/div&gt;
          &lt;div className="flex items-center gap-1 md:gap-2"&gt;
            &lt;DropdownMenu&gt;
              &lt;DropdownMenuTrigger asChild&gt;
                &lt;Button variant="ghost" size="icon"&gt;
                  &lt;Settings className="h-5 w-5" /&gt;
                  &lt;span className="sr-only"&gt;Reading Settings&lt;/span&gt;
                &lt;/Button&gt;
              &lt;/DropdownMenuTrigger&gt;
              &lt;DropdownMenuContent align="end"&gt;
                &lt;DropdownMenuItem&gt;Font Size (Coming Soon)&lt;/DropdownMenuItem&gt;
                &lt;DropdownMenuItem&gt;Theme (Coming Soon)&lt;/DropdownMenuItem&gt;
              &lt;/DropdownMenuContent&gt;
            &lt;/DropdownMenu&gt;
            &lt;Button variant="ghost" size="icon" onClick={handleShare}&gt;
              &lt;Share2 className="h-5 w-5" /&gt;
              &lt;span className="sr-only"&gt;Share&lt;/span&gt;
            &lt;/Button&gt;
            &lt;Button variant="ghost" size="icon" asChild disabled={!hasNextChapter}&gt;
              &lt;Link href={hasNextChapter ? `/read/${slug}/${chapterNumber + 1}` : '#'} aria-label="Next Chapter" className={!hasNextChapter ? 'opacity-50 cursor-not-allowed' : 'hover:text-primary'}&gt;
                &lt;ChevronRight className="h-5 w-5" /&gt;
              &lt;/Link&gt;
            &lt;/Button&gt;
          &lt;/div&gt;
        &lt;/div&gt;
        &lt;Progress value={progress} className="w-full h-1 rounded-none" /&gt;
      &lt;/header&gt;

      &lt;main className="flex-grow container max-w-3xl mx-auto px-4 py-8 md:py-12"&gt;
        &lt;article className="prose prose-lg dark:prose-invert max-w-none prose-p:text-foreground/90 prose-strong:text-foreground" style={{ fontFamily: "'Georgia', 'Times New Roman', Times, serif", lineHeight: '1.8' }}&gt;
          {formatContent(content)}
        &lt;/article&gt;
      &lt;/main&gt;

      &lt;footer className="w-full border-t bg-secondary/50 mt-8 py-6"&gt;
        &lt;div className="container max-w-3xl mx-auto px-4 space-y-6"&gt;
          &lt;div&gt;
            &lt;h3 className="text-lg font-semibold mb-2"&gt;Rate this chapter&lt;/h3&gt;
            &lt;div className="flex items-center gap-1"&gt;
              {[1, 2, 3, 4, 5].map((star) => (
                &lt;Button
>>>>>>> eeac1358d3ae1f112a5aa4ef27eebeb43ae4c6bf
                  key={star}
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRate(star)}
                  disabled={!user || isSubmittingRating}
                  className={`h-8 w-8 p-0 ${!user ? 'cursor-not-allowed opacity-50' : ''}`}
<<<<<<< HEAD
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
=======
                  aria-label={`Rate ${star} stars`}
                &gt;
                  &lt;Star
                    className={`h-6 w-6 transition-colors ${star &lt;= rating ? 'fill-primary text-primary' : 'text-muted-foreground/50'} ${user ? 'hover:text-primary/80' : ''}`}
                  /&gt;
                &lt;/Button&gt;
              ))}
              {isSubmittingRating &amp;&amp; &lt;Loader2 className="h-5 w-5 animate-spin text-muted-foreground ml-2" /&gt;}
            &lt;/div&gt;
            {!user &amp;&amp; &lt;p className="text-xs text-muted-foreground mt-1"&gt;You must be logged in to rate.&lt;/p&gt;}
          &lt;/div&gt;

          &lt;Separator /&gt;

          &lt;div&gt;
            &lt;h3 className="text-lg font-semibold mb-3 flex items-center gap-2"&gt;
              &lt;MessageSquare className="w-5 h-5" /&gt; Comments ({comments.length})
            &lt;/h3&gt;
            {user ? (
              &lt;div className="space-y-4"&gt;
                &lt;div className="flex gap-3 items-start"&gt;
                  &lt;Avatar className="mt-1"&gt;
                    &lt;AvatarImage src={user.avatarUrl || undefined} alt={user.name || 'User'} data-ai-hint="user avatar small" /&gt;
                    &lt;AvatarFallback&gt;{user.name?.substring(0, 1).toUpperCase() || 'U'}&lt;/AvatarFallback&gt;
                  &lt;/Avatar&gt;
                  &lt;div className="flex-1 space-y-2"&gt;
                    &lt;Textarea
>>>>>>> eeac1358d3ae1f112a5aa4ef27eebeb43ae4c6bf
                      placeholder="Add your comment..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      rows={3}
                      className="w-full"
                      disabled={isSubmittingComment}
<<<<<<< HEAD
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
                        <AvatarImage src={comment.userAvatar || undefined} alt={comment.userName || 'User'} data-ai-hint="commenter avatar"/>
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

          <div className="mt-8">
            <Separator />
            <div className="flex items-center justify-between pt-4">
                <Button variant="outline" asChild disabled={!hasPreviousChapter} className="w-1/2">
                    <Link href={hasPreviousChapter ? `/read/${slug}/${chapterNumber - 1}` : '#'} className="flex items-center justify-center gap-2 w-full">
                        <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                    </Link>
                </Button>
                <span className="text-sm text-muted-foreground hidden sm:inline">
                    Chapter {chapterNumber} / {totalChapters}
                </span>
                <Button variant="outline" asChild disabled={!hasNextChapter} className="w-1/2">
                    <Link href={hasNextChapter ? `/read/${slug}/${chapterNumber + 1}` : '#'} className="flex items-center justify-center gap-2 w-full">
                        Next <ChevronRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const SuspendedReadingPage: NextPage<ReadPageProps> = (props) => (
  <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <ReadingPage {...props} />
  </Suspense>
=======
                    /&gt;
                    &lt;Button onClick={handleCommentSubmit} size="sm" disabled={commentText.trim() === '' || isSubmittingComment}&gt;
                      {isSubmittingComment ? &lt;Loader2 className="h-4 w-4 mr-1 animate-spin"/&gt; : &lt;Send className="h-4 w-4 mr-1" /&gt;}
                      Post Comment
                    &lt;/Button&gt;
                  &lt;/div&gt;
                &lt;/div&gt;
                &lt;div className="space-y-4 pt-4"&gt;
                 {comments.length === 0 &amp;&amp; (
                     &lt;p className="text-center text-sm text-muted-foreground italic"&gt;No comments yet. Be the first!&lt;/p&gt;
                 )}
                  {comments.map((comment) => (
                     &lt;div key={comment.id} className="flex gap-3 items-start"&gt;
                       &lt;Avatar className="h-9 w-9"&gt;
                         &lt;AvatarImage src={comment.userAvatar || undefined} alt={comment.userName || 'User'} data-ai-hint="commenter avatar"/&gt;
                         &lt;AvatarFallback&gt;{comment.userName?.substring(0, 1).toUpperCase() || 'U'}&lt;/AvatarFallback&gt;
                       &lt;/Avatar&gt;
                       &lt;div className="p-3 rounded-md bg-background border w-full"&gt;
                         &lt;p className="font-semibold text-sm"&gt;{comment.userName}&lt;/p&gt;
                         &lt;p className="text-sm text-foreground/80 mt-1 whitespace-pre-line"&gt;{comment.text}&lt;/p&gt;
                         &lt;p className="text-xs text-muted-foreground mt-2"&gt;{new Date(comment.timestamp).toLocaleString()}&lt;/p&gt;
                       &lt;/div&gt;
                     &lt;/div&gt;
                   ))}
                &lt;/div&gt;
              &lt;/div&gt;
            ) : (
              &lt;div className="text-center p-6 border border-dashed rounded-md"&gt;
                &lt;p className="text-muted-foreground"&gt;
                  &lt;Link href="/login" className="text-primary font-medium underline"&gt;Log in&lt;/Link&gt; or&lt;{' '}/&gt;
                  &lt;Link href="/signup" className="text-primary font-medium underline"&gt;Sign up&lt;/Link&gt; to leave a comment.
                &lt;/p&gt;
              &lt;/div&gt;
            )}
          &lt;/div&gt;

          &lt;Separator className="mt-8" /&gt;
          &lt;div className="flex items-center justify-between pt-4"&gt;
            &lt;Button variant="outline" asChild disabled={!hasPreviousChapter}&gt;
              &lt;Link href={hasPreviousChapter ? `/read/${slug}/${chapterNumber - 1}` : '#'} className={!hasPreviousChapter ? 'opacity-60 cursor-not-allowed' : ''}&gt;
                &lt;ChevronLeft className="mr-2 h-4 w-4" /&gt; Previous
              &lt;/Link&gt;
            &lt;/Button&gt;
            &lt;span className="text-sm text-muted-foreground hidden sm:inline"&gt;
              Chapter {chapterNumber} / {totalChapters}
            &lt;/span&gt;
            &lt;Button variant="outline" asChild disabled={!hasNextChapter}&gt;
              &lt;Link href={hasNextChapter ? `/read/${slug}/${chapterNumber + 1}` : '#'} className={!hasNextChapter ? 'opacity-60 cursor-not-allowed' : ''}&gt;
                Next &lt;ChevronRight className="ml-2 h-4 w-4" /&gt;
              &lt;/Link&gt;
            &lt;/Button&gt;
          &lt;/div&gt;
        &lt;/div&gt;
      &lt;/footer&gt;
    &lt;/div&gt;
  );
};

// Wrap with Suspense for client components that might use hooks like useSearchParams
const SuspendedReadingPage: NextPage&lt;ReadPageProps&gt; = (props) => (
  &lt;Suspense fallback=&lt;div className="flex items-center justify-center min-h-screen"&gt;&lt;Loader2 className="h-8 w-8 animate-spin text-primary" /&gt;&lt;/div&gt;&gt;
    &lt;ReadingPage {...props} /&gt;
  &lt;/Suspense&gt;
>>>>>>> eeac1358d3ae1f112a5aa4ef27eebeb43ae4c6bf
);


export default SuspendedReadingPage;
