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
}

interface StoryCommentData {
    id: string;
    userId: string;
    userName: string;
    userAvatar?: string | null;
    text: string;
    timestamp: Date;
}

interface ChapterSummary {
    id: string;
    title: string;
    order: number;
    wordCount?: number;
    lastUpdated?: string; // ISO string
}

// This should match the one in the page component
interface StoryDetailsResult {
    id: string;
    title: string;
    description: string;
    genre: string;
    tags: string[];
    status: 'Draft' | 'Published' | 'Archived' | 'Ongoing' | 'Completed'; // Added Ongoing/Completed
    authorId: string;
    authorName: string; // Ensure this is fetched
    coverImageUrl?: string;
    reads?: number;
    author: Author;
    authorFollowers: number;
    chapters: number; // Explicit chapters count
    chaptersData: ChapterSummary[];
    lastUpdated: string; // ISO string for consistency
    averageRating?: number;
    totalRatings?: number;
    comments?: StoryCommentData[];
    userRating?: number;
    isInLibrary?: boolean;
    slug: string;
    dataAiHint?: string;
    // Ensure all fields from src/types Story are here or correctly mapped
}



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
export const fetchStoryDetails = async (slug: string, userId?: string | null): Promise<StoryDetailsResult | null> => {
    try {
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
                 timestamp: (data.timestamp instanceof Timestamp)?.toDate() || new Date(),
             };
        });

         let userRating = 0;
         if (userId) {
             const ratingRef = doc(db, "stories", storyId, "ratings", userId);
             const ratingSnap = await getDoc(ratingRef);
             if (ratingSnap.exists()) {
                 userRating = ratingSnap.data().rating || 0;
             }
         }

          let isInLibrary = false;
          if (userId) {
              const libraryRef = doc(db, "users", userId, "library", storyId);
              const librarySnap = await getDoc(libraryRef);
              isInLibrary = librarySnap.exists();
          }

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



        const result: StoryDetailsResult = {
            id: storyId,
            title: storyData.title,
            description: storyData.description,
            genre: storyData.genre,
            tags: storyData.tags || [],
            status: storyData.status || 'Ongoing',
            authorId: storyData.authorId,
            authorName: storyData.authorName,
            coverImageUrl: storyData.coverImageUrl,
            reads: storyData.reads || 0,
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
        };

        return result;

    } catch (error) {
        console.error("Error fetching story details:", error);
        throw new Error("Failed to fetch story details.");
    }
};


export const submitStoryComment = async (params: SubmitStoryCommentParams): Promise<{ id: string }> => {
    const { storyId, userId, text } = params;
    if (!auth.currentUser || auth.currentUser.uid !== userId) {
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
        // await updateDoc(doc(db, "stories", storyId), { commentCount: increment(1) });
        return { id: newCommentRef.id };
    } catch (error) {
        console.error("Error submitting story comment:", error);
        throw new Error("Failed to submit story comment.");
    }
};

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
        const ratingSnap = await getDoc(ratingRef);
        const previousRating = ratingSnap.exists() ? ratingSnap.data().rating : 0;

        await setDoc(ratingRef, {
            rating: rating,
            timestamp: serverTimestamp(),
        });

        const storyRef = doc(db, "stories", storyId);
        const ratingDiff = rating - previousRating;
        const ratingCountChange = previousRating === 0 ? 1 : 0;

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

    } catch (error) {
        console.error("Error submitting story rating:", error);
        throw new Error("Failed to submit story rating.");
    }
};

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
            await deleteDoc(libraryDocRef);
        }
    } catch (error) {
        console.error(`Error ${addToLibrary ? 'adding to' : 'removing from'} library:`, error);
        throw new Error("Failed to update library status.");
    }
};