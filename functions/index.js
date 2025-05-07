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
<<<<<<< HEAD

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
=======
admin.initializeApp();

/**
 * Sets the 'admin' custom claim for a given user UID.
 * WARNING: This function should be secured, for example, by checking
 * if the request comes from an already authenticated admin user or using
 * a secret key known only to your trusted backend services.
 * Directly exposing this endpoint without proper security checks is a major risk.
 *
 * Query Parameter:
 * - uid: The Firebase UID of the user to grant admin role.
 */
exports.setAdminRole = functions.https.onRequest(async (req, res) => {
  // --- SECURITY WARNING ---
  // The current implementation lacks proper authentication/authorization checks.
  // Anyone knowing this function's URL and a user's UID could potentially grant admin rights.
  // TODO: Implement robust security checks here. For example:
  // 1. Check if the request has a valid ID token of an existing admin.
  //    const idToken = req.headers.authorization?.split('Bearer ')[1];
  //    if (!idToken) { return res.status(401).send("Unauthorized: Missing token."); }
  //    try {
  //      const decodedToken = await admin.auth().verifyIdToken(idToken);
  //      if (!decodedToken.admin) { // Check if the CALLER is an admin
  //         return res.status(403).send("Forbidden: Caller is not an admin.");
  //      }
  //    } catch (error) {
  //       console.error('Error verifying token:', error);
  //       return res.status(401).send("Unauthorized: Invalid token.");
  //    }
  // 2. Use a secret key shared between your deployment script and this function.
  //    if (req.headers['x-admin-secret'] !== functions.config().admin.secret) {
  //      return res.status(401).send("Unauthorized: Invalid secret.");
  //    }
  // -----------------------

  const uid = req.query.uid;

  if (!uid) {
     return res.status(400).send("Missing UID in query parameter.");
  }

  try {
    // Set custom user claims: { admin: true }
    await admin.auth().setCustomUserClaims(uid, { admin: true });
    console.log(`Successfully set admin role for user ${uid}.`);
    // It might be useful to also store this role in Firestore for easier querying in security rules
    // await admin.firestore().collection('users').doc(uid).set({ isAdmin: true }, { merge: true });

    return res.status(200).send(`Successfully set admin role for user ${uid}.`);
  } catch (error) {
    console.error(`Error setting admin role for user ${uid}:`, error);
    return res.status(500).send("Error setting admin role: " + error.message);
  }
});

/**
 * Removes the 'admin' custom claim for a given user UID.
 * WARNING: Similar security concerns as setAdminRole apply here. Secure this endpoint properly.
 *
 * Query Parameter:
 * - uid: The Firebase UID of the user to remove admin role from.
 */
exports.removeAdminRole = functions.https.onRequest(async (req, res) => {
  // --- SECURITY WARNING ---
  // Implement robust security checks similar to setAdminRole.
  // -----------------------

  const uid = req.query.uid;

  if (!uid) {
    return res.status(400).send("Missing UID in query parameter.");
  }

  try {
    // Remove custom user claims by setting them back to null or an empty object
    await admin.auth().setCustomUserClaims(uid, { admin: null }); // Or simply {}
    console.log(`Successfully removed admin role for user ${uid}.`);
    // Update Firestore role if applicable
    // await admin.firestore().collection('users').doc(uid).set({ isAdmin: false }, { merge: true });

    return res
      .status(200)
      .send(`Successfully removed admin role for user ${uid}.`);
  } catch (error) {
    console.error(`Error removing admin role for user ${uid}:`, error);
    return res.status(500).send(`Error removing admin role: ${error.message}`);
>>>>>>> eeac1358d3ae1f112a5aa4ef27eebeb43ae4c6bf
  }
});
