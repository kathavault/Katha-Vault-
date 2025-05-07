import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from 'uuid'; // For generating unique file names
import { app } from './firebase'; // Import your Firebase app configuration

const storage = getStorage(app);

/**
 * Uploads an image to Firebase Storage
 * @param {File} file - The image file to upload
 * @return {Promise<string>} - Returns the download URL of the uploaded image
 */
export async function uploadImage(file: File): Promise<string> {
    const uniqueFileName = `${uuidv4()}-${file.name}`;
    const storageRef = ref(storage, `images/${uniqueFileName}`);

    try {
        // Upload the file
        const snapshot = await uploadBytes(storageRef, file);
        console.log('Image uploaded successfully:', snapshot);

        // Get the file's download URL
        const downloadURL = await getDownloadURL(storageRef);
        console.log('File available at:', downloadURL);

        return downloadURL;
    } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
    }
}