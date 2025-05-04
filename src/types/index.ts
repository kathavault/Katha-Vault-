// src/types/index.ts

// Represents a single chapter of a story
export interface Chapter {
  id: string; // Firestore document ID
  title: string;
  content: string;
  storyId: string; // Reference to the parent story
  order?: number; // Optional field for chapter order
  wordCount?: number;
  lastUpdated?: string | Date; // Keep track of updates
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
  chapters?: Chapter[]; // Chapters might be loaded separately or stored within
  reads?: number; // Read count (consider how to update this efficiently)
  lastUpdated?: string | Date; // Firestore Timestamp or ISO string
  // Add other relevant fields like rating, votes, etc.
}

// Add other shared types here as needed, e.g., UserProfile, SiteSettings
