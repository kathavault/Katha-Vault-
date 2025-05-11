// src/app/story/[slug]/StoryDetailPage.tsx
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { fetchStoryDetails, submitStoryComment, submitStoryRating, toggleLibraryStatus } from '@/lib/storyService';
import type { StoryDetailsResult, ChapterSummary, StoryCommentData as CommentData, UserProfile } from '@/types'; // Ensure types are correctly imported

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { BookOpen, Eye, MessageSquare, ThumbsUp, List, PlusCircle, Library, CheckCircle, Star, Share2, Send, Loader2, ChevronDown, AlertTriangle, Bookmark, BookmarkCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';


interface StoryDetailPageProps {
  slug: string;
}

const StoryDetailPage: React.FC<StoryDetailPageProps> = ({ slug }) => {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [story, setStory] = useState<StoryDetailsResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [rating, setRating] = useState(0); // User's current rating for the story
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [isInLibrary, setIsInLibrary] = useState(false);
  const [isTogglingLibrary, setIsTogglingLibrary] = useState(false);

  const fetchAndSetStoryDetails = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchStoryDetails(slug, user?.id || null);
      if (data) {
        setStory(data);
        setRating(data.userRating || 0);
        setIsInLibrary(data.isInLibrary || false);
      } else {
        toast({ title: "Story not found", description: "This story may have been moved or deleted.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Failed to fetch story details:", error);
      toast({ title: "Error loading story", description: "Please try again later.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [slug, user?.id, toast]);

  useEffect(() => {
    if (slug) {
      fetchAndSetStoryDetails();
    }
  }, [slug, fetchAndSetStoryDetails]);


  const handleCommentSubmit = async () => {
    if (!story || !user || !newComment.trim()) {
      toast({ title: "Cannot submit comment", description: "Please log in and write a comment.", variant: "warning" });
      return;
    }
    setIsSubmittingComment(true);
    try {
      const { id: commentId } = await submitStoryComment({ storyId: story.id, userId: user.id, text: newComment });
      
      const newCommentObject: CommentData = {
        id: commentId,
        userId: user.id,
        userName: user.name || user.email || 'Anonymous',
        userAvatar: user.avatarUrl,
        text: newComment,
        timestamp: new Date(), // Use client date for immediate display
      };

      setStory(prev => prev ? ({ ...prev, comments: [newCommentObject, ...(prev.comments || [])] }) : null);
      setNewComment('');
      toast({ title: "Comment posted!" });
    } catch (error) {
      console.error("Failed to submit comment:", error);
      toast({ title: "Error posting comment", variant: "destructive" });
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleRatingSubmit = async (newRatingValue: number) => {
    if (!story || !user) {
      toast({ title: "Login Required", description: "Please log in to rate this story.", variant: "warning" });
      return;
    }
    if (isSubmittingRating) return;

    setIsSubmittingRating(true);
    try {
      await submitStoryRating({ storyId: story.id, userId: user.id, rating: newRatingValue });
      setRating(newRatingValue); // Update local state immediately
      // Optionally, re-fetch story details to get updated averageRating, or update locally if simple
      setStory(prev => {
        if (!prev) return null;
        const oldUserRating = prev.userRating || 0;
        const ratingCountChange = oldUserRating === 0 ? 1 : 0; // Only if it's a new rating
        const newTotalRatingSum = (prev.totalRatingSum || 0) - oldUserRating + newRatingValue;
        const newRatingCount = (prev.totalRatings || 0) + ratingCountChange;
        
        return {
          ...prev,
          userRating: newRatingValue,
          totalRatingSum: newTotalRatingSum,
          totalRatings: newRatingCount,
          averageRating: newRatingCount > 0 ? parseFloat((newTotalRatingSum / newRatingCount).toFixed(1)) : undefined,
        };
      });
      toast({ title: "Rating submitted!", description: `You rated this story ${newRatingValue} stars.` });
    } catch (error) {
      console.error("Failed to submit rating:", error);
      toast({ title: "Error submitting rating", variant: "destructive" });
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const handleToggleLibrary = async () => {
    if (!story || !user) {
        toast({ title: "Login Required", description: "Please log in to manage your library.", variant: "warning" });
        return;
    }
    setIsTogglingLibrary(true);
    try {
        await toggleLibraryStatus(user.id, story.id, !isInLibrary);
        setIsInLibrary(!isInLibrary);
        toast({ title: "Library Updated", description: story.title + (isInLibrary ? " removed from" : " added to") + " your library." });
    } catch (error) {
        console.error("Failed to update library status:", error);
        toast({ title: "Error updating library", variant: "destructive" });
    } finally {
        setIsTogglingLibrary(false);
    }
  };


  if (isLoading || authLoading) {
    return <div className="flex items-center justify-center min-h-[calc(100vh-200px)]"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  if (!story) {
    return (
        <div className="container mx-auto py-10 text-center">
            <AlertTriangle className="mx-auto h-16 w-16 text-destructive mb-4" />
            <h1 className="text-3xl font-bold text-destructive mb-2">Story Not Found</h1>
            <p className="text-lg text-muted-foreground mb-6">
                The story you are looking for does not exist or may have been removed.
            </p>
            <Button asChild variant="outline">
                <Link href="/browse">Browse Other Stories</Link>
            </Button>
        </div>
    );
  }
  
  const coverImageUrl = story.slug === 'dil-ke-raaste' ? 'https://i.imgur.com/F6H94Zd.png' : story.coverImageUrl;


  return (
    <div className="container mx-auto py-6 md:py-10">
        {/* Header Section - Title and Author */}
        <section className="mb-8 md:mb-12 text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight text-foreground mb-2">{story.title}</h1>
            <p className="text-lg text-muted-foreground">
                by <Link href={`/profile/${story.author.id}`} className="text-primary hover:underline font-medium">{story.author.name}</Link>
            </p>
        </section>

        {/* Main Content - Cover, Stats, Actions, Summary */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
            {/* Left Column - Cover & Meta */}
            <div className="md:col-span-4 lg:col-span-3">
                <Card className="overflow-hidden shadow-lg">
                    {coverImageUrl && (
                        <div className="relative aspect-[2/3] w-full">
                            <Image
                                src={coverImageUrl}
                                alt={`Cover for ${story.title}`}
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                                className="object-cover"
                                priority={true} // Mark as priority if it's likely LCP
                                data-ai-hint={story.dataAiHint || "story cover detail"}
                            />
                        </div>
                    )}
                    <CardContent className="p-4 space-y-3">
                        <div className="flex items-center justify-center space-x-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    className={`h-6 w-6 cursor-pointer transition-colors
                                        ${(hoverRating || rating) >= star ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/50 hover:text-yellow-300'}
                                        ${isSubmittingRating ? 'opacity-50 cursor-not-allowed' : ''}
                                    `}
                                    onMouseEnter={() => !isSubmittingRating && setHoverRating(star)}
                                    onMouseLeave={() => !isSubmittingRating && setHoverRating(0)}
                                    onClick={() => !isSubmittingRating && handleRatingSubmit(star)}
                                />
                            ))}
                        </div>
                        {story.averageRating && (
                             <p className="text-xs text-muted-foreground text-center">
                                Avg. Rating: {story.averageRating.toFixed(1)} ({story.totalRatings || 0} votes)
                            </p>
                        )}
                        <Separator/>
                        <div className="flex justify-around text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><Eye className="h-4 w-4"/> {story.reads?.toLocaleString() || 0} Reads</span>
                            <span className="flex items-center gap-1"><List className="h-4 w-4"/> {story.chapters || 0} Parts</span>
                            <span className="flex items-center gap-1"><MessageSquare className="h-4 w-4"/> {story.comments?.length || 0}</span>
                        </div>
                         <Separator/>
                         <div className="flex flex-col sm:flex-row gap-2">
                            <Button 
                                variant={isInLibrary ? "secondary" : "default"} 
                                className="w-full"
                                onClick={handleToggleLibrary}
                                disabled={isTogglingLibrary || authLoading || !user}
                            >
                                {isTogglingLibrary ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : (isInLibrary ? <BookmarkCheck className="mr-2 h-4 w-4"/> : <Bookmark className="mr-2 h-4 w-4"/>)}
                                {isInLibrary ? 'In Library' : 'Add to Library'}
                            </Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="w-full">
                                        <Share2 className="mr-2 h-4 w-4"/> Share <ChevronDown className="ml-auto h-4 w-4"/>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onSelect={() => navigator.clipboard.writeText(window.location.href).then(() => toast({title: "Link Copied!"}))}>Copy Link</DropdownMenuItem>
                                    {/* Add more share options */}
                                </DropdownMenuContent>
                            </DropdownMenu>
                         </div>
                    </CardContent>
                </Card>
                 <div className="mt-4 text-xs text-muted-foreground">
                    <p>Genre: <Badge variant="secondary">{story.genre}</Badge></p>
                    {story.tags && story.tags.length > 0 && (
                        <p className="mt-1">Tags: {story.tags.map(tag => <Badge key={tag} variant="outline" className="mr-1 mb-1 text-xs">{tag}</Badge>)}</p>
                    )}
                    <p className="mt-1">Status: {story.status}</p>
                    <p className="mt-1">Last Updated: {formatDistanceToNow(new Date(story.lastUpdated), { addSuffix: true })}</p>
                </div>
            </div>

            {/* Right Column - Summary, Chapters, Comments */}
            <div className="md:col-span-8 lg:col-span-9 space-y-8">
                {/* Story Summary */}
                <Card>
                    <CardHeader>
                        <CardTitle>Story Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="prose prose-sm dark:prose-invert max-w-none">
                        {story.slug === 'dil-ke-raaste' ? (
                            <>
                                <p>Dil Ke Raaste ek dil ko chhoo lene wali romantic kahani hai jo Anaya, ek kalpnik aur pratibhashali ladki, aur Aarav, ek safal lekin thoda reserved vyapari, ke beech ke rishton par adharit hai. Jab unke parivaron ke beech ek achanak rishta tay hota hai, to dono ki zindagi ek naye mod par aa jati hai.</p>
                                <p>Yeh kahani parivaarik ummeedein, samajik dabav aur vyakti ke sapno ke beech pyaar, vishwas aur samarpan ki yatra hai.</p>
                            </>
                        ) : (
                            <p>{story.description || "No summary available."}</p>
                        )}
                    </CardContent>
                </Card>

                {/* Chapters List */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            Table of Contents ({story.chaptersData?.length || 0} Chapters)
                             {story.chaptersData && story.chaptersData.length > 0 && (
                                <Button variant="default" size="sm" asChild>
                                    <Link href={`/read/${story.slug}/${story.chaptersData[0].order}`}>
                                        Start Reading <BookOpen className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {story.chaptersData && story.chaptersData.length > 0 ? (
                            <ul className="space-y-2 max-h-96 overflow-y-auto pr-2">
                                {story.chaptersData.map((chapter) => (
                                    <li key={chapter.id}>
                                        <Link href={`/read/${story.slug}/${chapter.order}`}
                                              className="flex justify-between items-center p-3 hover:bg-secondary rounded-md transition-colors">
                                            <span className="font-medium text-primary">{chapter.order}. {chapter.title}</span>
                                            <span className="text-xs text-muted-foreground">{chapter.wordCount ? `${chapter.wordCount.toLocaleString()} words` : ''}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-muted-foreground">No chapters available yet.</p>
                        )}
                    </CardContent>
                </Card>

                {/* Comments Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Comments ({story.comments?.length || 0})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {user && !authLoading && (
                            <div className="mb-6">
                                <Label htmlFor="newComment" className="sr-only">Write a comment</Label>
                                <Textarea
                                    id="newComment"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Share your thoughts..."
                                    rows={3}
                                    className="mb-2"
                                />
                                <Button onClick={handleCommentSubmit} disabled={isSubmittingComment || !newComment.trim()}>
                                    {isSubmittingComment ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                                    Post Comment
                                </Button>
                            </div>
                        )}
                        {!user && !authLoading && (
                            <Alert className="mb-6">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertTitle>Login to Comment</AlertTitle>
                                <AlertDescription>
                                    <Link href="/login" className="text-primary underline">Log in</Link> or <Link href="/signup" className="text-primary underline">sign up</Link> to join the conversation.
                                </AlertDescription>
                            </Alert>
                        )}

                        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                            {story.comments && story.comments.length > 0 ? (
                                story.comments.map((comment) => (
                                    <div key={comment.id} className="flex items-start space-x-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={comment.userAvatar || undefined} alt={comment.userName} data-ai-hint="user avatar small"/>
                                            <AvatarFallback>{comment.userName.substring(0, 1).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 bg-muted p-3 rounded-md">
                                            <div className="flex items-center justify-between text-xs mb-1">
                                                <span className="font-semibold text-foreground">{comment.userName}</span>
                                                <span className="text-muted-foreground">{formatDistanceToNow(new Date(comment.timestamp), { addSuffix: true })}</span>
                                            </div>
                                            <p className="text-sm text-foreground/90 whitespace-pre-wrap">{comment.text}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-muted-foreground text-center py-4">Be the first to comment!</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  );
};

export default StoryDetailPage;
