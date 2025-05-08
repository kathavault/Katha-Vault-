import { fetchStoryDetails, getStories } from '@/lib/storyService';
import type { NextPage } from 'next';
import { Suspense } from 'react';
import StoryDetailPage, { StoryDetailLoader } from './StoryDetailPage';
import type { Story } from '@/types'; // Import the main Story type

interface StoryPageResolvedParams {
    slug: string;
}

interface StoryParams {
  slug: string;
}

interface StoryPageProps {
  params: StoryParams;
}


// Required for static export with dynamic routes
// Fetches slugs for published stories to generate static pages
export async function generateStaticParams(): Promise<{ slug: string }[]> {
  console.log("generateStaticParams for /story/[slug] running...");
  const stories = await getStories(); // Ensure getStories fetches slugs for published stories
  if (!stories || stories.length === 0) {
     console.warn("No stories returned from getStories() for generateStaticParams in /story/[slug].");
     return []; // Return empty array if no stories found
  }
  const params = stories
    .map((story) => ({
      slug: story.slug,
    }))
    // Filter out any potential undefined/null slugs just in case
    .filter(param => typeof param.slug === 'string' && param.slug.length > 0);

  console.log(`Generated ${params.length} static params for /story/[slug]:`, params.slice(0, 10)); // Log first 10 slugs
  return params;
}


const StoryPage: NextPage<StoryPageProps> = (props) => {
  const { slug } = props.params; // Directly access slug since this is a Server Component now

  return (
      <Suspense fallback={<StoryDetailLoader />}>
          {/* Pass slug to the client component */}
          <StoryDetailPage slug={slug} />
      </Suspense>
  );
};
export default StoryPage;
