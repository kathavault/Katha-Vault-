// src/app/read/[slug]/[chapter]/ChapterNavigation.tsx
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface ChapterNavigationProps {
    currentChapterOrder: number;
    totalChapters: number;
    storySlug: string;
}

const ChapterNavigation: React.FC<ChapterNavigationProps> = ({
    currentChapterOrder,
    totalChapters,
    storySlug,
}) => {
    const hasPreviousChapter = currentChapterOrder > 1;
    const hasNextChapter = currentChapterOrder < totalChapters;

    return (
        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
            {hasPreviousChapter ? (
                <Button variant="outline" asChild>
                    <Link href={`/read/${storySlug}/${currentChapterOrder - 1}`}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Previous Chapter
                    </Link>
                </Button>
            ) : (
                <div /> // Placeholder to maintain layout
            )}

            <span className="text-sm text-muted-foreground">
                Chapter {currentChapterOrder} of {totalChapters}
            </span>

            {hasNextChapter ? (
                <Button variant="outline" asChild>
                    <Link href={`/read/${storySlug}/${currentChapterOrder + 1}`}>
                        Next Chapter <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            ) : (
                <div /> // Placeholder to maintain layout
            )}
        </div>
    );
};

export default ChapterNavigation;
