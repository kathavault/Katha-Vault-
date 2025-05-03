// src/hooks/use-auth.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider, // Import FacebookAuthProvider
  // sendEmailVerification, // Optional: for email verification flow
} from 'firebase/auth';
import { auth } from '@/lib/firebase'; // Import auth from firebase setup
import { useToast } from './use-toast'; // Import useToast

// Define the user type structure we'll use in the app
interface User {
  id: string;
  email: string | null;
  name?: string | null;
  avatarUrl?: string | null;
}

// Define the simulated admin email
const ADMIN_EMAIL = "kathavault@gmail.com";

// Define the hook
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Start loading
  const [isVerifyingAdminOtp, setIsVerifyingAdminOtp] = useState<boolean>(false); // Track admin OTP state
  const { toast } = useToast();

  // Effect to listen for Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // User is signed in
        const appUser: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName,
          avatarUrl: firebaseUser.photoURL,
        };
        setUser(appUser);
        const isAdminUser = appUser.email === ADMIN_EMAIL;
        setIsAdmin(isAdminUser);
        // If admin logs in, don't immediately assume full access, wait for OTP step
        if (!isAdminUser) {
            setIsVerifyingAdminOtp(false);
        }
      } else {
        // User is signed out
        setUser(null);
        setIsAdmin(false);
        setIsVerifyingAdminOtp(false);
      }
      setIsLoading(false); // Auth state determined
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []); // Empty dependency array ensures this runs only once on mount

  // Signup with Email and Password
  const signupWithEmail = async (email: string, password: string): Promise<User | null> => {
      setIsLoading(true);
      try {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const firebaseUser = userCredential.user;
          // Optional: Send email verification
          // await sendEmailVerification(firebaseUser);
          // toast({ title: "Verification Email Sent", description: "Please check your email to verify your account." });

          const appUser: User = {
              id: firebaseUser.uid,
              email: firebaseUser.email,
              name: firebaseUser.displayName, // Might be null initially
              avatarUrl: firebaseUser.photoURL,
          };
          // Don't set user state here, onAuthStateChanged will handle it
          setIsLoading(false);
          toast({ title: "Signup Successful", description: "Welcome! You can now log in." });
          return appUser; // Return user for potential immediate use, though state update is async
      } catch (error: any) {
          console.error("Email signup error:", error);
          toast({ title: "Signup Failed", description: error.message || "Could not create account.", variant: "destructive" });
          setIsLoading(false);
          return null;
      }
  };

  // Login with Email and Password
  const loginWithEmail = async (email: string, password: string): Promise<User | null> => {
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
       // Don't set user state here, onAuthStateChanged handles it
       const isAdminUser = firebaseUser.email === ADMIN_EMAIL;
       setIsAdmin(isAdminUser); // Set admin status immediately for conditional logic
        if (isAdminUser) {
            setIsVerifyingAdminOtp(true); // Mark that admin needs OTP verification next
            // Redirect handled in LoginPage based on isAdmin and isVerifyingAdminOtp
        } else {
            setIsVerifyingAdminOtp(false);
        }
        setIsLoading(false);

       const appUser: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName,
          avatarUrl: firebaseUser.photoURL,
        };
       return appUser; // Return for immediate use if needed
    } catch (error: any) {
      console.error("Email login error:", error);
      toast({ title: "Login Failed", description: error.message || "Invalid email or password.", variant: "destructive" });
      setIsLoading(false);
      return null;
    }
  };

   // Login/Signup with Google
   const loginWithGoogle = async (): Promise<User | null> => {
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;
       // State updated by onAuthStateChanged
       setIsLoading(false);
       const appUser: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email,
        name: firebaseUser.displayName,
        avatarUrl: firebaseUser.photoURL,
      };
      toast({ title: "Login Successful", description: `Welcome, ${appUser.name || 'User'}!` });
      return appUser;
    } catch (error: any) {
      console.error("Google sign-in error:", error);
      // Handle specific errors like popup closed by user
      if (error.code !== 'auth/popup-closed-by-user') {
         toast({ title: "Google Sign-In Failed", description: error.message || "Could not sign in with Google.", variant: "destructive" });
      }
      setIsLoading(false);
      return null;
    }
  };

  // Login/Signup with Facebook
   const loginWithFacebook = async (): Promise<User | null> => {
    setIsLoading(true);
    const provider = new FacebookAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;
      // State updated by onAuthStateChanged
      setIsLoading(false);
       const appUser: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email,
        name: firebaseUser.displayName,
        avatarUrl: firebaseUser.photoURL,
      };
      toast({ title: "Login Successful", description: `Welcome, ${appUser.name || 'User'}!` });
      return appUser;
    } catch (error: any) {
       console.error("Facebook sign-in error:", error);
       // Handle specific errors
        if (error.code === 'auth/account-exists-with-different-credential') {
           toast({ title: "Facebook Sign-In Failed", description: "An account already exists with the same email address using a different sign-in method.", variant: "destructive" });
        } else if (error.code !== 'auth/popup-closed-by-user') {
            toast({ title: "Facebook Sign-In Failed", description: error.message || "Could not sign in with Facebook.", variant: "destructive" });
       }
      setIsLoading(false);
      return null;
    }
  };

  // Simulate OTP verification (only checks if admin email was used initially)
  // This function is now primarily for the *admin* flow after they've logged in via Firebase.
  const verifyAdminOtp = useCallback(async (phoneOtp: string, emailOtp: string): Promise<boolean> => {
    if (!user || !isAdmin) {
        toast({ title: "Error", description: "Admin user not properly logged in.", variant: "destructive" });
        return false;
    }
    setIsLoading(true);
    return new Promise((resolve) => {
        setTimeout(() => {
            // --- SIMULATION NOTE ---
            // This is still a simulation. A real implementation would involve
            // a backend service to validate OTPs sent via SMS/Email.
            // Here, we just check if non-empty OTPs were provided for the logged-in admin.
            // --- --- --- ---
            const success = phoneOtp.length >= 4 && emailOtp.length >= 4; // Basic check

            setIsLoading(false);
            if(success){
                console.log("Simulated Admin OTP verification successful.");
                setIsVerifyingAdminOtp(false); // Mark OTP verification as complete
                 toast({ title: "Admin Verification Successful", description: "Welcome, Admin!" });
                resolve(true);
            } else {
                console.log("Simulated Admin OTP verification failed.");
                toast({ title: "OTP Verification Failed", description: "Incorrect OTPs provided.", variant: "destructive" });
                // Don't necessarily log out, let them retry OTP on the OTP page.
                resolve(false);
            }
        }, 700); // Simulate validation latency
    });
  }, [user, isAdmin, toast]);


  // Logout function
  const logout = async () => {
    setIsLoading(true);
    try {
      await signOut(auth);
      // State updates handled by onAuthStateChanged
      toast({ title: "Logged Out", description: "You have been successfully logged out." });
       // No need to manually set user/admin state here
    } catch (error: any) {
      console.error("Logout error:", error);
      toast({ title: "Logout Failed", description: error.message || "Could not log out.", variant: "destructive" });
    } finally {
      setIsLoading(false); // Ensure loading state is reset even if logout fails
    }
  };

  return {
    user,
    isAdmin,
    isLoading,
    isVerifyingAdminOtp, // Expose this state for routing logic in login/otp pages
    signupWithEmail,
    loginWithEmail,
    loginWithGoogle,
    loginWithFacebook,
    verifyAdminOtp, // Expose the admin OTP function
    logout,
  };
}
