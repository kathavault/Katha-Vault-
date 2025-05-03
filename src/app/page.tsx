import type { NextPage } from 'next';
import StoryCard, { type Story } from '@/components/story/story-card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

// Mock data - replace with actual data fetching later
const mockStories: Story[] = [
  {
    id: '1',
    title: 'The Crimson Cipher',
    author: 'Alex Quill',
    description: 'A thrilling adventure into the unknown depths of ancient ruins, where secrets lie buried.',
    coverImageUrl: 'https://picsum.photos/seed/crimson/400/600',
    genre: 'Adventure',
    reads: 12567,
    chapters: 25,
    tags: ['Mystery', 'Action', 'Ancient'],
    slug: 'the-crimson-cipher',
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
  },
];


const Home: NextPage = () => {
  // In a real app, fetch data here
  const trendingStories = mockStories.slice(0, 6); // Example: first 6 are trending
  const newStories = mockStories.slice(3, 9).reverse(); // Example: different slice for new

  return (
    <div className="space-y-12">
      {/* Hero Section - Optional */}
      <section className="text-center py-12 bg-gradient-to-r from-primary/10 via-background to-accent/10 rounded-lg">
        <h1 className="text-4xl font-bold mb-4 text-primary">Dive into Infinite Stories</h1>
        <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
          Discover the next generation of storytellers and find your next favorite read on StoryVerse.
        </p>
        <Button size="lg" asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
          <Link href="/browse">Start Reading Now</Link>
        </Button>
      </section>

      {/* Trending Stories Section */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Trending Now</h2>
          <Button variant="link" asChild className="text-accent">
            <Link href="/browse?sort=trending">
              See All <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
          {trendingStories.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      </section>

      {/* New Stories Section */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Fresh Reads</h2>
           <Button variant="link" asChild className="text-accent">
             <Link href="/browse?sort=new">
               See All <ArrowRight className="ml-1 h-4 w-4" />
             </Link>
           </Button>
        </div>
         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
           {newStories.map((story) => (
             <StoryCard key={story.id} story={story} />
           ))}
         </div>
      </section>

      {/* Add more sections like "Top Fantasy", "Featured Writers", etc. */}

    </div>
  );
};

export default Home;
