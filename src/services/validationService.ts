// src/services/validationService.ts
/**
 * @fileOverview Provides basic server-side validation functions.
 */

/**
 * Validates story data.
 * @param data - The story data to validate.
 * @returns A string containing the validation error message, or null if valid.
 */
export function validateStoryData(data: { title: string; description: string; genre: string; tags?: string[] }): string | null {
  if (!data.title || data.title.trim().length === 0) {
    return "Story title cannot be empty.";
  }
  if (data.title.length > 100) {
    return "Story title cannot exceed 100 characters.";
  }
  if (!data.genre) {
    return "Please select a genre for the story.";
  }
  if (!data.description || data.description.trim().length === 0) {
    return "Story description cannot be empty.";
  }
  if (data.description.length > 1000) {
    return "Story description cannot exceed 1000 characters.";
  }
  if (data.tags) {
    if (!Array.isArray(data.tags)) {
        return "Tags must be an array of strings."
    }
    if (data.tags.some(tag => typeof tag !== 'string' || tag.trim().length === 0)) {
        return "All tags must be non-empty strings."
    }
     if (data.tags.some(tag => tag.length > 30)) {
         return "Tags cannot exceed 30 characters each."
     }
  }
  return null; // No validation errors
}

/**
 * Validates chapter data.
 * @param data - The chapter data to validate.
 * @returns A string containing the validation error message, or null if valid.
 */
export function validateChapterData(data: { title: string; content: string }): string | null {
  if (!data.title || data.title.trim().length === 0) {
    return "Chapter title cannot be empty.";
  }
  if (data.title.length > 150) {
    return "Chapter title cannot exceed 150 characters.";
  }
  if (!data.content || data.content.trim().length === 0) {
    return "Chapter content cannot be empty.";
  }
  // Add content length validation if needed, e.g.:
  // if (data.content.length > 50000) {
  //   return "Chapter content is too long.";
  // }
  return null; // No validation errors
}

/**
 * Validates comment data.
 * @param data - The comment data to validate.
 * @returns A string containing the validation error message, or null if valid.
 */
export function validateCommentData(data: { text: string }): string | null {
    if (!data.text || data.text.trim().length === 0) {
        return "Comment cannot be empty.";
    }
    if (data.text.length > 1000) { // Example max length
        return "Comment cannot exceed 1000 characters.";
    }
    // Add more validation if needed (e.g., check for harmful content - might need AI)
    return null;
}

/**
 * Validates rating data.
 * @param data - The rating data to validate.
 * @returns A string containing the validation error message, or null if valid.
 */
export function validateRatingData(data: { rating: number }): string | null {
    if (typeof data.rating !== 'number' || !Number.isInteger(data.rating) || data.rating < 1 || data.rating > 5) {
        return "Rating must be an integer between 1 and 5.";
    }
    return null;
}

    