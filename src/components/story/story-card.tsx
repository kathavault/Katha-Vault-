import type { FC } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, BookOpen, User } from 'lucide-react';

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
};

interface StoryCardProps {
  story: Story;
}

const StoryCard: FC<StoryCardProps> = ({ story }) => {
  return (
    <Card className="w-full overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <Link href={`/story/${story.slug}`} className="group block">
        <div className="relative aspect-[2/3] w-full">
          <Image
            src={story.coverImageUrl}
            alt={`Cover for ${story.title}`}
            layout="fill"
            objectFit="cover"
            className="group-hover:scale-105 transition-transform duration-300"
            data-ai-hint="book cover story"
          />
           <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
           <div className="absolute bottom-2 left-2 right-2">
             <Badge variant="secondary" className="text-xs">{story.genre}</Badge>
           </div>
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg leading-tight truncate mb-1 group-hover:text-primary">{story.title}</h3>
          <p className="text-sm text-muted-foreground flex items-center gap-1 mb-2">
            <User className="w-3 h-3" />
            <span>{story.author}</span>
          </p>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{story.description}</p>
          <div className="flex justify-between items-center text-xs text-muted-foreground">
             <div className="flex items-center gap-2">
               <span className="flex items-center gap-1"><Eye className="w-3 h-3"/> {story.reads.toLocaleString()}</span>
               <span className="flex items-center gap-1"><BookOpen className="w-3 h-3"/> {story.chapters} Parts</span>
             </div>
           </div>
           {story.tags && story.tags.length > 0 && (
             <div className="mt-2 flex flex-wrap gap-1">
                {story.tags.slice(0, 3).map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                ))}
             </div>
            )}
        </CardContent>
      </Link>
    </Card>
  );
};

export default StoryCard;
