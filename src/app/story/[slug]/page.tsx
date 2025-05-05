
"use client";


import type { NextPage } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BookOpen, Eye, Users, MessageSquare, ThumbsUp, List, PlusCircle, Library, CheckCircle, Star, Share2, Send, Loader2 } from 'lucide-react'; // Added/updated icons & Loader2
import type { Story as BaseStory } from '@/components/story/story-card'; // Rename imported Story
import React, { useEffect, useState, Suspense } from 'react'; // Import React and hooks
import { useAuth } from '@/hooks/use-auth'; // Import useAuth
import { Textarea } from '@/components/ui/textarea'; // Import Textarea
import { useToast } from '@/hooks/use-toast'; // Import useToast
import { validateCommentData, validateRatingData } from '@/services/validationService'; // Import validation functions
import { fetchStoryDetails, submitStoryComment, submitStoryRating, toggleLibraryStatus } from '@/lib/storyService'; // Import story-specific services

// Re-type BaseStory author to be an object
interface Author {
    name: string;
    id: string; // Assuming an ID for linking later
    avatarUrl?: string; // Optional avatar URL
}

export interface Story extends Omit&lt;BaseStory, 'author'&gt; {
    author: Author;
}

// Define the shape of a comment for story page
interface StoryCommentData {
    id: string;
    userId: string;
    userName: string;
    userAvatar?: string | null;
    text: string;
    timestamp: Date; // Use Date object
}

// Define extended Story type for this page
interface StoryDetails extends Story {
  chaptersData: { id: string; title: string; order: number }[]; // Add order
  authorFollowers: number;
  status: 'Ongoing' | 'Completed';
  lastUpdated: string;
  averageRating?: number; // Overall story rating
  totalRatings?: number;
  comments?: StoryCommentData[]; // Story-level comments
  userRating?: number; // Current user's overall rating for the story
  isInLibrary?: boolean; // Whether the story is in the current user's library
}

interface StoryPageProps {
  params: {
    slug: string;
  };
}

