// src/types/index.ts
import type { Timestamp } from 'firebase/firestore';

// Represents a comment (could be on story or chapter)
export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string | null;
  text: string;
  timestamp: Date | Timestamp | string; // Allow ISO string for flexibility after fetch
}

// Explicitly define and export StoryCommentData if it's different or used widely
export interface StoryCommentData extends Omit<Comment, 'timestamp'> {
  timestamp: Date; // Ensure timestamp is a Date object after processing
}


// Represents a single chapter of a story (as stored in DB)
export interface Chapter {
  id: string; // Firestore document ID
  title: string;
  content: string; // Full content for reading view
  storyId: string; // Reference to the parent story
  order?: number; // Optional field for chapter order
  wordCount?: number;
  lastUpdated?: Date | Timestamp | string; // Keep track of updates
  // Optional aggregated data (might be calculated on read or stored)
  totalRatingSum?: number; // Sum of ratings specifically for THIS chapter
  ratingCount?: number;    // Count of ratings specifically for THIS chapter
  commentCount?: number;   // Count of comments specifically for THIS chapter
}

// Represents the main story object (as stored in DB)
export interface Story {
  id: string; // Firestore document ID
  title: string;
  description: string;
  genre: string;
  tags?: string[];
  status: 'Draft' | 'Published' | 'Archived' | 'Ongoing' | 'Completed'; // Added Ongoing/Completed
  authorId: string; // Firestore user ID of the author
  authorName: string; // Author's display name
  authorAvatarUrl?: string; // Optional author avatar URL (denormalized)
  coverImageUrl?: string;
  chapterCount?: number; // Explicit count of chapters
  reads?: number; // Read count
  lastUpdated?: Date | Timestamp | string; // Firestore Timestamp or ISO string/Date object
  slug: string; // URL-friendly identifier
  dataAiHint?: string; // For image generation

  // Story-level aggregated data (make optional as they might not exist initially)
  totalRatingSum?: number;  // Sum of all ratings for THE STORY
  ratingCount?: number;     // Total number of ratings for THE STORY
  commentCount?: number;    // Total number of comments for THE STORY
}

// Represents basic user profile information stored in Firestore
export interface UserProfile {
    id?: string; // Might not be directly on the doc data, but the doc ID
    name?: string | null;
    email?: string | null; // Should match auth email
    avatarUrl?: string | null;
    bio?: string;
    isAdmin?: boolean; // Indicates admin role
    // Add other profile fields like followers, following counts, etc.
    followersCount?: number;
    followingCount?: number;
    storiesPublishedCount?: number;
}

// Represents user-specific settings stored in Firestore (e.g., under /users/{userId}/preferences/settings)
export interface UserSettings {
    emailNotifications?: boolean; // e.g., new chapter alerts, comments
    pushNotifications?: boolean; // For future mobile app integration
    readingTheme?: 'light' | 'dark' | 'sepia' | 'system'; // Reading view theme
    fontSize?: 'small' | 'medium' | 'large' | 'xlarge'; // Reading view font size
    language?: string; // Preferred interface language (e.g., 'en', 'hi')
    // Add other preferences as needed
}


// Represents site-wide settings (example) stored in Firestore (e.g., under /siteSettings/config)
export interface SiteSettings {
    siteTitle: string;
    siteDescription: string;
    allowUserRegistration: boolean;
    // Add other global settings
}


// --- Types for Service Function Results ---

// Type for Author details (used in StoryDetailsResult)
export interface Author {
    id: string;
    name: string;
    avatarUrl?: string;
}

// Type for Chapter summary (used in StoryDetailsResult)
export interface ChapterSummary {
    id: string;
    title: string;
    order: number; // Make order required for reliable sorting
    wordCount?: number;
    lastUpdated?: string; // ISO string or undefined
}

// Type for the result returned by fetchStoryDetails
export interface StoryDetailsResult extends Omit<Story, 'id' | 'authorId' | 'authorName' | 'authorAvatarUrl' | 'lastUpdated'> {
    id: string; // Ensure id is present
    author: Author; // Use the Author interface
    chaptersData: ChapterSummary[];
    authorFollowers: number; // Example additional data
    lastUpdated: string; // Ensure lastUpdated is always a string (ISO format) after processing
    averageRating?: number; // Calculated average rating for the story
    totalRatings?: number; // Total number of ratings for the story
    comments?: StoryCommentData[]; // Processed comments with Date objects
    userRating?: number; // User's rating for the story (0 if not rated)
    isInLibrary?: boolean; // Whether the story is in the user's library
}

// Type for the result returned by fetchChapterDetails
export interface ChapterDetailsResult {
    title: string;
    content: string;
    storyTitle: string;
    storyAuthor: string;
    totalChapters: number;
    storyId: string;
    chapterId: string;
    comments?: StoryCommentData[]; // Processed comments with Date objects
    userRating?: number; // User's rating for this specific chapter (0 if not rated)
}


// --- Types for Service Function Parameters ---

export interface SubmitCommentParams {
    storyId: string;
    chapterId: string; // Chapter ID is needed for chapter comments
    userId: string;
    text: string;
}

export interface SubmitRatingParams {
    storyId: string;
    chapterId: string; // Chapter ID is needed for chapter ratings
    userId: string;
    rating: number; // Should be 1-5
}

export interface SubmitStoryCommentParams {
    storyId: string;
    userId: string;
    text: string;
}

export interface SubmitStoryRatingParams {
    storyId: string;
    userId: string;
    rating: number;
}
