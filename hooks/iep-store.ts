import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect } from 'react';
import { IEP, IEPSummary, Child } from '@/types';
import { useAuth } from './auth-store';
import { AIService } from '@/utils/ai-service';

// Mock IEP data
const mockIEPs: IEP[] = [
  {
    id: '1',
    parentId: '1',
    childId: '1',
    fileName: 'JohnDoe_IEP_2025.pdf',
    fileUrl: 'https://example.com/iep1.pdf',
    uploadDate: '2025-06-15T10:30:00Z',
    summary: {
      goals: [
        'Improve reading comprehension to grade level',
        'Develop social skills for peer interaction',
        'Increase focus during classroom activities'
      ],
      services: [
        'Speech therapy: 30 minutes, twice weekly',
        'Occupational therapy: 45 minutes, once weekly',
        'Resource room support: 60 minutes daily'
      ],
      accommodations: [
        'Extended time for assignments and tests',
        'Preferential seating near teacher',
        'Use of visual schedules and reminders'
      ],
      notes: 'John has shown improvement in reading skills but continues to need support with comprehension and social interactions.',
      generatedAt: '2025-06-15T11:00:00Z'
    },
    advocateId: '2'
  }
];

// Mock children data
const mockChildren: Child[] = [
  {
    id: '1',
    name: 'John Doe',
    dateOfBirth: '2015-03-12',
    grade: '5th Grade',
    school: 'Lincoln Elementary School',
    notes: 'Has an IEP for reading and social skills support'
  }
];

