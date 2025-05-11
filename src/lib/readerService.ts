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
    runTransaction 
} from 'firebase/firestore';
import type { Chapter, StoryCommentData, ChapterDetailsResult, SubmitCommentParams, SubmitRatingParams } from '@/types';

/**
 * Fetches detailed information for a specific chapter, including comments.
 * This version is more suited for client-side fetching after navigation.
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

        const chaptersRef = collection(db, "stories", storyId, "chapters");
        const chapterQuery = query(chaptersRef, where("order", "==", chapterNumber), limit(1));
        const chapterSnapshot = await getDocs(chapterQuery);

        if (chapterSnapshot.empty) {
            console.warn(`Chapter number ${chapterNumber} for story "${slug}" (ID: ${storyId}) not found.`);
            return null;
        }
        const chapterDoc = chapterSnapshot.docs[0];
        const chapterData = chapterDoc.data() as Omit<Chapter, 'id'>;
        chapterId = chapterDoc.id;
        console.log(`Found chapter with ID: ${chapterId}`);

        if (!chapterData || !storyData) {
            console.error(`Incomplete chapter or story data for story ${storyId}, chapter ${chapterId}`);
            return null;
        }

        const commentsRef = collection(db, "stories", storyId, "chapters", chapterId, "comments");
        const commentsQuery = query(commentsRef, orderBy("timestamp", "desc"), limit(20));
        const commentsSnapshot = await getDocs(commentsRef); // Corrected: use commentsRef with orderBy for comments
        const comments: StoryCommentData[] = commentsSnapshot.docs.map(docSnap => {
             const data = docSnap.data();
             const timestamp = data.timestamp;
             let commentDate: Date = new Date(); 
             if (timestamp instanceof Timestamp) {
                 commentDate = timestamp.toDate();
             } else if (typeof timestamp === 'string') {
                 try { commentDate = new Date(timestamp); } catch { /* ignore invalid date */ }
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
        console.log(`Found ${comments.length} comments for chapter ${chapterId}`);

        let userRating = 0;
        if (userId) {
             try {
                const ratingRef = doc(db, "stories", storyId, "chapters", chapterId, "ratings", userId);
                const ratingSnap = await getDoc(ratingRef);
                if (ratingSnap.exists()) {
                    userRating = ratingSnap.data()?.rating || 0; 
                }
             } catch (ratingError) {
                 console.error(`Error fetching rating for user ${userId} on chapter ${chapterId}:`, ratingError);
             }
        }
        console.log(`User specific data for chapter ${chapterId} - rating: ${userRating}`);

        const result: ChapterDetailsResult = {
            title: chapterData.title || `Chapter ${chapterNumber}`, 
            content: chapterData.content || 'Content not available.', 
            storyTitle: storyData.title || 'Untitled Story',
            storyAuthor: storyData.authorName || 'Unknown Author', 
            totalChapters: storyData.chapterCount || 0, 
            storyId: storyId,
            chapterId: chapterId,
            comments: comments,
            userRating: userRating,
        };

        return result;

    } catch (error) {
        console.error(`CRITICAL: Error fetching chapter details for slug "${slug}", chapter ${chapterNumber} (StoryID: ${storyId}, ChapterID: ${chapterId}):`, error);
        return null;
    }
};


/**
 * Fetches content and basic details for a specific chapter by its order number.
 * Optimized for server-side rendering or initial data fetching for a chapter page.
 */
