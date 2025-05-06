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
import { validateCommentData, validateRatingData } from '@/services/validationService'; // Import validation function
import { fetchStoryDetails, submitStoryComment, submitStoryRating, toggleLibraryStatus } from '@/lib/storyService'; // Import story-specific services
import type { Timestamp } from 'firebase/firestore'; // Import Timestamp type


// Re-type BaseStory author to be an object
interface Author {
    name: string;
    id: string; // Assuming an ID for linking later
    avatarUrl?: string; // Optional avatar URL
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
interface StoryDetails extends Omit<BaseStory, 'author' | 'chapters' | 'lastUpdated'> {
  id: string; // Ensure StoryDetails also has an id
  author: Author; // Use the Author interface
  chaptersData: { id: string; title: string; order: number }[];
  authorFollowers: number; // Example additional data
  status: 'Draft' | 'Published' | 'Archived' | 'Ongoing' | 'Completed'; // Use specific status type // Adjusted status type
  lastUpdated: string; // Keep as string for consistency
  averageRating?: number;
  totalRatings?: number;
  chapters: number; // Add chapters count
  comments?: StoryCommentData[];
  userRating?: number; // User's overall rating for this story
  isInLibrary?: boolean;
}

interface StoryPageProps {
  params: {
    slug: string;
  };
}

const StoryDetailPage: NextPage<StoryPageProps> = ({ params }) => {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [story, setStory] = useState<StoryDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [rating, setRating] = useState(0); // User's overall story rating selection
  const [isInLibrary, setIsInLibrary] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [isTogglingLibrary, setIsTogglingLibrary] = useState(false);
  const [comments, setComments] = useState<StoryCommentData[]>([]);

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

  const handleShareStory = async () => {
      if (!story) {
          toast({ title: "Error", description: "Story not available.", variant: "destructive" });
          return;
      }
      const shareData = {
          title: story.title,
          text: story.description,
          url: window.location.href,
      };
      if (navigator.share) {
          try {
              await navigator.share(shareData);
          } catch (error) {
              toast({ title: "Share Failed", description: "Could not share the story. Please try again.", variant: "destructive" });
          }
      } else {
          toast({ title: "Share Not Supported", description: "Sharing is not supported in your browser.", variant: "destructive" });
      }
  };

  const handleCopyUrl = () => {
    if (!story) {
      toast({ title: "Error", description: "Story not available.", variant: "destructive" });
      return;
    }
    const storyUrl = window.location.href;
    navigator.clipboard.writeText(storyUrl)
      .then(() => {
        toast({ title: "Copied!", description: "Story URL copied to clipboard." });
      })
      .catch(error => {
        console.error("Failed to copy story URL:", error);
        toast({ title: "Error", description: "Failed to copy URL. Please try again.", variant: "destructive" });
      });
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
    return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!story) {
    return <div className="text-center py-20">Story not found.</div>;
  }

  const displayRating = story.averageRating ? story.averageRating.toFixed(1) : 'N/A';
  const fullStars = Math.floor(story.averageRating || 0);
  const hasHalfStar = (story.averageRating || 0) % 1 >= 0.5;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 relative">
      <div className="lg:col-span-4 xl:col-span-3 space-y-6">
        <div className="sticky top-20 space-y-6">
          <Card className="overflow-hidden shadow-lg border border-border/80">
            <div className="relative aspect-[2/3] w-full">
              <Image
                src={story.coverImageUrl || `https://picsum.photos/seed/${story.slug}/400/600`} // Fallback image
                alt={`Cover for ${story.title}`}
                fill
                sizes="(max-width: 1024px) 100vw, 33vw"
                className="object-cover"
                {...(story.coverImageUrl && { priority: true })} // Prioritize loading cover image if present
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
              disabled={!user || isTogglingLibrary}
            >
              {isTogglingLibrary ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin"/>
              ) : isInLibrary ? (
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

          <Card className="border border-border/80">
            <CardContent className="p-4 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-medium flex items-center gap-2"><Eye className="w-4 h-4" /> Reads</span>
                <span className="font-bold">{story.reads?.toLocaleString() || 0}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-medium flex items-center gap-2"><ThumbsUp className="w-4 h-4" /> Votes</span>
                <span className="font-bold">{story.totalRatings?.toLocaleString() || 0}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-medium flex items-center gap-2"><List className="w-4 h-4" /> Parts</span>
                <span className="font-bold">{story.chapters}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-medium flex items-center gap-2"><Star className="w-4 h-4" /> Rating</span>
                <div className="flex items-center gap-1">
                  <span className="font-bold">{displayRating}</span>
                   {/* Display star icons based on average rating */}
                   {story.averageRating && (
                      <div className="flex">
                          {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`h-4 w-4 ${
                                  i < fullStars ? 'text-primary fill-primary' :
                                  i === fullStars && hasHalfStar ? 'text-primary fill-primary/50' :
                                  'text-muted-foreground/30'
                              }`}/>
                          ))}
                      </div>
                   )}
                   <span className="text-xs text-muted-foreground">({story.totalRatings || 0})</span>
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-medium">Status</span>
                 <Badge variant={story.status === 'Completed' ? "secondary" : "outline"} className={story.status === 'Completed' ? "text-green-700 border-green-300 bg-green-50" : (story.status === 'Ongoing' ? "text-blue-700 border-blue-300 bg-blue-50" : "")}>
                  {story.status}
                </Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-medium">Updated</span>
                <span className="font-semibold">{new Date(story.lastUpdated).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>

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
           <div className="flex items-center gap-2 w-full">
               <Button variant="outline" className="w-1/2" onClick={handleShareStory}>
                   <Share2 className="mr-2 h-4 w-4" /> Share
               </Button>
               <Button variant="outline" className="w-1/2" onClick={handleCopyUrl}>
                    Copy Link
               </Button>
           </div>
        </div>
      </div>

      <div className="lg:col-span-8 xl:col-span-9 space-y-8">
        <div className="space-y-3">
          <h1 className="text-3xl md:text-4xl font-bold leading-tight text-foreground">{story.title}</h1>
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
            {user && user.id !== story.author.id && (
              <Button variant="outline" size="sm" className="ml-4" disabled>Follow</Button> // Follow button disabled for now
            )}
          </div>
          <div className="flex items-center gap-2 pt-2">
            <span className="text-sm font-medium text-muted-foreground">Your Rating:</span>
            {[1, 2, 3, 4, 5].map((star) => (
              <Button
                key={star}
                variant="ghost"
                size="icon"
                onClick={() => handleRateStory(star)}
                disabled={!user || isSubmittingRating}
                className={`h-7 w-7 p-0 ${!user ? 'cursor-not-allowed opacity-50' : ''}`}
                aria-label={`Rate story ${star} stars`}
              >
                <Star
                  className={`h-5 w-5 transition-colors ${star <= rating ? 'fill-primary text-primary' : 'text-muted-foreground/50'} ${user ? 'hover:text-primary/80' : ''}`}
                />
              </Button>
            ))}
            {isSubmittingRating && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground ml-1" />}
            {!user && <Link href="/login" className="text-xs text-primary underline ml-1">Log in to rate</Link>}
          </div>
        </div>

        <Card className="border border-border/80 shadow-sm">
          <CardContent className="p-5">
            <p className="text-base md:text-lg leading-relaxed whitespace-pre-line text-foreground/90">{story.description}</p>
          </CardContent>
        </Card>

        <Card id="chapters" className="border border-border/80 shadow-sm scroll-mt-20">
          <CardHeader className="border-b border-border/80">
            <CardTitle className="flex items-center gap-2 text-xl font-semibold">
              <List className="w-5 h-5" /> Table of Contents ({story.chaptersData.length} Parts)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y divide-border/60">
              {story.chaptersData.map((chapter) => (
                <li key={chapter.id}>
                  <Link href={`/read/${story.slug}/${chapter.order}`} className="flex justify-between items-center p-4 hover:bg-secondary transition-colors duration-150 group">
                    <span className="font-medium group-hover:text-primary">{chapter.order}. {chapter.title}</span>
                    <span className="text-sm text-muted-foreground"></span>
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border border-border/80 shadow-sm">
          <CardHeader className="border-b border-border/80">
            <CardTitle className="flex items-center gap-2 text-xl font-semibold">
              <MessageSquare className="w-5 h-5" /> Comments ({comments.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-6">
            {user ? (
              <div className="flex gap-3 items-start">
                <Avatar className="mt-1">
                  <AvatarImage src={user.avatarUrl || undefined} alt={user.name || 'User'} data-ai-hint="user avatar comment" />
                  <AvatarFallback>{user.name?.substring(0, 1).toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <Textarea
                    placeholder="Add a comment about the story..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    rows={3}
                    className="w-full"
                    disabled={isSubmittingComment}
                  />
                  <Button onClick={handleCommentSubmit} size="sm" disabled={commentText.trim() === '' || isSubmittingComment}>
                    {isSubmittingComment ? <Loader2 className="h-4 w-4 mr-1 animate-spin"/> : <Send className="h-4 w-4 mr-1" />} Post Comment
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
            <div className="space-y-4 pt-4">
                {comments.length === 0 && (
                     <p className="text-center text-sm text-muted-foreground italic">No story comments yet.</p>
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Wrap with Suspense for client components that might use hooks like useSearchParams
const SuspendedStoryDetailPage: NextPage<StoryPageProps> = (props) => (
  <Suspense fallback={<div className="flex items-center justify-center min-h-[calc(100vh-10rem)]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
    <StoryDetailPage {...props} />
  </Suspense>
);


export default SuspendedStoryDetailPage;

