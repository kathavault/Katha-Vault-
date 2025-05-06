// setAdmin.js
// WARNING: This script grants admin privileges. Run it securely and only once.
// Ensure you have installed the Firebase Admin SDK: npm install firebase-admin

const admin = require("firebase-admin");

// **Important:** Replace this path with the actual path to your downloaded service account key file.
// Download your service account key from Firebase Project Settings -> Service accounts -> Generate new private key
const serviceAccount = require("./serviceAccountKey.json"); // Ensure this path is correct

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// **Important:** Replace this placeholder with the actual Firebase UID of the user you want to make an admin.
// You can find the UID in the Firebase Authentication console.
const uid = "SpiTC3hGgZfXTHMOiIHdf59Dngg2"; // User provided UID

if (uid === "YAHAN_APNA_UID_DALO") {
    console.error("Error: Please replace 'YAHAN_APNA_UID_DALO' with the actual Firebase User ID.");
    process.exit(1); // Exit the script if the placeholder UID is still present
}


// Set the custom claim { admin: true } for the specified user
admin.auth().setCustomUserClaims(uid, { admin: true })
  .then(() => {
    console.log(`Admin claim set successfully for UID: ${uid}`);
    // It might take a short while for the claim to propagate.
    // The user needs to refresh their ID token (e.g., by logging out and back in)
    // for the claim to be reflected in their token on the client-side.
    process.exit(0); // Exit successfully
  })
  .catch((error) => {
    console.log(`Error setting admin claim for UID: ${uid}`, error);
    process.exit(1); // Exit with an error code
  });

/*
How to use this script:
1.  **Install Firebase Admin SDK:** If you haven't already, run `npm install firebase-admin` in your project directory (or a separate directory for this script).
2.  **Download Service Account Key:**
    *   Go to your Firebase Project Settings > Service accounts.
    *   Click "Generate new private key" and save the downloaded JSON file.
    *   **Important:** Rename the downloaded file to `serviceAccountKey.json` and place it in the *same directory* as this `setAdmin.js` script, OR update the `require("./serviceAccountKey.json")` path above to point to the correct location of your key file.
    *   **Keep this key file secure!** Do not commit it to version control (add it to your .gitignore).
3.  **Find User UID:** Go to the Firebase Authentication console, find the user you want to make an admin (e.g., kathavault@gmail.com), and copy their "User UID".
4.  **Replace Placeholder:** Open this `setAdmin.js` file and replace the placeholder string `"YAHAN_APNA_UID_DALO"` with the actual User UID you copied.
5.  **Run the Script:** Open your terminal, navigate to the directory containing this script and your service account key, and run the script using Node.js:
    ```bash
    node setAdmin.js
    ```
6.  **Verify:** You should see "Admin claim set successfully" in the console. The user might need to log out and log back into your application for the new claim to take effect on their ID token. You can also verify claims using the Firebase Admin SDK if needed.
*/
