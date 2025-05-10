'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { fetchChapterContent } from '@/lib/storyService'; // Adjust the path if needed
import { useToast } from '@/hooks/use-toast';

interface ChapterContentProps {
    slug: string;
    chapter: string;
}

const ChapterContent: React.FC<ChapterContentProps> = ({ slug, chapter }) => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [chapterContent, setChapterContent] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadChapter = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const data = await fetchChapterContent(slug, chapter, user?.id);
                setChapterContent(data.content);
            } catch (err) {
                console.error('Error fetching chapter:', err);
                setError('Failed to load chapter. Please try again later.');
                 toast({
                    title: 'Error',
                    description: 'Failed to load chapter. Please try again later.',
                    variant: 'destructive',
                });
            } finally {
                setIsLoading(false);
            }
        };
        loadChapter();
    }, [slug, chapter, user?.id, toast]);

    if (isLoading) {
        return <p>Loading chapter content...</p>; // Replace with a better loading indicator
    }

    if (error) {
        return <p className="text-red-500">{error}</p>;
    }

    return (
        <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: chapterContent || '' }}></div>
    );
};

export default ChapterContent;