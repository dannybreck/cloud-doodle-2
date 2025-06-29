import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signOut: () => Promise<void>;
  isGuest: boolean;
  continueAsGuest: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      const guestMode = await AsyncStorage.getItem('guestMode');
      
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else if (guestMode === 'true') {
        setIsGuest(true);
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // Mock authentication - in real app, use Supabase
      const mockUser: User = {
        id: '1',
        email,
        name: email.split('@')[0],
      };

      setUser(mockUser);
      setIsGuest(false);
      await AsyncStorage.setItem('user', JSON.stringify(mockUser));
      await AsyncStorage.removeItem('guestMode');
    } catch (error) {
      console.error('Sign in error:', error);
      throw new Error('Failed to sign in. Please check your credentials.');
    }
  };

  const signUp = async (email: string, password: string, name?: string) => {
    try {
      // Mock registration - in real app, use Supabase
      const mockUser: User = {
        id: Date.now().toString(),
        email,
        name: name || email.split('@')[0],
      };

      setUser(mockUser);
      setIsGuest(false);
      await AsyncStorage.setItem('user', JSON.stringify(mockUser));
      await AsyncStorage.removeItem('guestMode');
    } catch (error) {
      console.error('Sign up error:', error);
      throw new Error('Failed to create account. Please try again.');
    }
  };

  const signOut = async () => {
    try {
      setUser(null);
      setIsGuest(false);
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('guestMode');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const continueAsGuest = async () => {
    try {
      setIsGuest(true);
      await AsyncStorage.setItem('guestMode', 'true');
    } catch (error) {
      console.error('Guest mode error:', error);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    signIn,
    signUp,
    signOut,
    isGuest,
    continueAsGuest,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}