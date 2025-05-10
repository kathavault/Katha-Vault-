// src/app/story/[slug]/page.tsx
import { getStories } from '@/lib/storyService'; // Assuming this is the correct function for fetching story slugs
import { Suspense } from 'react';

interface StoryPageResolvedParams {
    slug: string;
}
interface StoryPageProps {
    params: StoryPageResolvedParams;
}


export async function generateStaticParams(): Promise<StoryPageResolvedParams[]> {
    try {
        console.log("generateStaticParams for /story/[slug] running...");
        // Ensure fetchStories is adapted or a new function is created to return only { slug: string } or full stories
        const stories = await getStories(); 
        if (!stories || stories.length === 0) {
            console.warn("No stories returned from fetchStories() for generateStaticParams in /story/[slug].");
            return [];
        }
        const params = stories
            .map((story: { slug: any; }) => ({
                slug: story.slug, // Assuming story object has a slug property
            }))
            .filter((param: { slug: string | any[]; }) => typeof param.slug === 'string' && param.slug.length > 0);

        console.log(`Generated ${params.length} static params for /story/[slug]:`, params.slice(0, 10));
        return params;
    } catch (error) {
        console.error("Error fetching stories for generateStaticParams in /story/[slug]:", error);
        return [];
    }
}


const StoryPage = ({ params }: StoryPageProps) => {
    const { slug } = params;

    if (!slug) {
        // This case should ideally not be hit if generateStaticParams works correctly for static export
        // or if dynamic segment validation is in place.
        return <div>Error: Story slug is missing.</div>;
    }

    return (
        <div>Story slug: {slug}</div> // Placeholder or alternative content
    );
};

export default StoryPage;
