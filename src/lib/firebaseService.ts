// src/lib/firebaseService.ts
import { db, auth } from './firebase'; // Assuming db and auth are exported from firebase setup
import {
  collection,
  addDoc,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  getDoc,
  writeBatch,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import type { Story, Chapter } from '@/types'; // Import shared types

const STORIES_COLLECTION = 'stories';
const CHAPTERS_COLLECTION = 'chapters';

/**
 * Fetches stories for the admin user.
 * Currently fetches all stories for simplicity, but should ideally filter by authorId.
 * Consider adding pagination for large datasets.
 */
export const fetchAdminStories = async (adminUserId: string): Promise<Story[]> => {
  try {
    // TODO: Implement proper filtering by authorId if stories are user-specific
    // const storiesQuery = query(collection(db, STORIES_COLLECTION), where("authorId", "==", adminUserId), orderBy("title"));
    // For now, fetch all stories as admin might manage all content
    const storiesQuery = query(collection(db, STORIES_COLLECTION), orderBy("title"));
    const querySnapshot = await getDocs(storiesQuery);
    const stories: Story[] = [];

    for (const docSnap of querySnapshot.docs) {
        const storyData = docSnap.data() as Omit<Story, 'id' | 'chapters'>;

        // Fetch chapters for each story
        const chaptersQuery = query(collection(db, STORIES_COLLECTION, docSnap.id, CHAPTERS_COLLECTION), orderBy("order", "asc")); // Assuming an 'order' field for chapters
        const chaptersSnapshot = await getDocs(chaptersQuery);
        const chapters: Chapter[] = chaptersSnapshot.docs.map(chDoc => ({
            id: chDoc.id,
            ...(chDoc.data() as Omit<Chapter, 'id'>)
        }));

         // Convert Timestamps if they exist
         const lastUpdated = storyData.lastUpdated instanceof Timestamp
             ? storyData.lastUpdated.toDate().toISOString()
             : storyData.lastUpdated || new Date().toISOString(); // Provide a fallback


        stories.push({
            id: docSnap.id,
            ...storyData,
            chapters: chapters,
            lastUpdated: lastUpdated, // Ensure it's a string or Date
        });
    }
    return stories;
  } catch (error) {
    console.error("Error fetching admin stories: ", error);
    throw new Error("Failed to fetch stories."); // Re-throw for handling in component
  }
};

/**
 * Saves (creates or updates) a story document in Firestore.
 * @param storyId - The ID of the story to update, or null/undefined to create a new one.
 * @param data - The story data to save.
 * @returns The ID of the saved story.
 */
export const saveStory = async (storyId: string | null | undefined, data: Omit<Story, 'id' | 'chapters' | 'reads' | 'lastUpdated'> & { authorId: string }): Promise<string> => {
  try {
    const storyDataWithTimestamp = {
        ...data,
        lastUpdated: serverTimestamp(), // Use server timestamp for updates
    };

    if (storyId) {
      // Update existing story
      const storyRef = doc(db, STORIES_COLLECTION, storyId);
      await setDoc(storyRef, storyDataWithTimestamp, { merge: true }); // Merge to avoid overwriting chapters subcollection if stored differently
      return storyId;
    } else {
      // Create new story
      const docRef = await addDoc(collection(db, STORIES_COLLECTION), storyDataWithTimestamp);
      return docRef.id;
    }
  } catch (error) {
    console.error("Error saving story: ", error);
    throw new Error("Failed to save story.");
  }
};

/**
 * Saves (creates or updates) a chapter document within a story's subcollection.
 * @param storyId - The ID of the parent story.
 * @param chapterId - The ID of the chapter to update, or null/undefined to create a new one.
 * @param data - The chapter data to save.
 * @returns The ID of the saved chapter.
 */
export const saveChapter = async (storyId: string, chapterId: string | null | undefined, data: Omit<Chapter, 'id'>): Promise<string> => {
   if (!storyId) throw new Error("Story ID is required to save a chapter.");
  try {
    // Determine chapter order (simple approach: count existing chapters)
    // A more robust approach might involve a dedicated 'order' field updated via transaction
    const chaptersColRef = collection(db, STORIES_COLLECTION, storyId, CHAPTERS_COLLECTION);
    let order = data.order; // Use existing order if provided
    if (order === undefined && !chapterId) { // Only calculate for new chapters if order not set
        const chaptersSnapshot = await getDocs(query(chaptersColRef));
        order = chaptersSnapshot.size + 1;
    }

     const chapterDataWithOrder = {
         ...data,
         order: order, // Ensure order is set
         lastUpdated: serverTimestamp(), // Add timestamp
     };


    if (chapterId) {
      // Update existing chapter
      const chapterRef = doc(db, STORIES_COLLECTION, storyId, CHAPTERS_COLLECTION, chapterId);
      await setDoc(chapterRef, chapterDataWithOrder, { merge: true });
      return chapterId;
    } else {
      // Create new chapter
      const docRef = await addDoc(chaptersColRef, chapterDataWithOrder);
      return docRef.id;
    }
  } catch (error) {
    console.error("Error saving chapter: ", error);
    throw new Error("Failed to save chapter.");
  }
};


/**
 * Deletes a story and all its chapters from Firestore using a batch write.
 * @param storyId - The ID of the story to delete.
 */
export const deleteStory = async (storyId: string): Promise<void> => {
  if (!storyId) throw new Error("Story ID is required for deletion.");
  console.log(`Attempting to delete story: ${storyId}`);

  const storyRef = doc(db, STORIES_COLLECTION, storyId);
  const chaptersColRef = collection(db, STORIES_COLLECTION, storyId, CHAPTERS_COLLECTION);

  try {
    const batch = writeBatch(db);

    // Delete all chapters first
    const chaptersSnapshot = await getDocs(chaptersColRef);
    if (!chaptersSnapshot.empty) {
        console.log(`Found ${chaptersSnapshot.size} chapters to delete for story ${storyId}`);
        chaptersSnapshot.forEach(doc => {
            console.log(`Adding chapter ${doc.id} to delete batch.`);
            batch.delete(doc.ref);
        });
    } else {
        console.log(`No chapters found for story ${storyId}.`);
    }


    // Delete the story document
    console.log(`Adding story document ${storyId} to delete batch.`);
    batch.delete(storyRef);

    // Commit the batch
    await batch.commit();
    console.log(`Successfully deleted story ${storyId} and its chapters.`);
  } catch (error) {
    console.error(`Error deleting story ${storyId}:`, error);
    throw new Error("Failed to delete story and its chapters.");
  }
};


/**
 * Deletes a specific chapter from Firestore.
 * @param storyId - The ID of the parent story.
 * @param chapterId - The ID of the chapter to delete.
 */
export const deleteChapter = async (storyId: string, chapterId: string): Promise<void> => {
  if (!storyId || !chapterId) throw new Error("Story ID and Chapter ID are required for deletion.");

  const chapterRef = doc(db, STORIES_COLLECTION, storyId, CHAPTERS_COLLECTION, chapterId);
  try {
    await deleteDoc(chapterRef);
  } catch (error) {
    console.error(`Error deleting chapter ${chapterId} from story ${storyId}:`, error);
    throw new Error("Failed to delete chapter.");
  }
};

// Add functions for fetching/updating user data, site settings etc. as needed
// e.g., fetchUsers, updateUserRole, fetchSettings, updateSettings
