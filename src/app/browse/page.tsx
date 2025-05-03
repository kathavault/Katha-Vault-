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
import { Search, Filter, ArrowUpDown } from 'lucide-react'; // Added icons

// Mock data - replace with actual data fetching and filtering/sorting logic
const allMockStories: Story[] = Array.from({ length: 30 }, (_, i) => ({ // Increased number of stories
  id: `${i + 1}`,
  title: `Story Title ${i + 1}`,
  author: `Author Name ${i % 5 + 1}`,
  description: `This is a captivating description for story number ${i + 1}. It involves adventure, mystery, and maybe a touch of romance. Read on to find out more! The plot thickens quickly.`,
  coverImageUrl: `https://picsum.photos/seed/browse${i + 1}/400/600`,
  genre: ['Fantasy', 'Sci-Fi', 'Romance', 'Thriller', 'Adventure', 'Horror', 'Mystery', 'Contemporary', 'Humor', 'Paranormal'][i % 10],
  reads: Math.floor(Math.random() * 25000) + 100,
  chapters: Math.floor(Math.random() * 50) + 5,
  tags: [['Magic', 'Quest'], ['Space', 'Aliens'], ['Love', 'Drama'], ['Suspense', 'Crime'], ['Journey', 'Discovery'], ['Supernatural', 'Fear'], ['Detective', 'Clues'], ['Modern', 'Life'], ['Comedy', 'Satire'], ['Vampire', 'Witch']][i % 10],
  slug: `story-title-${i + 1}`,
  dataAiHint: `book cover ${['fantasy quest', 'sci-fi space', 'romance drama', 'thriller crime', 'adventure discovery', 'horror fear', 'mystery detective', 'contemporary life', 'humor comedy', 'paranormal vampire'][i % 10]}`, // Add AI hints
}));


const BrowsePage: NextPage = () => {
  // Placeholder for filter/sort state and logic
  // const [filterGenre, setFilterGenre] = useState<string>('all');
  // const [sortBy, setSortBy] = useState<string>('popularity');
  // const [searchTerm, setSearchTerm] = useState<string>('');

  // Filtered/sorted stories would be calculated here based on state
  const displayedStories = allMockStories; // Use all for now

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Discover Stories</h1>

      {/* Filters and Sorting Controls */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center p-4 bg-card rounded-lg shadow-sm border border-border/80">
        {/* Search Input */}
        <div className="relative w-full md:max-w-sm lg:max-w-md">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
           <Input
             type="search"
             placeholder="Search by title, author, or tag..."
             className="w-full pl-10 rounded-full bg-secondary border-transparent focus:border-border focus:bg-background"
             // value={searchTerm}
             // onChange={(e) => setSearchTerm(e.target.value)}
           />
         </div>
         {/* Filter and Sort Dropdowns */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
         <Select defaultValue="all" /* onValueChange={setFilterGenre} */ >
            <SelectTrigger className="w-full sm:w-[160px] lg:w-[180px]">
              <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
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
              <SelectItem value="Mystery">Mystery</SelectItem>
              <SelectItem value="Contemporary">Contemporary</SelectItem>
              <SelectItem value="Humor">Humor</SelectItem>
              <SelectItem value="Paranormal">Paranormal</SelectItem>
              {/* Add more genres */}
            </SelectContent>
          </Select>
          <Select defaultValue="popularity" /* onValueChange={setSortBy} */ >
            <SelectTrigger className="w-full sm:w-[160px] lg:w-[180px]">
               <ArrowUpDown className="w-4 h-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popularity">Popularity</SelectItem>
              <SelectItem value="trending">Trending (Hot)</SelectItem>
              <SelectItem value="new">Newest</SelectItem>
              <SelectItem value="updated">Recently Updated</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem> {/* Assuming rating exists */}
              <SelectItem value="alphabetical">Alphabetical (A-Z)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Story Grid - Adjusted grid columns for better spacing */}
       {displayedStories.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5 lg:gap-6">
            {displayedStories.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-lg text-muted-foreground">No stories found matching your criteria.</p>
            {/* Optionally add a button to clear filters */}
          </div>
        )}


      {/* Pagination Placeholder */}
      <div className="flex justify-center mt-12">
        {/* Add pagination component here */}
        <p className="text-sm text-muted-foreground">Pagination would go here</p>
        {/* Example: <PaginationComponent currentPage={1} totalPages={10} /> */}
      </div>
    </div>
  );
};

export default BrowsePage;
