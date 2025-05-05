// src/lib/readerService.ts
import { db, auth } from './firebase';
import {
    collection,
    query,
    where,
    getDocs,
    doc,
    getDoc,
    addDoc,
    serverTimestamp,
    orderBy,
    limit,
    setDoc,
    Timestamp,
    updateDoc,
    increment
} from 'firebase/firestore';
import type { Chapter } from '@/types';

// Define types for service functions
interface ChapterDetailsParams {
    slug: string;
    chapterNumber: number;
    userId?: string | null; // Optional user ID to check for existing ratings/comments
}

interface SubmitCommentParams {
    storyId: string;
    chapterId: string;
    userId: string;
    text: string;
}

interface SubmitRatingParams {
    storyId: string;
    chapterId: string;
    userId: string;
    rating: number; // Should be 1-5
}

interface CommentData {
    id: string;
    userId: string;
    userName: string;
    userAvatar?: string | null;
    text: string;
    timestamp: Date;
}

interface ChapterDetailsResult {
    title: string;
    content: string;
    storyTitle: string;
    storyAuthor: string;
    totalChapters: number;
    storyId: string;
    chapterId: string;
    comments?: CommentData[];
    userRating?: number; // User's rating for this specific chapter
}

/**
 * Fetches detailed information for a specific chapter, including comments.
 */
export const fetchChapterDetails = async (slug: string, chapterNumber: number, userId?: string | null): Promise&lt;ChapterDetailsResult | null&gt; => {
    try {
        // 1. Find the story by slug
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

        // 2. Find the specific chapter by order/number within the story's subcollection
        const chaptersRef = collection(db, "stories", storyId, "chapters");
        const chapterQuery = query(chaptersRef, where("order", "==", chapterNumber), limit(1));
        const chapterSnapshot = await getDocs(chapterQuery);

        if (chapterSnapshot.empty) {
            console.warn(`Chapter number ${chapterNumber} for story "${slug}" not found.`);
            return null;
        }
        const chapterDoc = chapterSnapshot.docs[0];
        const chapterData = chapterDoc.data() as Omit&lt;Chapter, 'id'&gt;;
        const chapterId = chapterDoc.id;

        // 3. Fetch comments for this chapter (e.g., last 20)
        const commentsRef = collection(db, "stories", storyId, "chapters", chapterId, "comments");
        const commentsQuery = query(commentsRef, orderBy("timestamp", "desc"), limit(20));
        const commentsSnapshot = await getDocs(commentsQuery);
        const comments: CommentData[] = commentsSnapshot.docs.map(docSnap => {
             const data = docSnap.data();
             return {
                 id: docSnap.id,
                 userId: data.userId,
                 userName: data.userName, // Fetch user name (ideally stored with comment or fetched separately)
                 userAvatar: data.userAvatar, // Fetch avatar URL
                 text: data.text,
                 timestamp: (data.timestamp as Timestamp)?.toDate() || new Date(), // Convert Firestore Timestamp
             };
        });

        // 4. Fetch user's rating for this chapter (if userId provided)
        let userRating = 0;
        if (userId) {
            const ratingRef = doc(db, "stories", storyId, "chapters", chapterId, "ratings", userId);
            const ratingSnap = await getDoc(ratingRef);
            if (ratingSnap.exists()) {
                userRating = ratingSnap.data().rating || 0;
            }
        }

        // 5. Construct the result
        const result: ChapterDetailsResult = {
            title: chapterData.title,
            content: chapterData.content,
            storyTitle: storyData.title,
            storyAuthor: storyData.authorName, // Assuming authorName is stored
            totalChapters: storyData.chapters || 0, // Assuming chapter count is stored or calculate if needed
            storyId: storyId,
            chapterId: chapterId,
            comments: comments,
            userRating: userRating,
        };

        return result;

    } catch (error) {
        console.error("Error fetching chapter details:", error);
        throw new Error("Failed to fetch chapter details.");
    }
};


/**
 * Submits a comment for a specific chapter.
 */
export const submitComment = async (params: SubmitCommentParams): Promise&lt;{ id: string }&gt; => {
    const { storyId, chapterId, userId, text } = params;

    if (!auth.currentUser || auth.currentUser.uid !== userId) {
        throw new Error("User is not authenticated or UID mismatch.");
    }

    try {
        const commentsRef = collection(db, "stories", storyId, "chapters", chapterId, "comments");
        const newCommentRef = await addDoc(commentsRef, {
            userId: userId,
            text: text,
            timestamp: serverTimestamp(), // Use server timestamp
            // Store denormalized user info for easier display (optional but recommended)
            userName: auth.currentUser.displayName || 'Anonymous',
            userAvatar: auth.currentUser.photoURL
        });
         // Optionally, update a comment count on the chapter/story document (use transactions for accuracy)

        return { id: newCommentRef.id };
    } catch (error) {
        console.error("Error submitting comment:", error);
        throw new Error("Failed to submit comment.");
    }
};

/**
 * Submits or updates a rating for a specific chapter.
 */
export const submitRating = async (params: SubmitRatingParams): Promise&lt;void&gt; => {
    const { storyId, chapterId, userId, rating } = params;

     if (!auth.currentUser || auth.currentUser.uid !== userId) {
        throw new Error("User is not authenticated or UID mismatch.");
     }
     if (rating &lt; 1 || rating &gt; 5) {
         throw new Error("Rating must be between 1 and 5.");
     }

    try {
        const ratingRef = doc(db, "stories", storyId, "chapters", chapterId, "ratings", userId);
        // Check if rating already exists to calculate diff for average later
        const ratingSnap = await getDoc(ratingRef);
        const previousRating = ratingSnap.exists() ? ratingSnap.data().rating : 0;

        // Set/update the user's specific rating
        await setDoc(ratingRef, {
            rating: rating,
            timestamp: serverTimestamp(),
        });

        // Update aggregated rating on the chapter document (requires a transaction for accuracy)
        // This part is complex and might involve Cloud Functions for better scalability
        // Simple (less accurate) update example:
        const chapterRef = doc(db, "stories", storyId, "chapters", chapterId);
        const ratingDiff = rating - previousRating;
        const ratingCountChange = previousRating === 0 ? 1 : 0; // Increment count only if it's a new rating

        await updateDoc(chapterRef, {
            totalRatingSum: increment(ratingDiff), // Field to store sum of all ratings
            ratingCount: increment(ratingCountChange) // Field to store number of ratings
            // Average can be calculated on read: totalRatingSum / ratingCount
        });


    } catch (error) {
        console.error("Error submitting rating:", error);
        throw new Error("Failed to submit rating.");
    }
};
