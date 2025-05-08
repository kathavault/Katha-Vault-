import { fetchStoryDetails, getStories } from '@/lib/storyService';
import type { NextPage } from 'next';
import { Suspense } from 'react';
import StoryDetailPage, { StoryDetailLoader } from './StoryDetailPage';

import type { Timestamp } from 'firebase/firestore';
import type { Story as BaseStory, ChapterSummary as BaseChapterSummary } from '@/lib/types';

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
    // Ensure all fields from src/types Story are here or correctly mapped
}

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
// export async function generateStaticParams(): Promise<{ slug: string }[]> {
//   const stories = await getStories(); // Assuming getStories fetches all necessary story slugs
//   return stories.map((story) => ({
//     slug: story.slug,
//   }));
// }


const StoryPage: NextPage<StoryPageProps> = (props) => {
  const { slug } = props.params; // Directly access slug since this is a Server Component now
  
    return (
        <Suspense fallback={<StoryDetailLoader />}>
            <StoryDetailPage slug={slug} />
        </Suspense>
    );
};
export default StoryPage;
