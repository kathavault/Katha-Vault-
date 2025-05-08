// src/lib/storyService.ts
import { db, auth } from './firebase';
import {
    collection,
    query,
    where,
    getDocs,
    doc,
    getDoc,
    addDoc,
    setDoc,
    deleteDoc,
    serverTimestamp,
    orderBy,
    limit,
    Timestamp,
    updateDoc,
    increment,
    collectionGroup, // Import collectionGroup for potential future use (e.g., finding all chapters)
    runTransaction // Import transaction for atomic updates
} from 'firebase/firestore';
import type { Story, Chapter, StoryCommentData, UserProfile, Author, ChapterSummary, StoryDetailsResult, SubmitStoryCommentParams, SubmitStoryRatingParams } from '@/types'; // Consolidated type imports


/**
 * Fetches basic data (including slugs) for all stories.
 * Used primarily for generateStaticParams if static export is enabled.
 * NOTE: This function might be problematic if there are many stories or if slugs change frequently.
 * Consider disabling static export for this route if issues arise.
 */
export const getStories = async (): Promise<Pick<Story, 'id' | 'slug'>[]> => {
    const storiesRef = collection(db, "stories");
    // Consider filtering by status === 'Published' if needed for static generation
    const q = query(storiesRef, where("status", "==", "Published"), limit(500)); // Example: fetch only published and limit results
    try {
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
            console.log("No published stories found for generateStaticParams.");
            return [];
        }
        const stories = querySnapshot.docs
            .map(doc => ({
                id: doc.id,
                slug: doc.data().slug // Ensure slug field exists
            }))
            .filter(story => story.slug && typeof story.slug === 'string'); // Ensure slug exists and is a string

        if (stories.length === 0) {
             console.warn("No stories with valid slugs found for generateStaticParams.");
        }
        return stories;
    } catch (error) {
        console.error("Error fetching stories for generateStaticParams:", error);
        // Return empty array on error during build to avoid breaking static generation entirely
        // Or re-throw if you want the build to fail
        // throw error; // Uncomment to fail the build on error
        return [];
    }
};


/**
 * Fetches detailed information for a specific story by its slug.
 */
