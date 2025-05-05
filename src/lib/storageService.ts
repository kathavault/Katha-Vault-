// src/lib/storageService.ts
import { storage } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid'; // Use UUID for unique filenames

/**
 * Uploads a file to Firebase Storage.
 * @param file - The file object to upload.
 * @param path - The desired path/folder in Firebase Storage (e.g., 'covers', 'avatars').
 * @returns The download URL of the uploaded file.
 */
export const uploadFile = async (file: File, path: string): Promise<string> => {
  if (!file) {
    throw new Error("No file provided for upload.");
  }

  // Generate a unique filename to avoid collisions
  const fileExtension = file.name.split('.').pop();
  const uniqueFilename = `${uuidv4()}.${fileExtension}`;
  const storageRef = ref(storage, `${path}/${uniqueFilename}`);

  try {
    // Upload the file
    const snapshot = await uploadBytes(storageRef, file);
    console.log('Uploaded a blob or file!', snapshot);

    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log('File available at', downloadURL);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading file: ", error);
    throw new Error("Failed to upload file.");
  }
};
