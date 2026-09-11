import React, { createContext, useContext, useState, useEffect } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import {
  UserDoc,
  UserRole,
  onAuthChange,
  signInUser,
  signOutUser,
  resetPassword as sendResetEmail,
  getUserProfile,
  getFriendlyAuthErrorMessage,
} from '../services/firebase';

export interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: UserDoc | null;
  role: UserRole;
  isAdmin: boolean;
  isOfficer: boolean;
  isStudent: boolean;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<UserDoc>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserDoc | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthChange((firebaseUser, profile) => {
      setUser(firebaseUser);
      setUserProfile(profile);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const clearError = () => setError(null);

  const signIn = async (email: string, password: string): Promise<UserDoc> => {
    try {
      setLoading(true);
      setError(null);
      const profile = await signInUser(email, password);
      setUserProfile(profile);
      return profile;
    } catch (err: unknown) {
      const fbError = err as { code?: string; message?: string };
      const friendlyMessage = fbError.code
        ? getFriendlyAuthErrorMessage(fbError.code)
        : fbError.message || 'Login failed.';
      setError(friendlyMessage);
      throw new Error(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      setLoading(true);
      await signOutUser();
      setUser(null);
      setUserProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await sendResetEmail(email);
    } catch (err: unknown) {
      const fbError = err as { code?: string; message?: string };
      const friendlyMessage = fbError.code
        ? getFriendlyAuthErrorMessage(fbError.code)
        : fbError.message || 'Password reset request failed.';
      setError(friendlyMessage);
      throw new Error(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async (): Promise<void> => {
    if (user) {
      const profile = await getUserProfile(user.uid);
      setUserProfile(profile);
    }
  };

  const role: UserRole = (userProfile?.role?.toLowerCase() as UserRole) || 'student';
  const isAdmin = role === 'admin';
  const isOfficer = role === 'officer' || isAdmin;
  const isStudent = role === 'student';

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        role,
        isAdmin,
        isOfficer,
        isStudent,
        loading,
        error,
        signIn,
        signOut,
        resetPassword,
        refreshProfile,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
