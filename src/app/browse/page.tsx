import type { NextPage } from 'next';
import StoryCard, { type Story } from '@/components/story/story-card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

// Mock data - replace with actual data fetching and filtering/sorting logic
const allMockStories: Story[] = Array.from({ length: 24 }, (_, i) => ({
  id: `${i + 1}`,
  title: `Story Title ${i + 1}`,
  author: `Author Name ${i % 5 + 1}`,
  description: `This is a captivating description for story number ${i + 1}. It involves adventure, mystery, and maybe a touch of romance. Read on to find out more!`,
  coverImageUrl: `https://picsum.photos/seed/story${i + 1}/400/600`,
  genre: ['Fantasy', 'Sci-Fi', 'Romance', 'Thriller', 'Adventure', 'Horror'][i % 6],
  reads: Math.floor(Math.random() * 25000) + 100,
  chapters: Math.floor(Math.random() * 50) + 5,
  tags: [['Magic', 'Quest'], ['Space', 'Aliens'], ['Love', 'Drama'], ['Suspense', 'Crime'], ['Journey', 'Discovery'], ['Supernatural', 'Fear']][i % 6],
  slug: `story-title-${i + 1}`,
}));


const BrowsePage: NextPage = () => {
  // Placeholder for filter/sort state and logic
  // const [filterGenre, setFilterGenre] = useState<string>('all');
  // const [sortBy, setSortBy] = useState<string>('popularity');
  // const [searchTerm, setSearchTerm] = useState<string>('');

  // Filtered/sorted stories would be calculated here based on state
  const displayedStories = allMockStories;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Browse Stories</h1>

      {/* Filters and Sorting Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center p-4 bg-card rounded-lg shadow-sm border">
        <div className="relative w-full sm:max-w-xs">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
           <Input
             type="search"
             placeholder="Filter by title or author..."
             className="w-full pl-10"
             // value={searchTerm}
             // onChange={(e) => setSearchTerm(e.target.value)}
           />
         </div>
        <div className="flex gap-4 w-full sm:w-auto">
         <Select defaultValue="all" /* onValueChange={setFilterGenre} */ >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Genre" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Genres</SelectItem>
              <SelectItem value="Fantasy">Fantasy</SelectItem>
              <SelectItem value="Sci-Fi">Sci-Fi</SelectItem>
              <SelectItem value="Romance">Romance</SelectItem>
              <SelectItem value="Thriller">Thriller</SelectItem>
              <SelectItem value="Adventure">Adventure</SelectItem>
              <SelectItem value="Horror">Horror</SelectItem>
              {/* Add more genres */}
            </SelectContent>
          </Select>
          <Select defaultValue="popularity" /* onValueChange={setSortBy} */ >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popularity">Popularity</SelectItem>
              <SelectItem value="trending">Trending</SelectItem>
              <SelectItem value="new">Newest</SelectItem>
              <SelectItem value="rating">Rating</SelectItem> {/* Assuming rating exists */}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Story Grid */}
      {displayedStories.length > 0 ? (
         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
           {displayedStories.map((story) => (
             <StoryCard key={story.id} story={story} />
           ))}
         </div>
       ) : (
         <p className="text-center text-muted-foreground py-12">No stories found matching your criteria.</p>
       )}

      {/* Pagination Placeholder */}
      <div className="flex justify-center mt-12">
        {/* Add pagination component here */}
        <p className="text-sm text-muted-foreground">Pagination placeholder</p>
      </div>
    </div>
  );
};

export default BrowsePage;