export const fetchStoryDetails = async (slug: string, userId?: string | null): Promise<StoryDetailsResult | null> => {
    if (!slug) {
        console.error("fetchStoryDetails called with empty or null slug.");
        return null;
    }
    console.log(`Fetching story details for slug: ${slug}, userId: ${userId}`);

    let storyId = '';
    try {
        // 1. Find the story by slug
        const storiesRef = collection(db, "stories");
        const storyQuery = query(storiesRef, where("slug", "==", slug), limit(1));
        const storySnapshot = await getDocs(storyQuery);

        if (storySnapshot.empty) {
            console.warn(`Story with slug "${slug}" not found.`);
            return null; // Story not found
        }
        const storyDoc = storySnapshot.docs[0];
        const storyData = storyDoc.data();
        storyId = storyDoc.id; // Assign storyId here
        console.log(`Found story with ID: ${storyId}`);

        // Validate essential story data
        if (!storyData || !storyData.authorId || !storyData.authorName) {
            console.error(`Incomplete story data found for story ID: ${storyId}. Missing authorId or authorName.`);
            // Even if data is incomplete, we might still want to show *something*
            // For now, let's return null, but consider showing partial data later.
            return null;
        }


        // 2. Fetch Author Details (with robust fallback)
        let author: Author = { // Default fallback
            id: storyData.authorId,
            name: storyData.authorName, // Use denormalized name first
            avatarUrl: storyData.authorAvatarUrl,
        };
        try {
            const authorRef = doc(db, "users", storyData.authorId);
            const authorSnap = await getDoc(authorRef);
            if (authorSnap.exists()) {
                const authorData = authorSnap.data() as UserProfile;
                 // Overwrite with Firestore data if available, keeping existing if Firestore is missing fields
                 author = {
                    id: authorData.id || storyData.authorId,
                    name: authorData.name || author.name, // Prioritize Firestore name
                    avatarUrl: authorData.avatarUrl || author.avatarUrl, // Prioritize Firestore avatar
                 };
            } else {
                 console.warn(`Author profile not found for ID: ${storyData.authorId}. Using denormalized data from story.`);
            }
        } catch (authorError) {
             console.error(`Error fetching author details for ID ${storyData.authorId}:`, authorError);
             // Fallback to denormalized data is already handled by initial `author` declaration
        }


        // 3. Fetch chapters summary
        let chaptersData: ChapterSummary[] = [];
        try {
            const chaptersRef = collection(db, "stories", storyId, "chapters");
            const chaptersQuery = query(chaptersRef, orderBy("order", "asc"));
            const chaptersSnapshot = await getDocs(chaptersQuery);
            chaptersData = chaptersSnapshot.docs.map(docSnap => {
                const chData = docSnap.data();
                 const chLastUpdated = chData.lastUpdated;
                 let chLastUpdatedISO: string | undefined = undefined;
                 if (chLastUpdated instanceof Timestamp) {
                     chLastUpdatedISO = chLastUpdated.toDate().toISOString();
                 } else if (typeof chLastUpdated === 'string') {
                      try { chLastUpdatedISO = new Date(chLastUpdated).toISOString(); } catch { /* ignore invalid date */ }
                 }
                 return {
                    id: docSnap.id,
                    title: chData.title || `Chapter ${chData.order || 'N/A'}`,
                    order: chData.order || 0,
                    wordCount: chData.wordCount || 0,
                    lastUpdated: chLastUpdatedISO
                };
            }).sort((a, b) => a.order - b.order); // Ensure sorting
            console.log(`Found ${chaptersData.length} chapters for story ${storyId}`);
        } catch (chapterError) {
            console.error(`Error fetching chapters for story ${storyId}:`, chapterError);
            // Continue without chapters if fetch fails
        }


        // 4. Fetch comments for the story
        let comments: StoryCommentData[] = [];
        try {
            const commentsRef = collection(db, "stories", storyId, "comments");
            const commentsQuery = query(commentsRef, orderBy("timestamp", "desc"), limit(20)); // Limit for performance
            const commentsSnapshot = await getDocs(commentsQuery);
            comments = commentsSnapshot.docs.map(docSnap => {
                 const data = docSnap.data();
                 const timestamp = data.timestamp;
                  let commentDate: Date = new Date(); // Default to now if timestamp missing/invalid
                  if (timestamp instanceof Timestamp) {
                      commentDate = timestamp.toDate();
                  } else if (typeof timestamp === 'string') {
                       try { commentDate = new Date(timestamp); } catch { /* ignore */ }
                  }
                 return {
                     id: docSnap.id,
                     userId: data.userId || 'unknown',
                     userName: data.userName || 'Anonymous',
                     userAvatar: data.userAvatar,
                     text: data.text || '',
                     timestamp: commentDate,
                 };
            });
             console.log(`Found ${comments.length} comments for story ${storyId}`);
         } catch (commentError) {
              console.error(`Error fetching comments for story ${storyId}:`, commentError);
              // Continue without comments if fetch fails
         }


         // 5. Fetch user-specific data (rating, library status) if userId is provided
         let userRating = 0;
         let isInLibrary = false;
         if (userId) {
             try {
                const ratingRef = doc(db, "stories", storyId, "ratings", userId);
                const ratingSnap = await getDoc(ratingRef);
                if (ratingSnap.exists()) {
                    userRating = ratingSnap.data()?.rating || 0;
                }
             } catch (ratingError) {
                 console.error(`Error fetching story rating for user ${userId} on story ${storyId}:`, ratingError);
             }
             try {
                const libraryRef = doc(db, "users", userId, "library", storyId);
                const librarySnap = await getDoc(libraryRef);
                isInLibrary = librarySnap.exists();
             } catch (libraryError) {
                 console.error(`Error checking library status for user ${userId} on story ${storyId}:`, libraryError);
             }
         }
         console.log(`User specific data for story ${storyId} - rating: ${userRating}, isInLibrary: ${isInLibrary}`);


        // 6. Calculate average rating for the STORY
        let averageRating: number | undefined = undefined;
        const totalSum = storyData.totalRatingSum;
        const count = storyData.ratingCount;
        if (typeof totalSum === 'number' && typeof count === 'number' && count > 0) {
            averageRating = parseFloat((totalSum / count).toFixed(1));
        }

        // 7. Format lastUpdated timestamp
        const lastUpdatedTimestamp = storyData.lastUpdated;
        let lastUpdatedISO: string = new Date().toISOString(); // Sensible default
        if (lastUpdatedTimestamp instanceof Timestamp) {
             lastUpdatedISO = lastUpdatedTimestamp.toDate().toISOString();
        } else if (typeof lastUpdatedTimestamp === 'string') {
             try {
                const date = new Date(lastUpdatedTimestamp);
                if (!isNaN(date.getTime())) { // Check if date is valid
                    lastUpdatedISO = date.toISOString();
                } else {
                    console.warn(`Invalid date string for lastUpdated: ${lastUpdatedTimestamp}`);
                }
             } catch {
                 console.warn(`Could not parse date string for lastUpdated: ${lastUpdatedTimestamp}`);
             }
        } else if (lastUpdatedTimestamp instanceof Date) { // Handle if it's already a Date object
            lastUpdatedISO = lastUpdatedTimestamp.toISOString();
        } else {
            console.warn(`Unexpected type for lastUpdated: ${typeof lastUpdatedTimestamp}`);
        }


        // 8. Construct the result
        const result: StoryDetailsResult = {
            id: storyId,
            title: storyData.title || 'Untitled Story',
            description: storyData.description || 'No description available.',
            genre: storyData.genre || 'Uncategorized',
            tags: storyData.tags || [],
            status: storyData.status || 'Ongoing',
            authorId: storyData.authorId, // Already validated above
            authorName: author.name, // Use fetched/fallback author name
            coverImageUrl: storyData.coverImageUrl,
            reads: storyData.reads || 0,
            author: author, // Assign the Author object
            authorFollowers: storyData.authorFollowers || 0,
            chapters: chaptersData.length, // Count fetched chapters
            chaptersData: chaptersData,
            lastUpdated: lastUpdatedISO, // Use formatted string
            averageRating: averageRating,
            totalRatings: count || 0,
            comments: comments, // Use fetched comments (might be empty array)
            userRating: userRating,
            isInLibrary: isInLibrary,
            slug: storyData.slug || storyId, // Fallback to ID if slug missing
            dataAiHint: storyData.dataAiHint,
        };

        return result;

    } catch (error) {
        console.error(`CRITICAL: Error fetching story details for slug "${slug}" (Story ID potentially ${storyId || 'unknown'}):`, error);
        // Show toast for critical errors
        // This should ideally be handled by the caller, but adding a generic one here for now.
        // toast({ title: "Error Loading Story", description: "An unexpected error occurred.", variant: "destructive" });
        throw new Error(`Failed to fetch story details for slug: ${slug}`); // Re-throw to be caught by component
    }
};


