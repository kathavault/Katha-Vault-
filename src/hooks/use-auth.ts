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
        let adminStatus = false;
        console.log("onAuthStateChanged: User detected:", firebaseUser.email);

        try {
          const idTokenResult = await firebaseUser.getIdTokenResult(true); // Force refresh token
          if (idTokenResult.claims.admin === true) {
            adminStatus = true;
            console.log("onAuthStateChanged: Admin claim is true.");
          } else {
            console.log("onAuthStateChanged: Admin claim not explicitly true or not present. Value:", idTokenResult.claims.admin);
            // If claim is not explicitly true, try email fallback
            if (firebaseUser.email === ADMIN_EMAIL) {
              console.log("onAuthStateChanged: Admin email matched as fallback because claim was not true.");
              adminStatus = true;
            }
          }
        } catch (error) {
          console.error("onAuthStateChanged: Error fetching custom claims:", error);
          // Fallback to email check if claims fetch failed
          if (firebaseUser.email === ADMIN_EMAIL) {
            console.log("onAuthStateChanged: Admin email matched as fallback after claim fetch error.");
            adminStatus = true;
          }
        }

        const appUser: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName,
          avatarUrl: firebaseUser.photoURL,
          emailVerified: firebaseUser.emailVerified, // Get verification status
          isAdmin: adminStatus,
        };
        setUser(appUser);
        setIsAdmin(adminStatus); // This is the key state for the header
        console.log("onAuthStateChanged: Final admin status for", firebaseUser.email, ":", adminStatus, "App user object:", appUser);


        if (adminStatus) {
          setIsVerifyingAdminOtp(true);
          console.log("onAuthStateChanged: Admin identified, OTP verification step initiated.");
        } else {
          setIsVerifyingAdminOtp(false);
        }

      } else {
        // User is signed out
        console.log("onAuthStateChanged: No user detected (signed out).");
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
      console.log("loginWithEmail: User signed in:", firebaseUser.email);

      let adminStatus = false;
      try {
        const idTokenResult = await firebaseUser.getIdTokenResult(true); // Force refresh
        if (idTokenResult.claims.admin === true) {
          adminStatus = true;
          console.log("loginWithEmail: Admin claim is true.");
        } else {
          console.log("loginWithEmail: Admin claim not true or not present. Value:", idTokenResult.claims.admin);
        }
      } catch (claimError) {
        console.error("loginWithEmail: Error fetching claims on login:", claimError);
      }

      // Fallback if claim didn't confirm admin
      if (!adminStatus && firebaseUser.email === ADMIN_EMAIL) {
        console.log("loginWithEmail: Admin email matched as fallback.");
        adminStatus = true;
      }
      console.log("loginWithEmail: Determined adminStatus:", adminStatus);


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

      // Do not set user/isAdmin state directly here, onAuthStateChanged is the source of truth.
      // However, we need to set isVerifyingAdminOtp based on this immediate check.
      if (adminStatus) {
        setIsVerifyingAdminOtp(true);
        console.log("loginWithEmail: Admin identified, OTP step will be required.");
        // Actual user state (setUser, setIsAdmin) will be handled by onAuthStateChanged
      } else {
        setIsVerifyingAdminOtp(false);
        toast({ title: "Login Successful", description: "Welcome back!" });
      }

      setIsLoading(false);
      // Return a temporary user object, but rely on onAuthStateChanged for context update
      const appUser: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email,
        name: firebaseUser.displayName,
        avatarUrl: firebaseUser.photoURL,
        emailVerified: firebaseUser.emailVerified,
        isAdmin: adminStatus, // Use locally determined adminStatus for immediate return
      };
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
      // For social logins, we assume they don't need the simulated OTP step for admin
      // unless onAuthStateChanged later confirms admin AND isVerifyingAdminOtp is set there.
      // For simplicity, we set it to false here.
      setIsVerifyingAdminOtp(false);

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
      setIsVerifyingAdminOtp(false);

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
  const verifyAdminOtp = useCallback(async (phoneOtp: string, emailOtp: string): Promise<boolean> => {
    // This check ensures that we only proceed if onAuthStateChanged has ALREADY confirmed admin status
    if (!user || !isAdmin) {
      toast({ title: "Error", description: "Admin status not confirmed. Cannot verify OTP.", variant: "destructive" });
      return false;
    }
    setIsLoading(true); // Should be a different loading state, e.g., isSubmittingOtp
    return new Promise((resolve) => {
      setTimeout(() => {
         const correctPhoneOtp = "123456";
         const correctEmailOtp = "654321";
         const success = phoneOtp === correctPhoneOtp && emailOtp === correctEmailOtp;

        setIsLoading(false);
        if (success) {
          console.log("Simulated Admin OTP verification successful.");
          setIsVerifyingAdminOtp(false); // Mark OTP verification as complete for this "session"
          toast({ title: "Admin Verification Successful", description: "Welcome, Admin!" });
          resolve(true);
        } else {
          console.log("Simulated Admin OTP verification failed.");
          toast({ title: "OTP Verification Failed", description: "Incorrect OTPs provided. Please try again.", variant: "destructive" });
          // isVerifyingAdminOtp remains true, so user stays on OTP page
          resolve(false);
        }
      }, 700);
    });
  }, [user, isAdmin, toast]);


  // Logout function
  const logout = async () => {
    setIsLoading(true);
    try {
      await signOut(auth);
      // State updates handled by onAuthStateChanged, which will set user to null, isAdmin to false, isVerifyingAdminOtp to false.
      toast({ title: "Logged Out", description: "You have been successfully logged out." });
    } catch (error: any) {
      console.error("Logout error:", error);
      toast({ title: "Logout Failed", description: error.message || "Could not log out.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

   // Function to handle email verification action code
   const handleVerifyEmail = async (actionCode: string): Promise<boolean> => {
       setIsLoading(true);
       try {
           await applyActionCode(auth, actionCode);
           toast({ title: "Email Verified", description: "Your email address has been successfully verified. You can now log in." });
           // If a user was signed in (e.g. during a flow where they verify immediately after signup without logout),
           // their emailVerified status might need a reload.
           if (auth.currentUser) {
               await auth.currentUser.reload();
               // Manually update user state if needed, though onAuthStateChanged should ideally catch this.
               const refreshedFirebaseUser = auth.currentUser;
               if (refreshedFirebaseUser) {
                   setUser(prevUser => prevUser ? {...prevUser, emailVerified: refreshedFirebaseUser.emailVerified} : null);
               }
           }
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
    isVerifyingAdminOtp,
    signupWithEmail,
    loginWithEmail,
    loginWithGoogle,
    loginWithFacebook,
    verifyAdminOtp,
    logout,
    handleVerifyEmail,
  };
}
