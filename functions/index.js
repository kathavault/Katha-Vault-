// functions/index.js
/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// const {onRequest} = require("firebase-functions/v2/https");
// const logger = require("firebase-functions/logger");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });


const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

exports.setAdminRole = functions.https.onCall(async (data, context) => {
  // Check karo ki user admin hai ya nahi
  // IMPORTANT: This check assumes the calling user *already* has an admin claim.
  // In a real scenario, you'd likely have a different, more secure way to
  // authorize the initial admin setting (e.g., check against a hardcoded list
  // of admin UIDs, or trigger manually from the Firebase console).
  // For this implementation, we'll assume the first admin is set manually or
  // through another secure process, and this function is for admins to grant
  // admin rights to others.
  if (context.auth.token.admin !== true) {
    // Log the attempt for security auditing
    console.log(`Unauthorized attempt to set admin role by UID: ${context.auth?.uid}`);
    return {
      error: 'Unauthorized: Sirf admins hi admin claim set kar sakte hain.',
    };
  }

  const uid = data.uid;
  if (!uid) {
    return {
      error: 'UID missing hai',
    };
  }

  // Prevent admins from removing their own admin status accidentally via this function
  if (context.auth.uid === uid && data.admin !== true) {
      return {
          error: 'Admins cannot remove their own admin status using this function.'
      }
  }

  try {
    // Set the custom claim for the target user UID
    await admin.auth().setCustomUserClaims(uid, {
      admin: true, // Set the admin claim to true
    });
    console.log(`Admin role successfully set for UID: ${uid} by admin UID: ${context.auth.uid}`);
    // Optional: You might want to trigger a refresh of the user's token on the client-side
    // This isn't directly possible from the backend function, the client needs to handle it.
    return {
      result: `User ${uid} ke liye admin role successfully set ho gaya.`,
    };
  } catch (error) {
    console.error(`Error setting custom claim for UID: ${uid} by admin UID: ${context.auth.uid}`, error);
    return {
      // Provide a generic error message to the client
      error: 'Custom claim set karne mein error: ' + error.message,
    };
  }
});
