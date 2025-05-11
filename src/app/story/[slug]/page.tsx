// src/app/story/[slug]/page.tsx
import React, { Suspense } from 'react';
import StoryDetailPage from './StoryDetailPage'; // Import the client component
import { getStories } from '@/lib/storyService'; // For generateStaticParams
import { Loader2 } from 'lucide-react';

interface StoryPageResolvedParams {
    slug: string;
}
interface StoryPageProps {
    params: StoryPageResolvedParams;
}

export async function generateStaticParams(): Promise<StoryPageResolvedParams[]> {
    console.log("generateStaticParams for /story/[slug] running...");
    try {
        const stories = await getStories(); 
        if (!stories || stories.length === 0) {
            console.warn("No stories returned from getStories() for generateStaticParams in /story/[slug].");
            return [];
        }
        const params = stories
            .map((story) => ({
                slug: story.slug, 
            }))
            .filter((param) => typeof param.slug === 'string' && param.slug.length > 0);

        console.log(`Generated ${params.length} static params for /story/[slug]. Sample:`, params.slice(0, 5));
        return params;
    } catch (error) {
        console.error("Error in generateStaticParams for /story/[slug]:", error);
        return [];
    }
}


const StoryPage = ({ params }: StoryPageProps) => {
    const { slug } = params;

    if (!slug) {
        // This case should ideally not be hit if generateStaticParams works correctly
        return (
            <div className="container mx-auto py-10 text-center">
                <h1 className="text-2xl font-semibold text-destructive">Error: Story Not Found</h1>
                <p className="text-muted-foreground">The story slug is missing or invalid.</p>
            </div>
        );
    }

    // StoryDetailPage is a Client Component and will handle its own data fetching.
    // We wrap it in Suspense for better UX during data loading.
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        }>
            <StoryDetailPage slug={slug} />
        </Suspense>
    );
};

export default StoryPage;
