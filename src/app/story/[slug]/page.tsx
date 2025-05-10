import { fetchStories } from '@/lib/storyService';
import { Suspense } from 'react';
import StoryDetailPage, { StoryDetailLoader } from './StoryDetailPage';

interface StoryParams {
    slug: string;
}

interface StoryPageProps {
    params: StoryParams;
}

export async function generateStaticParams() {
    try {
        console.log("generateStaticParams for /story/[slug] running...");
        const stories = await fetchStories();
        if (!stories || stories.length === 0) {
            console.warn("No stories returned from getStories() for generateStaticParams in /story/[slug].");
            return [];
        }
        const params = stories
            .map((story) => ({
                slug: story.slug,
            }))
            .filter(param => typeof param.slug === 'string' && param.slug.length > 0);

        console.log(`Generated ${params.length} static params for /story/[slug]:`, params.slice(0, 10));
        return params;
    } catch (error) {
        console.error("Error fetching stories for generateStaticParams:", error);
        return [];
    }
}

const StoryPage = (props: StoryPageProps) => {
    const { slug } = props.params;
    return <Suspense fallback={<StoryDetailLoader />}><StoryDetailPage slug={slug} /></Suspense>;
};
export default StoryPage;
