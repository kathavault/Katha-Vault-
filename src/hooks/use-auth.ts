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
  FacebookAuthProvider,
  sendEmailVerification,
  AuthErrorCodes,
  applyActionCode,
  getIdTokenResult,
  sendPasswordResetEmail, // For password reset
  reauthenticateWithCredential, // For re-authentication
  EmailAuthProvider,       // For re-authentication credential
  deleteUser,              // For account deletion
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { createUserProfileDocument } from '@/lib/userService'; // Import profile creation

const ADMIN_EMAIL = 'kathavault@gmail.com';

import { useToast } from './use-toast';

export interface User {
  id: string;
  email: string | null;
  name?: string | null;
  avatarUrl?: string | null;
  emailVerified: boolean;
  isAdmin?: boolean;
}

// Function to send password reset email (can be called from settings)
export const sendPasswordReset = async (email: string): Promise<void> => {
    if (!email) {
        throw new Error("Email is required to send password reset.");
    }
    await sendPasswordResetEmail(auth, email);
};


export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isVerifyingAdminOtp, setIsVerifyingAdminOtp] = useState<boolean>(false);
  const { toast } = useToast();

   // Function to update the user state locally (e.g., after profile update)
   const updateUserContext = useCallback((updatedUserData: Partial<User>) => {
       setUser(prevUser => prevUser ? { ...prevUser, ...updatedUserData } : null);
       // Update admin status if relevant field changed
       if (updatedUserData.isAdmin !== undefined) {
           setIsAdmin(updatedUserData.isAdmin);
       }
   }, []);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      setIsLoading(true);
      if (firebaseUser) {
        let adminStatus = false;
        try {
          const idTokenResult = await firebaseUser.getIdTokenResult(true);
          adminStatus = idTokenResult.claims.admin === true;
           // Fallback check (only if claim is NOT explicitly false)
          if (!adminStatus && firebaseUser.email === ADMIN_EMAIL && idTokenResult.claims.admin !== false) {
              console.log("Admin email matched, using as fallback since admin claim wasn't true.");
              adminStatus = true; // Consider admin based on email if claim isn't set or fetch failed but email matches
          }
        } catch (error) {
          console.error("Error fetching custom claims:", error);
           // Fallback check if claims fail
           if (firebaseUser.email === ADMIN_EMAIL) {
               console.log("Admin email matched, using as fallback after claim fetch error.");
               adminStatus = true;
           }
        }

        const appUser: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName,
          avatarUrl: firebaseUser.photoURL,
          emailVerified: firebaseUser.emailVerified,
          isAdmin: adminStatus,
        };
        setUser(appUser);
        setIsAdmin(adminStatus);

        if (adminStatus && !isVerifyingAdminOtp) { // Only set OTP needed if not already verified in this session
           // Check if OTP was *just* verified - don't ask again immediately
           // This simple check might need refinement depending on exact flow
           // For now, if admin logs in, assume OTP is needed unless already passed
           console.log("Admin identified, setting isVerifyingAdminOtp = true");
           setIsVerifyingAdminOtp(true);
        } else if (!adminStatus) {
            setIsVerifyingAdminOtp(false); // Non-admins don't need OTP
        }
        // If admin AND already verified OTP (isVerifyingAdminOtp is false), do nothing

      } else {
        setUser(null);
        setIsAdmin(false);
        setIsVerifyingAdminOtp(false);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [isVerifyingAdminOtp]); // Re-run if OTP status changes

  const signupWithEmail = async (email: string, password: string): Promise<User | null> => {
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Create user profile document in Firestore
      await createUserProfileDocument(firebaseUser.uid, firebaseUser.email, firebaseUser.displayName);

      await sendEmailVerification(firebaseUser);
      toast({
        title: "Verification Email Sent",
        description: "Please check your email to verify your account before logging in.",
        duration: 6000,
      });
      await signOut(auth);
      setIsLoading(false);
      return null;
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

  const loginWithEmail = async (email: string, password: string): Promise<User | null> => {
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      let adminStatus = false;
      try {
        const idTokenResult = await firebaseUser.getIdTokenResult(true);
        adminStatus = idTokenResult.claims.admin === true;
         if (!adminStatus && firebaseUser.email === ADMIN_EMAIL && idTokenResult.claims.admin !== false) {
             adminStatus = true;
         }
      } catch (claimError) {
         if (firebaseUser.email === ADMIN_EMAIL) {
             adminStatus = true;
         }
      }

      if (!firebaseUser.emailVerified && !adminStatus) {
        await signOut(auth);
        toast({
          title: "Email Not Verified",
          description: "Please verify your email address before logging in. Check your inbox.",
          variant: "destructive",
          duration: 6000,
        });
        setIsLoading(false);
        return null;
      }

      if (adminStatus) {
        setIsVerifyingAdminOtp(true); // Trigger OTP flow for admin
      } else {
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
      return appUser; // Return user data, state update via onAuthStateChanged
    } catch (error: any) {
      console.error("Email login error:", error);
      let description = "Login failed. Please check your credentials.";
       if (error.code === AuthErrorCodes.INVALID_LOGIN_CREDENTIALS ||
           error.code === 'auth/invalid-credential' ||
           error.code === 'auth/wrong-password' || // Older SDK versions
           error.code === 'auth/user-not-found'
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

  const loginWithGoogle = async (): Promise<User | null> => {
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;
      setIsLoading(false);
      setIsVerifyingAdminOtp(false); // Social logins typically bypass OTP
      toast({ title: "Login Successful", description: `Welcome, ${firebaseUser.displayName || 'User'}!` });
      // User state will be set by onAuthStateChanged, which checks claims
       // Check if profile exists, create if not
       await createUserProfileDocument(firebaseUser.uid, firebaseUser.email, firebaseUser.displayName);
      return {
         id: firebaseUser.uid,
         email: firebaseUser.email,
         name: firebaseUser.displayName,
         avatarUrl: firebaseUser.photoURL,
         emailVerified: true, // Assume verified
         // isAdmin set by onAuthStateChanged
      };
    } catch (error: any) {
      handleAuthError(error, "Google");
      setIsLoading(false);
      return null;
    }
  };

  const loginWithFacebook = async (): Promise<User | null> => {
    setIsLoading(true);
    const provider = new FacebookAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;
      setIsLoading(false);
      setIsVerifyingAdminOtp(false); // Social logins bypass OTP
      toast({ title: "Login Successful", description: `Welcome, ${firebaseUser.displayName || 'User'}!` });
       // Check if profile exists, create if not
       await createUserProfileDocument(firebaseUser.uid, firebaseUser.email, firebaseUser.displayName);
       return {
         id: firebaseUser.uid,
         email: firebaseUser.email,
         name: firebaseUser.displayName,
         avatarUrl: firebaseUser.photoURL,
         emailVerified: true, // Assume verified
         // isAdmin set by onAuthStateChanged
      };
    } catch (error: any) {
      handleAuthError(error, "Facebook");
      setIsLoading(false);
      return null;
    }
  };

  // Helper for social auth errors
  const handleAuthError = (error: any, providerName: string) => {
      console.error(`${providerName} sign-in error:`, error);
      let description = `Could not sign in with ${providerName}.`;
      if (error.code === AuthErrorCodes.ACCOUNT_EXISTS_WITH_DIFFERENT_CREDENTIAL) {
          description = "An account already exists with this email using a different sign-in method.";
      } else if (error.code === AuthErrorCodes.POPUP_CLOSED_BY_USER) {
          description = "Sign-in cancelled.";
          toast({ title: "Sign-in Cancelled", description});
          return; // Don't show destructive toast for cancellation
      } else if (error.message) {
          description = error.message;
      }
      toast({ title: `${providerName} Sign-In Failed`, description, variant: "destructive" });
  };

  const verifyAdminOtp = useCallback(async (phoneOtp: string, emailOtp: string): Promise<boolean> => {
    if (!user || !isAdmin) {
      toast({ title: "Error", description: "Admin status not confirmed.", variant: "destructive" });
      return false;
    }
    setIsLoading(true);
    return new Promise((resolve) => {
      setTimeout(() => {
         // WARNING: Hardcoded OTPs - replace with secure backend verification
         const correctPhoneOtp = "123456"; // Replace with actual logic
         const correctEmailOtp = "654321"; // Replace with actual logic
         const success = phoneOtp === correctPhoneOtp && emailOtp === correctEmailOtp;
        setIsLoading(false);
        if (success) {
          setIsVerifyingAdminOtp(false); // Mark OTP as verified for this session
          toast({ title: "Admin Verification Successful", description: "Welcome, Admin!" });
          resolve(true);
        } else {
          toast({ title: "OTP Verification Failed", description: "Incorrect OTPs provided.", variant: "destructive" });
          resolve(false); // Keep isVerifyingAdminOtp true
        }
      }, 700);
    });
  }, [user, isAdmin, toast]);

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
      setIsLoading(false);
    }
  };

  const handleVerifyEmail = async (actionCode: string): Promise<boolean> => {
       setIsLoading(true);
       try {
           await applyActionCode(auth, actionCode);
           toast({ title: "Email Verified", description: "Your email address has been successfully verified. You can now log in." });
           if (auth.currentUser) {
               await auth.currentUser.reload();
               const refreshedFirebaseUser = auth.currentUser;
               if (refreshedFirebaseUser) {
                   // Use the updateUserContext function to update the state
                   updateUserContext({ emailVerified: refreshedFirebaseUser.emailVerified });
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

   // Function to re-authenticate user (needed for sensitive operations like delete)
   const reauthenticateUser = async (password: string): Promise<boolean> => {
       const currentUser = auth.currentUser;
       if (!currentUser || !currentUser.email) {
           toast({ title: "Error", description: "No authenticated user found.", variant: "destructive" });
           return false;
       }
       try {
           const credential = EmailAuthProvider.credential(currentUser.email, password);
           await reauthenticateWithCredential(currentUser, credential);
           return true; // Re-authentication successful
       } catch (error: any) {
           console.error("Re-authentication failed:", error);
           // Handle specific errors like wrong password
           if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
               toast({ title: "Authentication Failed", description: "Incorrect password.", variant: "destructive" });
           } else {
               toast({ title: "Authentication Error", description: "Could not re-authenticate.", variant: "destructive" });
           }
           return false; // Re-authentication failed
       }
   };

    // Function to delete the current user's account
    const deleteAccount = async (): Promise<void> => {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            throw new Error("No authenticated user found to delete.");
        }
        // Re-authentication should be performed *before* calling this function
        try {
            await deleteUser(currentUser);
            // Firestore data deletion should be handled separately, perhaps via Cloud Function trigger
            console.log("User account deleted successfully from Firebase Auth.");
            // State updates (user=null) handled by onAuthStateChanged
        } catch (error: any) {
            console.error("Error deleting user account:", error);
            throw new Error(error.message || "Failed to delete account.");
        }
    };


  return {
    user,
    isAdmin,
    isLoading,
    isVerifyingAdminOtp,
    updateUserContext, // Expose the update function
    signupWithEmail,
    loginWithEmail,
    loginWithGoogle,
    loginWithFacebook,
    verifyAdminOtp,
    logout,
    handleVerifyEmail,
    reauthenticateUser, // Expose re-authentication function
    deleteAccount,     // Expose delete function
  };
}

