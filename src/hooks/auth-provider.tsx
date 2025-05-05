// src/hooks/auth-provider.tsx
'use client';

import React, { createContext, useContext, Suspense } from 'react'; // Added Suspense
import { useAuth } from './use-auth'; // Import the actual hook implementation
import { Loader2 } from 'lucide-react'; // Added Loader2

// Define the shape of the context data
type AuthContextType = ReturnType<typeof useAuth>;

// Create the context with a default value (null or a placeholder)
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create the provider component
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const auth = useAuth(); // Get the auth state and functions

  // Optional: Add a suspense boundary here if children heavily rely on auth immediately
  // Although the internal isLoading check in consuming components is usually sufficient.
  return (
    <AuthContext.Provider value={auth}>
       {/* Basic fallback during initial context setup, though useAuth handles its own loading */}
       <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
           {children}
       </Suspense>
    </AuthContext.Provider>
  );
};

// Custom hook to consume the context easily
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

// Re-export useAuth as useAuthContext if preferred, or keep both
// export { useAuth as useAuthContext };
