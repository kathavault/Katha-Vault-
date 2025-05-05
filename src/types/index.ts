// src/types/index.ts

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
  content: string;
  storyId: string; // Reference to the parent story
  order?: number; // Optional field for chapter order
  wordCount?: number;
  lastUpdated?: Date | Timestamp | string; // Keep track of updates
  // Optional aggregated data (might be calculated on read or stored)
  totalRatingSum?: number;
  ratingCount?: number;
  commentCount?: number;
  comments?: Comment[]; // Comments specific to this chapter (usually fetched separately)
}

// Represents the main story object
export interface Story {
  id: string; // Firestore document ID
  title: string;
  description: string;
  genre: string;
  tags: string[];
  status: 'Draft' | 'Published' | 'Archived';
  authorId: string; // Firestore user ID of the author
  authorName: string; // Author's display name
  coverImageUrl?: string;
  chapters?: Chapter[]; // Chapters might be loaded separately or stored within (often only IDs/basic info stored here)
  chapterCount?: number; // Explicit count of chapters
  reads?: number; // Read count
  lastUpdated?: Date | Timestamp | string; // Firestore Timestamp or ISO string/Date object
  slug: string; // URL-friendly identifier
  dataAiHint?: string; // For image generation
  // Optional aggregated data
  totalRatingSum?: number;
  ratingCount?: number;
  averageRating?: number; // Can be calculated: totalRatingSum / ratingCount
  commentCount?: number;
  comments?: Comment[]; // Comments specific to the story overall (usually fetched separately)
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
}

// Represents site-wide settings (example)
export interface SiteSettings {
    siteTitle: string;
    siteDescription: string;
    allowUserRegistration: boolean;
    // Add other settings
}


