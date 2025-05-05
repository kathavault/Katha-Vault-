// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from "firebase/auth"; // Import getAuth
import { getStorage } from "firebase/storage"; // Import getStorage

// Your web app's Firebase configuration
// Use environment variables for sensitive data
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDT4-R0H8uydAqzrTsHfMKLXQ59p7u67Ho",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "katha-vault-novel.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "katha-vault-novel",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "katha-vault-novel.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1050410197456",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:1050410197456:web:3add67c05dac9fe2c419d5",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID // Optional
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Export Firestore database instance
export const db = getFirestore(app);

// Export Firebase Authentication instance
export const auth = getAuth(app);

// Export Firebase Storage instance
export const storage = getStorage(app);
