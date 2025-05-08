// src/app/story/[slug]/page.tsx
'use client';

// --- Type Definitions ---
import React, { useEffect, useState, Suspense, use } from 'react'; // Added 'use' hook
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    BookOpen,
    Eye,
    List,
    CheckCircle,
    Star,
    Share2,
    Send,
    Loader2,
    Twitter,
    Facebook,
    Copy,
    MessageSquare,
    Bookmark,
    // Removed unused icons: Users, ThumbsUp, PlusCircle, Library, Heart
} from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/hooks/use-auth'; // Ensure this path is correct
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast'; // Ensure this path is correct
import { validateCommentData, validateRatingData } from '@/services/validationService'; // Ensure this path is correct
import { Skeleton } from '@/components/ui/skeleton'; // Ensure this path is correct
import type { StoryDetailsResult, StoryCommentData } from '@/types'; // Import types directly
import { fetchStoryDetails, submitStoryComment, submitStoryRating, toggleLibraryStatus } from '@/lib/storyService'; // Ensure this path is correct


// Define the shape of the resolved params if necessary, or rely on Next.js context
interface StoryParams {
  slug: string;
}

interface StoryPageProps {
  params: Promise<StoryParams>; // Params are now a Promise
}

// Loader component for Suspense boundary
const StoryDetailLoader: React.FC = () => (
     <div className="container mx-auto py-6 md:py-10">
        <section className="mb-8 md:mb-12 text-center space-y-3">
           <Skeleton className="h-10 w-3/4 mx-auto" />
           <Skeleton className="h-6 w-1/4 mx-auto" />
        </section>
         <section className="mb-8 md:mb-12 flex justify-center">
            <Skeleton className="w-full max-w-xs sm:max-w-sm md:max-w-md aspect-[2/3] rounded-lg" />
         </section>
         <section className="mb-8 md:mb-12 flex flex-col items-center gap-4">
              <Skeleton className="h-10 w-48" />
               <div className="flex gap-3">
                   <Skeleton className="h-8 w-24" />
                   <Skeleton className="h-8 w-24" />
                   <Skeleton className="h-8 w-24" />
               </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
              <aside className="md:col-span-4 lg:col-span-3 space-y-6">
                  <div className="space-y-3 sticky top-20">
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                  </div>
                   <Card><CardContent className="p-4 space-y-3"><Skeleton className="h-5 w-full" /><Skeleton className="h-5 w-full" /><Skeleton className="h-5 w-full" /></CardContent></Card>
                   <Card><CardContent className="p-4"><Skeleton className="h-6 w-1/2" /></CardContent></Card>
               </aside>
              <main className="md:col-span-8 lg:col-span-9 space-y-8">
                  <Card><CardHeader><Skeleton className="h-6 w-1/4" /></CardHeader><CardContent><Skeleton className="h-20 w-full" /></CardContent></Card>
                  <Card><CardHeader><Skeleton className="h-6 w-1/4" /></CardHeader><CardContent className="flex items-center gap-4"><Skeleton className="h-16 w-16 rounded-full" /><div className="space-y-2"><Skeleton className="h-5 w-32" /><Skeleton className="h-4 w-24" /></div></CardContent></Card>
                   <Card><CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader><CardContent className="space-y-2"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></CardContent></Card>
                   <Card><CardHeader><Skeleton className="h-6 w-1/4" /></CardHeader><CardContent className="space-y-4"><Skeleton className="h-24 w-full" /><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></CardContent></Card>
               </main>
          </div>
     </div>
 );


