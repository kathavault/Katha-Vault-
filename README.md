# Katha Vault - Hindi Novel Website

This is a web application built with Next.js for reading and potentially writing Hindi novels, similar in concept to platforms like Wattpad.

## Features

*   Browse and read stories.
*   User authentication (Login/Signup via Email, Google, Facebook).
*   Admin panel for managing stories and chapters (CRUD operations).
*   User profiles and settings.
*   Story/Chapter commenting and rating system.
*   Dark/Light theme support.
*   (Planned) User story creation and library management.

## Tech Stack

*   **Framework:** Next.js (App Router)
*   **UI:** Shadcn/ui, Tailwind CSS
*   **State Management:** React Context API, React Hooks
*   **Authentication:** Firebase Authentication
*   **Database:** Firestore
*   **Storage:** Firebase Storage (for images)
*   **Styling:** Tailwind CSS, CSS Variables
*   **Deployment:** (User Choice - Vercel/Firebase Hosting recommended)

## Getting Started

### Prerequisites

*   Node.js (v18 or later recommended)
*   npm or yarn
*   Firebase Account and Project Setup

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/kathavault/Katha-Vault-.git
    cd Katha-Vault-
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    # yarn install
    ```

3.  **Set up Firebase:**
    *   Create a Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/).
    *   Enable Firestore, Firebase Authentication (Email/Password, Google, Facebook providers), and Firebase Storage.
    *   Get your Firebase project configuration keys.
    *   Create a `.env.local` file in the root of the project and add your Firebase configuration:
        ```env
        NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_API_KEY
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_AUTH_DOMAIN
        NEXT_PUBLIC_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=YOUR_STORAGE_BUCKET
        NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_MESSAGING_SENDER_ID
        NEXT_PUBLIC_FIREBASE_APP_ID=YOUR_APP_ID
        NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=YOUR_MEASUREMENT_ID

        # For Admin SDK in Functions (if using)
        GOOGLE_APPLICATION_CREDENTIALS=path/to/your/serviceAccountKey.json
        ```
    *   **Important:** Configure Firestore Security Rules to protect your data (see Firebase documentation and the example rules provided earlier in the chat).
    *   **Admin Setup:** Set the `admin: true` custom claim for your admin user (e.g., `kathavault@gmail.com`) using Firebase Functions or the Firebase Admin SDK in a secure environment. The provided `setAdminRole` Cloud Function is a starting point.

4.  **Set up Cloud Functions (Optional but Recommended for Admin Role):**
    *   If you haven't already, initialize Firebase Functions in your project:
        ```bash
        firebase init functions
        ```
        (Choose JavaScript/TypeScript, install dependencies)
    *   Copy the `setAdminRole` function code into `functions/index.js`.
    *   Deploy the function:
        ```bash
        firebase deploy --only functions
        ```

### Running the Development Server

```bash
npm run dev
# or
# yarn dev
```

Open [http://localhost:9004](http://localhost:9004) (or your specified port) in your browser.

## Building for Production

```bash
npm run build
# or
# yarn build
```

This will create an optimized production build in the `.next` directory.

## Deployment

You can deploy this Next.js application to various platforms. Here are two common options:

### Option 1: Vercel (Recommended for Next.js)

1.  **Push to Git:** Ensure your code is pushed to a Git repository (GitHub, GitLab, Bitbucket).
2.  **Import Project:** Sign up or log in to [Vercel](https://vercel.com) and import your Git repository.
3.  **Configure Environment Variables:** Add your Firebase environment variables (the ones starting with `NEXT_PUBLIC_`) in the Vercel project settings.
4.  **Deploy:** Vercel will automatically detect it's a Next.js project and deploy it. You'll get a live URL.

### Option 2: Firebase Hosting

1.  **Install Firebase CLI:** If you haven't already: `npm install -g firebase-tools`
2.  **Login:** `firebase login`
3.  **Initialize Hosting:** In your project root, run `firebase init hosting`.
    *   Select your Firebase project.
    *   Choose `.next` as your public directory (Vercel handles this differently, but for direct Firebase hosting, you point to the build output).
    *   Configure as a single-page app: **No**.
    *   Set up automatic builds and deploys with GitHub: **Yes** (Follow the prompts to connect your repository if desired).
4.  **Build:** `npm run build`
5.  **Deploy:** `firebase deploy --only hosting`

Refer to the [Firebase Hosting documentation](https://firebase.google.com/docs/hosting/frameworks/nextjs) for the most up-to-date instructions on deploying Next.js apps.

## Security Considerations

*   **Firestore Rules:** Crucial for protecting your database. Ensure only authorized users (especially admins) can write data.
*   **Firebase Functions:** Secure callable functions (like `setAdminRole`) properly, typically by checking `context.auth.token.admin === true`.
*   **Environment Variables:** Never commit sensitive keys (like API keys or service account keys) directly into your code. Use environment variables.
*   **Input Validation:** Always validate user input on the server-side (e.g., using Firebase Functions or server actions) before saving to the database.
```