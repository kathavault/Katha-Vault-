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
    increment
} from 'firebase/firestore';
import type { Story, Chapter } from '@/types'; // Assuming types are defined

// Define types used in this service
interface Author {
    name: string;
    id: string;
    avatarUrl?: string;
<<<<<<< HEAD
    // followers?: number; // Example if you fetch this
=======
>>>>>>> eeac1358d3ae1f112a5aa4ef27eebeb43ae4c6bf
}

interface StoryCommentData {
    id: string;
    userId: string;
    userName: string;
    userAvatar?: string | null;
    text: string;
    timestamp: Date;
}

<<<<<<< HEAD
interface ChapterSummary {
    id: string;
    title: string;
    order: number;
    wordCount?: number;
    lastUpdated?: string; // ISO string
}

// This should match the one in the page component
interface StoryDetailsResult extends Omit<BaseStory, 'author' | 'chapters' | 'lastUpdated' | 'status'> {
    id: string;
    author: Author;
    chaptersData: ChapterSummary[];
    authorFollowers: number;
    status: 'Draft' | 'Published' | 'Archived' | 'Ongoing' | 'Completed';
    lastUpdated: string; // ISO string for consistency
    averageRating?: number;
    totalRatings?: number;
    chapters: number; // Explicit chapters count
    comments?: StoryCommentData[];
    userRating?: number;
    isInLibrary?: boolean;
    // Ensure all fields from src/types Story are here or correctly mapped
}


=======
interface StoryDetailsResult extends Omit&lt;Story, 'author' | 'chapters' | 'lastUpdated'&gt; {
    author: Author; // Use the Author interface
    chaptersData: { id: string; title: string; order: number }[];
    authorFollowers: number; // Example additional data
    status: 'Ongoing' | 'Completed'; // Use specific status type
    lastUpdated: string; // Keep as string for consistency
    averageRating?: number;
    totalRatings?: number;
    comments?: StoryCommentData[];
    userRating?: number; // User's overall rating for this story
    isInLibrary?: boolean;
}

>>>>>>> eeac1358d3ae1f112a5aa4ef27eebeb43ae4c6bf
interface SubmitStoryCommentParams {
    storyId: string;
    userId: string;
    text: string;
}

interface SubmitStoryRatingParams {
    storyId: string;
    userId: string;
    rating: number;
}

/**
 * Fetches detailed information for a specific story by its slug.
 */
