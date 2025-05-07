// src/app/admin/write/page.tsx
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, ShieldCheck, FileText, PlusCircle, Save, Trash2, List, Edit3, Image as ImageIcon, AlertTriangle, Upload } from 'lucide-react'; // Added Upload icon
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
import { validateStoryData, validateChapterData } from '@/services/validationService';
import { fetchAdminStories, saveStory, saveChapter, deleteStory, deleteChapter } from '@/lib/firebaseService'; // Import Firebase service functions
import { uploadFile } from '@/lib/storageService'; // Import storage service
import type { Story, Chapter } from '@/types'; // Import shared types
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Image from 'next/image'; // Import next/image

export default function AdminWritePage() {
  const router = useRouter();
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  // Editor state
  const [stories, setStories] = React.useState<Story[]>([]);
  const [selectedStory, setSelectedStory] = React.useState<Story | null>(null);
  const [selectedChapter, setSelectedChapter] = React.useState<Chapter | null>(null);
  const [isCreatingNewStory, setIsCreatingNewStory] = React.useState(false);
  const [isCreatingNewChapter, setIsCreatingNewChapter] = React.useState(false);
  const [isLoadingStories, setIsLoadingStories] = React.useState(true); // Loading state for stories
  const [isSaving, setIsSaving] = React.useState(false); // Saving state for story/chapter
  const [isDeleting, setIsDeleting] = React.useState(false); // Deleting state
  const [isUploading, setIsUploading] = React.useState(false); // Uploading state for cover

  // Form state
  const [storyTitle, setStoryTitle] = React.useState('');
  const [storyDescription, setStoryDescription] = React.useState('');
  const [storyGenre, setStoryGenre] = React.useState('');
  const [storyTags, setStoryTags] = React.useState('');
  const [storyStatus, setStoryStatus] = React.useState<'Draft' | 'Published' | 'Archived'>('Draft');
  const [storyCoverImageUrl, setStoryCoverImageUrl] = React.useState<string | undefined>(undefined); // Store cover image URL
  const [chapterTitle, setChapterTitle] = React.useState('');
  const [chapterContent, setChapterContent] = React.useState('');

  const fileInputRef = React.useRef<HTMLInputElement>(null); // Ref for file input

  // Fetch stories for the admin user on mount
  React.useEffect(() => {
    const loadStories = async () => {
      if (user?.id && isAdmin) { // Only fetch if logged-in user is admin
        setIsLoadingStories(true);
        try {
          // Assuming fetchAdminStories is appropriate for fetching all stories managed by admins
          const fetchedStories = await fetchAdminStories(user.id);
          setStories(fetchedStories);
        } catch (error) {
          console.error("Error fetching admin stories:", error);
          toast({
            title: "Error Fetching Stories",
            description: "Could not load stories. Please try again.",
            variant: "destructive",
          });
        } finally {
          setIsLoadingStories(false);
        }
      } else if (!authLoading) {
          // If auth is loaded but no user or not admin, clear stories and stop loading
          setStories([]);
          setIsLoadingStories(false);
      }
    };

    if (!authLoading) { // Only run when auth state is resolved
        loadStories();
    }
  }, [user, isAdmin, authLoading, toast]);


  // Protect the route
  React.useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      toast({
        title: "Access Denied",
        description: "You must be an admin to access the writing editor.",
        variant: "destructive",
      });
      router.replace('/login');
    }
  }, [user, isAdmin, authLoading, router, toast]);

  // Load story/chapter data into form when selected
  React.useEffect(() => {
    if (selectedStory) {
      setStoryTitle(selectedStory.title);
      setStoryDescription(selectedStory.description);
      setStoryGenre(selectedStory.genre);
      setStoryTags(selectedStory.tags?.join(', ') || '');
      setStoryStatus(selectedStory.status);
      setStoryCoverImageUrl(selectedStory.coverImageUrl); // Load existing cover URL
      setIsCreatingNewStory(false);
    } else {
        setStoryTitle('');
        setStoryDescription('');
        setStoryGenre('');
        setStoryTags('');
        setStoryStatus('Draft');
        setStoryCoverImageUrl(undefined); // Reset cover URL
    }
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
          setChapterTitle('');
          setChapterContent('');
      }
  }, [selectedChapter]);


  // Handlers
  const handleSelectStory = (storyId: string) => {
    const story = stories.find(s => s.id === storyId) || null;
    setSelectedStory(story);
    setSelectedChapter(null);
    setIsCreatingNewStory(false);
    setIsCreatingNewChapter(false);
  };

  const handleSelectChapter = (chapterId: string) => {
    const chapter = selectedStory?.chapters?.find(c => c.id === chapterId) || null;
    setSelectedChapter(chapter);
    setIsCreatingNewChapter(false);
  };

  const handleCreateNewStory = () => {
      setSelectedStory(null);
      setSelectedChapter(null);
      setIsCreatingNewStory(true);
      setIsCreatingNewChapter(false);
      setStoryTitle('New Story Title');
      setStoryDescription('');
      setStoryGenre('');
      setStoryTags('');
      setStoryStatus('Draft');
      setStoryCoverImageUrl(undefined); // Reset cover URL
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
      setChapterTitle('New Chapter Title');
      setChapterContent('');
  };

   // Handle clicking the "Upload Cover" button
   const handleUploadButtonClick = () => {
      if (fileInputRef.current) {
         fileInputRef.current.click(); // Trigger the hidden file input
       }
   };

   // Handle file selection and upload
    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
       if (!event.target.files || event.target.files.length === 0) {
         return;
       }
       const file = event.target.files[0];
       if (!file || !selectedStory?.id) {
            toast({ title: "Upload Error", description: "No file selected or story not saved yet.", variant: "destructive" });
            return;
        }
        console.log('File to be uploaded:', file);
        console.log('Selected story:', selectedStory);
        console.log('Is file an image:', file.type.startsWith('image/'));
        console.log('File size (bytes):', file.size);

        if (!selectedStory?.id) {
            return;
        }

       // Basic file validation (optional: add more checks like size, type)
       if (!file.type.startsWith('image/')) {
         toast({ title: "Invalid File Type", description: "Please upload an image file.", variant: "destructive" });
         return;
       }
       if (file.size > 5 * 1024 * 1024) { // 5MB limit example
          toast({ title: "File Too Large", description: "Image size should not exceed 5MB.", variant: "destructive" });
          return;
       }


       setIsUploading(true);
       try {
         // Upload file to Firebase Storage in a 'covers' folder
         const downloadURL = await uploadFile(file, `stories/${selectedStory.id}/covers`);

         // Update the story document in Firestore with the new URL
         const storyDataToUpdate: Partial<Story> = { coverImageUrl: downloadURL };
         await saveStory(selectedStory.id, storyDataToUpdate as any); // Cast needed as saveStory expects full data

         // Update local state immediately
          setStoryCoverImageUrl(downloadURL);
          setSelectedStory(prev => prev ? { ...prev, coverImageUrl: downloadURL } : null);
          setStories(prevStories => prevStories.map(s => s.id === selectedStory.id ? { ...s, coverImageUrl: downloadURL } : s));


         toast({ title: "Cover Uploaded", description: "New cover image saved successfully." });
       } catch (error) {
            console.error('Detailed error uploading cover image:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred.';
            toast({
                title: 'Upload Failed',
                description: `Could not upload cover image. Error: ${errorMessage}`,
                variant: 'destructive',
            });
       } finally {
         setIsUploading(false);
       }
       // Reset file input value to allow re-uploading the same file if needed
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
     };

  const handleSaveStory = async () => {
    if (!user?.id || !isAdmin) { // Ensure user is admin
        toast({ title: "Authorization Error", description: "Only admins can save stories.", variant: "destructive"});
        return;
    }
    setIsSaving(true);
    const tagsArray = storyTags.split(',').map(t => t.trim()).filter(t => t);
    const storyData = {
        title: storyTitle,
        description: storyDescription,
        genre: storyGenre,
        tags: tagsArray,
        status: storyStatus,
        authorId: user.id, // Associate story with logged-in admin
        authorName: user.name || user.email || 'Admin', // Add author name
        coverImageUrl: storyCoverImageUrl, // Include cover image URL
    };

    // Server-side validation
    const validationError = validateStoryData(storyData);
    if (validationError) {
        toast({ title: "Validation Error", description: validationError, variant: "destructive" });
        setIsSaving(false);
        return;
    }

    try {
        // Pass necessary fields explicitly, omit fields managed by Firestore (like reads, potentially chapters depending on structure)
         const dataToSave: Omit<Story, 'id' | 'chapters' | 'reads' | 'lastUpdated'> & { authorId: string } = {
            title: storyData.title,
            description: storyData.description,
            genre: storyData.genre,
            tags: storyData.tags,
            status: storyData.status,
            authorId: storyData.authorId,
            authorName: storyData.authorName,
            coverImageUrl: storyData.coverImageUrl, // Include cover image URL
             slug: selectedStory?.slug || storyTitle.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''), // Generate slug if new
             // TODO: Ensure slug uniqueness server-side if necessary
        };

        const savedStoryId = await saveStory(selectedStory?.id, dataToSave); // Pass existing ID if editing
        const storySnapshot = stories.find(s => s.id === selectedStory?.id) || { chapters: [], reads: 0 }; // Get existing data or default

        const savedOrUpdatedStory: Story = {
            ...dataToSave,
            id: savedStoryId,
            chapters: storySnapshot.chapters, // Preserve chapters locally
            reads: storySnapshot.reads, // Preserve reads
            lastUpdated: new Date(), // Update timestamp locally (Firestore handles server time)
        };

        toast({ title: "Story Saved", description: `Story "${savedOrUpdatedStory.title}" has been saved.` });

        // Update local state
        if (isCreatingNewStory) {
            setStories(prev => [...prev, savedOrUpdatedStory]);
            setSelectedStory(savedOrUpdatedStory);
            setIsCreatingNewStory(false);
        } else {
            setStories(prev => prev.map(s => s.id === savedOrUpdatedStory.id ? savedOrUpdatedStory : s));
            // Update selected story details in state if it's the one being edited
            setSelectedStory(prev => prev && prev.id === savedOrUpdatedStory.id ? savedOrUpdatedStory : prev);
        }
    } catch (error) {
        console.error("Error saving story:", error);
        toast({ title: "Error Saving Story", description: "Could not save the story. Please try again.", variant: "destructive" });
    } finally {
        setIsSaving(false);
    }
  };

  const handleSaveChapter = async () => {
    if (!selectedStory?.id || !user?.id || !isAdmin) { // Ensure user is admin
      toast({ title: "Cannot Save Chapter", description: "No story selected or insufficient permissions.", variant: "destructive" });
      return;
    }
    setIsSaving(true);
    const chapterData = {
        title: chapterTitle,
        content: chapterContent,
        storyId: selectedStory.id,
        wordCount: chapterContent.split(/\s+/).filter(Boolean).length,
        // order field will be handled by saveChapter function if creating new
        order: selectedChapter?.order // Pass existing order if editing
    };

    // Server-side validation
    const validationError = validateChapterData(chapterData);
    if (validationError) {
        toast({ title: "Validation Error", description: validationError, variant: "destructive" });
        setIsSaving(false);
        return;
    }

    try {
        const dataToSave: Omit<Chapter, 'id' | 'lastUpdated'> = {
             title: chapterData.title,
             content: chapterData.content,
             storyId: chapterData.storyId,
             wordCount: chapterData.wordCount,
             order: chapterData.order,
        };

        const savedChapterId = await saveChapter(selectedStory.id, selectedChapter?.id, dataToSave);
        const savedChapter: Chapter = {
             ...dataToSave,
             id: savedChapterId,
             lastUpdated: new Date(), // Update timestamp locally
         };


        toast({ title: "Chapter Saved", description: `Chapter "${savedChapter.title}" saved.` });

        // Update local state
        const updateStoryChapters = (chapters: Chapter[] | undefined) => {
            const existingChapters = chapters || [];
            let updatedChapters: Chapter[];
            if (isCreatingNewChapter || !selectedChapter) {
                updatedChapters = [...existingChapters, savedChapter];
            } else {
                updatedChapters = existingChapters.map(ch => ch.id === savedChapter.id ? savedChapter : ch);
            }
            // Re-sort chapters locally based on order
            return updatedChapters.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        };

        setStories(prevStories => prevStories.map(s =>
            s.id === selectedStory.id ? { ...s, chapters: updateStoryChapters(s.chapters) } : s
        ));
        setSelectedStory(prevSelected => prevSelected ? { ...prevSelected, chapters: updateStoryChapters(prevSelected.chapters) } : null);

        setSelectedChapter(savedChapter); // Select the saved/updated chapter
        setIsCreatingNewChapter(false);

    } catch (error) {
        console.error("Error saving chapter:", error);
        toast({ title: "Error Saving Chapter", description: "Could not save the chapter. Please try again.", variant: "destructive" });
    } finally {
        setIsSaving(false);
    }
  };

  const handleDeleteStory = async () => {
      if (!selectedStory?.id || !isAdmin) return; // Check admin status
      if (window.confirm(`Are you sure you want to delete the story "${selectedStory.title}" and ALL its chapters? This action cannot be undone.`)) {
          setIsDeleting(true);
          try {
              await deleteStory(selectedStory.id);
              toast({ title: "Story Deleted", description: `Story "${selectedStory.title}" was deleted.`, variant: "destructive" });
              setStories(prev => prev.filter(s => s.id !== selectedStory.id));
              setSelectedStory(null);
              setSelectedChapter(null);
          } catch (error) {
              console.error("Error deleting story:", error);
              toast({ title: "Error Deleting Story", description: "Could not delete the story. Please try again.", variant: "destructive" });
          } finally {
              setIsDeleting(false);
          }
      }
  };

   const handleDeleteChapter = async () => {
        if (!selectedStory?.id || !selectedChapter?.id || !isAdmin) return; // Check admin status
        if (window.confirm(`Are you sure you want to delete the chapter "${selectedChapter.title}"? This action cannot be undone.`)) {
            setIsDeleting(true);
            try {
                await deleteChapter(selectedStory.id, selectedChapter.id);
                toast({ title: "Chapter Deleted", description: `Chapter "${selectedChapter.title}" was deleted.`, variant: "destructive" });

                 // Update local state
                const updateStoryChapters = (chapters: Chapter[] | undefined) => {
                    const updated = (chapters || []).filter(ch => ch.id !== selectedChapter.id);
                     // Re-sort chapters locally based on order
                     return updated.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
                };

                setStories(prevStories => prevStories.map(s =>
                    s.id === selectedStory.id ? { ...s, chapters: updateStoryChapters(s.chapters) } : s
                ));
                 setSelectedStory(prevSelected => prevSelected ? { ...prevSelected, chapters: updateStoryChapters(prevSelected.chapters) } : null);
                setSelectedChapter(null); // Deselect the deleted chapter
            } catch (error) {
                console.error("Error deleting chapter:", error);
                toast({ title: "Error Deleting Chapter", description: "Could not delete the chapter. Please try again.", variant: "destructive" });
            } finally {
                setIsDeleting(false);
            }
        }
   };

  const totalLoading = authLoading || isLoadingStories || isSaving || isDeleting || isUploading;

  if (authLoading || (!isAdmin && !authLoading) ) { // Show loader until auth check complete, or if redirecting
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

        <Alert variant="warning" className="mb-6">
             <AlertTriangle className="h-4 w-4" />
             <AlertTitle>Security Reminder</AlertTitle>
             <AlertDescription>
                Ensure your Firestore security rules are correctly configured to restrict write access to administrators only. Client-side checks alone are not sufficient. Ensure Storage rules also restrict uploads to admins.
             </AlertDescription>
         </Alert>


      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Sidebar - Story & Chapter List */}
        <div className="md:col-span-3">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center justify-between">
                 My Stories
                  <Button size="sm" variant="outline" onClick={handleCreateNewStory} disabled={totalLoading}>
                      <PlusCircle className="h-4 w-4 mr-1" /> New
                  </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2 max-h-[70vh] overflow-y-auto">
               {isLoadingStories && (
                   <div className="flex justify-center p-4"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground"/></div>
               )}
               {!isLoadingStories && stories.length === 0 && !isCreatingNewStory && (
                   <p className="text-sm text-muted-foreground p-4 text-center">No stories yet. Click 'New' to start!</p>
               )}
               {!isLoadingStories && stories.map(story => (
                <Card key={story.id} className={`p-3 cursor-pointer hover:bg-secondary transition-colors ${selectedStory?.id === story.id ? 'bg-secondary border-primary' : ''}`} onClick={() => handleSelectStory(story.id)}>
                   <p className="font-medium truncate">{story.title}</p>
                   <p className="text-xs text-muted-foreground">{story.chapters?.length || 0} Chapters | {story.status}</p>
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
                         <Button size="sm" variant="outline" onClick={handleCreateNewChapter} disabled={!selectedStory || totalLoading}>
                              <PlusCircle className="h-4 w-4 mr-1" /> New
                          </Button>
                     </CardTitle>
                  </CardHeader>
                   <CardContent className="pt-0 space-y-2 max-h-[30vh] overflow-y-auto">
                     {selectedStory.chapters?.length === 0 && !isCreatingNewChapter && (
                          <p className="text-sm text-muted-foreground p-4 text-center">No chapters yet.</p>
                     )}
                    {selectedStory.chapters?.map(chapter => (
                      <Card key={chapter.id} className={`p-3 cursor-pointer hover:bg-secondary transition-colors ${selectedChapter?.id === chapter.id ? 'bg-secondary border-primary' : ''}`} onClick={() => handleSelectChapter(chapter.id)}>
                           <p className="font-medium truncate">{chapter.order}. {chapter.title}</p> {/* Display order */}
                           <p className="text-xs text-muted-foreground">{chapter.wordCount || 0} words</p>
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
        <div className="md:col-span-9 space-y-6">
           {/* Story Details Form */}
            {(selectedStory || isCreatingNewStory) && (
            <Card>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    {isCreatingNewStory ? 'Create New Story' : `Edit Story: ${selectedStory?.title}`}
                    {!isCreatingNewStory && selectedStory && (
                         <Button variant="destructive" size="sm" onClick={handleDeleteStory} disabled={!selectedStory || totalLoading}>
                             {isDeleting ? <Loader2 className="h-4 w-4 mr-1 animate-spin"/> : <Trash2 className="h-4 w-4 mr-1" />}
                             Delete Story
                         </Button>
                    )}
                  </CardTitle>
                  <CardDescription>Manage the core information about your story.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                   <div>
                      <Label htmlFor="storyTitle">Title</Label>
                       <Input id="storyTitle" value={storyTitle} onChange={(e) => setStoryTitle(e.target.value)} placeholder="Enter story title" disabled={totalLoading}/>
                    </div>
                    <div>
                       <Label htmlFor="storyDescription">Description</Label>
                       <Textarea id="storyDescription" value={storyDescription} onChange={(e) => setStoryDescription(e.target.value)} placeholder="Enter a short description or synopsis" rows={4} disabled={totalLoading}/>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                           <Label htmlFor="storyGenre">Genre</Label>
                           <Select value={storyGenre} onValueChange={setStoryGenre} disabled={totalLoading}>
                               <SelectTrigger id="storyGenre">
                                 <SelectValue placeholder="Select genre" />
                               </SelectTrigger>
                               <SelectContent>
                                   {/* Add more genres as needed */}
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
                                   <SelectItem value="Historical">Historical</SelectItem>
                                   <SelectItem value="Fanfiction">Fanfiction</SelectItem>
                                   <SelectItem value="Urban Fantasy">Urban Fantasy</SelectItem>
                                   <SelectItem value="Young Adult">Young Adult</SelectItem>
                               </SelectContent>
                           </Select>
                         </div>
                         <div>
                            <Label htmlFor="storyTags">Tags (comma-separated)</Label>
                            <Input id="storyTags" value={storyTags} onChange={(e) => setStoryTags(e.target.value)} placeholder="e.g., magic, quest, dragon" disabled={totalLoading}/>
                         </div>
                    </div>
                     <div>
                       <Label htmlFor="storyStatus">Status</Label>
                        <Select value={storyStatus} onValueChange={(value: Story['status']) => setStoryStatus(value)} disabled={totalLoading}>
                            <SelectTrigger id="storyStatus">
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Draft">Draft</SelectItem>
                                <SelectItem value="Published">Published</SelectItem>
                                <SelectItem value="Archived">Archived</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div>
                       <Label htmlFor="coverImage">Cover Image</Label>
                       <div className="flex items-center gap-4 mt-1">
                          {storyCoverImageUrl && !isCreatingNewStory && (
                             <div className="relative h-24 w-16 rounded border bg-muted overflow-hidden">
                               <Image
                                 src={storyCoverImageUrl}
                                 alt="Current Cover"
                                 fill
                                 style={{ objectFit: 'cover' }}
                                 sizes="64px"
                                 data-ai-hint="admin cover image preview"
                               />
                             </div>
                          )}
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            style={{ display: 'none' }} // Hide the default input
                            disabled={totalLoading || !selectedStory?.id}
                          />
                          <Button
                             variant="outline"
                             size="sm"
                             onClick={handleUploadButtonClick}
                             disabled={totalLoading || !selectedStory?.id}
                          >
                             {isUploading ? <Loader2 className="h-4 w-4 mr-1 animate-spin"/> : <Upload className="h-4 w-4 mr-1" />}
                             {storyCoverImageUrl ? 'Change Cover' : 'Upload Cover'}
                          </Button>
                           {!selectedStory?.id && !isCreatingNewStory && <p className="text-xs text-muted-foreground">Save the story first to upload a cover.</p>}
                        </div>
                     </div>
                    <Button onClick={handleSaveStory} disabled={totalLoading}>
                      {isSaving ? <Loader2 className="h-4 w-4 mr-1 animate-spin"/> : <Save className="h-4 w-4 mr-1" />}
                      {isCreatingNewStory ? 'Create Story' : 'Save Story Details'}
                    </Button>
                </CardContent>
            </Card>
           )}

           {/* Chapter Editor Form */}
           {(selectedChapter || isCreatingNewChapter) && selectedStory && (
               <Card>
                   <CardHeader>
                      <CardTitle className="flex justify-between items-center">
                         {isCreatingNewChapter ? `Create New Chapter for "${selectedStory.title}"` : `Edit Chapter: ${selectedChapter?.title || ''}`}
                          {!isCreatingNewChapter && selectedChapter && (
                               <Button variant="destructive" size="sm" onClick={handleDeleteChapter} disabled={!selectedChapter || totalLoading}>
                                   {isDeleting ? <Loader2 className="h-4 w-4 mr-1 animate-spin"/> : <Trash2 className="h-4 w-4 mr-1" />}
                                   Delete Chapter
                               </Button>
                          )}
                      </CardTitle>
                       <CardDescription>Write and edit the content for this chapter.</CardDescription>
                   </CardHeader>
                   <CardContent className="space-y-4">
                       <div>
                           <Label htmlFor="chapterTitle">Chapter Title</Label>
                           <Input id="chapterTitle" value={chapterTitle} onChange={(e) => setChapterTitle(e.target.value)} placeholder="Enter chapter title" disabled={totalLoading}/>
                       </div>
                       <div>
                           <Label htmlFor="chapterContent">Content</Label>
                           <Textarea
                              id="chapterContent"
                              value={chapterContent}
                              onChange={(e) => setChapterContent(e.target.value)}
                              placeholder="Start writing your chapter here..."
                              rows={20}
                              className="font-serif text-base leading-relaxed"
                              disabled={totalLoading}
                           />
                       </div>
                       <div className="flex justify-between items-center">
                           <span className="text-sm text-muted-foreground">Word Count: {chapterContent.split(/\s+/).filter(Boolean).length}</span>
                           <Button onClick={handleSaveChapter} disabled={totalLoading}>
                             {isSaving ? <Loader2 className="h-4 w-4 mr-1 animate-spin"/> : <Save className="h-4 w-4 mr-1" />}
                             {isCreatingNewChapter ? 'Create Chapter' : 'Save Chapter'}
                           </Button>
                       </div>
                   </CardContent>
               </Card>
           )}

            {/* Placeholder when nothing is selected */}
             {!selectedStory && !isCreatingNewStory && !isLoadingStories && (
                <div className="text-center py-20 text-muted-foreground border-2 border-dashed border-border rounded-lg">
                    <FileText className="mx-auto h-12 w-12 mb-4" />
                    <p>Select a story from the left or create a new one to start editing.</p>
                 </div>
             )}
             {selectedStory && !selectedChapter && !isCreatingNewChapter && (
                <div className="text-center py-20 text-muted-foreground border-2 border-dashed border-border rounded-lg">
                   <List className="mx-auto h-12 w-12 mb-4" />
                    <p>Select a chapter from the list above or create a new one.</p>
                 </div>
             )}

        </div>
      </div>
    </div>
  );
}
