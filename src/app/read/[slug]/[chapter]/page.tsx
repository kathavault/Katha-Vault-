import type { NextPage } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, List, Settings, MessageSquare, BookOpenText, Share2 } from 'lucide-react'; // Added icons
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress"; // Added Progress bar


// Mock data - replace with actual chapter content fetching
const getChapterContent = async (slug: string, chapterNumber: number): Promise<{ title: string; content: string, storyTitle: string, storyAuthor: string, totalChapters: number } | null> => {
  console.log("Fetching chapter content for:", slug, "Chapter:", chapterNumber);
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 50));

  // Mock story details (should be fetched alongside chapter)
   const mockStories = [
      { slug: 'the-crimson-cipher', title: "The Crimson Cipher", author: "Alex Quill", totalChapters: 25 },
      { slug: 'echoes-of-starlight', title: "Echoes of Starlight", author: "Seraphina Moon", totalChapters: 40 },
      { slug: 'whispers-in-the-mist', title: "Whispers in the Mist", author: "Rowan Vale", totalChapters: 15 },
      // Add other stories if needed to match slugs
   ];

   const story = mockStories.find(s => s.slug === slug);

   if (!story || chapterNumber < 1 || chapterNumber > story.totalChapters) {
      return null; // Story or chapter out of range
   }


    return {
      storyTitle: story.title,
      storyAuthor: story.author,
      title: `Chapter ${chapterNumber}: The ${['Journey Unfolds', 'Plot Thickens', 'Danger Mounts', 'Secret Revealed', 'Turning Point', 'Climax Approaches'][chapterNumber % 6]}`, // More varied titles
      // More extensive and formatted mock content
      content: `
This is the dynamic content for **Chapter ${chapterNumber}** of *${story.title}*. The adventure continues, pushing our heroes further into the unknown.

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

> A quote or important thought might appear here. Like a sudden realization or a foreboding warning uttered by a character.

Paragraph two starts here, perhaps introducing a new challenge or character interaction. Curabitur pretium tincidunt lacus. Nulla gravida orci a odio. Nullam varius, turpis et commodo pharetra, est eros bibendum elit, nec luctus magna felis sollicitudin mauris. Integer in mauris eu nibh euismod gravida. Duis ac tellus et risus vulputate vehicula.

* Emphasized text or thoughts might be italicized.
* Bullet points could be used for lists or plans.
  * Nested points are possible too.

Donec lobortis risus a elit. Etiam tempor. Ut ullamcorper, ligula eu tempor congue, eros est euismod turpis, id tincidunt sapien risus a quam. Maecenas fermentum consequat mi. Donec fermentum. Pellentesque malesuada nulla a mi. Duis sapien sem, aliquet nec, commodo eget, consequat quis, neque.

---

A horizontal rule could signify a scene break or a shift in perspective.

Aliquam faucibus, elit ut dictum aliquet, felis nisl adipiscing sapien, sed malesuada diam lacus eget erat. Cras mollis scelerisque nunc. Nullam arcu. Aliquam erat volutpat. Duis ac turpis. Integer rutrum ante eu lacus.

**Bold text** can be used for emphasis or headings within the text if needed, though semantic HTML (like actual headings if applicable within a chapter's structure) is often better.

And a final paragraph for good measure, bringing this part of the chapter to a close, perhaps with a cliffhanger or a moment of reflection. Vestibulum libero nisl, porta vel, scelerisque eget, malesuada at, neque. Vivamus eget nibh. Etiam cursus leo vel metus. Nulla facilisi. Aenean nec eros. The end of chapter ${chapterNumber} leaves the reader wanting more.
      `,
       totalChapters: story.totalChapters,
    };
};

interface ReadPageProps {
  params: {
    slug: string;
    chapter: string; // Chapter number as string initially
  };
}