<<<<<<< HEAD
export const fetchStoryDetails = async (slug: string, userId?: string | null): Promise<StoryDetailsResult | null> => {
    try {
=======
export const fetchStoryDetails = async (slug: string, userId?: string | null): Promise&lt;StoryDetailsResult | null&gt; => {
    try {
        // 1. Find the story by slug
>>>>>>> eeac1358d3ae1f112a5aa4ef27eebeb43ae4c6bf
        const storiesRef = collection(db, "stories");
        const storyQuery = query(storiesRef, where("slug", "==", slug), limit(1));
        const storySnapshot = await getDocs(storyQuery);

        if (storySnapshot.empty) {
            console.warn(`Story with slug "${slug}" not found.`);
            return null;
        }
        const storyDoc = storySnapshot.docs[0];
        const storyData = storyDoc.data();
        const storyId = storyDoc.id;

<<<<<<< HEAD
        const chaptersRef = collection(db, "stories", storyId, "chapters");
        const chaptersQuery = query(chaptersRef, orderBy("order", "asc"));
        const chaptersSnapshot = await getDocs(chaptersQuery);
        const chaptersData: ChapterSummary[] = chaptersSnapshot.docs.map(docSnap => {
            const chData = docSnap.data();
            return {
                id: docSnap.id,
                title: chData.title || `Chapter ${chData.order}`,
                order: chData.order,
                wordCount: chData.wordCount || 0,
                lastUpdated: chData.lastUpdated instanceof Timestamp ? chData.lastUpdated.toDate().toISOString() : (chData.lastUpdated || new Date().toISOString())
            };
        });

        const commentsRef = collection(db, "stories", storyId, "comments");
=======
        // 2. Fetch chapters ordered by 'order' field
        const chaptersRef = collection(db, "stories", storyId, "chapters");
        const chaptersQuery = query(chaptersRef, orderBy("order", "asc"));
        const chaptersSnapshot = await getDocs(chaptersQuery);
        const chaptersData: { id: string; title: string; order: number }[] = chaptersSnapshot.docs.map(docSnap => ({
            id: docSnap.id,
            title: docSnap.data().title || `Chapter ${docSnap.data().order}`,
            order: docSnap.data().order,
        }));

        // 3. Fetch story-level comments (e.g., last 20)
        const commentsRef = collection(db, "stories", storyId, "comments"); // Assuming comments subcollection directly under story
>>>>>>> eeac1358d3ae1f112a5aa4ef27eebeb43ae4c6bf
        const commentsQuery = query(commentsRef, orderBy("timestamp", "desc"), limit(20));
        const commentsSnapshot = await getDocs(commentsQuery);
        const comments: StoryCommentData[] = commentsSnapshot.docs.map(docSnap => {
             const data = docSnap.data();
             return {
                 id: docSnap.id,
                 userId: data.userId,
                 userName: data.userName || 'Anonymous',
                 userAvatar: data.userAvatar,
                 text: data.text,
<<<<<<< HEAD
                 timestamp: (data.timestamp instanceof Timestamp)?.toDate() || new Date(),
             };
        });

         let userRating = 0;
         if (userId) {
             const ratingRef = doc(db, "stories", storyId, "ratings", userId);
=======
                 timestamp: (data.timestamp as Timestamp)?.toDate() || new Date(),
             };
        });

         // 4. Fetch user's overall rating for this story (if userId provided)
         let userRating = 0;
         if (userId) {
             const ratingRef = doc(db, "stories", storyId, "ratings", userId); // Assuming ratings subcollection under story
>>>>>>> eeac1358d3ae1f112a5aa4ef27eebeb43ae4c6bf
             const ratingSnap = await getDoc(ratingRef);
             if (ratingSnap.exists()) {
                 userRating = ratingSnap.data().rating || 0;
             }
         }

<<<<<<< HEAD
          let isInLibrary = false;
          if (userId) {
              const libraryRef = doc(db, "users", userId, "library", storyId);
=======
          // 5. Check if story is in user's library (if userId provided)
          let isInLibrary = false;
          if (userId) {
              const libraryRef = doc(db, "users", userId, "library", storyId); // Path to story in user's library
>>>>>>> eeac1358d3ae1f112a5aa4ef27eebeb43ae4c6bf
              const librarySnap = await getDoc(libraryRef);
              isInLibrary = librarySnap.exists();
          }

<<<<<<< HEAD
          const author: Author = {
              id: storyData.authorId,
              name: storyData.authorName || 'Unknown Author',
              avatarUrl: storyData.authorAvatarUrl, // Assuming authorAvatarUrl is stored on story or fetched separately
          };

           let averageRating: number | undefined = undefined;
           const totalSum = storyData.totalRatingSum; // Field for sum of all ratings for the story
           const count = storyData.ratingCount;     // Field for total number of ratings for the story
           if (typeof totalSum === 'number' && typeof count === 'number' && count > 0) {
               averageRating = parseFloat((totalSum / count).toFixed(1));
           }


=======
          // 6. Fetch author details (simple example, might need separate fetch)
          const author: Author = {
              id: storyData.authorId,
              name: storyData.authorName || 'Unknown Author',
              // avatarUrl: fetchedAuthorAvatarUrl // Ideally fetch this
          };

        // 7. Construct the result
>>>>>>> eeac1358d3ae1f112a5aa4ef27eebeb43ae4c6bf
        const result: StoryDetailsResult = {
            id: storyId,
            title: storyData.title,
            description: storyData.description,
            genre: storyData.genre,
            tags: storyData.tags || [],
<<<<<<< HEAD
            status: storyData.status || 'Ongoing',
=======
            status: storyData.status || 'Ongoing', // Default status if not set
>>>>>>> eeac1358d3ae1f112a5aa4ef27eebeb43ae4c6bf
            authorId: storyData.authorId,
            authorName: storyData.authorName,
            coverImageUrl: storyData.coverImageUrl,
            reads: storyData.reads || 0,
<<<<<<< HEAD
            author: author,
            authorFollowers: storyData.authorFollowers || 0, // Placeholder, might need separate fetch for author profile
            chapters: chaptersData.length,
            chaptersData: chaptersData,
            lastUpdated: (storyData.lastUpdated instanceof Timestamp ? storyData.lastUpdated.toDate() : new Date(storyData.lastUpdated || Date.now())).toISOString(),
            averageRating: averageRating,
            totalRatings: count || 0,
            comments: comments,
            userRating: userRating,
            isInLibrary: isInLibrary,
            slug: storyData.slug,
            dataAiHint: storyData.dataAiHint,
=======
            // Calculated/fetched fields
            author: author, // Include fetched author details
            authorFollowers: storyData.authorFollowers || 0, // Placeholder
            chapters: chaptersData.length, // Store chapter count derived from fetched chapters
            chaptersData: chaptersData, // Include chapter list
            lastUpdated: (storyData.lastUpdated instanceof Timestamp ? storyData.lastUpdated.toDate() : new Date()).toISOString(),
            averageRating: storyData.averageRating || undefined, // Fetch or calculate
            totalRatings: storyData.ratingCount || 0, // Fetch or calculate
            comments: comments,
            userRating: userRating,
            isInLibrary: isInLibrary,
            slug: storyData.slug, // Include slug
            dataAiHint: storyData.dataAiHint, // Include AI hint
>>>>>>> eeac1358d3ae1f112a5aa4ef27eebeb43ae4c6bf
        };

        return result;

    } catch (error) {
        console.error("Error fetching story details:", error);
        throw new Error("Failed to fetch story details.");
    }
};


<<<<<<< HEAD
export const submitStoryComment = async (params: SubmitStoryCommentParams): Promise<{ id: string }> => {
    const { storyId, userId, text } = params;
    if (!auth.currentUser || auth.currentUser.uid !== userId) {
        throw new Error("User is not authenticated or UID mismatch.");
    }
    try {
        const commentsRef = collection(db, "stories", storyId, "comments");
=======
/**
 * Submits a comment for a specific story.
 */
export const submitStoryComment = async (params: SubmitStoryCommentParams): Promise&lt;{ id: string }&gt; => {
    const { storyId, userId, text } = params;

    if (!auth.currentUser || auth.currentUser.uid !== userId) {
        throw new Error("User is not authenticated or UID mismatch.");
    }

    try {
        const commentsRef = collection(db, "stories", storyId, "comments"); // Story-level comments
>>>>>>> eeac1358d3ae1f112a5aa4ef27eebeb43ae4c6bf
        const newCommentRef = await addDoc(commentsRef, {
            userId: userId,
            text: text,
            timestamp: serverTimestamp(),
            userName: auth.currentUser.displayName || 'Anonymous',
            userAvatar: auth.currentUser.photoURL
        });
<<<<<<< HEAD
        // await updateDoc(doc(db, "stories", storyId), { commentCount: increment(1) });
=======
        // Optionally update comment count on the story document
        // await updateDoc(doc(db, "stories", storyId), { commentCount: increment(1) });

>>>>>>> eeac1358d3ae1f112a5aa4ef27eebeb43ae4c6bf
        return { id: newCommentRef.id };
    } catch (error) {
        console.error("Error submitting story comment:", error);
        throw new Error("Failed to submit story comment.");
    }
};

<<<<<<< HEAD
export const submitStoryRating = async (params: SubmitStoryRatingParams): Promise<void> => {
    const { storyId, userId, rating } = params;
     if (!auth.currentUser || auth.currentUser.uid !== userId) {
        throw new Error("User is not authenticated or UID mismatch.");
     }
     if (rating < 1 || rating > 5) {
         throw new Error("Rating must be between 1 and 5.");
     }
    try {
        const ratingRef = doc(db, "stories", storyId, "ratings", userId);
=======
/**
 * Submits or updates an overall rating for a specific story.
 */
export const submitStoryRating = async (params: SubmitStoryRatingParams): Promise&lt;void&gt; => {
    const { storyId, userId, rating } = params;

     if (!auth.currentUser || auth.currentUser.uid !== userId) {
        throw new Error("User is not authenticated or UID mismatch.");
     }
     if (rating &lt; 1 || rating &gt; 5) {
         throw new Error("Rating must be between 1 and 5.");
     }

    try {
        const ratingRef = doc(db, "stories", storyId, "ratings", userId); // User's rating for the story
>>>>>>> eeac1358d3ae1f112a5aa4ef27eebeb43ae4c6bf
        const ratingSnap = await getDoc(ratingRef);
        const previousRating = ratingSnap.exists() ? ratingSnap.data().rating : 0;

        await setDoc(ratingRef, {
            rating: rating,
            timestamp: serverTimestamp(),
        });

<<<<<<< HEAD
=======
        // Update aggregated rating on the main story document
>>>>>>> eeac1358d3ae1f112a5aa4ef27eebeb43ae4c6bf
        const storyRef = doc(db, "stories", storyId);
        const ratingDiff = rating - previousRating;
        const ratingCountChange = previousRating === 0 ? 1 : 0;

<<<<<<< HEAD
        // This should ideally be done in a transaction or Cloud Function for better scalability
        // For client-side, this is an optimistic update.
        // Firestore transactions or Cloud Functions are recommended for atomicity.
        const storyDocSnap = await getDoc(storyRef);
        if (storyDocSnap.exists()) {
            const currentTotalSum = storyDocSnap.data().totalRatingSum || 0;
            const currentRatingCount = storyDocSnap.data().ratingCount || 0;
            await updateDoc(storyRef, {
                totalRatingSum: currentTotalSum + ratingDiff,
                ratingCount: currentRatingCount + ratingCountChange
            });
        } else {
            // Initialize if not present - though less likely for an existing story
             await setDoc(storyRef, {
                 totalRatingSum: rating,
                 ratingCount: 1
             }, { merge: true });
        }
=======
        // This should ideally be done in a transaction or Cloud Function
        // to avoid race conditions and ensure accuracy
        await updateDoc(storyRef, {
            totalRatingSum: increment(ratingDiff),
            ratingCount: increment(ratingCountChange)
            // You'd calculate averageRating = totalRatingSum / ratingCount on read
        });
>>>>>>> eeac1358d3ae1f112a5aa4ef27eebeb43ae4c6bf

    } catch (error) {
        console.error("Error submitting story rating:", error);
        throw new Error("Failed to submit story rating.");
    }
};

<<<<<<< HEAD
export const toggleLibraryStatus = async (userId: string, storyId: string, addToLibrary: boolean): Promise<void> => {
    if (!auth.currentUser || auth.currentUser.uid !== userId) {
        throw new Error("User is not authenticated or UID mismatch.");
    }
    const libraryDocRef = doc(db, "users", userId, "library", storyId);
    try {
        if (addToLibrary) {
            // Fetch minimal story info to store in library for quick access
            const storyRef = doc(db, "stories", storyId);
            const storySnap = await getDoc(storyRef);
            let storyInfo = {};
            if (storySnap.exists()) {
                const data = storySnap.data();
                storyInfo = {
                    title: data.title,
                    coverImageUrl: data.coverImageUrl,
                    authorName: data.authorName,
                    slug: data.slug
                };
            }
            await setDoc(libraryDocRef, {
                ...storyInfo, // Store some denormalized story data
                addedAt: serverTimestamp(),
            });
        } else {
=======
/**
 * Adds or removes a story from the user's library.
 */
export const toggleLibraryStatus = async (userId: string, storyId: string, addToLibrary: boolean): Promise&lt;void&gt; => {
    if (!auth.currentUser || auth.currentUser.uid !== userId) {
        throw new Error("User is not authenticated or UID mismatch.");
    }

    const libraryDocRef = doc(db, "users", userId, "library", storyId);

    try {
        if (addToLibrary) {
            // Add story reference to the user's library subcollection
            await setDoc(libraryDocRef, {
                addedAt: serverTimestamp(),
                // Optionally store minimal story info like title/cover for faster loading in library view
                // storyTitle: fetchedStoryTitle,
                // storyCoverUrl: fetchedStoryCoverUrl
            });
        } else {
            // Remove story reference from the library
>>>>>>> eeac1358d3ae1f112a5aa4ef27eebeb43ae4c6bf
            await deleteDoc(libraryDocRef);
        }
    } catch (error) {
        console.error(`Error ${addToLibrary ? 'adding to' : 'removing from'} library:`, error);
        throw new Error("Failed to update library status.");
    }
};