export const [IEPProvider, useIEP] = createContextHook(() => {
  const { user } = useAuth();
  const [ieps, setIEPs] = useState<IEP[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        setIEPs([]);
        setChildren([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // Load stored data first
        let storedIEPs: IEP[] = [];
        let storedChildren: Child[] = [];
        
        try {
          const iepsData = await AsyncStorage.getItem('ieps');
          const childrenData = await AsyncStorage.getItem('children');
          
          if (iepsData) {
            storedIEPs = JSON.parse(iepsData);
            console.log('Loaded stored IEPs:', storedIEPs.length);
          }
          
          if (childrenData) {
            storedChildren = JSON.parse(childrenData);
            console.log('Loaded stored children:', storedChildren.length);
          }
        } catch (storageError) {
          console.warn('Could not load stored data:', storageError);
        }
        
        // In a real app, we would fetch from an API
        // For now, combine stored data with mock data
        if (user.role === 'parent') {
          const parentStoredIEPs = storedIEPs.filter(iep => iep.parentId === user.id);
          const parentMockIEPs = mockIEPs.filter(iep => iep.parentId === user.id);
          
          // Combine stored and mock data, avoiding duplicates
          const allIEPs = [...parentStoredIEPs];
          parentMockIEPs.forEach(mockIEP => {
            if (!allIEPs.find(iep => iep.id === mockIEP.id)) {
              allIEPs.push(mockIEP);
            }
          });
          
          setIEPs(allIEPs);
          
          // Same for children
          const allChildren = [...storedChildren];
          mockChildren.forEach(mockChild => {
            if (!allChildren.find(child => child.id === mockChild.id)) {
              allChildren.push(mockChild);
            }
          });
          setChildren(allChildren);
          
        } else if (user.role === 'advocate') {
          const advocateStoredIEPs = storedIEPs.filter(iep => iep.advocateId === user.id);
          const advocateMockIEPs = mockIEPs.filter(iep => iep.advocateId === user.id);
          
          const allIEPs = [...advocateStoredIEPs];
          advocateMockIEPs.forEach(mockIEP => {
            if (!allIEPs.find(iep => iep.id === mockIEP.id)) {
              allIEPs.push(mockIEP);
            }
          });
          
          setIEPs(allIEPs);
          
          // For advocates, we'd also fetch the children they're working with
          const childrenIds = allIEPs.map(iep => iep.childId);
          const relevantChildren = [...storedChildren, ...mockChildren]
            .filter((child, index, arr) => 
              childrenIds.includes(child.id) && 
              arr.findIndex(c => c.id === child.id) === index
            );
          setChildren(relevantChildren);
          
        } else if (user.role === 'admin') {
          // Admins can see all IEPs
          const allIEPs = [...storedIEPs];
          mockIEPs.forEach(mockIEP => {
            if (!allIEPs.find(iep => iep.id === mockIEP.id)) {
              allIEPs.push(mockIEP);
            }
          });
          setIEPs(allIEPs);
          
          const allChildren = [...storedChildren];
          mockChildren.forEach(mockChild => {
            if (!allChildren.find(child => child.id === mockChild.id)) {
              allChildren.push(mockChild);
            }
          });
          setChildren(allChildren);
        }
      } catch (err) {
        console.error('Failed to load IEP data:', err);
        setError('Failed to load IEP and child data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user]);

  const addChild = async (child: Omit<Child, 'id'>) => {
    try {
      if (!user || user.role !== 'parent') {
        throw new Error('Only parents can add children');
      }
      
      const newChild: Child = {
        ...child,
        id: `${Date.now()}`, // Generate a unique ID
      };
      
      const updatedChildren = [...children, newChild];
      setChildren(updatedChildren);
      
      // In a real app, we would save to a database
      await AsyncStorage.setItem('children', JSON.stringify(updatedChildren));
      
      console.log('Child added successfully:', newChild.name);
      
      return newChild;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add child';
      setError(errorMessage);
      throw err;
    }
  };

  const uploadIEP = async (childId: string, fileName: string, fileUri: string) => {
    try {
      if (!user || user.role !== 'parent') {
        throw new Error('Only parents can upload IEPs');
      }
      
      console.log('Starting IEP upload:', {
        childId,
        fileName,
        fileUri,
        hasUri: !!fileUri
      });
      
      const newIEP: IEP = {
        id: `${Date.now()}`,
        parentId: user.id,
        childId,
        fileName,
        fileUrl: fileUri, // Store the local file URI
        uploadDate: new Date().toISOString(),
      };
      
      const updatedIEPs = [...ieps, newIEP];
      setIEPs(updatedIEPs);
      
      // Save to AsyncStorage
      await AsyncStorage.setItem('ieps', JSON.stringify(updatedIEPs));
      
      console.log('IEP uploaded successfully:', {
        id: newIEP.id,
        fileName: newIEP.fileName,
        childId: newIEP.childId,
        totalIEPs: updatedIEPs.length
      });
      
      // Start AI processing immediately with the file URI
      try {
        console.log('Starting AI analysis for uploaded file...');
        await generateIEPSummary(newIEP.id);
        console.log('AI analysis completed successfully');
      } catch (aiError) {
        console.warn('AI processing failed, but IEP was uploaded:', aiError);
        // Don't throw here - the upload was successful even if AI failed
      }
      
      return newIEP;
    } catch (err) {
      console.error('Failed to upload IEP:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload IEP';
      setError(errorMessage);
      throw err;
    }
  };

  const generateIEPSummary = async (iepId: string, documentText?: string) => {
    try {
      // First try to find in current state
      let iep = ieps.find(i => i.id === iepId);
      
      // If not found, try to get from AsyncStorage (in case state hasn't updated yet)
      if (!iep) {
        try {
          const storedIEPs = await AsyncStorage.getItem('ieps');
          if (storedIEPs) {
            const parsedIEPs = JSON.parse(storedIEPs);
            iep = parsedIEPs.find((i: IEP) => i.id === iepId);
          }
        } catch (storageError) {
          console.warn('Could not retrieve IEPs from storage:', storageError);
        }
      }
      
      // If still not found, check if we have mock data available
      if (!iep) {
        iep = mockIEPs.find(i => i.id === iepId);
      }
      
      if (!iep) {
        console.error('IEP not found with ID:', iepId);
        console.error('Available IEPs in state:', ieps.map(i => ({ id: i.id, fileName: i.fileName })));
        console.error('Available mock IEPs:', mockIEPs.map(i => ({ id: i.id, fileName: i.fileName })));
        throw new Error(`IEP not found with ID: ${iepId}`);
      }
      
      console.log('Found IEP for analysis:', {
        id: iep.id,
        fileName: iep.fileName,
        hasExistingSummary: !!iep.summary
      });

      let textToAnalyze = documentText;
      
      // If no document text provided, try to extract from file URL
      if (!textToAnalyze && iep.fileUrl) {
        try {
          textToAnalyze = await AIService.extractTextFromDocument(iep.fileUrl);
        } catch (extractError) {
          console.warn('Could not extract text from document:', extractError);
          // Use fallback text for demo purposes
          textToAnalyze = `IEP Document for ${iep.fileName}\n\nThis is a placeholder for document text extraction. In a production app, this would contain the actual IEP document content extracted via OCR or PDF parsing.`;
        }
      }

      if (!textToAnalyze) {
        throw new Error('No document text available for analysis');
      }

      console.log('Starting AI analysis with text length:', textToAnalyze.length);
      
      // Use AI service to analyze the document
      const aiSummary = await AIService.analyzeIEPDocument(textToAnalyze);
      
      console.log('AI analysis completed:', {
        goalsCount: aiSummary.goals.length,
        servicesCount: aiSummary.services.length,
        accommodationsCount: aiSummary.accommodations.length
      });
      
      // Update the IEP with the AI-generated summary
      // Get the most current IEPs from storage to ensure we have the latest data
      let currentIEPs = ieps;
      try {
        const storedIEPs = await AsyncStorage.getItem('ieps');
        if (storedIEPs) {
          currentIEPs = JSON.parse(storedIEPs);
        }
      } catch (storageError) {
        console.warn('Could not retrieve current IEPs from storage:', storageError);
      }
      
      const updatedIEPs = currentIEPs.map((iepItem: IEP) => 
        iepItem.id === iepId ? { ...iepItem, summary: aiSummary } : iepItem
      );
      
      setIEPs(updatedIEPs);
      await AsyncStorage.setItem('ieps', JSON.stringify(updatedIEPs));
      
      console.log('IEP summary updated in storage:', {
        iepId,
        totalIEPs: updatedIEPs.length,
        summaryGenerated: true
      });
      
      // Log the AI analysis for audit purposes
      console.log('IEP AI Analysis Completed:', {
        iepId,
        fileName: iep.fileName,
        timestamp: new Date().toISOString(),
        goalsCount: aiSummary.goals.length,
        servicesCount: aiSummary.services.length,
        accommodationsCount: aiSummary.accommodations.length
      });
      
      return aiSummary;
    } catch (err) {
      console.error('Failed to generate IEP summary:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze IEP with AI';
      setError(errorMessage);
      throw err;
    }
  };

  const getChildIEPs = (childId: string) => {
    return ieps.filter(iep => iep.childId === childId);
  };

  const getChild = (childId: string) => {
    return children.find(child => child.id === childId) || null;
  };

  const generateCoachingQuestions = async (iepId: string): Promise<string[]> => {
    try {
      // First try to find in current state
      let iep = ieps.find(i => i.id === iepId);
      
      // If not found, try to get from AsyncStorage (in case state hasn't updated yet)
      if (!iep) {
        try {
          const storedIEPs = await AsyncStorage.getItem('ieps');
          if (storedIEPs) {
            const parsedIEPs = JSON.parse(storedIEPs);
            iep = parsedIEPs.find((i: IEP) => i.id === iepId);
          }
        } catch (storageError) {
          console.warn('Could not retrieve IEPs from storage:', storageError);
        }
      }
      
      if (!iep || !iep.summary) {
        throw new Error('IEP summary not found. Please generate summary first.');
      }

      const questions = await AIService.generateCoachingQuestions(iep.summary);
      
      console.log('Coaching Questions Generated:', {
        iepId,
        questionsCount: questions.length,
        timestamp: new Date().toISOString()
      });
      
      return questions;
    } catch (err) {
      console.error('Failed to generate coaching questions:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate coaching questions';
      setError(errorMessage);
      throw err;
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    ieps,
    children,
    isLoading,
    error,
    addChild,
    uploadIEP,
    generateIEPSummary,
    generateCoachingQuestions,
    getChildIEPs,
    getChild,
    clearError
  };
});