const StoryDetailPageContent: React.FC<{ slug: string }> = ({ slug }) => {
    // --- Hooks and State ---
    const { user, isLoading: authLoading } = useAuth();
    const { toast } = useToast();
    const [story, setStory] = useState<StoryDetailsResult | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorLoading, setErrorLoading] = useState<string | null>(null);
    const [commentText, setCommentText] = useState('');
    const [rating, setRating] = useState(0);
    const [isInLibrary, setIsInLibrary] = useState(false);
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [isSubmittingRating, setIsSubmittingRating] = useState(false);
    const [isTogglingLibrary, setIsTogglingLibrary] = useState(false);
    const [comments, setComments] = useState<StoryCommentData[]>([]);

    // --- Data Fetching ---
    useEffect(() => {
        const fetchStory = async () => {
            setErrorLoading(null); // Reset error before fetching
            setIsLoading(true);
            try {
                 // Fetch story details using the slug from props
                const data = await fetchStoryDetails(slug, user?.id);

                if (!data) {
                     setErrorLoading("Story not found or failed to load.");
                     setStory(null);
                     console.warn(`fetchStoryDetails returned null for slug: ${slug}`);
                } else {
                     setStory(data);
                     setRating(data.userRating || 0);
                     setIsInLibrary(data.isInLibrary || false);
                     setComments(data.comments || []);
                }
            } catch (error) {
                console.error(`Error in fetchStory useEffect for slug "${slug}":`, error);
                 setErrorLoading("An unexpected error occurred while loading the story.");
                setStory(null);
                toast({
                    title: "Error Loading Story",
                    description: "Could not load story details. Please try again later.",
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        };

        if (slug && !authLoading) { // Fetch only when slug is available and auth is resolved
             fetchStory();
        } else if (!slug) {
            setIsLoading(false);
            setErrorLoading("Story identifier is missing.");
            setStory(null);
            console.error("Story slug is missing in StoryDetailPageContent props.");
        }
        // Note: If authLoading changes, useEffect will re-run if user?.id changes,
        // causing a re-fetch which might be desired to get user-specific data.
    }, [slug, user?.id, toast, authLoading]); // Include authLoading

    // --- Handlers ---
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
            // Optimistically update comments state
            setComments(prevComments => [{
                id: newComment.id,
                userId: user.id,
                userName: user.name || 'User', // Use display name or fallback
                userAvatar: user.avatarUrl,
                text: commentText,
                timestamp: new Date() // Use client time for immediate feedback
            }, ...prevComments]);
            toast({ title: "Comment Posted", description: "Your comment has been added." });
            setCommentText(''); // Clear input field
        } catch (error) {
            console.error("Error submitting story comment:", error);
            toast({ title: "Error Posting Comment", description: "Could not post your comment. Please try again later.", variant: "destructive" });
        } finally {
            setIsSubmittingComment(false);
        }
    };

    const handleRateStory = async (newRating: number) => {
        if (!user || !story || isSubmittingRating) {
            if (!user) toast({ title: "Login Required", description: "Please log in to rate.", variant: "destructive" });
            return;
        }
        const validationError = validateRatingData({ rating: newRating });
        if (validationError) {
            toast({ title: "Validation Error", description: validationError, variant: "destructive" });
            return;
        }
        setIsSubmittingRating(true);
        const previousRating = rating;
        setRating(newRating); // Optimistic update
        try {
            await submitStoryRating({
                storyId: story.id,
                userId: user.id,
                rating: newRating,
            });
            toast({ title: "Rating Submitted", description: `You rated this story ${newRating} stars.` });
            // Re-fetch story details to update average rating display accurately
             fetchStoryDetails(slug, user?.id).then(data => {
                if(data) {
                    setStory(data); // Update story data with new average rating etc.
                    setRating(data.userRating || 0); // Ensure local rating matches fetched state
                }
             });
        } catch (error) {
            console.error("Error submitting story rating:", error);
            toast({ title: "Error Submitting Rating", description: "Could not save your rating. Please try again.", variant: "destructive" });
            setRating(previousRating); // Revert optimistic update on error
        } finally {
            setIsSubmittingRating(false);
        }
    };

    const handleCopyUrl = () => {
        if (!story) return;
        const storyUrl = window.location.href; // Get current URL
        navigator.clipboard.writeText(storyUrl)
            .then(() => toast({ title: "Copied!", description: "Story URL copied to clipboard." }))
            .catch(error => {
                console.error("Failed to copy story URL:", error);
                toast({ title: "Error", description: "Failed to copy URL.", variant: "destructive" });
            });
    };

    const handleShareStory = async (platform: 'web' | 'facebook' | 'twitter' | 'copy') => {
        if (!story || !story.author) {
            toast({ title: "Error", description: "Story data not available for sharing.", variant: "destructive" });
            return;
        }
        const url = window.location.href;
        const text = `Check out "${story.title}" by ${story.author.name} on Katha Vault!`;

        if (platform === 'copy') {
             handleCopyUrl();
             return;
        }

        if (platform === 'web' && typeof window !== 'undefined' && navigator.share) {
            try {
                await navigator.share({ title: story.title, text: text, url: url });
            } catch (error) {
                 if ((error as DOMException).name !== 'AbortError') {
                    console.error("Web Share API error:", error);
                    toast({ title: "Share Failed", description: "Could not share using Web Share.", variant: "destructive" });
                 }
            }
        } else {
            let shareUrl = '';
            if (platform === 'facebook') {
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
            } else if (platform === 'twitter') {
                shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
            }
            if (shareUrl) {
                window.open(shareUrl, '_blank', 'noopener,noreferrer');
            } else if (platform !== 'web') {
                 handleCopyUrl(); // Default to copy link
            }
        }
    };

    const handleToggleLibrary = async () => {
        if (!user || !story || isTogglingLibrary) {
            if (!user) toast({ title: "Login Required", description: "Please log in to manage your library.", variant: "destructive" });
            return;
        }
        setIsTogglingLibrary(true);
        const previousLibraryStatus = isInLibrary;
        setIsInLibrary(!isInLibrary); // Optimistic update
        try {
            await toggleLibraryStatus(user.id, story.id, !previousLibraryStatus);
            toast({ title: `Story ${!previousLibraryStatus ? 'Added To' : 'Removed From'} Library` });
        } catch (error) {
            console.error("Error toggling library status:", error);
            toast({ title: "Library Error", description: "Could not update your library. Please try again.", variant: "destructive" });
            setIsInLibrary(previousLibraryStatus); // Revert on error
        } finally {
            setIsTogglingLibrary(false);
        }
    };

    // --- Render Logic ---
    // Use combined loading state
    if (isLoading || authLoading) {
        // Return the loader directly, Suspense boundary handles this at the page level
        return <StoryDetailLoader />;
    }

     // Handle error state after loading finishes
     if (errorLoading) {
         return <div className="text-center py-20 text-xl text-destructive">{errorLoading}</div>;
     }

    // Handle case where story is definitively not found after loading
    if (!story) {
        return <div className="text-center py-20 text-xl text-muted-foreground">Story not found.</div>;
    }

    // Ensure story.author exists before accessing its properties
    const authorName = story.author?.name || 'Unknown Author';
    const authorId = story.author?.id || 'unknown';
    const authorAvatar = story.author?.avatarUrl;
    const authorFollowers = story.authorFollowers || 0;

    const displayRating = story.averageRating ? story.averageRating.toFixed(1) : 'N/A';
    const totalRatings = story.totalRatings || 0;

    // Custom summary for Dil Ke Raaste
    const dilKeRaasteSummary = `Dil Ke Raaste ek dil ko chhoo lene wali romantic kahani hai jo Anaya, ek kalpnik aur pratibhashali ladki, aur Aarav, ek safal lekin thoda reserved vyapari, ke beech ke rishton par adharit hai. Jab unke parivaron ke beech ek achanak rishta tay hota hai, to dono ki zindagi ek naye mod par aa jati hai.\n\nYeh kahani parivaarik ummeedein, samajik dabav aur vyakti ke sapno ke beech pyaar, vishwas aur samarpan ki yatra hai.`;

    return (
        <div className="container mx-auto py-6 md:py-10">
            {/* Header Section - Title and Author */}
            <section className="mb-8 md:mb-12 text-center">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight text-foreground mb-2">{story.title}</h1>
                <div className="text-lg text-muted-foreground">
                    by <Link href={`/profile/${authorId}`} className="text-primary hover:underline font-medium">{authorName}</Link>
                </div>
            </section>

            {/* Cover Image Section */}
             <section className="mb-8 md:mb-12 flex justify-center">
                 <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md aspect-[2/3] overflow-hidden rounded-lg shadow-lg border border-border/80 bg-muted"> {/* Added bg-muted for fallback */}
                     <Image
                         src={story.coverImageUrl || `https://picsum.photos/seed/${story.slug}/400/600`} // Fallback image
                         alt={`Cover for ${story.title}`}
                         fill
                         sizes="(max-width: 640px) 80vw, (max-width: 768px) 40vw, 33vw"
                         className="object-cover"
                         priority // LCP element, prioritize loading
                         data-ai-hint={story.dataAiHint || "book cover story detail large"}
                         onError={(e) => {
                             console.error("Image failed to load:", story.coverImageUrl, e);
                             // Optionally replace with a placeholder on error
                             e.currentTarget.src = `https://picsum.photos/seed/${story.slug}/400/600`; // Fallback
                             e.currentTarget.srcset = ''; // Reset srcset
                         }}
                     />
                 </div>
             </section>


            {/* Rating and Social Share (Added below image) */}
            <section className="mb-8 md:mb-12 flex flex-col items-center gap-4">
                 {/* Story Rating */}
                  <div className="flex items-center gap-1 pt-1">
                      {[1, 2, 3, 4, 5].map((starVal) => (
                           <Button
                              key={starVal} variant="ghost" size="icon"
                              onClick={() => handleRateStory(starVal)}
                              disabled={!user || isSubmittingRating}
                              className={`p-1 h-auto w-auto ${!user ? 'cursor-not-allowed opacity-60' : ''}`}
                              aria-label={`Rate story ${starVal} stars`}
                           >
                               <Star className={`h-7 w-7 transition-colors ${starVal <= rating ? 'fill-primary text-primary' : 'text-muted-foreground/40'} ${user ? 'hover:text-primary/70' : ''}`} />
                           </Button>
                       ))}
                       {isSubmittingRating && <Loader2 className="h-6 w-6 animate-spin text-muted-foreground ml-3" />}
                       <span className="text-sm text-muted-foreground ml-2">({displayRating} / {totalRatings})</span>
                   </div>
                   {!user && <p className="text-sm text-muted-foreground"><Link href="/login" className="text-primary underline">Log in</Link> to rate.</p>}

                   {/* Share Section */}
                   <div className="flex flex-wrap justify-center gap-3">
                       <Button variant="outline" size="sm" onClick={() => handleShareStory('twitter')}><Twitter className="mr-2 h-4 w-4"/> Twitter/X</Button>
                       <Button variant="outline" size="sm" onClick={() => handleShareStory('facebook')}><Facebook className="mr-2 h-4 w-4"/> Facebook</Button>
                       <Button variant="outline" size="sm" onClick={() => handleShareStory('copy')}><Copy className="mr-2 h-4 w-4"/> Copy Link</Button>
                       {typeof window !== 'undefined' && navigator.share && ( // Check if navigator is available
                           <Button variant="outline" size="sm" onClick={() => handleShareStory('web')}><Share2 className="mr-2 h-4 w-4" /> More...</Button>
                       )}
                   </div>
            </section>

            {/* Main Layout Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
                {/* Left Column: Actions, Meta */}
                <aside className="md:col-span-4 lg:col-span-3 space-y-6">
                    <div className="space-y-3 sticky top-20">
                        <Button
                            size="lg"
                            asChild
                            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-base font-semibold shadow-md"
                            // Disable button if no chapters exist
                            disabled={story.chaptersData.length === 0}
                            >
                            {/* Link to the first chapter or # if no chapters */}
                             <Link href={story.chaptersData?.length > 0 ? `/read/${slug}/${story.chaptersData[0].order}` : '#'}>
                                <BookOpen className="mr-2 h-5 w-5" /> Start Reading
                            </Link>
                        </Button>
                        <Button
                            variant={isInLibrary ? "secondary" : "outline"}
                            size="lg"
                            className="w-full text-base font-semibold border-primary/50 hover:border-primary"
                            onClick={handleToggleLibrary}
                            disabled={!user || isTogglingLibrary}
                        >
                            {isTogglingLibrary ? <Loader2 className="mr-2 h-5 w-5 animate-spin"/> : (
                                isInLibrary ? <CheckCircle className="mr-2 h-5 w-5 text-green-500" /> : <Bookmark className="mr-2 h-5 w-5" />
                            )}
                            {isInLibrary ? 'In Library' : 'Add to Library'}
                            {!user && <span className="text-xs ml-1 opacity-70">(Log in)</span>}
                        </Button>
                    </div>

                    {/* Story Stats */}
                     <Card>
                        <CardContent className="p-4 space-y-2 text-sm">
                             <div className="flex items-center justify-between">
                                 <span className="text-muted-foreground flex items-center gap-1.5"><Eye className="w-4 h-4" /> Reads</span>
                                 <span className="font-semibold">{story.reads?.toLocaleString() || 0}</span>
                             </div>
                             <Separator/>
                             <div className="flex items-center justify-between">
                                 <span className="text-muted-foreground flex items-center gap-1.5"><List className="w-4 h-4" /> Chapters</span>
                                 <span className="font-semibold">{story.chapters}</span>
                             </div>
                             <Separator/>
                             <div className="flex items-center justify-between">
                                <span className="text-muted-foreground flex items-center gap-1.5"><Star className="w-4 h-4" /> Rating</span>
                                 <span className="font-semibold">{displayRating} ({totalRatings})</span>
                             </div>
                             <Separator/>
                             <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Status</span>
                                 <Badge variant={story.status === 'Completed' ? "secondary" : "outline"} className="capitalize text-xs">
                                   {story.status || 'Unknown'}
                                 </Badge>
                             </div>
                              <Separator/>
                              <div className="flex items-center justify-between">
                                 <span className="text-muted-foreground">Updated</span>
                                 <span className="font-semibold">{new Date(story.lastUpdated).toLocaleDateString()}</span>
                              </div>
                         </CardContent>
                     </Card>

                    {/* Tags */}
                    {story.tags && story.tags.length > 0 && (
                        <Card>
                            <CardHeader className="p-4 pb-2"><CardTitle className="text-base font-semibold">Tags</CardTitle></CardHeader>
                            <CardContent className="p-4 pt-0">
                                <div className="flex flex-wrap gap-2">
                                    {story.tags.map(tag => (
                                        <Link key={tag} href={`/browse?tags=${encodeURIComponent(tag)}`} passHref>
                                            <Badge variant="secondary" className="hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer">
                                                #{tag.toLowerCase()}
                                            </Badge>
                                        </Link>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </aside>

                {/* Right Column: Summary, Chapters, Author, Comments */}
                <main className="md:col-span-8 lg:col-span-9 space-y-8">
                    <Card>
                        <CardHeader><CardTitle className="text-xl font-semibold">Story Summary</CardTitle></CardHeader>
                        <CardContent className="prose dark:prose-invert max-w-none">
                           {/* Conditional rendering for Dil Ke Raaste */}
                            {story.slug === 'dil-ke-raaste' ? (
                               <div className="text-base leading-relaxed whitespace-pre-line">
                                   {/* Split the summary into paragraphs */}
                                   {dilKeRaasteSummary.split('\n\n').map((para, index) => (
                                       <p key={index}>{para}</p>
                                   ))}
                               </div>
                           ) : (
                               <p className="text-base leading-relaxed whitespace-pre-line">{story.description}</p>
                           )}
                        </CardContent>
                    </Card>

                    {/* Author Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl font-semibold">About the Author</CardTitle>
                        </CardHeader>
                        <CardContent className="flex items-center gap-4">
                            <Link href={`/profile/${authorId}`}>
                                <Avatar className="h-16 w-16 border-2 border-primary">
                                    <AvatarImage src={authorAvatar} alt={authorName} data-ai-hint="author avatar medium"/>
                                    <AvatarFallback className="text-xl">{authorName?.substring(0, 1).toUpperCase() || 'A'}</AvatarFallback>
                                </Avatar>
                            </Link>
                            <div>
                                <Link href={`/profile/${authorId}`} className="text-lg font-semibold text-primary hover:underline">{authorName}</Link>
                                <p className="text-sm text-muted-foreground">{authorFollowers.toLocaleString()} Followers</p>
                                {/* Follow button logic can be added here */}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Table of Contents */}
                    <Card>
                        <CardHeader className="border-b">
                            <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                                <List className="w-5 h-5" /> Table of Contents ({story.chaptersData.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 max-h-[400px] overflow-y-auto">
                            <ul className="divide-y">
                                {story.chaptersData.length > 0 ? (
                                  story.chaptersData.map((chapter) => (
                                    <li key={chapter.id}>
                                        <Link href={`/read/${slug}/${chapter.order}`} className="flex justify-between items-center p-4 hover:bg-secondary/50 transition-colors duration-150 group">
                                            <span className="font-medium group-hover:text-primary">{chapter.order}. {chapter.title}</span>
                                            <span className="text-xs text-muted-foreground">{chapter.wordCount ? `${chapter.wordCount.toLocaleString()} words` : ''}</span>
                                        </Link>
                                    </li>
                                ))
                                ) : (
                                    <li className="p-6 text-center text-muted-foreground italic">No chapters published yet.</li>
                                )}
                            </ul>
                        </CardContent>
                    </Card>


                     {/* Story Comments */}
                    <Card>
                        <CardHeader className="border-b">
                            <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                                <MessageSquare className="w-5 h-5" /> Story Comments ({comments.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-5 space-y-6">
                            {user ? (
                                <div className="flex gap-4 items-start">
                                    <Avatar className="mt-1 h-10 w-10">
                                        <AvatarImage src={user.avatarUrl || undefined} alt={user.name || 'User'} data-ai-hint="user comment avatar"/>
                                        <AvatarFallback>{user.name?.substring(0, 1).toUpperCase() || 'U'}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 space-y-2">
                                        <Textarea
                                            placeholder="Share your thoughts on the story..."
                                            value={commentText}
                                            onChange={(e) => setCommentText(e.target.value)}
                                            rows={3}
                                            disabled={isSubmittingComment}
                                        />
                                        <Button onClick={handleCommentSubmit} size="sm" disabled={commentText.trim() === '' || isSubmittingComment}>
                                            {isSubmittingComment ? <Loader2 className="h-4 w-4 mr-2 animate-spin"/> : <Send className="h-4 w-4 mr-2" />} Post Comment
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center p-6 border border-dashed rounded-md bg-secondary/30">
                                    <p className="text-muted-foreground">
                                        <Link href="/login" className="text-primary font-medium hover:underline">Log in</Link> or{' '}
                                        <Link href="/signup" className="text-primary font-medium hover:underline">Sign up</Link> to leave a comment.
                                    </p>
                                </div>
                            )}
                            <div className="space-y-5">
                                {comments.length === 0 && (
                                    <p className="text-center text-sm text-muted-foreground italic py-4">No comments yet. Be the first!</p>
                                )}
                                {comments.length > 0 && comments.map((comment) => (
                                   <div key={comment.id} className="flex gap-3 items-start">
                                       <Link href={`/profile/${comment.userId}`}>
                                          <Avatar className="h-9 w-9">
                                               <AvatarImage src={comment.userAvatar || undefined} alt={comment.userName || 'User'} data-ai-hint="commenter story avatar"/>
                                               <AvatarFallback>{comment.userName?.substring(0, 1).toUpperCase() || 'U'}</AvatarFallback>
                                           </Avatar>
                                       </Link>
                                        <div className="p-3.5 rounded-lg bg-secondary/50 border w-full">
                                            <div className="flex items-center justify-between mb-1">
                                               <Link href={`/profile/${comment.userId}`} className="font-semibold text-sm hover:underline">{comment.userName}</Link>
                                               <p className="text-xs text-muted-foreground">{comment.timestamp ? new Date(comment.timestamp).toLocaleDateString() : ''}</p>
                                            </div>
                                            <p className="text-sm text-foreground/90 whitespace-pre-line">{comment.text}</p>
                                        </div>
                                    </div>
                               ))}
                           </div>
                       </CardContent>
                   </Card>

                </main>
            </div>
        </div>
    );
};


// The main page component that uses Suspense
const SuspendedStoryDetailPage: NextPage<StoryPageProps> = (props) => {
    // Use React.use() to unwrap the promise from props.params
    const params = use(props.params);
    const { slug } = params; // Now slug is available directly

    return (
        <Suspense fallback={<StoryDetailLoader />}>
            {/* Pass the resolved slug to the client component */}
            <StoryDetailPageContent slug={slug} />
        </Suspense>
    );
};

export default SuspendedStoryDetailPage;