export const fetchChapterContentByOrder = async (
    storySlug: string,
    chapterOrder: number
): Promise<{ title: string; content: string; storyTitle: string; storySlug: string; order: number } | null> => {
    if (!storySlug || isNaN(chapterOrder) || chapterOrder < 1) {
        console.error('fetchChapterContentByOrder: Invalid parameters', { storySlug, chapterOrder });
        return null;
    }

    try {
        // 1. Find the story by slug
        const storiesRef = collection(db, 'stories');
        const storyQuery = query(storiesRef, where('slug', '==', storySlug), limit(1));
        const storySnapshot = await getDocs(storyQuery);

        if (storySnapshot.empty) {
            console.warn(`fetchChapterContentByOrder: Story with slug "${storySlug}" not found.`);
            return null;
        }
        const storyDoc = storySnapshot.docs[0];
        const storyData = storyDoc.data();
        const storyId = storyDoc.id;

        // 2. Find the specific chapter by order within the story's subcollection
        const chaptersRef = collection(db, 'stories', storyId, 'chapters');
        const chapterQuery = query(chaptersRef, where('order', '==', chapterOrder), limit(1));
        const chapterSnapshot = await getDocs(chapterQuery);

        if (chapterSnapshot.empty) {
            console.warn(`fetchChapterContentByOrder: Chapter order ${chapterOrder} for story "${storySlug}" (ID: ${storyId}) not found.`);
            return null;
        }
        const chapterDoc = chapterSnapshot.docs[0];
        const chapterData = chapterDoc.data();

        return {
            title: chapterData.title || `Chapter ${chapterOrder}`,
            content: chapterData.content || 'Content not available.',
            storyTitle: storyData.title || 'Untitled Story',
            storySlug: storySlug,
            order: chapterOrder,
        };
    } catch (error) {
        console.error(`fetchChapterContentByOrder: Error fetching chapter ${chapterOrder} for story "${storySlug}":`, error);
        return null;
    }
};


export const submitComment = async (params: SubmitCommentParams): Promise<{ id: string }> => {
    const { storyId, chapterId, userId, text } = params;

    if (!auth.currentUser || auth.currentUser.uid !== userId) {
         console.error("submitComment failed: User not authenticated or UID mismatch.");
        throw new Error("User is not authenticated or UID mismatch.");
    }

    const commentData = {
        userId: userId,
        text: text,
        timestamp: serverTimestamp(), 
        userName: auth.currentUser.displayName || 'Anonymous',
        userAvatar: auth.currentUser.photoURL
    };

    const commentRef = collection(db, "stories", storyId, "chapters", chapterId, "comments");
    const chapterRef = doc(db, "stories", storyId, "chapters", chapterId);
    const storyRef = doc(db, "stories", storyId); 

    try {
        const newCommentDocRef = doc(collection(db, "stories", storyId, "chapters", chapterId, "comments")); // Generate new doc ref for ID
        
        await runTransaction(db, async (transaction) => {
             transaction.set(newCommentDocRef, commentData); // Set the new comment
             transaction.update(chapterRef, { commentCount: increment(1) });
             transaction.update(storyRef, { commentCount: increment(1) });
        });

         return { id: newCommentDocRef.id }; 

    } catch (error) {
        console.error("Error submitting comment with transaction:", error);
        throw new Error("Failed to submit comment.");
    }
};


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
            const ratingCountChange = previousRating === 0 ? 1 : 0; 

            transaction.set(ratingRef, {
                rating: rating,
                timestamp: serverTimestamp(),
            });

            transaction.update(chapterRef, {
                totalRatingSum: currentTotalSum + ratingDiff,
                ratingCount: currentRatingCount + ratingCountChange
            });
        });

    } catch (error) {
        console.error("Error submitting chapter rating:", error);
        throw new Error("Failed to submit chapter rating.");
    }
};


/**
 * Fetches an array of chapter summaries for a given story ID.
 * Useful for populating chapter lists or for generateStaticParams.
 */
export const fetchChaptersForStory = async (storyId: string): Promise<Chapter[]> => {
    if (!storyId) {
        console.warn("fetchChaptersForStory called with no storyId.");
        return [];
    }
    try {
        const chaptersRef = collection(db, "stories", storyId, "chapters");
        const q = query(chaptersRef, orderBy("order", "asc"));
        const querySnapshot = await getDocs(q);
        
        return querySnapshot.docs.map(docSnap => {
            const data = docSnap.data();
            const lastUpdated = data.lastUpdated;
            let lastUpdatedISO: string | undefined;
            if (lastUpdated instanceof Timestamp) {
                lastUpdatedISO = lastUpdated.toDate().toISOString();
            } else if (typeof lastUpdated === 'string') {
                try { lastUpdatedISO = new Date(lastUpdated).toISOString(); } catch { /* ignore */ }
            }

            return {
                id: docSnap.id,
                title: data.title || `Chapter ${data.order || 'N/A'}`,
                order: data.order || 0,
                wordCount: data.wordCount || 0,
                storyId: storyId, 
                content: data.content || '', // Include content or make it optional based on need
                lastUpdated: lastUpdatedISO,
            } as Chapter; // Cast to Chapter, ensure all required fields are present
        });
    } catch (error) {
        console.error(`Error fetching chapters for story ID ${storyId}:`, error);
        return [];
    }
};
