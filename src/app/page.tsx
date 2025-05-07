
import type { NextPage } from 'next';
import StoryCard, { type Story } from '@/components/story/story-card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Zap, TrendingUp, Feather } from 'lucide-react'; // Added icons
import Link from 'next/link';

// Expanded and diversified mock data
const mockStories: Story[] = [
  {
    id: '1',
    title: 'The Crimson Cipher',
    author: 'Alex Quill',
    description: 'A thrilling adventure into the unknown depths of ancient ruins, where secrets lie buried.',
    coverImageUrl: 'https://picsum.photos/seed/crimson-cipher/400/600', // Updated placeholder URL
    genre: 'Adventure',
    reads: 12567,
    chapters: 25,
    tags: ['Mystery', 'Action', 'Ancient'],
    slug: 'the-crimson-cipher',
    dataAiHint: 'adventure mystery book cover',
  },
  {
    id: '2',
    title: 'Echoes of Starlight',
    author: 'Seraphina Moon',
    description: 'In a galaxy torn by war, a young pilot discovers a power that could change everything.',
    coverImageUrl: 'https://picsum.photos/seed/starlight/400/600',
    genre: 'Sci-Fi',
    reads: 8930,
    chapters: 40,
    tags: ['Space Opera', 'Romance', 'Conflict'],
    slug: 'echoes-of-starlight',
     dataAiHint: 'sci-fi space opera book cover',
  },
   {
    id: '3',
    title: 'Whispers in the Mist',
    author: 'Rowan Vale',
    description: 'A forgotten village holds a dark secret, awakened by the arrival of a curious outsider.',
    coverImageUrl: 'https://picsum.photos/seed/mist/400/600',
    genre: 'Horror',
    reads: 5401,
    chapters: 15,
    tags: ['Supernatural', 'Suspense', 'Folk Horror'],
    slug: 'whispers-in-the-mist',
     dataAiHint: 'horror suspense book cover',
  },
   {
    id: '4',
    title: 'The Gilded Cage',
    author: 'Eleanor Vance',
    description: 'Trapped in high society, a young woman fights for her freedom and forbidden love.',
    coverImageUrl: 'https://picsum.photos/seed/gilded/400/600',
    genre: 'Romance',
    reads: 21050,
    chapters: 55,
    tags: ['Historical', 'Drama', 'Forbidden Love'],
    slug: 'the-gilded-cage',
     dataAiHint: 'romance historical drama book cover',
  },
    {
    id: '5',
    title: 'Dragon\'s Heir',
    author: 'Kenji Tanaka',
    description: 'The last dragon chooses an unlikely successor to protect the realm from encroaching darkness.',
    coverImageUrl: 'https://picsum.photos/seed/dragon/400/600',
    genre: 'Fantasy',
    reads: 18777,
    chapters: 30,
    tags: ['High Fantasy', 'Magic', 'Dragons'],
    slug: 'dragons-heir',
     dataAiHint: 'fantasy dragon magic book cover',
  },
  {
    id: '6',
    title: 'City of Neon Dreams',
    author: 'Jax Ryder',
    description: 'A detective navigates the rain-slicked streets of a futuristic city to solve a complex case.',
    coverImageUrl: 'https://picsum.photos/seed/neon/400/600',
    genre: 'Cyberpunk',
    reads: 7500,
    chapters: 20,
    tags: ['Dystopian', 'Noir', 'Technology'],
    slug: 'city-of-neon-dreams',
     dataAiHint: 'cyberpunk detective book cover',
  },
   {
    id: '7',
    title: 'Beneath the Willow Tree',
    author: 'Clara Meadows',
    description: 'A heartwarming tale of friendship and finding home in the most unexpected places.',
    coverImageUrl: 'https://picsum.photos/seed/willow/400/600',
    genre: 'Contemporary',
    reads: 15200,
    chapters: 22,
    tags: ['Friendship', 'Slice of Life', 'Rural'],
    slug: 'beneath-the-willow-tree',
     dataAiHint: 'contemporary friendship book cover',
  },
   {
    id: '8',
    title: 'The Alchemist\'s Secret',
    author: 'Marcus Thorne',
    description: 'Unraveling a centuries-old mystery, a historian discovers the key to eternal life... or eternal damnation.',
    coverImageUrl: 'https://picsum.photos/seed/alchemist/400/600',
    genre: 'Thriller',
    reads: 9850,
    chapters: 35,
    tags: ['Historical Thriller', 'Alchemy', 'Conspiracy'],
    slug: 'the-alchemists-secret',
     dataAiHint: 'thriller historical mystery book cover',
  },
   {
    id: '9',
    title: 'Academy of Shadows',
    author: 'Nyx Sterling',
    description: 'At a school for the magically gifted, dark secrets and dangerous rivalries threaten to consume a new student.',
    coverImageUrl: 'https://picsum.photos/seed/academy/400/600',
    genre: 'Urban Fantasy',
    reads: 11300,
    chapters: 28,
    tags: ['Magic School', 'Young Adult', 'Paranormal'],
    slug: 'academy-of-shadows',
     dataAiHint: 'urban fantasy magic school book cover',
  },
    {
    id: '10',
    title: 'The Last Stand',
    author: 'General Rex',
    description: 'Outnumbered and outgunned, a squad of soldiers must hold the line against overwhelming odds.',
    coverImageUrl: 'https://picsum.photos/seed/laststand/400/600',
    genre: 'Military Fiction',
    reads: 6100,
    chapters: 18,
    tags: ['War', 'Action', 'Survival'],
    slug: 'the-last-stand',
     dataAiHint: 'military action war book cover',
  },
     {
    id: '11',
    title: 'Poetry for the Soul',
    author: 'Luna Whisperwind',
    description: 'A collection of verses exploring love, loss, and the beauty found in everyday moments.',
    coverImageUrl: 'https://picsum.photos/seed/poetry/400/600',
    genre: 'Poetry',
    reads: 25000,
    chapters: 50, // Representing 50 poems
    tags: ['Emotional', 'Reflective', 'Verse'],
    slug: 'poetry-for-the-soul',
    priority: true, // Explicitly setting priority for this story
     dataAiHint: 'poetry collection book cover',
  },
    {
    id: '12',
    title: 'Werewolf Next Door',
    author: 'Fang Nightshade',
    description: 'Moving to a new town is hard, especially when your neighbor howls at the moon.',
    coverImageUrl: 'https://picsum.photos/seed/werewolf/400/600',
    genre: 'Paranormal Romance',
    reads: 17800,
    chapters: 32,
    tags: ['Werewolf', 'Romance', 'Humor'],
    slug: 'werewolf-next-door',
     dataAiHint: 'paranormal romance werewolf book cover',
  },
];


