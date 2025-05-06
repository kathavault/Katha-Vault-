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
  getIdTokenResult, // Import to get custom claims
} from 'firebase/auth';
import { auth } from '@/lib/firebase'; // Import auth from firebase setup

// Define the admin email directly in the hook for checking
const ADMIN_EMAIL = 'kathavault@gmail.com';

import { useToast } from './use-toast'; // Import useToast

// Define the user type structure we'll use in the app
export interface User {
  id: string;
  email: string | null;
  name?: string | null;
  avatarUrl?: string | null;
  emailVerified: boolean; // Add email verification status
  isAdmin?: boolean; // Add isAdmin flag based on custom claims
}

// Define the hook
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Start loading
  // WARNING: The OTP verification flow below is a SIMULATION and NOT secure for production.
  // It should be replaced with a proper multi-factor authentication system.
  const [isVerifyingAdminOtp, setIsVerifyingAdminOtp] = useState<boolean>(false); // Track *simulated* admin OTP state
  const { toast } = useToast();

  // Effect to listen for Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      setIsLoading(true); // Set loading true whenever auth state might change
      if (firebaseUser) {
        // User is signed in
        let adminStatus = false;
        try {
          // Check for admin custom claim
          const idTokenResult = await firebaseUser.getIdTokenResult(true); // Force refresh token
          adminStatus = !!idTokenResult.claims.admin; // Check if admin claim exists and is true
          console.log("Admin claim found:", adminStatus); // Log for debugging
        } catch (error) {
            console.error("Error fetching custom claims:", error);
            // Fallback check: Check if the email matches the hardcoded admin email
            // This provides a secondary way to identify the admin if claims fail/aren't set.
            if (firebaseUser.email === ADMIN_EMAIL) {
                console.log("Admin email matched as fallback.");
                adminStatus = true;
            } else {
                adminStatus = false;
            }
        }

        const appUser: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName,
          avatarUrl: firebaseUser.photoURL,
          emailVerified: firebaseUser.emailVerified, // Get verification status
          isAdmin: adminStatus, // Set based on custom claim or email fallback
        };
        setUser(appUser);
        setIsAdmin(adminStatus);

        // Trigger simulated OTP step ONLY if the user is confirmed as admin
        // AND hasn't completed the simulated OTP step yet in this session.
        // IMPORTANT: This is still a simulation. Real MFA is needed. We use adminStatus which
        // now considers both claims and the hardcoded email as a fallback.

        // Let's simplify: If admin logs in (claim verified or email matches), trigger OTP simulation.
        // Reset OTP state on user change.
        setIsVerifyingAdminOtp(adminStatus); // Trigger OTP if admin claim is true or email matches

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

      // Check for admin custom claim after login
       let adminStatus = false;
       try {
           const idTokenResult = await firebaseUser.getIdTokenResult(true); // Force refresh
           adminStatus = !!idTokenResult.claims.admin;
       } catch (claimError) {
           console.error("Error fetching claims on login:", claimError);
           // Fallback check: Check if the email matches the hardcoded admin email
           if (firebaseUser.email === ADMIN_EMAIL) {
               console.log("Admin email matched as fallback during login.");
               adminStatus = true;
           }
       }

      // Check if email is verified (unless it's an admin logging in)
      if (!firebaseUser.emailVerified && !adminStatus) {
        await signOut(auth); // Log out non-admin user if email not verified
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
      setIsAdmin(adminStatus); // Set admin status immediately for conditional logic

      if (adminStatus) {
        // Admin flow: Requires simulated OTP after password login
        // WARNING: This OTP flow is simulated and NOT secure for production.
        setIsVerifyingAdminOtp(true); // Trigger simulated OTP step
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
        isAdmin: adminStatus,
      };
      // Let onAuthStateChanged handle setting the final user state.
      // Return user object for immediate use if needed, but rely on context for consistency.
      return appUser;
    } catch (error: any) {
      console.error("Email login error:", error);
      let description = "Login failed. Please check your credentials.";
       if (error.code === AuthErrorCodes.INVALID_LOGIN_CREDENTIALS ||
           error.code === 'auth/invalid-credential' // Newer SDK version code
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
      // State updated by onAuthStateChanged, which will check claims
      setIsLoading(false);
      const appUser: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email,
        name: firebaseUser.displayName,
        avatarUrl: firebaseUser.photoURL,
        emailVerified: firebaseUser.emailVerified, // Google accounts are usually verified
        // isAdmin will be set by onAuthStateChanged after checking claims
      };
      setIsVerifyingAdminOtp(false); // Social logins bypass simulated OTP for now

      toast({ title: "Login Successful", description: `Welcome, ${appUser.name || 'User'}!` });
      return appUser; // Let onAuthStateChanged handle setting context state
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
      // State updated by onAuthStateChanged, which will check claims
      setIsLoading(false);
      const appUser: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email,
        name: firebaseUser.displayName,
        avatarUrl: firebaseUser.photoURL,
        emailVerified: true, // Assume verified for simplicity
        // isAdmin will be set by onAuthStateChanged after checking claims
      };
      setIsVerifyingAdminOtp(false); // Social logins bypass simulated OTP for now

      toast({ title: "Login Successful", description: `Welcome, ${appUser.name || 'User'}!` });
      return appUser; // Let onAuthStateChanged handle setting context state
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

  // Simulate OTP verification
  // WARNING: THIS IS A SIMULATION AND NOT SECURE FOR PRODUCTION.
  // It only proceeds if the user has already been identified as admin via custom claims.
  const verifyAdminOtp = useCallback(async (phoneOtp: string, emailOtp: string): Promise<boolean> => {
    if (!user || !isAdmin) { // Check claim-based or email-fallback isAdmin status
      toast({ title: "Error", description: "Admin user not properly logged in.", variant: "destructive" });
      return false;
    }
    setIsLoading(true);
    return new Promise((resolve) => {
      setTimeout(() => {
         // Simulate checking hardcoded OTPs for demonstration ONLY
         const correctPhoneOtp = "123456"; // Example OTP for phone 9756745653
         const correctEmailOtp = "654321"; // Example OTP for emails superworth00@gmail.com/rajputkritika87555@gmail.com
         const success = phoneOtp === correctPhoneOtp && emailOtp === correctEmailOtp;

        setIsLoading(false);
        if (success) {
          console.log("Simulated Admin OTP verification successful.");
          setIsVerifyingAdminOtp(false); // Mark OTP verification as complete for this session
          toast({ title: "Admin Verification Successful", description: "Welcome, Admin!" });
          resolve(true);
        } else {
          console.log("Simulated Admin OTP verification failed.");
          toast({ title: "OTP Verification Failed", description: "Incorrect OTPs provided. Please try again.", variant: "destructive" });
          // Don't log out, let them retry OTP on the OTP page.
          // OTP state remains true.
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
    } catch (error: any) {
      console.error("Logout error:", error);
      toast({ title: "Logout Failed", description: error.message || "Could not log out.", variant: "destructive" });
    } finally {
      setIsLoading(false); // Ensure loading state is reset
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

// NOTE: The admin check now relies on Firebase Custom Claims primarily,
// with a fallback to checking the hardcoded email address.
// You still need to set the 'admin: true' custom claim on the admin user's account
// (e.g., using Firebase Functions or the Firebase Admin SDK in a secure environment).
// The OTP verification remains a simulation and is insecure.
