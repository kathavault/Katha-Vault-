import type { NextPage } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BookOpen, Eye, Users, MessageSquare, ThumbsUp, List, PlusCircle, Library, CheckCircle } from 'lucide-react';
import type { Story } from '@/components/story/story-card'; // Reuse Story type

// Mock data - replace with actual data fetching based on slug
const getStoryBySlug = async (slug: string): Promise<Story & { chaptersData: { id: string, title: string }[], authorFollowers: number, status: 'Ongoing' | 'Completed', lastUpdated: string } | null> => {
  console.log("Fetching story for slug:", slug);
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 50));

  // Find story in mock data (replace with actual DB query)
   const mockStories: Story[] = [ // Ensure this list matches homepage/browse page data
     { id: '1', title: 'The Crimson Cipher', author: 'Alex Quill', description: 'A thrilling adventure into the unknown depths of ancient ruins, where secrets lie buried and danger lurks around every corner. Join Elara as she deciphers the ancient texts.', coverImageUrl: 'https://picsum.photos/seed/crimson/400/600', genre: 'Adventure', reads: 12567, chapters: 25, tags: ['Mystery', 'Action', 'Ancient', 'Puzzles'], slug: 'the-crimson-cipher', dataAiHint: 'adventure mystery book cover detail' },
     { id: '2', title: 'Echoes of Starlight', author: 'Seraphina Moon', description: 'In a galaxy torn by war, a young pilot discovers a power that could change everything. Battling empires and falling in love, Lyra\'s journey is epic.', coverImageUrl: 'https://picsum.photos/seed/starlight/400/600', genre: 'Sci-Fi', reads: 8930, chapters: 40, tags: ['Space Opera', 'Romance', 'Conflict', 'Chosen One'], slug: 'echoes-of-starlight', dataAiHint: 'sci-fi space opera book cover detail' },
     { id: '3', title: 'Whispers in the Mist', author: 'Rowan Vale', description: 'A forgotten village holds a dark secret, awakened by the arrival of a curious outsider. The fog never truly lifts, and neither does the dread.', coverImageUrl: 'https://picsum.photos/seed/mist/400/600', genre: 'Horror', reads: 5401, chapters: 15, tags: ['Supernatural', 'Suspense', 'Folk Horror', 'Isolation'], slug: 'whispers-in-the-mist', dataAiHint: 'horror suspense book cover detail' },
     { id: '4', title: 'The Gilded Cage', author: 'Eleanor Vance', description: 'Trapped in high society, a young woman fights for her freedom and forbidden love. Balls, secrets, and societal expectations clash.', coverImageUrl: 'https://picsum.photos/seed/gilded/400/600', genre: 'Romance', reads: 21050, chapters: 55, tags: ['Historical', 'Drama', 'Forbidden Love', 'Regency'], slug: 'the-gilded-cage', dataAiHint: 'romance historical drama book cover detail' },
     { id: '5', title: 'Dragon\'s Heir', author: 'Kenji Tanaka', description: 'The last dragon chooses an unlikely successor to protect the realm from encroaching darkness. Training, prophecies, and epic battles await.', coverImageUrl: 'https://picsum.photos/seed/dragon/400/600', genre: 'Fantasy', reads: 18777, chapters: 30, tags: ['High Fantasy', 'Magic', 'Dragons', 'Coming of Age'], slug: 'dragons-heir', dataAiHint: 'fantasy dragon magic book cover detail' },
     { id: '6', title: 'City of Neon Dreams', author: 'Jax Ryder', description: 'A detective navigates the rain-slicked streets of a futuristic city to solve a complex case involving rogue AI and corporate espionage.', coverImageUrl: 'https://picsum.photos/seed/neon/400/600', genre: 'Cyberpunk', reads: 7500, chapters: 20, tags: ['Dystopian', 'Noir', 'Technology', 'Investigation'], slug: 'city-of-neon-dreams', dataAiHint: 'cyberpunk detective book cover detail' },
      { id: '7', title: 'Beneath the Willow Tree', author: 'Clara Meadows', description: 'A heartwarming tale of friendship and finding home in the most unexpected places.', coverImageUrl: 'https://picsum.photos/seed/willow/400/600', genre: 'Contemporary', reads: 15200, chapters: 22, tags: ['Friendship', 'Slice of Life', 'Rural'], slug: 'beneath-the-willow-tree', dataAiHint: 'contemporary friendship book cover detail' },
      { id: '8', title: 'The Alchemist\'s Secret', author: 'Marcus Thorne', description: 'Unraveling a centuries-old mystery, a historian discovers the key to eternal life... or eternal damnation.', coverImageUrl: 'https://picsum.photos/seed/alchemist/400/600', genre: 'Thriller', reads: 9850, chapters: 35, tags: ['Historical Thriller', 'Alchemy', 'Conspiracy'], slug: 'the-alchemists-secret', dataAiHint: 'thriller historical mystery book cover detail' },
      { id: '9', title: 'Academy of Shadows', author: 'Nyx Sterling', description: 'At a school for the magically gifted, dark secrets and dangerous rivalries threaten to consume a new student.', coverImageUrl: 'https://picsum.photos/seed/academy/400/600', genre: 'Urban Fantasy', reads: 11300, chapters: 28, tags: ['Magic School', 'Young Adult', 'Paranormal'], slug: 'academy-of-shadows', dataAiHint: 'urban fantasy magic school book cover detail' },
       { id: '10', title: 'The Last Stand', author: 'General Rex', description: 'Outnumbered and outgunned, a squad of soldiers must hold the line against overwhelming odds.', coverImageUrl: 'https://picsum.photos/seed/laststand/400/600', genre: 'Military Fiction', reads: 6100, chapters: 18, tags: ['War', 'Action', 'Survival'], slug: 'the-last-stand', dataAiHint: 'military action war book cover detail' },
       { id: '11', title: 'Poetry for the Soul', author: 'Luna Whisperwind', description: 'A collection of verses exploring love, loss, and the beauty found in everyday moments.', coverImageUrl: 'https://picsum.photos/seed/poetry/400/600', genre: 'Poetry', reads: 25000, chapters: 50, tags: ['Emotional', 'Reflective', 'Verse'], slug: 'poetry-for-the-soul', dataAiHint: 'poetry collection book cover detail' },
       { id: '12', title: 'Werewolf Next Door', author: 'Fang Nightshade', description: 'Moving to a new town is hard, especially when your neighbor howls at the moon.', coverImageUrl: 'https://picsum.photos/seed/werewolf/400/600', genre: 'Paranormal Romance', reads: 17800, chapters: 32, tags: ['Werewolf', 'Romance', 'Humor'], slug: 'werewolf-next-door', dataAiHint: 'paranormal romance werewolf book cover detail' },
   ];

   const story = mockStories.find(s => s.slug === slug);

  if (!story) {
    return null;
  }

  // Add mock chapter data and other details
  const chaptersData = Array.from({ length: story.chapters }, (_, i) => ({
    id: `ch-${story.id}-${i + 1}`,
    // More engaging chapter titles
    title: i === 0 ? `Chapter 1: The Beginning` : `Chapter ${i + 1}: ${['Unexpected Turn', 'Rising Action', 'A New Clue', 'Confrontation', 'Secrets Revealed', 'The Plot Twist'][i % 6]}`,
  }));
  const authorFollowers = Math.floor(Math.random() * 5000) + 50;
  const status = story.chapters > 30 ? 'Ongoing' : 'Completed';
  const lastUpdated = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });


  return { ...story, chaptersData, authorFollowers, status, lastUpdated };
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

  // Placeholder state for "Added to Library"
  const isInLibrary = false; // Replace with actual logic

  return (
    // Use grid layout with adjusted column spans for different screen sizes
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

      {/* Left Column (on large screens): Cover, Actions, Details */}
      <div className="lg:col-span-4 xl:col-span-3 space-y-6">
        {/* Sticky container for cover and actions */}
        <div className="sticky top-20 space-y-6"> {/* Adjust top offset based on header height */}
          <Card className="overflow-hidden shadow-lg border border-border/80">
            <div className="relative aspect-[2/3] w-full">
              <Image
                src={story.coverImageUrl}
                alt={`Cover for ${story.title}`}
                fill
                sizes="(max-width: 1024px) 100vw, 33vw"
                className="object-cover"
                priority // Prioritize loading the main story cover
                data-ai-hint={story.dataAiHint || "book cover story detail"}
              />
            </div>
          </Card>

          <div className="flex flex-col gap-3">
             <Button size="lg" asChild className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-base font-semibold">
               <Link href={`/read/${story.slug}/1`}> {/* Link to first chapter */}
                 <BookOpen className="mr-2 h-5 w-5" /> Read First Chapter
               </Link>
             </Button>
             <Button variant={isInLibrary ? "secondary" : "outline"} size="lg" className="w-full text-base font-semibold">
               {isInLibrary ? (
                  <>
                    <CheckCircle className="mr-2 h-5 w-5 text-green-600" /> In Your Library
                  </>
                ) : (
                  <>
                    <PlusCircle className="mr-2 h-5 w-5" /> Add to Library
                  </>
                )}
             </Button>
          </div>

          {/* Story Stats Card */}
          <Card className="border border-border/80">
            <CardContent className="p-4 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-medium flex items-center gap-2"><Eye className="w-4 h-4" /> Reads</span>
                <span className="font-bold">{story.reads.toLocaleString()}</span>
              </div>
              <Separator />
               <div className="flex items-center justify-between">
                 <span className="text-muted-foreground font-medium flex items-center gap-2"><ThumbsUp className="w-4 h-4" /> Votes</span>
                 <span className="font-bold">{(story.reads / 10).toLocaleString(undefined, {maximumFractionDigits: 0})}</span> {/* Mock votes */}
               </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground font-medium flex items-center gap-2"><List className="w-4 h-4" /> Parts</span>
                  <span className="font-bold">{story.chapters}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                   <span className="text-muted-foreground font-medium">Status</span>
                    <Badge variant={story.status === 'Completed' ? "secondary" : "outline"} className={story.status === 'Completed' ? "text-green-700 border-green-300 bg-green-50" : "text-blue-700 border-blue-300 bg-blue-50"}>
                     {story.status}
                   </Badge>
                 </div>
                 <Separator />
                 <div className="flex items-center justify-between">
                   <span className="text-muted-foreground font-medium">Updated</span>
                   <span className="font-semibold">{story.lastUpdated}</span>
                 </div>
            </CardContent>
          </Card>

          {/* Tags Card */}
          {story.tags && story.tags.length > 0 && (
            <Card className="border border-border/80">
                <CardHeader className="p-4 pb-2">
                   <CardTitle className="text-base font-semibold">Tags</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                    <div className="flex flex-wrap gap-2">
                      {story.tags.map(tag => (
                        // Make tags links to browse page with tag filter
                        <Link key={tag} href={`/browse?tags=${encodeURIComponent(tag)}`}>
                          <Badge variant="secondary" className="cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors">
                            #{tag.toLowerCase()}
                          </Badge>
                        </Link>
                      ))}
                    </div>
                </CardContent>
             </Card>
          )}
        </div>
      </div>


      {/* Right Column (on large screens): Title, Author, Desc, Chapters, Comments */}
      <div className="lg:col-span-8 xl:col-span-9 space-y-8">
        {/* Story Title and Author */}
        <div className="space-y-3">
          <h1 className="text-3xl md:text-4xl font-bold leading-tight text-foreground">{story.title}</h1>
          <div className="flex items-center gap-3">
            <Link href={`/user/${story.author.toLowerCase().replace(/\s+/g, '-')}`} className="flex items-center gap-3 group">
              <Avatar className="h-11 w-11 border-2 border-border group-hover:border-primary transition-colors">
                <AvatarImage src={`https://picsum.photos/seed/${story.author}/100/100`} alt={story.author} data-ai-hint="author profile picture large" />
                <AvatarFallback>{story.author.substring(0, 1).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                 <p className="font-semibold text-lg group-hover:text-primary transition-colors">{story.author}</p>
                 <p className="text-sm text-muted-foreground">{story.authorFollowers.toLocaleString()} Followers</p>
              </div>
            </Link>
             <Button variant="outline" size="sm" className="ml-4">Follow</Button>
          </div>
        </div>

        {/* Story Description */}
        {/* Using Card for subtle bordering */}
        <Card className="border border-border/80 shadow-sm">
           <CardContent className="p-5">
             <p className="text-base md:text-lg leading-relaxed whitespace-pre-line text-foreground/90">{story.description}</p>
           </CardContent>
        </Card>


        {/* Table of Contents */}
        <Card id="chapters" className="border border-border/80 shadow-sm scroll-mt-20"> {/* Add scroll margin */}
          <CardHeader className="border-b border-border/80">
            <CardTitle className="flex items-center gap-2 text-xl font-semibold">
               <List className="w-5 h-5" /> Table of Contents ({story.chapters} Parts)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0"> {/* Remove padding to let links fill space */}
             <ul className="divide-y divide-border/60">
               {story.chaptersData.map((chapter, index) => (
                  <li key={chapter.id}>
                     <Link href={`/read/${story.slug}/${index + 1}`} className="flex justify-between items-center p-4 hover:bg-secondary transition-colors duration-150 group">
                       <span className="font-medium group-hover:text-primary">{chapter.title}</span>
                       <span className="text-sm text-muted-foreground">
                          {/* Placeholder for chapter read time or date */}
                          {/* Example: 5 min read */}
                       </span>
                     </Link>
                  </li>
               ))}
             </ul>
          </CardContent>
        </Card>

         {/* Comments Section Placeholder */}
         <Card className="border border-border/80 shadow-sm">
             <CardHeader className="border-b border-border/80">
                <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                  <MessageSquare className="w-5 h-5" /> Comments
                </CardTitle>
             </CardHeader>
             <CardContent className="p-5">
                 <p className="text-muted-foreground mb-4">Join the conversation!</p>
                 {/* Add comment input (e.g., Textarea + Button) */}
                 {/* Display existing comments */}
                 <div className="space-y-4 mt-4">
                    <p className="text-center text-sm text-muted-foreground italic">Comment feature coming soon.</p>
                    {/* Example comment structure */}
                    {/* <div className="flex gap-3">
                      <Avatar>...</Avatar>
                      <div>
                        <p className="font-semibold">Commenter Name</p>
                        <p className="text-sm text-foreground/80">This is a great chapter!</p>
                        <p className="text-xs text-muted-foreground mt-1">2 days ago</p>
                      </div>
                    </div> */}
                 </div>
             </CardContent>
         </Card>
      </div>
    </div>
  );
};

// Metadata generation (optional but good practice)
export async function generateMetadata({ params }: StoryPageProps) {
  const story = await getStoryBySlug(params.slug);
  if (!story) {
    return { title: 'Story Not Found | Katha Vault' };
  }
  return {
    title: `${story.title} by ${story.author} | Katha Vault`,
    description: story.description.substring(0, 160), // Truncate description for SEO
    // Add OpenGraph metadata if desired
     openGraph: {
       title: `${story.title} by ${story.author} | Katha Vault`,
       description: story.description.substring(0, 160),
       images: [
         {
           url: story.coverImageUrl,
           width: 400,
           height: 600,
           alt: `Cover for ${story.title}`,
         },
       ],
       type: 'article', // Or 'book' if more appropriate schema exists
       // url: `your-site-url/story/${story.slug}` // Add actual URL
     },
  };
}


export default StoryDetailPage;

// Optional: Generate static paths if you know all story slugs beforehand
// export async function generateStaticParams() {
//   // Fetch all story slugs
//   // const stories = await getAllStorySlugs(); // Implement this function
//   // const slugs = mockStories.map(story => ({ slug: story.slug })); // Use mock data for now
//   // return slugs;
// }
