// src/lib/userService.ts
import { db, auth, storage } from './firebase';
import { doc, getDoc, setDoc, updateDoc, FieldValue, serverTimestamp } from 'firebase/firestore';
import { updateProfile, reauthenticateWithCredential, EmailAuthProvider, deleteUser } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import type { UserProfile, UserSettings } from '@/types'; // Assuming types are defined

const USERS_COLLECTION = 'users';

/**
 * Fetches user profile data from Firestore.
 * @param userId - The ID of the user.
 * @returns The user profile data or null if not found.
 */
export const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
    if (!userId) return null;
    const userDocRef = doc(db, USERS_COLLECTION, userId);
    try {
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
            // Combine auth data with Firestore data
            const authUser = auth.currentUser; // Get current auth user for latest info
            const firestoreData = docSnap.data() as Partial<UserProfile>;
            return {
                id: userId,
                email: authUser?.email || firestoreData.email || null,
                name: authUser?.displayName || firestoreData.name || null,
                avatarUrl: authUser?.photoURL || firestoreData.avatarUrl || null,
                emailVerified: authUser?.emailVerified || false,
                isAdmin: firestoreData.isAdmin || false, // Get admin status from Firestore
                bio: firestoreData.bio || '',
                // Add other fields like follower counts etc.
            };
        } else {
            console.log("No profile document found for user:", userId);
            // Maybe create a default profile if needed?
            return null;
        }
    } catch (error) {
        console.error("Error fetching user profile:", error);
        throw new Error("Failed to fetch user profile.");
    }
};


/**
 * Updates user profile information in Firebase Auth and Firestore.
 * @param userId - The ID of the user.
 * @param data - The profile data to update (e.g., { displayName: 'New Name', photoURL: 'new_url' }).
 */
export const updateProfileInfo = async (userId: string, data: { displayName?: string | null; photoURL?: string | null }): Promise<void> => {
    const currentUser = auth.currentUser;
    if (!currentUser || currentUser.uid !== userId) {
        throw new Error("User not authenticated or mismatch.");
    }

    try {
        // Update Firebase Auth profile
        await updateProfile(currentUser, data);

        // Update Firestore profile (only fields present in data)
        const userDocRef = doc(db, USERS_COLLECTION, userId);
        const firestoreUpdateData: Partial<UserProfile> = {};
        if (data.displayName !== undefined) firestoreUpdateData.name = data.displayName;
        if (data.photoURL !== undefined) firestoreUpdateData.avatarUrl = data.photoURL;

        if (Object.keys(firestoreUpdateData).length > 0) {
             await setDoc(userDocRef, firestoreUpdateData, { merge: true }); // Use setDoc with merge to create if not exists
        }

    } catch (error) {
        console.error("Error updating profile info:", error);
        throw new Error("Failed to update profile information.");
    }
};


/**
 * Updates the user's bio in Firestore.
 * @param userId - The ID of the user.
 * @param bio - The new bio text.
 */
export const updateUserBio = async (userId: string, bio: string): Promise<void> => {
     if (!userId) throw new Error("User ID is required.");
     const userDocRef = doc(db, USERS_COLLECTION, userId);
     try {
         await setDoc(userDocRef, { bio: bio }, { merge: true }); // Use setDoc with merge
     } catch (error) {
         console.error("Error updating user bio:", error);
         throw new Error("Failed to update bio.");
     }
 };


 /**
 * Uploads an avatar image for a user.
 * @param userId - The ID of the user.
 * @param file - The avatar file to upload.
 * @returns The download URL of the uploaded avatar.
 */
 export const uploadAvatar = async (userId: string, file: File): Promise<string> => {
     if (!userId) throw new Error("User ID is required for avatar upload.");
     const filePath = `avatars/${userId}/${uuidv4()}.${file.name.split('.').pop()}`; // Unique path per user
     const storageRef = ref(storage, filePath);

     try {
         const snapshot = await uploadBytes(storageRef, file);
         const downloadURL = await getDownloadURL(snapshot.ref);
         return downloadURL;
     } catch (error) {
         console.error("Error uploading avatar:", error);
         throw new Error("Failed to upload avatar.");
     }
 };


// --- Settings Functions ---

/**
 * Fetches user settings from Firestore.
 * @param userId - The ID of the user.
 * @returns The user settings object or null if not found.
 */
export const fetchUserSettings = async (userId: string): Promise<UserSettings | null> => {
    if (!userId) return null;
    const settingsDocRef = doc(db, USERS_COLLECTION, userId, "preferences", "settings"); // Example subcollection path
    try {
        const docSnap = await getDoc(settingsDocRef);
        if (docSnap.exists()) {
            return docSnap.data() as UserSettings;
        } else {
            return {}; // Return empty object if no settings found yet
        }
    } catch (error) {
        console.error("Error fetching user settings:", error);
        throw new Error("Failed to fetch user settings.");
    }
};

/**
 * Updates user settings in Firestore.
 * @param userId - The ID of the user.
 * @param settings - The settings object to save.
 */
export const updateUserSettings = async (userId: string, settings: UserSettings): Promise<void> => {
    if (!userId) throw new Error("User ID is required.");
    const settingsDocRef = doc(db, USERS_COLLECTION, userId, "preferences", "settings"); // Example subcollection path
    try {
        // Use setDoc with merge:true to create the doc if it doesn't exist or update existing fields
        await setDoc(settingsDocRef, settings, { merge: true });
    } catch (error) {
        console.error("Error updating user settings:", error);
        throw new Error("Failed to update user settings.");
    }
};

// Potentially add function to create user profile doc on signup if needed
export const createUserProfileDocument = async (userId: string, email: string | null, name?: string | null, isAdmin = false): Promise<void> => {
    const userDocRef = doc(db, USERS_COLLECTION, userId);
    const userProfile: UserProfile = {
        id: userId,
        email: email,
        name: name,
        isAdmin: isAdmin, // Set admin status during creation if applicable
        bio: '',
        followersCount: 0,
        followingCount: 0,
        storiesPublishedCount: 0,
        // Initialize other fields
    };
    try {
        await setDoc(userDocRef, userProfile); // Don't merge on creation
        console.log("User profile document created for:", userId);
    } catch (error) {
        console.error("Error creating user profile document:", error);
        // Decide if this error should be thrown or handled silently
    }
};


// Add other user-related service functions as needed (e.g., follow user, etc.)
