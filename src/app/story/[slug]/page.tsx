import type { NextPage } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BookOpen, Eye, Users, MessageSquare, ThumbsUp, List } from 'lucide-react';
import type { Story } from '@/components/story/story-card'; // Reuse Story type if applicable

// Mock data - replace with actual data fetching based on slug
const getStoryBySlug = async (slug: string): Promise<Story & { chaptersData: { id: string, title: string }[] } | null> => {
  console.log("Fetching story for slug:", slug);
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 50));

  // Find story in mock data (replace with actual DB query)
   const mockStories: Story[] = [
     { id: '1', title: 'The Crimson Cipher', author: 'Alex Quill', description: 'A thrilling adventure into the unknown depths of ancient ruins, where secrets lie buried and danger lurks around every corner. Join Elara as she deciphers the ancient texts.', coverImageUrl: 'https://picsum.photos/seed/crimson/400/600', genre: 'Adventure', reads: 12567, chapters: 25, tags: ['Mystery', 'Action', 'Ancient', 'Puzzles'], slug: 'the-crimson-cipher' },
     { id: '2', title: 'Echoes of Starlight', author: 'Seraphina Moon', description: 'In a galaxy torn by war, a young pilot discovers a power that could change everything. Battling empires and falling in love, Lyra\'s journey is epic.', coverImageUrl: 'https://picsum.photos/seed/starlight/400/600', genre: 'Sci-Fi', reads: 8930, chapters: 40, tags: ['Space Opera', 'Romance', 'Conflict', 'Chosen One'], slug: 'echoes-of-starlight' },
     { id: '3', title: 'Whispers in the Mist', author: 'Rowan Vale', description: 'A forgotten village holds a dark secret, awakened by the arrival of a curious outsider. The fog never truly lifts, and neither does the dread.', coverImageUrl: 'https://picsum.photos/seed/mist/400/600', genre: 'Horror', reads: 5401, chapters: 15, tags: ['Supernatural', 'Suspense', 'Folk Horror', 'Isolation'], slug: 'whispers-in-the-mist' },
     { id: '4', title: 'The Gilded Cage', author: 'Eleanor Vance', description: 'Trapped in high society, a young woman fights for her freedom and forbidden love. Balls, secrets, and societal expectations clash.', coverImageUrl: 'https://picsum.photos/seed/gilded/400/600', genre: 'Romance', reads: 21050, chapters: 55, tags: ['Historical', 'Drama', 'Forbidden Love', 'Regency'], slug: 'the-gilded-cage' },
     { id: '5', title: 'Dragon\'s Heir', author: 'Kenji Tanaka', description: 'The last dragon chooses an unlikely successor to protect the realm from encroaching darkness. Training, prophecies, and epic battles await.', coverImageUrl: 'https://picsum.photos/seed/dragon/400/600', genre: 'Fantasy', reads: 18777, chapters: 30, tags: ['High Fantasy', 'Magic', 'Dragons', 'Coming of Age'], slug: 'dragons-heir' },
     { id: '6', title: 'City of Neon Dreams', author: 'Jax Ryder', description: 'A detective navigates the rain-slicked streets of a futuristic city to solve a complex case involving rogue AI and corporate espionage.', coverImageUrl: 'https://picsum.photos/seed/neon/400/600', genre: 'Cyberpunk', reads: 7500, chapters: 20, tags: ['Dystopian', 'Noir', 'Technology', 'Investigation'], slug: 'city-of-neon-dreams' },
   ];

   const story = mockStories.find(s => s.slug === slug);

  if (!story) {
    return null;
  }

  // Add mock chapter data
  const chaptersData = Array.from({ length: story.chapters }, (_, i) => ({
    id: `ch-${story.id}-${i + 1}`,
    title: `Chapter ${i + 1}: The Adventure Begins`, // Example chapter title
  }));

  return { ...story, chaptersData };
};

interface StoryPageProps {
  params: {
    slug: string;
  };
}

