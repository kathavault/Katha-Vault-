// src/hooks/auth-provider.tsx
'use client';

import React, { createContext, useContext } from 'react';
import { useAuth } from './use-auth'; // Import the actual hook implementation

// Define the shape of the context data
type AuthContextType = ReturnType<typeof useAuth>;

// Create the context with a default value (null or a placeholder)
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create the provider component
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const auth = useAuth(); // Get the auth state and functions

  return (
    <AuthContext.Provider value={auth}>
      {children}
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
