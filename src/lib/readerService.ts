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
    increment,
    runTransaction // Added for atomic updates
} from 'firebase/firestore';
import type { Chapter, StoryCommentData, ChapterDetailsResult, SubmitCommentParams, SubmitRatingParams } from '@/types'; // Import necessary types

/**
 * Fetches detailed information for a specific chapter, including comments.
 */
export const fetchChapterDetails = async (slug: string, chapterNumber: number, userId?: string | null): Promise<ChapterDetailsResult | null> => {
    if (!slug || isNaN(chapterNumber) || chapterNumber < 1) {
        console.error(`fetchChapterDetails called with invalid parameters: slug=${slug}, chapterNumber=${chapterNumber}`);
        return null;
    }
    console.log(`Fetching chapter details for slug: ${slug}, chapter: ${chapterNumber}, userId: ${userId}`);

    let storyId = '';
    let chapterId = '';

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
        storyId = storyDoc.id;
         console.log(`Found story with ID: ${storyId}`);

        // 2. Find the specific chapter by order/number within the story's subcollection
        const chaptersRef = collection(db, "stories", storyId, "chapters");
        const chapterQuery = query(chaptersRef, where("order", "==", chapterNumber), limit(1));
        const chapterSnapshot = await getDocs(chapterQuery);

        if (chapterSnapshot.empty) {
            console.warn(`Chapter number ${chapterNumber} for story "${slug}" (ID: ${storyId}) not found.`);
            return null;
        }
        const chapterDoc = chapterSnapshot.docs[0];
        const chapterData = chapterDoc.data() as Omit<Chapter, 'id'>;
        chapterId = chapterDoc.id; // Assign chapterId
         console.log(`Found chapter with ID: ${chapterId}`);

         // Validate essential chapter/story data
         if (!chapterData || !storyData) {
             console.error(`Incomplete chapter or story data for story ${storyId}, chapter ${chapterId}`);
             return null;
         }

        // 3. Fetch comments for this chapter (e.g., last 20)
        const commentsRef = collection(db, "stories", storyId, "chapters", chapterId, "comments");
        const commentsQuery = query(commentsRef, orderBy("timestamp", "desc"), limit(20));
        const commentsSnapshot = await getDocs(commentsQuery);
        const comments: StoryCommentData[] = commentsSnapshot.docs.map(docSnap => {
             const data = docSnap.data();
             const timestamp = data.timestamp;
             let commentDate: Date = new Date(); // Default to now
             if (timestamp instanceof Timestamp) {
                 commentDate = timestamp.toDate();
             } else if (typeof timestamp === 'string') {
                 try { commentDate = new Date(timestamp); } catch { /* ignore invalid date */ }
             }
             return {
                 id: docSnap.id,
                 userId: data.userId || 'unknown',
                 userName: data.userName || 'Anonymous', // Handle missing names
                 userAvatar: data.userAvatar,
                 text: data.text || '', // Handle missing text
                 timestamp: commentDate, // Convert Firestore Timestamp
             };
        });
        console.log(`Found ${comments.length} comments for chapter ${chapterId}`);


        // 4. Fetch user's rating for this chapter (if userId provided)
        let userRating = 0;
        if (userId) {
             try {
                 // Path: /stories/{storyId}/chapters/{chapterId}/ratings/{userId}
                const ratingRef = doc(db, "stories", storyId, "chapters", chapterId, "ratings", userId);
                const ratingSnap = await getDoc(ratingRef);
                if (ratingSnap.exists()) {
                    userRating = ratingSnap.data()?.rating || 0; // Safe access
                }
             } catch (ratingError) {
                 console.error(`Error fetching rating for user ${userId} on chapter ${chapterId}:`, ratingError);
                 // Don't fail the whole fetch, just proceed without user rating
             }
        }
        console.log(`User specific data for chapter ${chapterId} - rating: ${userRating}`);


        // 5. Construct the result
        const result: ChapterDetailsResult = {
            title: chapterData.title || `Chapter ${chapterNumber}`, // Fallback title
            content: chapterData.content || 'Content not available.', // Fallback content
            storyTitle: storyData.title || 'Untitled Story',
            storyAuthor: storyData.authorName || 'Unknown Author', // Assuming authorName is stored
            totalChapters: storyData.chapterCount || 0, // Use stored chapterCount if available
            storyId: storyId,
            chapterId: chapterId,
            comments: comments,
            userRating: userRating,
        };

        return result;

    } catch (error) {
        console.error(`CRITICAL: Error fetching chapter details for slug "${slug}", chapter ${chapterNumber} (StoryID: ${storyId}, ChapterID: ${chapterId}):`, error);
        // Return null instead of throwing to allow page to handle gracefully
        return null;
    }
};