const StoryDetailPage: NextPage<StoryPageProps> = async ({ params }) => {
  const story = await getStoryBySlug(params.slug);

  if (!story) {
    // In a real app, you'd likely use the notFound() function from next/navigation
    return <div className="text-center py-20">Story not found.</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
      {/* Left Column: Cover, Actions, Details */}
      <div className="md:col-span-1 space-y-6">
        <Card className="overflow-hidden shadow-md">
          <div className="relative aspect-[2/3] w-full">
            <Image
              src={story.coverImageUrl}
              alt={`Cover for ${story.title}`}
              layout="fill"
              objectFit="cover"
              priority // Prioritize loading the main story cover
              data-ai-hint="book cover story detail"
            />
          </div>
        </Card>

        <div className="flex flex-col gap-2">
           <Button size="lg" asChild className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
             <Link href={`/read/${story.slug}/chapter/1`}> {/* Link to first chapter */}
               <BookOpen className="mr-2 h-5 w-5" /> Start Reading
             </Link>
           </Button>
           <Button variant="outline" size="lg" className="w-full">
             {/* Placeholder for "Add to Library" */}
             + Add to Library
           </Button>
        </div>

        <Card>
          <CardContent className="p-4 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1"><Eye className="w-4 h-4" /> Reads</span>
              <span className="font-medium">{story.reads.toLocaleString()}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1"><List className="w-4 h-4" /> Parts</span>
              <span className="font-medium">{story.chapters}</span>
            </div>
             <Separator />
             {/* Placeholder stats */}
             <div className="flex items-center justify-between">
               <span className="text-muted-foreground flex items-center gap-1"><ThumbsUp className="w-4 h-4" /> Votes</span>
               <span className="font-medium">{(story.reads / 10).toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
             </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1"><MessageSquare className="w-4 h-4" /> Comments</span>
                <span className="font-medium">{(story.reads / 50).toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
              </div>
          </CardContent>
        </Card>

        {story.tags && story.tags.length > 0 && (
          <Card>
              <CardHeader className="p-4 pb-2">
                 <CardTitle className="text-base">Tags</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                  <div className="flex flex-wrap gap-2">
                    {story.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="cursor-pointer hover:bg-accent hover:text-accent-foreground">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
              </CardContent>
           </Card>
        )}
      </div>

      {/* Right Column: Title, Author, Description, Chapters */}
      <div className="md:col-span-2 space-y-6">
        <h1 className="text-3xl md:text-4xl font-bold leading-tight">{story.title}</h1>

        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={`https://picsum.photos/seed/${story.author}/100/100`} alt={story.author} data-ai-hint="author profile picture" />
            <AvatarFallback>{story.author.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
             <p className="font-semibold text-lg">{story.author}</p>
             {/* Add follower count or other author info if available */}
             <p className="text-sm text-muted-foreground">Follow</p>
          </div>
        </div>

        <p className="text-base leading-relaxed whitespace-pre-line">{story.description}</p>

        <Separator />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
               <List className="w-5 h-5" /> Table of Contents
            </CardTitle>
          </CardHeader>
          <CardContent>
             <ul className="space-y-1">
               {story.chaptersData.map((chapter, index) => (
                  <li key={chapter.id}>
                     <Link href={`/read/${story.slug}/chapter/${index + 1}`} className="block p-3 rounded-md hover:bg-secondary transition-colors">
                       <span className="font-medium">{chapter.title}</span>
                       {/* Optionally add read status or chapter stats */}
                     </Link>
                  </li>
               ))}
             </ul>
          </CardContent>
        </Card>

         {/* Placeholder for Comments Section */}
         <Card>
             <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <MessageSquare className="w-5 h-5" /> Comments
                </CardTitle>
             </CardHeader>
             <CardContent>
                 <p className="text-muted-foreground">Comments section coming soon...</p>
                 {/* Add comment input and display */}
             </CardContent>
         </Card>
      </div>
    </div>
  );
};

export default StoryDetailPage;

// Optional: Generate static paths if you know all story slugs beforehand
// export async function generateStaticParams() {
//   // Fetch all story slugs
//   const stories = await getAllStorySlugs(); // Implement this function
//   return stories.map((story) => ({
//     slug: story.slug,
//   }));
// }