// Helper function to format content (replace basic newlines with paragraphs, basic markdown)
// A more robust Markdown parser (like 'marked' or 'react-markdown') is recommended for real use.
const formatContent = (text: string): React.ReactNode => {
   // Basic replacements - VERY limited markdown support
   const paragraphs = text.trim().split(/\n\s*\n/); // Split by double newlines
   return paragraphs.map((p, i) => {
     let content: React.ReactNode = p;
     // Simple bold/italic - can be improved significantly
     content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
     content = content.replace(/\*(.*?)\*/g, '<em>$1</em>');
     // Basic blockquote
     if (p.startsWith('> ')) {
       return <blockquote key={i} className="pl-4 italic border-l-4 my-4">{p.substring(2)}</blockquote>;
     }
     // Basic horizontal rule
     if (p === '---') {
       return <hr key={i} className="my-6" />;
     }
     // Handle list items (very basic)
     if (p.startsWith('* ')) {
       return <li key={i}>{p.substring(2)}</li>; // Needs wrapping in <ul> in a real parser
     }

     // Insert <br /> for single newlines within a paragraph block for poetry etc.
     const lines = p.split('\n').map((line, lineIndex) => (
       <React.Fragment key={lineIndex}>
         {line}
         {lineIndex < p.split('\n').length - 1 && <br />}
       </React.Fragment>
     ));

     return <p key={i} dangerouslySetInnerHTML={{ __html: p.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>').replace(/\n/g, '<br />') }} />;
     // Using dangerouslySetInnerHTML is generally discouraged without sanitization.
     // A proper markdown parser is safer and more feature-complete.
     // return <p key={i}>{lines}</p>; // Use this line if not using dangerouslySetInnerHTML
   });
};


const ReadingPage: NextPage<ReadPageProps> = async ({ params }) => {
  const { slug } = params;
  const chapterNumber = parseInt(params.chapter, 10);

  if (isNaN(chapterNumber) || chapterNumber < 1) {
    return <div className="text-center py-20 text-destructive">Invalid chapter number specified.</div>;
  }

  const chapterData = await getChapterContent(slug, chapterNumber);

  if (!chapterData) {
     // Provide a link back or to the story page
     return (
       <div className="text-center py-20 flex flex-col items-center gap-4">
         <p className="text-xl text-destructive">Chapter Not Found</p>
         <p className="text-muted-foreground">We couldn't find the chapter you were looking for.</p>
         <Button variant="outline" asChild>
            <Link href={`/story/${slug}`}>Go to Story Details</Link>
          </Button>
       </div>
     );
  }

  const { title, content, storyTitle, storyAuthor, totalChapters } = chapterData;
  const hasPreviousChapter = chapterNumber > 1;
  const hasNextChapter = chapterNumber < totalChapters;
  const progress = Math.round((chapterNumber / totalChapters) * 100);

  return (
    // Using min-h-screen on body ensures footer sticks
    <div className="flex flex-col">
       {/* Reading Header - Sticky with background blur */}
       <header className="sticky top-0 z-40 w-full border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75 shadow-sm">
         <div className="container flex h-14 items-center justify-between px-4 md:px-6 gap-2">
           {/* Left: Previous Chapter & Story Info Dropdown */}
           <div className="flex items-center gap-1 md:gap-2">
             <Button variant="ghost" size="icon" asChild disabled={!hasPreviousChapter}>
                <Link href={hasPreviousChapter ? `/read/${slug}/${chapterNumber - 1}` : '#'} aria-label="Previous Chapter" className={!hasPreviousChapter ? 'opacity-50 cursor-not-allowed' : 'hover:text-primary'}>
                  <ChevronLeft className="h-5 w-5" />
                </Link>
             </Button>
              {/* Story Title Dropdown */}
              <DropdownMenu>
                 <DropdownMenuTrigger asChild>
                   <Button variant="ghost" className="px-2 py-1 h-auto flex items-center gap-1 text-left">
                       <div className="flex flex-col">
                         <span className="text-sm font-medium truncate max-w-[150px] sm:max-w-xs md:max-w-sm">{storyTitle}</span>
                         <span className="text-xs text-muted-foreground truncate">{title}</span>
                       </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" /> {/* Indicate dropdown */}
                    </Button>
                 </DropdownMenuTrigger>
                 <DropdownMenuContent align="start">
                   <DropdownMenuItem asChild>
                     <Link href={`/story/${slug}`} className="flex items-center gap-2">
                        <BookOpenText className="h-4 w-4" /> Story Details
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                     <Link href={`/story/${slug}#chapters`} className="flex items-center gap-2"> {/* Assuming #chapters target exists */}
                        <List className="h-4 w-4" /> Table of Contents
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled> {/* Placeholder */}
                      <span className="text-xs text-muted-foreground">By {storyAuthor}</span>
                    </DropdownMenuItem>
                 </DropdownMenuContent>
               </DropdownMenu>
           </div>

           {/* Right: Actions & Next Chapter */}
           <div className="flex items-center gap-1 md:gap-2">
              {/* Reading Settings (Placeholder) */}
             <DropdownMenu>
               <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                      <Settings className="h-5 w-5" />
                      <span className="sr-only">Reading Settings</span>
                    </Button>
               </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                   <DropdownMenuItem>Font Size (Coming Soon)</DropdownMenuItem>
                   <DropdownMenuItem>Theme (Coming Soon)</DropdownMenuItem>
                </DropdownMenuContent>
             </DropdownMenu>

             {/* Comments (Placeholder) */}
             <Button variant="ghost" size="icon">
                <MessageSquare className="h-5 w-5" />
                 <span className="sr-only">Comments</span>
             </Button>

              {/* Share (Placeholder) */}
              <Button variant="ghost" size="icon">
                 <Share2 className="h-5 w-5" />
                  <span className="sr-only">Share</span>
              </Button>


             <Button variant="ghost" size="icon" asChild disabled={!hasNextChapter}>
                <Link href={hasNextChapter ? `/read/${slug}/${chapterNumber + 1}` : '#'} aria-label="Next Chapter" className={!hasNextChapter ? 'opacity-50 cursor-not-allowed' : 'hover:text-primary'}>
                  <ChevronRight className="h-5 w-5" />
                </Link>
             </Button>
           </div>
         </div>
         {/* Progress Bar */}
          <Progress value={progress} className="w-full h-1 rounded-none" />
       </header>

       {/* Chapter Content - Centered with max-width */}
       <main className="flex-grow container max-w-3xl mx-auto px-4 py-8 md:py-12">
          <article className="prose prose-lg dark:prose-invert max-w-none prose-p:text-foreground/90 prose-strong:text-foreground" style={{fontFamily: "'Georgia', 'Times New Roman', Times, serif", lineHeight: '1.8'}}>
              {/* Render formatted content */}
              {formatContent(content)}
          </article>
       </main>

       {/* Reading Footer (Pagination) - Simplified */}
       <footer className="w-full py-4 mt-8">
          <div className="container flex items-center justify-between px-4 md:px-6">
             <Button variant="outline" asChild disabled={!hasPreviousChapter}>
               <Link href={hasPreviousChapter ? `/read/${slug}/${chapterNumber - 1}` : '#'} className={!hasPreviousChapter ? 'opacity-60 cursor-not-allowed' : ''}>
                  <ChevronLeft className="mr-2 h-4 w-4" /> Previous
               </Link>
            </Button>
            <span className="text-sm text-muted-foreground hidden sm:inline">
               Chapter {chapterNumber} / {totalChapters}
            </span>
            <Button variant="outline" asChild disabled={!hasNextChapter}>
               <Link href={hasNextChapter ? `/read/${slug}/${chapterNumber + 1}` : '#'} className={!hasNextChapter ? 'opacity-60 cursor-not-allowed' : ''}>
                  Next <ChevronRight className="ml-2 h-4 w-4" />
               </Link>
            </Button>
          </div>
       </footer>
    </div>
  );
};

// Dynamic Metadata Generation
export async function generateMetadata({ params }: ReadPageProps) {
  const chapterNumber = parseInt(params.chapter, 10);
  if (isNaN(chapterNumber)) return { title: 'Invalid Chapter | StoryVerse' };

  const chapterData = await getChapterContent(params.slug, chapterNumber);
  if (!chapterData) {
    return { title: 'Chapter Not Found | StoryVerse' };
  }
  return {
    title: `${chapterData.title} - ${chapterData.storyTitle} | StoryVerse Reader`,
    description: `Read Chapter ${chapterNumber} of the story "${chapterData.storyTitle}" by ${chapterData.storyAuthor}.`,
  };
}

export default ReadingPage;

// The dedicated src/app/read/layout.tsx already handles removing the default Header/Footer.
