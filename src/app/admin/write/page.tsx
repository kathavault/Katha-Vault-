// src/app/admin/write/page.tsx
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, ShieldCheck, FileText, PlusCircle, Save, Trash2, List, Edit3, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from '@/components/ui/separator';

// Mock data structures for stories and chapters (replace with actual data types/fetching)
interface Chapter {
  id: string;
  title: string;
  content: string;
  wordCount?: number; // Optional
}

interface Story {
  id: string;
  title: string;
  description: string;
  genre: string;
  tags: string[];
  coverImageUrl?: string;
  chapters: Chapter[];
  status: 'Draft' | 'Published' | 'Archived';
}

// Validation function for story data
const validateStoryData = (data: { title: string; description: string; genre: string }): string | null => {
    if (!data.title || data.title.trim().length === 0) {
        return "Story title cannot be empty.";
    }
    if (data.title.length > 100) { // Example max length
        return "Story title cannot exceed 100 characters.";
    }
    if (!data.genre) {
        return "Please select a genre for the story.";
    }
    if (!data.description || data.description.trim().length === 0) {
        return "Story description cannot be empty.";
    }
    if (data.description.length > 1000) { // Example max length
        return "Story description cannot exceed 1000 characters.";
    }
    // Add more validation rules as needed (e.g., for tags)
    return null; // No validation errors
};

// Validation function for chapter data
const validateChapterData = (data: { title: string; content: string }): string | null => {
    if (!data.title || data.title.trim().length === 0) {
        return "Chapter title cannot be empty.";
    }
    if (data.title.length > 150) { // Example max length
        return "Chapter title cannot exceed 150 characters.";
    }
    if (!data.content || data.content.trim().length === 0) {
        return "Chapter content cannot be empty.";
    }
    // Add more validation rules as needed
    return null; // No validation errors
};

// Mock stories for the editor (replace with data fetched for the admin)
const mockAdminStories: Story[] = [
  {
    id: 'story-admin-1',
    title: 'The Crimson Cipher',
    description: 'A thrilling adventure into the unknown...',
    genre: 'Adventure',
    tags: ['Mystery', 'Action'],
    chapters: [
      { id: 'ch-1', title: 'Chapter 1: The Beginning', content: 'The old map felt brittle...' },
      { id: 'ch-2', title: 'Chapter 2: The First Clue', content: 'Deep within the ruins...' },
    ],
    status: 'Published',
    coverImageUrl: 'https://picsum.photos/seed/crimson/400/600',
  },
  {
    id: 'story-admin-2',
    title: 'Project Chimera (Draft)',
    description: 'A new sci-fi concept.',
    genre: 'Sci-Fi',
    tags: ['Cyberpunk', 'AI'],
    chapters: [],
    status: 'Draft',
  },
];


