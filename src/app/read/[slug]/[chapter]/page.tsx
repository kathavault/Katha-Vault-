import React, { Suspense } from 'react';
import { getStories, fetchStoryDetails } from '@/lib/storyService'; // For generateStaticParams
import { fetchChapterContentByOrder } from '@/lib/readerService'; // For fetching chapter content
import ContentRenderer from './ContentRenderer';
import { Loader2, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import ChapterNavigation from './ChapterNavigation'; // Component for Next/Prev chapter links

interface PageProps {
  params: { slug: string; chapter: string }; // chapter is chapterOrder string
}

export async function generateStaticParams(): Promise<{ slug: string; chapter: string }[]> {
  console.log("Generating static params for /read/[slug]/[chapter]...");
  try {
    const stories = await getStories(); // Gets { id, slug } for published stories
    if (!stories || stories.length === 0) {
      console.warn("No stories found for generateStaticParams in /read page.");
      return [];
    }

    const allParams: { slug: string; chapter: string }[] = [];

    for (const story of stories) {
      if (!story.slug || !story.id) {
        console.warn(`Story with ID ${story.id} has no slug. Skipping.`);
        continue;
      }

      // Fetch full story details to get chapter information
      const storyDetails = await fetchStoryDetails(story.slug, null); // null for userId, not relevant for params generation

      if (storyDetails && storyDetails.chaptersData && storyDetails.chaptersData.length > 0) {
        storyDetails.chaptersData.forEach(chap => {
          if (chap.order !== undefined) { // Ensure chapter order is valid
            allParams.push({
              slug: story.slug,
              chapter: chap.order.toString(), // 'chapter' param is the order number as string
            });
          }
        });
      } else {
        console.warn(`No chapters found for story slug: ${story.slug}`);
      }
    }
    console.log(`Generated ${allParams.length} static params for /read/[slug]/[chapter]. Sample:`, allParams.slice(0, 5));
    return allParams;
  } catch (error) {
    console.error("Error in generateStaticParams for /read/[slug]/[chapter]:", error);
    return []; // Prevent build failure by returning empty array, but log error
  }
}

// ChapterContentFetcher component to handle client-side data fetching for content
// This will be wrapped in Suspense
async function ChapterContentData({ slug, chapterOrderStr }: { slug: string; chapterOrderStr: string }) {
  const chapterOrder = parseInt(chapterOrderStr, 10);

  if (isNaN(chapterOrder)) {
    return (
      <div className="text-center py-10">
        <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold text-destructive">Invalid Chapter Number</h2>
        <p className="text-muted-foreground">The chapter number provided is not valid.</p>
        <Button asChild variant="link" className="mt-4">
          <Link href={`/story/${slug}`}>Back to Story Details</Link>
        </Button>
      </div>
    );
  }

  const chapterData = await fetchChapterContentByOrder(slug, chapterOrder);

  if (!chapterData) {
    return (
      <div className="text-center py-10">
        <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold text-destructive">Chapter Not Found</h2>
        <p className="text-muted-foreground">The content for this chapter could not be loaded.</p>
        <Button asChild variant="link" className="mt-4">
          <Link href={`/story/${slug}`}>Back to Story Details</Link>
        </Button>
      </div>
    );
  }

  // Fetch total chapters for navigation (can be optimized by passing from parent if available)
  const storyDetails = await fetchStoryDetails(slug, null);
  const totalChapters = storyDetails?.chaptersData?.length || 0;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <article>
        <header className="mb-8 text-center">
          <Link href={`/story/${slug}`} className="text-sm text-primary hover:underline mb-2 inline-block">
            &larr; Back to {chapterData.storyTitle || 'Story'}
          </Link>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">
            {chapterData.title || `Chapter ${chapterOrder}`}
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            From "{chapterData.storyTitle || 'Untitled Story'}"
          </p>
        </header>

        <ContentRenderer contentString={chapterData.content} />
      </article>

      <ChapterNavigation
        currentChapterOrder={chapterOrder}
        totalChapters={totalChapters}
        storySlug={slug}
      />
    </div>
  );
}

const ChapterPage = ({ params }: PageProps) => {
  const { slug, chapter } = params;

  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    }>
      <ChapterContentData slug={slug} chapterOrderStr={chapter} />
    </Suspense>
  );
};

export default ChapterPage;
