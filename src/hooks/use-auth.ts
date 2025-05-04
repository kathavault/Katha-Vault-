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
  sendEmailVerification, // Import for email verification
  AuthErrorCodes, // Import error codes
  applyActionCode, // For email verification link handling
} from 'firebase/auth';
import { auth } from '@/lib/firebase'; // Import auth from firebase setup
import { useToast } from './use-toast'; // Import useToast

// Define the user type structure we'll use in the app
export interface User {
  id: string;
  email: string | null;
  name?: string | null;
  avatarUrl?: string | null;
  emailVerified: boolean; // Add email verification status
}

// Define the simulated admin email
// WARNING: Hardcoding admin email is NOT secure for production. Use roles/custom claims.
export const ADMIN_EMAIL = "kathavault@gmail.com";

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
          emailVerified: firebaseUser.emailVerified, // Get verification status
        };
        setUser(appUser);
        // WARNING: Checking email directly for admin role is NOT secure for production.
        // Use Firebase custom claims or a dedicated role management system.
        const isAdminUser = appUser.email === ADMIN_EMAIL;
        setIsAdmin(isAdminUser);
        // If admin logs in, don't immediately assume full access, wait for OTP step
        // Also ensure non-admins don't get stuck in OTP state
        // WARNING: Tying admin OTP to email verification status is a placeholder, NOT a secure OTP mechanism.
        setIsVerifyingAdminOtp(isAdminUser && !appUser.emailVerified);
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

      // Send email verification
      await sendEmailVerification(firebaseUser);
      toast({
        title: "Verification Email Sent",
        description: "Please check your email to verify your account before logging in.",
        duration: 6000, // Give more time to read
      });

      // User needs to verify email before they are fully logged in by our app logic
      // onAuthStateChanged will initially set the user, but we might log them out
      // immediately if emailVerified is false, depending on app requirements.
      // For now, just let them know verification is needed.

      // Sign the user out immediately after signup until they verify
      await signOut(auth);

      setIsLoading(false);
      return null; // Don't return user yet, they need to verify and log in
    } catch (error: any) {
      console.error("Email signup error:", error);
      let description = "Could not create account.";
      if (error.code === AuthErrorCodes.EMAIL_EXISTS) {
        description = "This email address is already in use. Please try logging in.";
      } else if (error.code === AuthErrorCodes.WEAK_PASSWORD) {
        description = "Password is too weak. Please choose a stronger password.";
      } else if (error.message) {
        description = error.message;
      }
      toast({ title: "Signup Failed", description, variant: "destructive" });
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

      // Check if email is verified
      if (!firebaseUser.emailVerified && email !== ADMIN_EMAIL) {
        await signOut(auth); // Log out user if email not verified (except admin)
        toast({
          title: "Email Not Verified",
          description: "Please verify your email address before logging in. Check your inbox for the verification link.",
          variant: "destructive",
          duration: 6000,
        });
        setIsLoading(false);
        return null;
      }

      // Don't set user state here, onAuthStateChanged handles it
      // WARNING: Checking email directly for admin role is NOT secure for production.
      // Use Firebase custom claims or a dedicated role management system.
      const isAdminUser = firebaseUser.email === ADMIN_EMAIL;
      setIsAdmin(isAdminUser); // Set admin status immediately for conditional logic

      if (isAdminUser) {
        // Admin flow: Requires OTP after password login
        // WARNING: This OTP flow is simulated and NOT secure for production.
        setIsVerifyingAdminOtp(true);
        // Redirect handled in LoginPage based on isAdmin and isVerifyingAdminOtp
      } else {
        // Regular user flow
        setIsVerifyingAdminOtp(false);
        toast({ title: "Login Successful", description: "Welcome back!" });
      }

      setIsLoading(false);
      const appUser: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email,
        name: firebaseUser.displayName,
        avatarUrl: firebaseUser.photoURL,
        emailVerified: firebaseUser.emailVerified,
      };
      return appUser; // Return for immediate use if needed
    } catch (error: any) {
      console.error("Email login error:", error);
      let description = "Login failed. Please check your credentials.";
      if (error.code === AuthErrorCodes.USER_DELETED || // More specific errors
          error.code === AuthErrorCodes.USER_DISABLED ||
          error.code === AuthErrorCodes.INVALID_EMAIL ||
          error.code === AuthErrorCodes.INVALID_PASSWORD ||
          error.code === AuthErrorCodes.INVALID_LOGIN_CREDENTIALS || // Common for wrong email/password
          error.code === 'auth/user-not-found' || // Legacy codes just in case
          error.code === 'auth/wrong-password'
      ) {
        description = "Invalid email or password.";
      } else if (error.message) {
          description = error.message;
      }
      toast({ title: "Login Failed", description, variant: "destructive" });
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
        emailVerified: firebaseUser.emailVerified, // Google accounts are usually verified
      };
      // Check if admin (though unlikely via Google unless it matches ADMIN_EMAIL)
      const isAdminUser = appUser.email === ADMIN_EMAIL;
      setIsAdmin(isAdminUser);
      setIsVerifyingAdminOtp(false); // Assume Google users don't need OTP

      toast({ title: "Login Successful", description: `Welcome, ${appUser.name || 'User'}!` });
      return appUser;
    } catch (error: any) {
      console.error("Google sign-in error:", error);
      let description = "Could not sign in with Google.";
      if (error.code === AuthErrorCodes.ACCOUNT_EXISTS_WITH_DIFFERENT_CREDENTIAL) {
        description = "An account already exists with this email using a different sign-in method.";
      } else if (error.code === AuthErrorCodes.POPUP_CLOSED_BY_USER) {
        description = "Sign-in cancelled."; // Don't show as destructive
        toast({ title: "Sign-in Cancelled", description});
        setIsLoading(false);
        return null;
      } else if (error.message) {
        description = error.message;
      }
      toast({ title: "Google Sign-In Failed", description, variant: "destructive" });
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
        // Facebook login might require email verification step if email not verified by FB
        // For simplicity, we'll trust FB for now, but production might need checks
        emailVerified: true,
      };
       // Check if admin
       const isAdminUser = appUser.email === ADMIN_EMAIL;
       setIsAdmin(isAdminUser);
       setIsVerifyingAdminOtp(false); // Assume FB users don't need OTP

      toast({ title: "Login Successful", description: `Welcome, ${appUser.name || 'User'}!` });
      return appUser;
    } catch (error: any) {
      console.error("Facebook sign-in error:", error);
      let description = "Could not sign in with Facebook.";
      if (error.code === AuthErrorCodes.ACCOUNT_EXISTS_WITH_DIFFERENT_CREDENTIAL) {
        description = "An account already exists with this email using a different sign-in method.";
      } else if (error.code === AuthErrorCodes.POPUP_CLOSED_BY_USER) {
         description = "Sign-in cancelled.";
         toast({ title: "Sign-in Cancelled", description});
         setIsLoading(false);
         return null;
      } else if (error.message) {
         description = error.message;
      }
      toast({ title: "Facebook Sign-In Failed", description, variant: "destructive" });
      setIsLoading(false);
      return null;
    }
  };

  // Simulate OTP verification (only checks if admin email was used initially)
  // WARNING: THIS IS A SIMULATION AND NOT SECURE FOR PRODUCTION.
  // A real OTP system requires a backend to generate, send (via SMS/Email), and verify codes securely.
  // Do NOT use this implementation in a real application.
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
        // For now, just check non-empty OTPs for the logged-in admin.
        // Correct OTPs (for simulation): phone '9756745653' -> '123456', email 'superworth00@gmail.com' -> '654321'
        // --- --- --- ---
         const correctPhoneOtp = "123456"; // Example correct phone OTP
         const correctEmailOtp = "654321"; // Example correct email OTP

         const success = phoneOtp === correctPhoneOtp && emailOtp === correctEmailOtp;

        setIsLoading(false);
        if (success) {
          console.log("Simulated Admin OTP verification successful.");
          setIsVerifyingAdminOtp(false); // Mark OTP verification as complete
          toast({ title: "Admin Verification Successful", description: "Welcome, Admin!" });
          resolve(true);
        } else {
          console.log("Simulated Admin OTP verification failed.");
          toast({ title: "OTP Verification Failed", description: "Incorrect OTPs provided. Please try again.", variant: "destructive" });
          // Don't log out, let them retry OTP on the OTP page.
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

   // Function to handle email verification action code
   const handleVerifyEmail = async (actionCode: string): Promise<boolean> => {
       setIsLoading(true);
       try {
           await applyActionCode(auth, actionCode);
           toast({ title: "Email Verified", description: "Your email address has been successfully verified. You can now log in." });
           // Optionally, force refresh the user state if needed, though onAuthStateChanged might handle it.
           // await auth.currentUser?.reload();
           setIsLoading(false);
           return true;
       } catch (error: any) {
           console.error("Email verification error:", error);
           toast({ title: "Email Verification Failed", description: error.message || "Invalid or expired verification link.", variant: "destructive" });
           setIsLoading(false);
           return false;
       }
   };

  return {
    user,
    isAdmin,
    isLoading,
    isVerifyingAdminOtp, // Expose this state for routing logic
    signupWithEmail,
    loginWithEmail,
    loginWithGoogle,
    loginWithFacebook,
    verifyAdminOtp, // Expose the admin OTP function
    logout,
    handleVerifyEmail, // Expose email verification handler
  };
}

// NOTE: A real OTP system requires a backend to generate/send/verify codes.
// The current 'verifyAdminOtp' is a placeholder simulation.
// Email verification flow is added, users need to click the link in their email.
// WARNING: Checking email for admin role is insecure. Use custom claims or a backend role system.
