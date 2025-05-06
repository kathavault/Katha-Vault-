import type { FC } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, BookOpen, User } from 'lucide-react';
import { cn } from '@/lib/utils';

// Define a type for the story data
export type Story = {
  id: string;
  title: string;
  author: string;
  description: string;
  coverImageUrl: string;
  genre: string;
  reads: number;
  chapters: number;
  tags?: string[];
  slug: string; // For linking to the story page
  priority?: boolean; // Add optional priority prop
  dataAiHint?: string; // Optional AI hint for image generation
};

interface StoryCardProps {
  story: Story;
  className?: string; // Allow passing additional classes
  priority?: boolean; // Add optional priority prop
}

const StoryCard: FC<StoryCardProps> = ({ story, className, priority = false }) => {
  return (
    <Card className={cn("w-full overflow-hidden border border-border/80 hover:border-border hover:shadow-md transition-all duration-200 group bg-card", className)}>
      <Link href={`/story/${story.slug}`} className="block h-full flex flex-col">
        <div className="relative aspect-[2/3] w-full overflow-hidden"> {/* Ensure image container clips */}
          <Image
            src={story.coverImageUrl}
            alt={`Cover for ${story.title}`}
            fill // Use fill instead of layout="fill"
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16.6vw" // Provide sizes for optimization
            className="object-cover group-hover:scale-105 transition-transform duration-300 ease-in-out" // Smooth transition
            priority={priority} // Use the passed priority prop
            data-ai-hint={story.dataAiHint || "book cover story"} // Use provided hint or default
          />
           {/* Subtle gradient overlay for text contrast */}
           <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>
           {/* Genre Badge */}
           <div className="absolute bottom-2 left-2">
             {/* Use primary color for genre badge like Wattpad often does */}
             <Badge variant="default" className="text-xs bg-primary/90 text-primary-foreground truncate max-w-[calc(100%-1rem)]">
               {story.genre}
             </Badge>
           </div>
        </div>
        <CardContent className="p-3 flex-grow flex flex-col justify-between"> {/* Adjusted padding, flex-grow */}
          <div>
             <h3 className="font-semibold text-base leading-tight truncate mb-1 group-hover:text-primary">{story.title}</h3>
             <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2 truncate">
               <User className="w-3 h-3" />
               <span>by {story.author}</span>
             </p>
          </div>
          {/* Stats */}
          <div className="flex justify-between items-center text-xs text-muted-foreground mt-2">
             <div className="flex items-center gap-3"> {/* Increased gap */}
               <span className="flex items-center gap-1" title={`${story.reads.toLocaleString()} Reads`}>
                  <Eye className="w-3.5 h-3.5"/> {/* Slightly larger icons */}
                  {story.reads > 1000 ? `${(story.reads / 1000).toFixed(1)}K` : story.reads}
                </span>
               <span className="flex items-center gap-1" title={`${story.chapters} Parts`}>
                  <BookOpen className="w-3.5 h-3.5"/>
                  {story.chapters}
                </span>
                {/* Placeholder for votes/comments if needed */}
             </div>
             {/* Optionally show 1-2 tags */}
              {story.tags && story.tags.length > 0 && (
               <div className="hidden sm:flex flex-wrap gap-1 justify-end">
                  {story.tags.slice(0, 1).map(tag => ( // Show only one tag usually
                      <Badge key={tag} variant="outline" className="text-[10px] px-1.5 py-0.5">#{tag}</Badge>
                  ))}
               </div>
              )}
           </div>
        </CardContent>
      </Link>
    </Card>
  );
};

export default StoryCard;
