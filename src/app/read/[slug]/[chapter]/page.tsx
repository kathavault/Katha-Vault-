import type { NextPage } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, List, Settings, MessageSquare } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

// Mock data - replace with actual chapter content fetching
const getChapterContent = async (slug: string, chapterNumber: number): Promise<{ title: string; content: string, storyTitle: string, totalChapters: number } | null> => {
  console.log("Fetching chapter content for:", slug, "Chapter:", chapterNumber);
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 50));

  // In a real app, fetch story and chapter details based on slug and chapterNumber
  if (slug === 'the-crimson-cipher' && chapterNumber >= 1 && chapterNumber <= 25) {
     const storyTitle = "The Crimson Cipher";
     const totalChapters = 25;
    return {
      storyTitle: storyTitle,
      title: `Chapter ${chapterNumber}: The Journey Unfolds`,
      content: `This is the content for Chapter ${chapterNumber} of "${storyTitle}".

      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

      Paragraph two starts here. Curabitur pretium tincidunt lacus. Nulla gravida orci a odio. Nullam varius, turpis et commodo pharetra, est eros bibendum elit, nec luctus magna felis sollicitudin mauris. Integer in mauris eu nibh euismod gravida. Duis ac tellus et risus vulputate vehicula. Donec lobortis risus a elit. Etiam tempor. Ut ullamcorper, ligula eu tempor congue, eros est euismod turpis, id tincidunt sapien risus a quam. Maecenas fermentum consequat mi. Donec fermentum. Pellentesque malesuada nulla a mi. Duis sapien sem, aliquet nec, commodo eget, consequat quis, neque. Aliquam faucibus, elit ut dictum aliquet, felis nisl adipiscing sapien, sed malesuada diam lacus eget erat. Cras mollis scelerisque nunc. Nullam arcu. Aliquam erat volutpat. Duis ac turpis. Integer rutrum ante eu lacus.

      And a final paragraph for good measure. Vestibulum libero nisl, porta vel, scelerisque eget, malesuada at, neque. Vivamus eget nibh. Etiam cursus leo vel metus. Nulla facilisi. Aenean nec eros.`,
       totalChapters: totalChapters,
    };
  }
  // Add more mock data checks or return null if not found
  return null;
};

interface ReadPageProps {
  params: {
    slug: string;
    chapter: string; // Chapter number as string initially
  };
}

const ReadingPage: NextPage<ReadPageProps> = async ({ params }) => {
  const { slug } = params;
  const chapterNumber = parseInt(params.chapter, 10);

  if (isNaN(chapterNumber) || chapterNumber < 1) {
    // Handle invalid chapter number
    return <div className="text-center py-20">Invalid chapter number.</div>;
  }

  const chapterData = await getChapterContent(slug, chapterNumber);

  if (!chapterData) {
    // Handle chapter not found
    return <div className="text-center py-20">Chapter not found.</div>;
  }

  const { title, content, storyTitle, totalChapters } = chapterData;
  const hasPreviousChapter = chapterNumber > 1;
  const hasNextChapter = chapterNumber < totalChapters;

  return (
    <div className="flex flex-col min-h-screen">
       {/* Reading Header */}
       <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
         <div className="container flex h-14 items-center justify-between px-4 md:px-6">
           <Button variant="ghost" size="icon" asChild disabled={!hasPreviousChapter}>
              <Link href={hasPreviousChapter ? `/read/${slug}/chapter/${chapterNumber - 1}` : '#'} aria-label="Previous Chapter" className={!hasPreviousChapter ? 'opacity-50 cursor-not-allowed' : ''}>
                <ChevronLeft className="h-5 w-5" />
              </Link>
           </Button>

           <div className="text-center">
              <Link href={`/story/${slug}`} className="hover:text-primary">
                 <h1 className="text-sm font-medium truncate max-w-[200px] sm:max-w-xs md:max-w-md lg:max-w-lg">{storyTitle}</h1>
              </Link>
              <h2 className="text-xs text-muted-foreground truncate">{title}</h2>
           </div>

           <div className="flex items-center gap-1">
              {/* Placeholder buttons */}
             <Button variant="ghost" size="icon">
                <MessageSquare className="h-5 w-5" />
                 <span className="sr-only">Comments</span>
             </Button>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
                <span className="sr-only">Reading Settings</span>
              </Button>
             <Button variant="ghost" size="icon" asChild>
                <Link href={`/story/${slug}`} aria-label="Table of Contents">
                   <List className="h-5 w-5" />
                </Link>
             </Button>
             <Button variant="ghost" size="icon" asChild disabled={!hasNextChapter}>
                <Link href={hasNextChapter ? `/read/${slug}/chapter/${chapterNumber + 1}` : '#'} aria-label="Next Chapter" className={!hasNextChapter ? 'opacity-50 cursor-not-allowed' : ''}>
                  <ChevronRight className="h-5 w-5" />
                </Link>
             </Button>
           </div>
         </div>
       </header>

       {/* Chapter Content */}
       <main className="flex-grow container max-w-3xl mx-auto px-4 py-8 md:py-12">
         <article className="prose prose-lg dark:prose-invert max-w-none" style={{fontFamily: 'Georgia, serif', lineHeight: '1.7'}}>
            {/* Using whitespace-pre-line to respect newlines from the mock content */}
           <p className="whitespace-pre-line">{content}</p>
         </article>
       </main>

       {/* Reading Footer (Pagination) */}
       <footer className="sticky bottom-0 z-40 w-full border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 items-center justify-between px-4 md:px-6">
             <Button variant="outline" asChild disabled={!hasPreviousChapter}>
               <Link href={hasPreviousChapter ? `/read/${slug}/chapter/${chapterNumber - 1}` : '#'} className={!hasPreviousChapter ? 'opacity-50 cursor-not-allowed' : ''}>
                  <ChevronLeft className="mr-2 h-4 w-4" /> Previous
               </Link>
            </Button>
            <span className="text-sm text-muted-foreground">
               Chapter {chapterNumber} of {totalChapters}
            </span>
            <Button variant="outline" asChild disabled={!hasNextChapter}>
               <Link href={hasNextChapter ? `/read/${slug}/chapter/${chapterNumber + 1}` : '#'} className={!hasNextChapter ? 'opacity-50 cursor-not-allowed' : ''}>
                  Next <ChevronRight className="ml-2 h-4 w-4" />
               </Link>
            </Button>
          </div>
       </footer>
    </div>
  );
};

// Override layout for reading page to remove default header/footer
export async function generateMetadata({ params }: ReadPageProps) {
  const chapterData = await getChapterContent(params.slug, parseInt(params.chapter, 10));
  if (!chapterData) {
    return { title: 'StoryVerse Reader' };
  }
  return {
    title: `${chapterData.title} - ${chapterData.storyTitle} | StoryVerse`,
  };
}

export default ReadingPage;

// Need to override the default RootLayout for this page
// Create a specific layout file `src/app/read/layout.tsx` if you want
// a different overall structure for all reading pages, or manage it within the page component.
// For now, we'll let the page component manage its own header/footer and remove the default ones via CSS or conditional rendering in RootLayout if needed.
// A simpler approach for now is letting this page define its full structure.