export default function AdminWritePage() {
  const router = useRouter();
  const { user, isAdmin, isLoading } = useAuth();
  const { toast } = useToast();

  // Editor state
  const [stories, setStories] = React.useState<Story[]>(mockAdminStories);
  const [selectedStory, setSelectedStory] = React.useState<Story | null>(null);
  const [selectedChapter, setSelectedChapter] = React.useState<Chapter | null>(null);
  const [isCreatingNewStory, setIsCreatingNewStory] = React.useState(false);
  const [isCreatingNewChapter, setIsCreatingNewChapter] = React.useState(false);

  // Form state (could use react-hook-form for more complex scenarios)
  const [storyTitle, setStoryTitle] = React.useState('');
  const [storyDescription, setStoryDescription] = React.useState('');
  const [storyGenre, setStoryGenre] = React.useState('');
  const [storyTags, setStoryTags] = React.useState(''); // Comma-separated for simplicity
  const [chapterTitle, setChapterTitle] = React.useState('');
  const [chapterContent, setChapterContent] = React.useState('');


  // Protect the route
  React.useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      toast({
        title: "Access Denied",
        description: "You must be an admin to access the writing editor.",
        variant: "destructive",
      });
      router.replace('/login');
    }
  }, [user, isAdmin, isLoading, router, toast]);

  // Load story/chapter data into form when selected
  React.useEffect(() => {
    if (selectedStory) {
      setStoryTitle(selectedStory.title);
      setStoryDescription(selectedStory.description);
      setStoryGenre(selectedStory.genre);
      setStoryTags(selectedStory.tags.join(', '));
      setIsCreatingNewStory(false); // Ensure we are not in creation mode
    } else {
        // Reset form if no story selected or creating new
        setStoryTitle('');
        setStoryDescription('');
        setStoryGenre('');
        setStoryTags('');
    }
     // Reset chapter form when story changes or no story selected
    setSelectedChapter(null);
    setChapterTitle('');
    setChapterContent('');
    setIsCreatingNewChapter(false);

  }, [selectedStory]);

  React.useEffect(() => {
      if (selectedChapter) {
        setChapterTitle(selectedChapter.title);
        setChapterContent(selectedChapter.content);
        setIsCreatingNewChapter(false);
      } else {
          // Reset form if no chapter selected or creating new
          setChapterTitle('');
          setChapterContent('');
      }
  }, [selectedChapter]);


  // Handlers (Simulated - replace with actual API calls)
  const handleSelectStory = (storyId: string) => {
    const story = stories.find(s => s.id === storyId) || null;
    setSelectedStory(story);
    setSelectedChapter(null); // Deselect chapter when story changes
    setIsCreatingNewStory(false);
    setIsCreatingNewChapter(false);
  };

  const handleSelectChapter = (chapterId: string) => {
    const chapter = selectedStory?.chapters.find(c => c.id === chapterId) || null;
    setSelectedChapter(chapter);
    setIsCreatingNewChapter(false);
  };

  const handleCreateNewStory = () => {
      setSelectedStory(null);
      setSelectedChapter(null);
      setIsCreatingNewStory(true);
      setIsCreatingNewChapter(false);
      // Clear forms
      setStoryTitle('New Story Title');
      setStoryDescription('');
      setStoryGenre('');
      setStoryTags('');
      setChapterTitle('');
      setChapterContent('');
  };

  const handleCreateNewChapter = () => {
       if (!selectedStory) {
           toast({ title: "Select a story first", variant: "destructive" });
           return;
       }
      setSelectedChapter(null);
      setIsCreatingNewChapter(true);
       // Clear chapter form
      setChapterTitle('New Chapter Title');
      setChapterContent('');
  };

  const handleSaveStory = () => {
       // Validate story data
       const validationError = validateStoryData({ title: storyTitle, description: storyDescription, genre: storyGenre });
       if (validationError) {
           toast({ title: "Validation Error", description: validationError, variant: "destructive" });
           return;
       }

        // Simulate saving
        console.log("Saving story:", { title: storyTitle, description: storyDescription, genre: storyGenre, tags: storyTags.split(',').map(t => t.trim()) });
        toast({ title: "Story Saved (Simulated)", description: `Story "${storyTitle}" has been saved.` });

        // Update local state (in real app, you'd refetch or update based on API response)
        if (isCreatingNewStory && selectedStory === null) { // Check selectedStory is null to avoid confusion
            const newStory: Story = {
                id: `story-admin-${Date.now()}`,
                title: storyTitle,
                description: storyDescription,
                genre: storyGenre,
                tags: storyTags.split(',').map(t => t.trim()).filter(t => t),
                chapters: [],
                status: 'Draft',
            };
            setStories([...stories, newStory]);
            setSelectedStory(newStory); // Select the newly created story
            setIsCreatingNewStory(false);
        } else if (selectedStory) {
            const updatedStories = stories.map(s =>
                s.id === selectedStory.id
                ? { ...s, title: storyTitle, description: storyDescription, genre: storyGenre, tags: storyTags.split(',').map(t => t.trim()).filter(t => t) }
                : s
            );
            setStories(updatedStories);
             // Update selected story details in state if it's the one being edited
            setSelectedStory(prev => prev ? { ...prev, title: storyTitle, description: storyDescription, genre: storyGenre, tags: storyTags.split(',').map(t => t.trim()).filter(t => t) } : null);
        }
  };

  const handleSaveChapter = () => {
    if (!selectedStory) {
      toast({ title: "No story selected", variant: "destructive" });
      return;
    }

    // Validate chapter data
    const validationError = validateChapterData({ title: chapterTitle, content: chapterContent });
    if (validationError) {
        toast({ title: "Validation Error", description: validationError, variant: "destructive" });
        return;
    }

    // Simulate saving
    console.log("Saving chapter:", { title: chapterTitle, content: chapterContent });
    toast({ title: "Chapter Saved (Simulated)", description: `Chapter "${chapterTitle}" for story "${selectedStory.title}" has been saved.` });

    // Update local state (in real app, you'd refetch or update based on API response)
     if (isCreatingNewChapter && selectedChapter === null) {
         const newChapter: Chapter = {
             id: `ch-${selectedStory.id}-${Date.now()}`,
             title: chapterTitle,
             content: chapterContent,
         };
         const updatedStories = stories.map(s =>
             s.id === selectedStory.id
                 ? { ...s, chapters: [...s.chapters, newChapter] }
                 : s
         );
         setStories(updatedStories);
         // Also update the selectedStory state to reflect the new chapter
         setSelectedStory(prev => prev ? { ...prev, chapters: [...prev.chapters, newChapter] } : null);
         setSelectedChapter(newChapter); // Select the newly created chapter
         setIsCreatingNewChapter(false);
     } else if (selectedChapter) {
        const updatedStories = stories.map(s => {
            if (s.id === selectedStory.id) {
                const updatedChapters = s.chapters.map(ch =>
                    ch.id === selectedChapter.id
                        ? { ...ch, title: chapterTitle, content: chapterContent }
                        : ch
                );
                return { ...s, chapters: updatedChapters };
            }
            return s;
        });
        setStories(updatedStories);
        // Update the selectedStory state
        setSelectedStory(prev => prev ? {
            ...prev,
            chapters: prev.chapters.map(ch =>
                    ch.id === selectedChapter.id
                        ? { ...ch, title: chapterTitle, content: chapterContent }
                        : ch
            )
        } : null);
         // Update selected chapter details in state
         setSelectedChapter(prev => prev ? { ...prev, title: chapterTitle, content: chapterContent } : null);
     }
  };

  const handleDeleteStory = () => {
      if (!selectedStory) return;
      // Confirm deletion
      if (window.confirm(`Are you sure you want to delete the story "${selectedStory.title}" and all its chapters?`)) {
          console.log("Deleting story:", selectedStory.id);
          toast({ title: "Story Deleted (Simulated)", description: `Story "${selectedStory.title}" was deleted.`, variant: "destructive" });
          setStories(stories.filter(s => s.id !== selectedStory.id));
          setSelectedStory(null);
          setSelectedChapter(null);
      }
  };

   const handleDeleteChapter = () => {
        if (!selectedStory || !selectedChapter) return;
        // Confirm deletion
       if (window.confirm(`Are you sure you want to delete the chapter "${selectedChapter.title}"?`)) {
           console.log("Deleting chapter:", selectedChapter.id);
           toast({ title: "Chapter Deleted (Simulated)", description: `Chapter "${selectedChapter.title}" was deleted.`, variant: "destructive" });

            const updatedStories = stories.map(s => {
               if (s.id === selectedStory.id) {
                    return { ...s, chapters: s.chapters.filter(ch => ch.id !== selectedChapter.id) };
               }
                return s;
            });
            setStories(updatedStories);
            // Update selected story state
            setSelectedStory(prev => prev ? {
               ...prev,
               chapters: prev.chapters.filter(ch => ch.id !== selectedChapter.id)
            } : null);
            setSelectedChapter(null); // Deselect the deleted chapter
        }
   };


  if (isLoading || !isAdmin) {
    return (
      <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <Edit3 className="w-8 h-8 text-primary" /> Story Editor
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Sidebar - Story & Chapter List */}
        <div className="md:col-span-3">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center justify-between">
                 My Stories
                  <Button size="sm" variant="outline" onClick={handleCreateNewStory}>
                      <PlusCircle className="h-4 w-4 mr-1" /> New
                  </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2 max-h-[70vh] overflow-y-auto">
               {stories.length === 0 && !isCreatingNewStory && (
                   <p className="text-sm text-muted-foreground p-4 text-center">No stories yet. Click 'New' to start!</p>
               )}
               {stories.map(story => (
                <Card key={story.id} className={`p-3 cursor-pointer hover:bg-secondary transition-colors ${selectedStory?.id === story.id ? 'bg-secondary border-primary' : ''}`} onClick={() => handleSelectStory(story.id)}>
                   <p className="font-medium truncate">{story.title}</p>
                   <p className="text-xs text-muted-foreground">{story.chapters.length} Chapters | {story.status}</p>
                 </Card>
              ))}
              {isCreatingNewStory && (
                 <Card className="p-3 bg-secondary border-primary">
                     <p className="font-medium truncate">New Story...</p>
                     <p className="text-xs text-muted-foreground">Editing Details</p>
                 </Card>
              )}
            </CardContent>
             {selectedStory && (
                 <>
                 <Separator />
                  <CardHeader className="pb-3 pt-4">
                     <CardTitle className="text-lg flex items-center justify-between">
                        Chapters
                         <Button size="sm" variant="outline" onClick={handleCreateNewChapter} disabled={!selectedStory}>
                              <PlusCircle className="h-4 w-4 mr-1" /> New
                          </Button>
                     </CardTitle>
                  </CardHeader>
                   <CardContent className="pt-0 space-y-2 max-h-[30vh] overflow-y-auto">
                     {selectedStory.chapters.length === 0 && !isCreatingNewChapter && (
                          <p className="text-sm text-muted-foreground p-4 text-center">No chapters yet.</p>
                     )}
                    {selectedStory.chapters.map(chapter => (
                      <Card key={chapter.id} className={`p-3 cursor-pointer hover:bg-secondary transition-colors ${selectedChapter?.id === chapter.id ? 'bg-secondary border-primary' : ''}`} onClick={() => handleSelectChapter(chapter.id)}>
                           <p className="font-medium truncate">{chapter.title}</p>
                           {/* Add word count or status if needed */}
                        </Card>
                    ))}
                     {isCreatingNewChapter && (
                         <Card className="p-3 bg-secondary border-primary">
                             <p className="font-medium truncate">New Chapter...</p>
                             <p className="text-xs text-muted-foreground">Editing Content</p>
                         </Card>
                     )}
                   </CardContent>
                  </>
              )}
          </Card>
        </div>

        {/* Main Editor Area */}
        <div className="md:col-span-9">
           {/* Story Details Form */}
            {(selectedStory || isCreatingNewStory) && (
            <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    {isCreatingNewStory ? 'Create New Story' : 'Edit Story Details'}
                    {!isCreatingNewStory && selectedStory && (
                         <Button variant="destructive" size="sm" onClick={handleDeleteStory} disabled={!selectedStory}>
                             <Trash2 className="h-4 w-4 mr-1" /> Delete Story
                         </Button>
                    )}
                  </CardTitle>
                  <CardDescription>Manage the core information about your story.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                   <div>
                      <Label htmlFor="storyTitle">Title</Label>
                       <Input id="storyTitle" value={storyTitle} onChange={(e) => setStoryTitle(e.target.value)} placeholder="Enter story title" />
                    </div>
                    <div>
                       <Label htmlFor="storyDescription">Description</Label>
                       <Textarea id="storyDescription" value={storyDescription} onChange={(e) => setStoryDescription(e.target.value)} placeholder="Enter a short description or synopsis" rows={4} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                           <Label htmlFor="storyGenre">Genre</Label>
                           <Select value={storyGenre} onValueChange={setStoryGenre}>
                               <SelectTrigger id="storyGenre">
                                 <SelectValue placeholder="Select genre" />
                               </SelectTrigger>
                               <SelectContent>
                                   {/* Populate with your genres */}
                                   <SelectItem value="Adventure">Adventure</SelectItem>
                                   <SelectItem value="Fantasy">Fantasy</SelectItem>
                                   <SelectItem value="Sci-Fi">Sci-Fi</SelectItem>
                                   <SelectItem value="Romance">Romance</SelectItem>
                                   <SelectItem value="Thriller">Thriller</SelectItem>
                                   <SelectItem value="Horror">Horror</SelectItem>
                                   <SelectItem value="Mystery">Mystery</SelectItem>
                                    <SelectItem value="Contemporary">Contemporary</SelectItem>
                                    <SelectItem value="Humor">Humor</SelectItem>
                                    <SelectItem value="Paranormal">Paranormal</SelectItem>
                                    <SelectItem value="Poetry">Poetry</SelectItem>
                                    <SelectItem value="Military Fiction">Military Fiction</SelectItem>
                                    <SelectItem value="Cyberpunk">Cyberpunk</SelectItem>
                                   {/* ... more genres */}
                               </SelectContent>
                           </Select>
                         </div>
                         <div>
                            <Label htmlFor="storyTags">Tags (comma-separated)</Label>
                            <Input id="storyTags" value={storyTags} onChange={(e) => setStoryTags(e.target.value)} placeholder="e.g., magic, quest, dragon" />
                         </div>
                    </div>
                     <div>
                       <Label htmlFor="coverImage">Cover Image (Placeholder)</Label>
                       <div className="flex items-center gap-2 mt-1">
                          {selectedStory?.coverImageUrl && !isCreatingNewStory && (
                              <img src={selectedStory.coverImageUrl} alt="Current Cover" className="h-16 w-auto rounded border" />
                          )}
                          <Button variant="outline" size="sm"><ImageIcon className="h-4 w-4 mr-1" /> Upload Cover</Button>
                          <p className="text-xs text-muted-foreground">Upload feature coming soon.</p>
                        </div>
                     </div>
                    <Button onClick={handleSaveStory}><Save className="h-4 w-4 mr-1" /> Save Story Details</Button>
                </CardContent>
            </Card>
           )}

           {/* Chapter Editor Form */}
           {(selectedChapter || isCreatingNewChapter) && selectedStory && (
               <Card>
                   <CardHeader>
                      <CardTitle className="flex justify-between items-center">
                         {isCreatingNewChapter ? 'Create New Chapter' : `Edit Chapter: ${selectedChapter?.title || ''}`}
                          {!isCreatingNewChapter && selectedChapter && (
                               <Button variant="destructive" size="sm" onClick={handleDeleteChapter} disabled={!selectedChapter}>
                                   <Trash2 className="h-4 w-4 mr-1" /> Delete Chapter
                               </Button>
                          )}
                      </CardTitle>
                       <CardDescription>Write and edit the content for this chapter.</CardDescription>
                   </CardHeader>
                   <CardContent className="space-y-4">
                       <div>
                           <Label htmlFor="chapterTitle">Chapter Title</Label>
                           <Input id="chapterTitle" value={chapterTitle} onChange={(e) => setChapterTitle(e.target.value)} placeholder="Enter chapter title" />
                       </div>
                       <div>
                           <Label htmlFor="chapterContent">Content</Label>
                           {/* Basic Textarea - Replace with a Rich Text Editor (e.g., TipTap, Slate.js) for better formatting */}
                           <Textarea id="chapterContent" value={chapterContent} onChange={(e) => setChapterContent(e.target.value)} placeholder="Start writing your chapter here..." rows={20} className="font-serif text-base leading-relaxed" />
                       </div>
                       <div className="flex justify-between items-center">
                           <span className="text-sm text-muted-foreground">Word Count: {chapterContent.split(/\s+/).filter(Boolean).length}</span>
                           <Button onClick={handleSaveChapter}><Save className="h-4 w-4 mr-1" /> Save Chapter</Button>
                       </div>
                   </CardContent>
               </Card>
           )}

            {/* Placeholder when nothing is selected */}
             {!selectedStory && !isCreatingNewStory && (
                <div className="text-center py-20 text-muted-foreground border-2 border-dashed border-border rounded-lg">
                    <FileText className="mx-auto h-12 w-12 mb-4" />
                    <p>Select a story from the left or create a new one to start editing.</p>
                 </div>
             )}
             {selectedStory && !selectedChapter && !isCreatingNewChapter && (
                <div className="text-center py-20 text-muted-foreground border-2 border-dashed border-border rounded-lg">
                   <List className="mx-auto h-12 w-12 mb-4" />
                    <p>Select a chapter from the list above or create a new one to start editing.</p>
                 </div>
             )}

        </div>
      </div>
    </div>
  );
}


    