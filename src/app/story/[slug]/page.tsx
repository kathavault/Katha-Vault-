// src/app/story/[slug]/page.tsx
'use client';

import type { NextPage } from 'next';
import Image from 'next/image';
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
    PlusCircle,
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
    Heart,
} from 'lucide-react';
import type { Story as BaseStory } from '@/components/story/story-card';
import React, { useEffect, useState, Suspense, use } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { validateCommentData, validateRatingData } from '@/services/validationService';
import { fetchStoryDetails, submitStoryComment, submitStoryRating, toggleLibraryStatus } from '@/lib/storyService';
import type { Timestamp } from 'firebase/firestore';

// Define the Story type again for clarity, aligning with `storyService` expectations
// Ensure this aligns with the structure returned by fetchStoryDetails
interface Author {
    name: string;
    id: string;
    avatarUrl?: string;
}

interface StoryCommentData {
    id: string;
    userId: string;
    userName: string;
    userAvatar?: string | null;
    text: string;
    timestamp: Date;
}

interface ChapterSummary {
    id: string;
    title: string;
    order: number;
    wordCount?: number;
    lastUpdated?: string; // ISO string
}

interface StoryDetailsResult {
    id: string;
    title: string;
    description: string;
    genre: string;
    tags: string[];
    status: 'Draft' | 'Published' | 'Archived' | 'Ongoing' | 'Completed';
    authorId: string;
    authorName: string; // Ensure this is fetched
    coverImageUrl?: string;
    reads?: number;
    author: Author;
    authorFollowers: number;
    chapters: number; // Explicit chapters count
    chaptersData: ChapterSummary[];
    lastUpdated: string; // ISO string for consistency
    averageRating?: number;
    totalRatings?: number;
    comments?: StoryCommentData[];
    userRating?: number;
    isInLibrary?: boolean;
    slug: string;
    dataAiHint?: string;
}

interface StoryPageResolvedParams {
    slug: string;
}

interface StoryPageProps {
    params: Promise<StoryPageResolvedParams>;
}

