// src/types/index.ts
import type { Timestamp } from 'firebase/firestore';

// Represents a comment (could be on story or chapter)
export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string | null;
  text: string;
  timestamp: Date | Timestamp; // Allow both for flexibility
}


// Represents a single chapter of a story
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
  // comments?: Comment[]; // Comments specific to this chapter (usually fetched separately for read view)
}

// Represents the main story object
export interface Story {
  id: string; // Firestore document ID
  title: string;
  description: string;
  genre: string;
  tags: string[];
  status: 'Draft' | 'Published' | 'Archived' | 'Ongoing' | 'Completed'; // Added Ongoing/Completed
  authorId: string; // Firestore user ID of the author
  authorName: string; // Author's display name
  authorAvatarUrl?: string; // Optional author avatar URL (denormalized)
  coverImageUrl?: string;
  chapters?: Chapter[]; // Usually IDs/basic info if not fully embedded. For detail page, full chapter summaries fetched.
  chapterCount?: number; // Explicit count of chapters, often from story.chaptersData.length
  reads?: number; // Read count
  lastUpdated?: Date | Timestamp | string; // Firestore Timestamp or ISO string/Date object
  slug: string; // URL-friendly identifier
  dataAiHint?: string; // For image generation

  // Story-level aggregated data
  totalRatingSum?: number;  // Sum of all ratings for THE STORY
  ratingCount?: number;     // Total number of ratings for THE STORY
  averageRating?: number;   // Calculated: totalRatingSum / ratingCount for THE STORY

  commentCount?: number;    // Total number of comments for THE STORY
  // comments?: Comment[];  // Story-level comments, if fetched and displayed directly on story page
                           // Often fetched paginated or limited set
}

// Represents basic user profile information
export interface UserProfile {
    id: string; // Same as Firebase Auth UID
    name?: string | null;
    email: string | null; // Should match auth email
    avatarUrl?: string | null;
    bio?: string;
    isAdmin?: boolean; // Indicates admin role
    // Add other profile fields like followers, following counts, etc.
    followersCount?: number;
    followingCount?: number;
    storiesPublishedCount?: number;
}

// Represents site-wide settings (example)
export interface SiteSettings {
    siteTitle: string;
    siteDescription: string;
    allowUserRegistration: boolean;
    // Add other settings
}