const StoryDetailPage: NextPage&lt;StoryPageProps&gt; = ({ params }) => {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [story, setStory] = useState&lt;StoryDetails | null&gt;(null);
  const [isLoading, setIsLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [rating, setRating] = useState(0); // User's overall story rating selection
  const [isInLibrary, setIsInLibrary] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [isTogglingLibrary, setIsTogglingLibrary] = useState(false);
  const [comments, setComments] = useState&lt;StoryCommentData[]&gt;([]);

  useEffect(() => {
    const fetchStory = async () => {
      setIsLoading(true);
      try {
        // Pass userId if available to check library status and user rating
        const data = await fetchStoryDetails(params.slug, user?.id);
        setStory(data);
        setRating(data?.userRating || 0);
        setIsInLibrary(data?.isInLibrary || false);
        setComments(data?.comments || []);
      } catch (error) {
        console.error("Error fetching story details:", error);
        setStory(null);
        toast({
          title: "Error Loading Story",
          description: "Could not load the story details. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    // Fetch only when auth state is resolved or changes
    if (!authLoading) {
      fetchStory();
    }
  }, [params.slug, authLoading, user?.id, toast]); // Re-fetch if user changes


  const handleCommentSubmit = async () => {
    if (!user || !story) {
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
      const newComment = await submitStoryComment({
        storyId: story.id,
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
      setCommentText('');
    } catch (error) {
      console.error("Error submitting story comment:", error);
      toast({ title: "Error Posting Comment", description: "Could not post your comment. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleRateStory = async (newRating: number) => {
    if (!user || !story || isSubmittingRating) {
      if(!user) toast({ title: "Login Required", description: "Please log in to rate.", variant: "destructive" });
      return;
    }
    const validationError = validateRatingData({ rating: newRating });
    if (validationError) {
      toast({ title: "Validation Error", description: validationError, variant: "destructive" });
      return;
    }

    setIsSubmittingRating(true);
    const previousRating = rating;
    setRating(newRating); // Optimistic UI update

    try {
      await submitStoryRating({
        storyId: story.id,
        userId: user.id,
        rating: newRating,
      });
      toast({ title: "Rating Submitted", description: `You rated this story ${newRating} stars.` });
      // Optionally, re-fetch story data to get updated average rating, or update locally if API returns it
    } catch (error) {
      console.error("Error submitting story rating:", error);
      toast({ title: "Error Submitting Rating", description: "Could not save your rating. Please try again.", variant: "destructive" });
      setRating(previousRating); // Revert optimistic update
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const handleShareStory = () => {
    console.log("Sharing story:", story?.title);
    // TODO: Implement actual sharing logic
    toast({ title: "Share Feature (Coming Soon)", description: "Sharing options will be available here." });
  };

  const handleToggleLibrary = async () => {
    if (!user || !story || isTogglingLibrary) {
      if(!user) toast({ title: "Login Required", description: "Please log in to manage your library.", variant: "destructive" });
      return;
    }
    setIsTogglingLibrary(true);
    const previousLibraryStatus = isInLibrary;
    setIsInLibrary(!isInLibrary); // Optimistic UI update

    try {
      await toggleLibraryStatus(user.id, story.id, !previousLibraryStatus); // Send the action to perform
      toast({ title: `Story ${!previousLibraryStatus ? 'Added To' : 'Removed From'} Library` });
    } catch (error) {
      console.error("Error toggling library status:", error);
      toast({ title: "Library Error", description: "Could not update your library. Please try again.", variant: "destructive" });
      setIsInLibrary(previousLibraryStatus); // Revert optimistic update
    } finally {
      setIsTogglingLibrary(false);
    }
  };

  if (isLoading || authLoading) {
    return &lt;div className="flex items-center justify-center min-h-screen"&gt;&lt;Loader2 className="h-8 w-8 animate-spin text-primary" /&gt;&lt;/div&gt;;
  }

  if (!story) {
    return &lt;div className="text-center py-20"&gt;Story not found.&lt;/div&gt;;
  }

  const displayRating = story.averageRating ? story.averageRating.toFixed(1) : 'N/A';
  const fullStars = Math.floor(story.averageRating || 0);
  const hasHalfStar = (story.averageRating || 0) % 1 &gt;= 0.5;

  return (
    &lt;div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12"&gt;
      &lt;div className="lg:col-span-4 xl:col-span-3 space-y-6"&gt;
        &lt;div className="sticky top-20 space-y-6"&gt;
          &lt;Card className="overflow-hidden shadow-lg border border-border/80"&gt;
            &lt;div className="relative aspect-[2/3] w-full"&gt;
              &lt;Image
                src={story.coverImageUrl || `https://picsum.photos/seed/${story.slug}/400/600`} // Fallback image
                alt={`Cover for ${story.title}`}
                fill
                sizes="(max-width: 1024px) 100vw, 33vw"
                className="object-cover"
                priority // Prioritize loading cover image
                data-ai-hint={story.dataAiHint || "book cover story detail"}
              /&gt;
            &lt;/div&gt;
          &lt;/Card&gt;

          &lt;div className="flex flex-col gap-3"&gt;
            &lt;Button size="lg" asChild className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-base font-semibold"&gt;
              &lt;Link href={`/read/${story.slug}/1`}&gt;
                &lt;BookOpen className="mr-2 h-5 w-5" /&gt; Read First Chapter
              &lt;/Link&gt;
            &lt;/Button&gt;
            &lt;Button
              variant={isInLibrary ? "secondary" : "outline"}
              size="lg"
              className="w-full text-base font-semibold"
              onClick={handleToggleLibrary}
              disabled={!user || isTogglingLibrary}
            &gt;
              {isTogglingLibrary ? (
                  &lt;Loader2 className="mr-2 h-5 w-5 animate-spin"/&gt;
              ) : isInLibrary ? (
                &lt;&gt;
                  &lt;CheckCircle className="mr-2 h-5 w-5 text-green-600" /&gt; In Your Library
                &lt;/>
              ) : (
                &lt;&gt;
                  &lt;PlusCircle className="mr-2 h-5 w-5" /&gt; Add to Library
                &lt;/>
              )}
              {!user &amp;&amp; &lt;span className="text-xs ml-2"&gt;(Log in)&lt;/span&gt;}
            &lt;/Button&gt;
          &lt;/div&gt;

          &lt;Card className="border border-border/80"&gt;
            &lt;CardContent className="p-4 space-y-3 text-sm"&gt;
              &lt;div className="flex items-center justify-between"&gt;
                &lt;span className="text-muted-foreground font-medium flex items-center gap-2"&gt;&lt;Eye className="w-4 h-4" /&gt; Reads&lt;/span&gt;
                &lt;span className="font-bold"&gt;{story.reads?.toLocaleString() || 0}&lt;/span&gt;
              &lt;/div&gt;
              &lt;Separator /&gt;
              &lt;div className="flex items-center justify-between"&gt;
                &lt;span className="text-muted-foreground font-medium flex items-center gap-2"&gt;&lt;ThumbsUp className="w-4 h-4" /&gt; Votes&lt;/span&gt;
                &lt;span className="font-bold"&gt;{story.totalRatings?.toLocaleString() || 0}&lt;/span&gt;
              &lt;/div&gt;
              &lt;Separator /&gt;
              &lt;div className="flex items-center justify-between"&gt;
                &lt;span className="text-muted-foreground font-medium flex items-center gap-2"&gt;&lt;List className="w-4 h-4" /&gt; Parts&lt;/span&gt;
                &lt;span className="font-bold"&gt;{story.chapters}&lt;/span&gt;
              &lt;/div&gt;
              &lt;Separator /&gt;
              &lt;div className="flex items-center justify-between"&gt;
                &lt;span className="text-muted-foreground font-medium flex items-center gap-2"&gt;&lt;Star className="w-4 h-4" /&gt; Rating&lt;/span&gt;
                &lt;div className="flex items-center gap-1"&gt;
                  &lt;span className="font-bold"&gt;{displayRating}&lt;/span&gt;
                   {/* Display star icons based on average rating */}
                   {story.averageRating &amp;&amp; (
                      &lt;div className="flex"&gt;
                          {[...Array(5)].map((_, i) => (
                              &lt;Star key={i} className={`h-4 w-4 ${
                                  i &lt; fullStars ? 'text-primary fill-primary' :
                                  i === fullStars &amp;&amp; hasHalfStar ? 'text-primary fill-primary/50' :
                                  'text-muted-foreground/30'
                              }`}/&gt;
                          ))}
                      &lt;/div&gt;
                   )}
                   &lt;span className="text-xs text-muted-foreground"&gt;({story.totalRatings || 0})&lt;/span&gt;
                &lt;/div&gt;
              &lt;/div&gt;
              &lt;Separator /&gt;
              &lt;div className="flex items-center justify-between"&gt;
                &lt;span className="text-muted-foreground font-medium"&gt;Status&lt;/span&gt;
                &lt;Badge variant={story.status === 'Completed' ? "secondary" : "outline"} className={story.status === 'Completed' ? "text-green-700 border-green-300 bg-green-50" : "text-blue-700 border-blue-300 bg-blue-50"}&gt;
                  {story.status}
                &lt;/Badge&gt;
              &lt;/div&gt;
              &lt;Separator /&gt;
              &lt;div className="flex items-center justify-between"&gt;
                &lt;span className="text-muted-foreground font-medium"&gt;Updated&lt;/span&gt;
                &lt;span className="font-semibold"&gt;{new Date(story.lastUpdated).toLocaleDateString()}&lt;/span&gt;
              &lt;/div&gt;
            &lt;/CardContent&gt;
          &lt;/Card&gt;

          {story.tags &amp;&amp; story.tags.length &gt; 0 &amp;&amp; (
            &lt;Card className="border border-border/80"&gt;
              &lt;CardHeader className="p-4 pb-2"&gt;
                &lt;CardTitle className="text-base font-semibold"&gt;Tags&lt;/CardTitle&gt;
              &lt;/CardHeader&gt;
              &lt;CardContent className="p-4 pt-0"&gt;
                &lt;div className="flex flex-wrap gap-2"&gt;
                  {story.tags.map(tag => (
                    &lt;Link key={tag} href={`/browse?tags=${encodeURIComponent(tag)}`}&gt;
                      &lt;Badge variant="secondary" className="cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"&gt;
                        #{tag.toLowerCase()}
                      &lt;/Badge&gt;
                    &lt;/Link&gt;
                  ))}
                &lt;/div&gt;
              &lt;/CardContent&gt;
            &lt;/Card&gt;
          )}
          &lt;Button variant="outline" className="w-full" onClick={handleShareStory}&gt;
            &lt;Share2 className="mr-2 h-4 w-4" /&gt; Share Story
          &lt;/Button&gt;
        &lt;/div&gt;
      &lt;/div&gt;

      &lt;div className="lg:col-span-8 xl:col-span-9 space-y-8"&gt;
        &lt;div className="space-y-3"&gt;
          &lt;h1 className="text-3xl md:text-4xl font-bold leading-tight text-foreground"&gt;{story.title}&lt;/h1&gt;
          &lt;div className="flex items-center gap-3"&gt;
            &lt;Link href={`/user/${story.author.id}`} className="flex items-center gap-3 group"&gt;
              &lt;Avatar className="h-11 w-11 border-2 border-border group-hover:border-primary transition-colors"&gt;
                &lt;AvatarImage src={story.author.avatarUrl || `https://picsum.photos/seed/${story.author.name}/100/100`} alt={story.author.name} data-ai-hint="author profile picture large" /&gt;
                &lt;AvatarFallback&gt;{story.author.name.substring(0, 1).toUpperCase()}&lt;/AvatarFallback&gt;
              &lt;/Avatar&gt;
              &lt;div&gt;
                &lt;p className="font-semibold text-lg group-hover:text-primary transition-colors"&gt;{story.author.name}&lt;/p&gt;
                &lt;p className="text-sm text-muted-foreground"&gt;{story.authorFollowers.toLocaleString()} Followers&lt;/p&gt;
              &lt;/div&gt;
            &lt;/Link&gt;
            {user &amp;&amp; user.id !== story.author.id &amp;&amp; (
              &lt;Button variant="outline" size="sm" className="ml-4" disabled&gt;Follow&lt;/Button&gt; // Follow button disabled for now
            )}
          &lt;/div&gt;
          &lt;div className="flex items-center gap-2 pt-2"&gt;
            &lt;span className="text-sm font-medium text-muted-foreground"&gt;Your Rating:&lt;/span&gt;
            {[1, 2, 3, 4, 5].map((star) => (
              &lt;Button
                key={star}
                variant="ghost"
                size="icon"
                onClick={() => handleRateStory(star)}
                disabled={!user || isSubmittingRating}
                className={`h-7 w-7 p-0 ${!user ? 'cursor-not-allowed opacity-50' : ''}`}
                aria-label={`Rate story ${star} stars`}
              &gt;
                &lt;Star
                  className={`h-5 w-5 transition-colors ${star &lt;= rating ? 'fill-primary text-primary' : 'text-muted-foreground/50'} ${user ? 'hover:text-primary/80' : ''}`}
                /&gt;
              &lt;/Button&gt;
            ))}
            {isSubmittingRating &amp;&amp; &lt;Loader2 className="h-4 w-4 animate-spin text-muted-foreground ml-1" /&gt;}
            {!user &amp;&amp; &lt;Link href="/login" className="text-xs text-primary underline ml-1"&gt;Log in to rate&lt;/Link&gt;}
          &lt;/div&gt;
        &lt;/div&gt;

        &lt;Card className="border border-border/80 shadow-sm"&gt;
          &lt;CardContent className="p-5"&gt;
            &lt;p className="text-base md:text-lg leading-relaxed whitespace-pre-line text-foreground/90"&gt;{story.description}&lt;/p&gt;
          &lt;/CardContent&gt;
        &lt;/Card&gt;

        &lt;Card id="chapters" className="border border-border/80 shadow-sm scroll-mt-20"&gt;
          &lt;CardHeader className="border-b border-border/80"&gt;
            &lt;CardTitle className="flex items-center gap-2 text-xl font-semibold"&gt;
              &lt;List className="w-5 h-5" /&gt; Table of Contents ({story.chaptersData.length} Parts)
            &lt;/CardTitle&gt;
          &lt;/CardHeader&gt;
          &lt;CardContent className="p-0"&gt;
            &lt;ul className="divide-y divide-border/60"&gt;
              {story.chaptersData.map((chapter) => (
                &lt;li key={chapter.id}&gt;
                  &lt;Link href={`/read/${story.slug}/${chapter.order}`} className="flex justify-between items-center p-4 hover:bg-secondary transition-colors duration-150 group"&gt;
                    &lt;span className="font-medium group-hover:text-primary"&gt;{chapter.order}. {chapter.title}&lt;/span&gt;
                    &lt;span className="text-sm text-muted-foreground"&gt;&lt;/span&gt;
                  &lt;/Link&gt;
                &lt;/li&gt;
              ))}
            &lt;/ul&gt;
          &lt;/CardContent&gt;
        &lt;/Card&gt;

        &lt;Card className="border border-border/80 shadow-sm"&gt;
          &lt;CardHeader className="border-b border-border/80"&gt;
            &lt;CardTitle className="flex items-center gap-2 text-xl font-semibold"&gt;
              &lt;MessageSquare className="w-5 h-5" /&gt; Comments ({comments.length})
            &lt;/CardTitle&gt;
          &lt;/CardHeader&gt;
          &lt;CardContent className="p-5 space-y-6"&gt;
            {user ? (
              &lt;div className="flex gap-3 items-start"&gt;
                &lt;Avatar className="mt-1"&gt;
                  &lt;AvatarImage src={user.avatarUrl || undefined} alt={user.name || 'User'} data-ai-hint="user avatar comment" /&gt;
                  &lt;AvatarFallback&gt;{user.name?.substring(0, 1).toUpperCase() || 'U'}&lt;/AvatarFallback&gt;
                &lt;/Avatar&gt;
                &lt;div className="flex-1 space-y-2"&gt;
                  &lt;Textarea
                    placeholder="Add a comment about the story..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    rows={3}
                    className="w-full"
                    disabled={isSubmittingComment}
                  /&gt;
                  &lt;Button onClick={handleCommentSubmit} size="sm" disabled={commentText.trim() === '' || isSubmittingComment}&gt;
                    {isSubmittingComment ? &lt;Loader2 className="h-4 w-4 mr-1 animate-spin"/&gt; : &lt;Send className="h-4 w-4 mr-1" /&gt;} Post Comment
                  &lt;/Button&gt;
                &lt;/div&gt;
              &lt;/div&gt;
            ) : (
              &lt;div className="text-center p-4 border border-dashed rounded-md"&gt;
                &lt;p className="text-muted-foreground"&gt;
                  &lt;Link href="/login" className="text-primary font-medium underline"&gt;Log in&lt;/Link&gt; or&lt;{' '}/&gt;
                  &lt;Link href="/signup" className="text-primary font-medium underline"&gt;Sign up&lt;/Link&gt; to leave a comment.
                &lt;/p&gt;
              &lt;/div&gt;
            )}
            &lt;div className="space-y-4 pt-4"&gt;
                {comments.length === 0 &amp;&amp; (
                     &lt;p className="text-center text-sm text-muted-foreground italic"&gt;No story comments yet.&lt;/p&gt;
                 )}
              {comments.map((comment) => (
                &lt;div key={comment.id} className="flex gap-3 items-start"&gt;
                  &lt;Avatar className="h-9 w-9"&gt;
                    &lt;AvatarImage src={comment.userAvatar || undefined} alt={comment.userName || 'User'} data-ai-hint="commenter avatar" /&gt;
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
          &lt;/CardContent&gt;
        &lt;/Card&gt;
      &lt;/div&gt;
    &lt;/div&gt;
  );
};

// Wrap with Suspense for client components that might use hooks like useSearchParams
const SuspendedStoryDetailPage: NextPage&lt;StoryPageProps&gt; = (props) => (
  &lt;Suspense fallback=&lt;div className="flex items-center justify-center min-h-[calc(100vh-10rem)]"&gt;&lt;Loader2 className="h-8 w-8 animate-spin text-primary" /&gt;&lt;/div&gt;&gt;
    &lt;StoryDetailPage {...props} /&gt;
  &lt;/Suspense&gt;
);


export default SuspendedStoryDetailPage;