/**
 * Submits a comment for a specific chapter.
 */
export const submitComment = async (params: SubmitCommentParams): Promise<{ id: string }> => {
    const { storyId, chapterId, userId, text } = params;

    if (!auth.currentUser || auth.currentUser.uid !== userId) {
         console.error("submitComment failed: User not authenticated or UID mismatch.");
        throw new Error("User is not authenticated or UID mismatch.");
    }

    const commentData = {
        userId: userId,
        text: text,
        timestamp: serverTimestamp(), // Use server timestamp
        // Store denormalized user info for easier display (optional but recommended)
        userName: auth.currentUser.displayName || 'Anonymous',
        userAvatar: auth.currentUser.photoURL
    };

    const commentRef = collection(db, "stories", storyId, "chapters", chapterId, "comments");
    const chapterRef = doc(db, "stories", storyId, "chapters", chapterId);
    const storyRef = doc(db, "stories", storyId); // Reference to the main story doc

    try {
        // Use a transaction to add comment and increment counts atomically
        const newCommentDocRef = await runTransaction(db, async (transaction) => {
             // 1. Add the new comment document
             const addedDocRef = await addDoc(commentRef, commentData); // Add doc needs to happen outside transaction to get ref, or generate ID beforehand

             // If addDoc were inside, we couldn't get the ID easily.
             // Alternative: Generate ID beforehand `const newId = doc(commentRef).id; transaction.set(doc(commentRef, newId), ...)`

             // 2. Increment comment count on the chapter
             transaction.update(chapterRef, { commentCount: increment(1) });

             // 3. Increment comment count on the story
             transaction.update(storyRef, { commentCount: increment(1) });

             return addedDocRef; // Or return the generated ID if done differently
        });


        // Return the ID of the newly created comment
         return { id: newCommentDocRef.id }; // Assuming addDoc was outside transaction or ID was pre-generated

    } catch (error) {
        console.error("Error submitting comment with transaction:", error);
        throw new Error("Failed to submit comment.");
    }
};

/**
 * Submits or updates a rating for a specific chapter.
 */
export const submitRating = async (params: SubmitRatingParams): Promise<void> => {
    const { storyId, chapterId, userId, rating } = params;

     if (!auth.currentUser || auth.currentUser.uid !== userId) {
         console.error("submitRating failed: User not authenticated or UID mismatch.");
        throw new Error("User is not authenticated or UID mismatch.");
     }
     if (rating < 1 || rating > 5) {
         console.error(`submitRating failed: Invalid rating value ${rating}.`);
         throw new Error("Rating must be between 1 and 5.");
     }

    const ratingRef = doc(db, "stories", storyId, "chapters", chapterId, "ratings", userId);
    const chapterRef = doc(db, "stories", storyId, "chapters", chapterId);

    try {
        await runTransaction(db, async (transaction) => {
            const ratingSnap = await transaction.get(ratingRef);
            const chapterSnap = await transaction.get(chapterRef);

            if (!chapterSnap.exists()) {
                throw new Error("Chapter does not exist!");
            }

            const previousRating = ratingSnap.exists() ? ratingSnap.data()?.rating || 0 : 0;
            const currentTotalSum = chapterSnap.data()?.totalRatingSum || 0;
            const currentRatingCount = chapterSnap.data()?.ratingCount || 0;

            const ratingDiff = rating - previousRating;
            const ratingCountChange = previousRating === 0 ? 1 : 0; // Increment count only if it's a new rating

            // Update user's specific rating
            transaction.set(ratingRef, {
                rating: rating,
                timestamp: serverTimestamp(),
            });

            // Update aggregated rating on the chapter document
            transaction.update(chapterRef, {
                totalRatingSum: currentTotalSum + ratingDiff,
                ratingCount: currentRatingCount + ratingCountChange
                // Average can be calculated on read: totalRatingSum / ratingCount
            });
        });

    } catch (error) {
        console.error("Error submitting chapter rating:", error);
        throw new Error("Failed to submit chapter rating.");
    }
};