export const submitStoryComment = async (params: SubmitStoryCommentParams): Promise<{ id: string }> => {
    const { storyId, userId, text } = params;
    if (!auth.currentUser || auth.currentUser.uid !== userId) {
        console.error("submitStoryComment failed: User not authenticated or UID mismatch.");
        throw new Error("User is not authenticated or UID mismatch.");
    }
    try {
        const commentsRef = collection(db, "stories", storyId, "comments");
        const newCommentRef = await addDoc(commentsRef, {
            userId: userId,
            text: text,
            timestamp: serverTimestamp(),
            userName: auth.currentUser.displayName || 'Anonymous',
            userAvatar: auth.currentUser.photoURL
        });

        // Update comment count on the story using a transaction for atomicity
         const storyRef = doc(db, "stories", storyId);
         await runTransaction(db, async (transaction) => {
              // It's safer to read the doc first inside the transaction if you need the current count
              // const storySnap = await transaction.get(storyRef);
              // if (!storySnap.exists()) throw "Document does not exist!";
             transaction.update(storyRef, { commentCount: increment(1) });
         });

        return { id: newCommentRef.id };
    } catch (error) {
        console.error("Error submitting story comment:", error);
        throw new Error("Failed to submit story comment.");
    }
};

export const submitStoryRating = async (params: SubmitStoryRatingParams): Promise<void> => {
    const { storyId, userId, rating } = params;
     if (!auth.currentUser || auth.currentUser.uid !== userId) {
        console.error("submitStoryRating failed: User not authenticated or UID mismatch.");
        throw new Error("User is not authenticated or UID mismatch.");
     }
     if (rating < 1 || rating > 5) {
         console.error(`submitStoryRating failed: Invalid rating value ${rating}.`);
         throw new Error("Rating must be between 1 and 5.");
     }

    const ratingRef = doc(db, "stories", storyId, "ratings", userId);
    const storyRef = doc(db, "stories", storyId);

    try {
        await runTransaction(db, async (transaction) => {
            const ratingSnap = await transaction.get(ratingRef);
            const storySnap = await transaction.get(storyRef);

            if (!storySnap.exists()) {
                throw new Error("Story does not exist!");
            }

            const previousRating = ratingSnap.exists() ? ratingSnap.data()?.rating || 0 : 0;
            const currentTotalSum = storySnap.data()?.totalRatingSum || 0;
            const currentRatingCount = storySnap.data()?.ratingCount || 0;

            const ratingDiff = rating - previousRating;
            // Increment count only if it's a new rating (previous was 0)
            const ratingCountChange = previousRating === 0 ? 1 : 0;

            // Update user's specific rating
            transaction.set(ratingRef, {
                rating: rating,
                timestamp: serverTimestamp(),
            });

            // Update aggregated rating on the story document
            transaction.update(storyRef, {
                totalRatingSum: currentTotalSum + ratingDiff,
                ratingCount: currentRatingCount + ratingCountChange
            });
        });

    } catch (error) {
        console.error("Error submitting story rating:", error);
        throw new Error("Failed to submit story rating.");
    }
};

