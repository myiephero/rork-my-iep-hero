import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect } from 'react';
import { useAuth } from './auth-store';

export interface AdvocateProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  specialties: string[];
  credentials: string[];
  experience: number; // years
  rating: number; // 1-5
  reviewCount: number;
  bio: string;
  availability: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
  };
  hourlyRate?: number;
  languages: string[];
  location: string;
  isActive: boolean;
  responseTime: string; // e.g., "Within 2 hours"
}

export interface AdvocateMatch {
  advocateId: string;
  parentId: string;
  childId: string;
  matchScore: number; // 0-100
  matchReasons: string[];
  status: 'pending' | 'accepted' | 'declined' | 'active' | 'completed';
  createdAt: string;
  acceptedAt?: string;
}

export interface WaitlistEntry {
  id: string;
  parentId: string;
  childId: string;
  helpType: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  position: number;
  estimatedWaitTime: string;
  createdAt: string;
  status: 'waiting' | 'matched' | 'cancelled';
}

// Mock advocate profiles
const mockAdvocates: AdvocateProfile[] = [
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?q=80&w=150&auto=format&fit=crop',
    specialties: ['Autism Spectrum Disorders', 'Learning Disabilities', 'ADHD'],
    credentials: ['M.Ed. Special Education', 'Certified Special Education Advocate'],
    experience: 8,
    rating: 4.9,
    reviewCount: 127,
    bio: 'Passionate advocate with 8+ years helping families navigate special education. Specializes in autism support and IEP development.',
    availability: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false
    },
    hourlyRate: 85,
    languages: ['English', 'Spanish'],
    location: 'California, USA',
    isActive: true,
    responseTime: 'Within 2 hours'
  },
  {
    id: 'adv-2',
    name: 'Michael Chen',
    email: 'michael@example.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150&auto=format&fit=crop',
    specialties: ['Behavioral Support', 'Transition Planning', 'Assistive Technology'],
    credentials: ['Ph.D. Educational Psychology', 'Board Certified Behavior Analyst'],
    experience: 12,
    rating: 4.8,
    reviewCount: 89,
    bio: 'Experienced advocate focusing on behavioral interventions and transition planning for students with disabilities.',
    availability: {
      monday: true,
      tuesday: false,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: true,
      sunday: false
    },
    hourlyRate: 95,
    languages: ['English', 'Mandarin'],
    location: 'New York, USA',
    isActive: true,
    responseTime: 'Within 4 hours'
  }
];

// Mock matches
const mockMatches: AdvocateMatch[] = [
  {
    advocateId: '2',
    parentId: '1',
    childId: 'child-1',
    matchScore: 92,
    matchReasons: [
      'Specializes in Autism Spectrum Disorders',
      'High rating (4.9/5)',
      'Available during preferred times',
      'Speaks Spanish (family preference)'
    ],
    status: 'active',
    createdAt: '2025-07-25T10:00:00Z',
    acceptedAt: '2025-07-25T11:30:00Z'
  }
];

// Mock waitlist
const mockWaitlist: WaitlistEntry[] = [
  {
    id: 'wait-1',
    parentId: '1',
    childId: 'child-2',
    helpType: 'IEP Review',
    priority: 'medium',
    position: 3,
    estimatedWaitTime: '5-7 days',
    createdAt: '2025-07-26T14:00:00Z',
    status: 'waiting'
  }
];

export const [AdvocateProvider, useAdvocate] = createContextHook(() => {
  const { user } = useAuth();
  const [advocates, setAdvocates] = useState<AdvocateProfile[]>([]);
  const [matches, setMatches] = useState<AdvocateMatch[]>([]);
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Load mock data
        setAdvocates(mockAdvocates);
        setMatches(mockMatches);
        setWaitlist(mockWaitlist);
        
      } catch (err) {
        console.error('Failed to load advocate data:', err);
        setError('Failed to load advocate data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const getMatchedAdvocate = (parentId: string) => {
    const match = matches.find(m => m.parentId === parentId && m.status === 'active');
    if (!match) return null;
    
    return advocates.find(a => a.id === match.advocateId) || null;
  };

  const getWaitlistPosition = (parentId: string) => {
    const entry = waitlist.find(w => w.parentId === parentId && w.status === 'waiting');
    return entry || null;
  };

  const requestAdvocateMatch = async (childId: string, helpType: string, preferences?: any) => {
    try {
      if (!user) throw new Error('User not authenticated');
      
      // In a real app, this would use AI/ML to find the best match
      // For now, simulate the matching process
      
      const newWaitlistEntry: WaitlistEntry = {
        id: `wait-${Date.now()}`,
        parentId: user.id,
        childId,
        helpType,
        priority: 'medium',
        position: waitlist.length + 1,
        estimatedWaitTime: '3-5 days',
        createdAt: new Date().toISOString(),
        status: 'waiting'
      };
      
      const updatedWaitlist = [...waitlist, newWaitlistEntry];
      setWaitlist(updatedWaitlist);
      
      // Save to storage
      await AsyncStorage.setItem('waitlist', JSON.stringify(updatedWaitlist));
      
      return newWaitlistEntry;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to request advocate match';
      setError(errorMessage);
      throw err;
    }
  };

  const acceptMatch = async (matchId: string) => {
    try {
      const updatedMatches = matches.map(match => 
        match.advocateId === matchId 
          ? { ...match, status: 'active' as const, acceptedAt: new Date().toISOString() }
          : match
      );
      
      setMatches(updatedMatches);
      await AsyncStorage.setItem('matches', JSON.stringify(updatedMatches));
      
      return true;
    } catch (err) {
      console.error('Failed to accept match:', err);
      setError('Failed to accept match');
      throw err;
    }
  };

  const getAdvocatesBySpecialty = (specialty: string) => {
    return advocates.filter(advocate => 
      advocate.specialties.some(s => 
        s.toLowerCase().includes(specialty.toLowerCase())
      )
    );
  };

  const getTopRatedAdvocates = (limit: number = 5) => {
    return advocates
      .filter(a => a.isActive)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit);
  };

  return {
    advocates,
    matches,
    waitlist,
    isLoading,
    error,
    getMatchedAdvocate,
    getWaitlistPosition,
    requestAdvocateMatch,
    acceptMatch,
    getAdvocatesBySpecialty,
    getTopRatedAdvocates
  };
});