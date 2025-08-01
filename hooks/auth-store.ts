import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect } from 'react';
import { User, UserRole } from '@/types';

// Mock authentication for MVP
const mockUsers = [
  {
    id: '1',
    email: 'parent@example.com',
    name: 'Parent User',
    role: 'parent' as UserRole,
    createdAt: new Date().toISOString(),
    isApproved: true,
  },
  {
    id: '2',
    email: 'advocate@example.com',
    name: 'Advocate User',
    role: 'advocate' as UserRole,
    createdAt: new Date().toISOString(),
    isApproved: true,
  },
  {
    id: '3',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'admin' as UserRole,
    createdAt: new Date().toISOString(),
    isApproved: true,
  },
];

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to load user:', err);
        setError('Failed to load user data');
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Mock authentication
      const foundUser = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (!foundUser) {
        throw new Error('Invalid email or password');
      }
      
      // In a real app, we would verify the password here
      
      await AsyncStorage.setItem('user', JSON.stringify(foundUser));
      setUser(foundUser);
      return foundUser;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string, role: UserRole) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Check if user already exists
      if (mockUsers.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        throw new Error('Email already in use');
      }
      
      // Create new user
      const newUser: User = {
        id: `${mockUsers.length + 1}`,
        email,
        name,
        role,
        createdAt: new Date().toISOString(),
        isApproved: false, // New users need approval
      };
      
      // In a real app, we would save this to a database
      mockUsers.push(newUser);
      
      // Don't automatically sign in after registration for this app
      // since we want to implement an approval process
      
      return newUser;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await AsyncStorage.removeItem('user');
      setUser(null);
    } catch (err) {
      console.error('Failed to sign out:', err);
      setError('Failed to sign out');
    }
  };

  return {
    user,
    isLoading,
    error,
    signIn,
    signUp,
    signOut,
    isAuthenticated: !!user,
    isParent: user?.role === 'parent',
    isAdvocate: user?.role === 'advocate',
    isAdmin: user?.role === 'admin',
  };
});