export const toggleLibraryStatus = async (userId: string, storyId: string, addToLibrary: boolean): Promise<void> => {
    if (!auth.currentUser || auth.currentUser.uid !== userId) {
        console.error("toggleLibraryStatus failed: User not authenticated or UID mismatch.");
        throw new Error("User is not authenticated or UID mismatch.");
    }
    const libraryDocRef = doc(db, "users", userId, "library", storyId);
    try {
        if (addToLibrary) {
            // Fetch minimal story info to store in library for quick access
            const storyRef = doc(db, "stories", storyId);
            const storySnap = await getDoc(storyRef);
            let storyInfo: Partial<Story> = {}; // Use Partial<Story> for flexibility
            if (storySnap.exists()) {
                const data = storySnap.data();
                storyInfo = {
                    title: data?.title || 'Untitled', // Add safe access
                    coverImageUrl: data?.coverImageUrl,
                    authorName: data?.authorName || 'Unknown',
                    slug: data?.slug || storyId // Add safe access
                };
            } else {
                console.warn(`Story ${storyId} not found when adding to library for user ${userId}.`);
                // Decide if you still want to add a reference even if story details are missing
                storyInfo = { title: 'Story not found' };
            }
            await setDoc(libraryDocRef, {
                ...storyInfo, // Store denormalized story data
                addedAt: serverTimestamp(),
            });
        } else {
            await deleteDoc(libraryDocRef);
        }
    } catch (error) {
        console.error(`Error ${addToLibrary ? 'adding to' : 'removing from'} library:`, error);
        throw new Error("Failed to update library status.");
    }
};

// Helper function to safely get data - useful if structure varies
function safeGetData<T>(docSnap: FirebaseFirestore.DocumentSnapshot<FirebaseFirestore.DocumentData>): T | null {
    if (!docSnap.exists()) {
        return null;
    }
    try {
        return docSnap.data() as T;
    } catch (e) {
        console.error("Error casting document data:", e);
        return null;
    }
}

