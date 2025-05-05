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
  }
});
