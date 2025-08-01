import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect } from 'react';
import { Case } from '@/types';
import { useAuth } from './auth-store';

// Mock cases
const mockCases: Case[] = [
  {
    id: '1',
    parentId: '1',
    advocateId: '2',
    childId: '1',
    iepId: '1',
    status: 'active',
    helpType: 'IEP Review and Recommendations',
    createdAt: '2025-07-15T10:00:00Z'
  }
];

export const [CaseProvider, useCase] = createContextHook(() => {
  const { user } = useAuth();
  const [cases, setCases] = useState<Case[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCases = async () => {
      if (!user) {
        setCases([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // In a real app, we would fetch from an API
        // For now, use mock data
        let userCases: Case[] = [];
        
        if (user.role === 'parent') {
          userCases = mockCases.filter(c => c.parentId === user.id);
        } else if (user.role === 'advocate') {
          userCases = mockCases.filter(c => c.advocateId === user.id);
        } else if (user.role === 'admin') {
          userCases = mockCases; // Admins can see all cases
        }
        
        setCases(userCases);
      } catch (err) {
        console.error('Failed to load cases:', err);
        setError('Failed to load case data');
      } finally {
        setIsLoading(false);
      }
    };

    loadCases();
  }, [user]);

  const createCase = async (childId: string, iepId: string, helpType: string) => {
    try {
      if (!user || user.role !== 'parent') {
        throw new Error('Only parents can create cases');
      }
      
      // In a real app, we would match with an advocate based on expertise
      // For now, just assign to our mock advocate
      const newCase: Case = {
        id: `${Date.now()}`,
        parentId: user.id,
        advocateId: '2', // Mock advocate ID
        childId,
        iepId,
        status: 'pending',
        helpType,
        createdAt: new Date().toISOString()
      };
      
      const updatedCases = [...cases, newCase];
      setCases(updatedCases);
      
      // In a real app, we would save to a database
      await AsyncStorage.setItem('cases', JSON.stringify(updatedCases));
      
      return newCase;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create case';
      setError(errorMessage);
      throw err;
    }
  };

  const updateCaseStatus = async (caseId: string, status: 'pending' | 'active' | 'completed') => {
    try {
      const updatedCases = cases.map(c => 
        c.id === caseId ? { ...c, status } : c
      );
      
      setCases(updatedCases);
      await AsyncStorage.setItem('cases', JSON.stringify(updatedCases));
    } catch (err) {
      console.error('Failed to update case status:', err);
      setError('Failed to update case');
      throw err;
    }
  };

  const getCase = (caseId: string) => {
    return cases.find(c => c.id === caseId) || null;
  };

  const getChildCase = (childId: string) => {
    return cases.find(c => c.childId === childId) || null;
  };

  return {
    cases,
    isLoading,
    error,
    createCase,
    updateCaseStatus,
    getCase,
    getChildCase
  };
});