const StoryDetailPage: NextPage<StoryPageProps> = (props) => {
    const resolvedParams = use(props.params);
    const { slug } = resolvedParams;

    const { user, isLoading: authLoading } = useAuth();
    const { toast } = useToast();
    const [story, setStory] = useState<StoryDetailsResult | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [commentText, setCommentText] = useState('');
    const [rating, setRating] = useState(0);
    const [isInLibrary, setIsInLibrary] = useState(false);
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [isSubmittingRating, setIsSubmittingRating] = useState(false);
    const [isTogglingLibrary, setIsTogglingLibrary] = useState(false);
    const [comments, setComments] = useState<StoryCommentData[]>([]);

    useEffect(() => {
        const fetchStory = async () => {
            if (!slug) return;
            setIsLoading(true);
            try {
                const data = await fetchStoryDetails(slug, user?.id);
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
        if (!authLoading && slug) {
            fetchStory();
        }
    }, [slug, user?.id, authLoading, toast]);

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
        setRating(newRating);
        try {
            await submitStoryRating({
                storyId: story.id,
                userId: user.id,
                rating: newRating,
            });
            toast({ title: "Rating Submitted", description: `You rated this story ${newRating} stars.` });
            // Re-fetch story details to update average rating display
            fetchStoryDetails(slug, user?.id).then(data => {
                if (data) setStory(data);
            });
        } catch (error) {
            console.error("Error submitting story rating:", error);
            toast({ title: "Error Submitting Rating", description: "Could not save your rating. Please try again.", variant: "destructive" });
            setRating(previousRating);
        } finally {
            setIsSubmittingRating(false);
        }
    };

    const handleShareStory = async (platform: 'web' | 'facebook' | 'twitter' | 'copy') => {
        if (!story) {
            toast({ title: "Error", description: "Story not available.", variant: "destructive" });
            return;
        }
        const url = window.location.href;
        const text = `Check out "${story.title}" by ${story.author.name} on Katha Vault!`;

        if (platform === 'copy') {
             handleCopyUrl();
             return;
        }

        if (platform === 'web' && navigator.share) {
            try {
                await navigator.share({ title: story.title, text: text, url: url });
            } catch (error) {
                console.error("Web Share API error:", error);
                handleCopyUrl(); // Fallback to copy link
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
            } else {
                handleCopyUrl(); // Default to copy link if platform not matched
            }
        }
    };

    const handleCopyUrl = () => {
        if (!story) return;
        const storyUrl = window.location.href;
        navigator.clipboard.writeText(storyUrl)
            .then(() => toast({ title: "Copied!", description: "Story URL copied to clipboard." }))
            .catch(error => {
                console.error("Failed to copy story URL:", error);
                toast({ title: "Error", description: "Failed to copy URL.", variant: "destructive" });
            });
    };

    const handleToggleLibrary = async () => {
        if (!user || !story || isTogglingLibrary) {
            if (!user) toast({ title: "Login Required", description: "Please log in to manage your library.", variant: "destructive" });
            return;
        }
        setIsTogglingLibrary(true);
        const previousLibraryStatus = isInLibrary;
        setIsInLibrary(!isInLibrary);
        try {
            await toggleLibraryStatus(user.id, story.id, !previousLibraryStatus);
            toast({ title: `Story ${!previousLibraryStatus ? 'Added To' : 'Removed From'} Library` });
        } catch (error) {
            console.error("Error toggling library status:", error);
            toast({ title: "Library Error", description: "Could not update your library. Please try again.", variant: "destructive" });
            setIsInLibrary(previousLibraryStatus);
        } finally {
            setIsTogglingLibrary(false);
        }
    };

    if (isLoading || authLoading) {
        return <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
    }

    if (!story) {
        return <div className="text-center py-20 text-xl text-muted-foreground">Story not found or failed to load.</div>;
    }

    const displayRating = story.averageRating ? story.averageRating.toFixed(1) : 'N/A';

    return (
        <div className="container mx-auto py-6 md:py-10">
            {/* Header Section - Title and Author */}
            <section className="mb-8 md:mb-12 text-center">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight text-foreground mb-2">{story.title}</h1>
                <div className="text-lg text-muted-foreground">
                    by <Link href={`/profile/${story.author.id}`} className="text-primary hover:underline font-medium">{story.author.name}</Link>
                </div>
            </section>

            {/* Cover Image Section */}
            {story.coverImageUrl && (
                 <section className="mb-8 md:mb-12 flex justify-center">
                     <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md aspect-[2/3] overflow-hidden rounded-lg shadow-lg border border-border/80">
                         <Image
                             src={story.coverImageUrl}
                             alt={`Cover for ${story.title}`}
                             fill
                             sizes="(max-width: 640px) 80vw, (max-width: 768px) 40vw, 33vw"
                             className="object-cover"
                             priority // Consider making this dynamic if needed
                             data-ai-hint={story.dataAiHint || "book cover story detail large"}
                         />
                     </div>
                 </section>
             )}


            {/* Main Layout Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
                {/* Left Column: Actions, Meta */}
                <aside className="md:col-span-4 lg:col-span-3 space-y-6">
                    {/* Removed duplicate cover image card */}

                    <div className="space-y-3 sticky top-20">
                        <Button size="lg" asChild className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-base font-semibold shadow-md">
                            <Link href={`/read/${slug}/1`}>
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
                                 <span className="font-semibold">{displayRating} ({story.totalRatings || 0})</span>
                             </div>
                             <Separator/>
                             <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Status</span>
                                 <Badge variant={story.status === 'Completed' ? "secondary" : "outline"} className="capitalize text-xs">
                                   {story.status}
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
                        <CardHeader><CardTitle className="text-xl font-semibold">Summary</CardTitle></CardHeader>
                        <CardContent className="prose dark:prose-invert max-w-none">
                            <p className="text-base leading-relaxed whitespace-pre-line">{story.description}</p>
                        </CardContent>
                    </Card>

                    {/* Author Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl font-semibold">About the Author</CardTitle>
                        </CardHeader>
                        <CardContent className="flex items-center gap-4">
                            <Link href={`/profile/${story.author.id}`}>
                                <Avatar className="h-16 w-16 border-2 border-primary">
                                    <AvatarImage src={story.author.avatarUrl} alt={story.author.name} data-ai-hint="author avatar medium"/>
                                    <AvatarFallback className="text-xl">{story.author.name.substring(0, 1).toUpperCase()}</AvatarFallback>
                                </Avatar>
                            </Link>
                            <div>
                                <Link href={`/profile/${story.author.id}`} className="text-lg font-semibold text-primary hover:underline">{story.author.name}</Link>
                                <p className="text-sm text-muted-foreground">{story.authorFollowers.toLocaleString()} Followers</p>
                                {/* <Button variant="outline" size="sm" className="mt-2"><Heart className="mr-2 h-4 w-4"/> Follow (Soon)</Button> */}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="border-b">
                            <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                                <List className="w-5 h-5" /> Table of Contents ({story.chaptersData.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 max-h-[400px] overflow-y-auto">
                            <ul className="divide-y">
                                {story.chaptersData.map((chapter, index) => (
                                    <li key={chapter.id}>
                                        <Link href={`/read/${slug}/${chapter.order}`} className="flex justify-between items-center p-4 hover:bg-secondary/50 transition-colors duration-150 group">
                                            <span className="font-medium group-hover:text-primary">{chapter.order}. {chapter.title}</span>
                                            <span className="text-xs text-muted-foreground">{/* Add word count or date later */}</span>
                                        </Link>
                                    </li>
                                ))}
                                {story.chaptersData.length === 0 && (
                                    <li className="p-6 text-center text-muted-foreground italic">No chapters published yet.</li>
                                )}
                            </ul>
                        </CardContent>
                    </Card>

                     {/* Your Rating for the Story */}
                     <Card>
                         <CardHeader><CardTitle className="text-xl font-semibold">Rate This Story</CardTitle></CardHeader>
                         <CardContent>
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
                             </div>
                             {!user && <p className="text-sm text-muted-foreground mt-2"><Link href="/login" className="text-primary underline">Log in</Link> to rate.</p>}
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
                                {comments.length === 0 && !user && (
                                    <p className="text-center text-sm text-muted-foreground italic py-4">No comments yet.</p>
                                )}
                                {comments.map((comment) => (
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
                                               <p className="text-xs text-muted-foreground">{new Date(comment.timestamp).toLocaleDateString()}</p>
                                            </div>
                                            <p className="text-sm text-foreground/90 whitespace-pre-line">{comment.text}</p>
                                        </div>
                                    </div>
                               ))}
                           </div>
                       </CardContent>
                   </Card>

                   {/* Share Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl font-semibold flex items-center gap-2"><Share2 className="w-5 h-5"/> Share Story</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-wrap gap-3">
                            <Button variant="outline" onClick={() => handleShareStory('twitter')}><Twitter className="mr-2 h-4 w-4"/> Twitter/X</Button>
                            <Button variant="outline" onClick={() => handleShareStory('facebook')}><Facebook className="mr-2 h-4 w-4"/> Facebook</Button>
                            <Button variant="outline" onClick={() => handleShareStory('copy')}><Copy className="mr-2 h-4 w-4"/> Copy Link</Button>
                            {typeof window !== 'undefined' && navigator.share && ( // Check if navigator is available
                                <Button variant="outline" onClick={() => handleShareStory('web')}><Share2 className="mr-2 h-4 w-4" /> More...</Button>
                            )}
                        </CardContent>
                    </Card>

                </main>
            </div>
        </div>
    );
};

const SuspendedStoryDetailPage: NextPage<StoryPageProps> = (props) => (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[calc(100vh-10rem)]"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>}>
        <StoryDetailPage {...props} />
    </Suspense>
);

export default SuspendedStoryDetailPage;
