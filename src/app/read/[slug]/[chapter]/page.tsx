// src/app/read/[slug]/[chapter]/page.tsx
import { fetchChapters } from '@/lib/storyService';
import ChapterContent from './ChapterContent';

interface PageProps {
    params: { slug: string; chapter: string };
}

export async function generateStaticParams() {
    //TODO: enable this when firebase access is enabled
    // try {
    //   const stories = await fetchStories();
    //   const params = [];
    //   for (const story of stories) {
    //     const chapters = await fetchChapters(story.slug);
    //     for (const chapter of chapters) {
    //       params.push({
    //         slug: story.slug,
    //         chapter: chapter.order.toString(),
    //       });
    //     }
    //   }
    //   return params;
    // } catch (error) {
    //   console.error("Error fetching stories for generateStaticParams:", error);
    //   return [];
    // }
    return []
}
const Page = async ({ params }: PageProps) => {
    const { slug, chapter } = params;

    return (
        <div>
            <ChapterContent slug={slug} chapter={chapter} />
        </div>
    );
};

export default Page;