const Home: NextPage = () => {
  // In a real app, fetch data here
  // More realistic slicing for sections
  const trendingStories = mockStories.sort((a, b) => b.reads - a.reads).slice(0, 6);
  const newStories = mockStories.slice().reverse().slice(0, 6); // Get the latest added
  const featuredStories = mockStories.filter(s => ['Fantasy', 'Sci-Fi', 'Romance'].includes(s.genre)).slice(0, 6); // Example: feature specific genres

  return (
    <div className="space-y-12 md:space-y-16">
      {/* Hero Section - Enhanced */}
      <section className="text-center py-16 px-4 bg-gradient-to-b from-primary/5 via-background to-background rounded-lg border border-border/50 shadow-sm">
        <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-primary">Your Next Obsession Awaits at Katha Vault</h1>
        <p className="text-lg text-muted-foreground mb-8 max-w-3xl mx-auto">
          Join a global community of readers and writers. Discover original stories across all genres, or share your own voice with the world.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <Button size="lg" asChild className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg transition-shadow">
            <Link href="/browse">Start Reading</Link>
          </Button>
           {/* Start Writing button is removed from here and will be shown conditionally in the header for admins */}
         </div>
      </section>

      {/* Trending Stories Section */}
      <section>
        <div className="flex justify-between items-center mb-4">
           <h2 className="text-2xl font-semibold flex items-center gap-2">
             <TrendingUp className="w-6 h-6 text-primary" /> Trending Now
           </h2>
          <Button variant="link" asChild className="text-primary hover:text-primary/80">
            <Link href="/browse?sort=trending">
              See All <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
          {trendingStories.map((story, index) => (
            <StoryCard
              key={story.id}
              story={story}
              priority={index < 6} // Set priority true for the first few (e.g., 6) cards in this visible section
            />
          ))}
        </div>
      </section>

      {/* Fresh Reads Section */}
      <section>
        <div className="flex justify-between items-center mb-4">
           <h2 className="text-2xl font-semibold flex items-center gap-2">
              <Zap className="w-6 h-6 text-accent" /> Fresh Reads
            </h2>
           <Button variant="link" asChild className="text-primary hover:text-primary/80">
             <Link href="/browse?sort=new">
               See All <ArrowRight className="ml-1 h-4 w-4" />
             </Link>
           </Button>
        </div>
         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
           {newStories.map((story) => (
             <StoryCard key={story.id} story={story} /> // Priority might not be needed here if below the fold
           ))}
         </div>
      </section>

       {/* Featured Section Example */}
       <section>
         <div className="flex justify-between items-center mb-4">
           <h2 className="text-2xl font-semibold flex items-center gap-2">
             <Feather className="w-6 h-6 text-secondary-foreground" /> Featured Fantasy & Sci-Fi
           </h2>
           <Button variant="link" asChild className="text-primary hover:text-primary/80">
             <Link href="/browse?genre=Fantasy&genre=Sci-Fi"> {/* Example multi-filter */}
               See All <ArrowRight className="ml-1 h-4 w-4" />
             </Link>
           </Button>
         </div>
         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
           {featuredStories.map((story) => (
             <StoryCard key={story.id} story={story} /> // Priority might not be needed here if below the fold
           ))}
         </div>
       </section>


    </div>
  );
};

export default Home;

