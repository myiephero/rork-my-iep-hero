import { useState, useCallback } from 'react';
import { Platform } from 'react-native';
import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './auth-store';

export interface FeedbackItem {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  type: 'bug' | 'feature' | 'general' | 'ui' | 'performance';
  category: string;
  title: string;
  description: string;
  rating?: number;
  screenshot?: string;
  deviceInfo: {
    platform: string;
    version: string;
    userAgent?: string;
  };
  location: string; // Which screen/feature
  timestamp: string;
  status: 'pending' | 'reviewed' | 'resolved';
  priority: 'low' | 'medium' | 'high' | 'critical';
}

const FEEDBACK_STORAGE_KEY = '@feedback_items';

export const [FeedbackProvider, useFeedback] = createContextHook(() => {
  const { user } = useAuth();
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load feedback from storage
  const loadFeedback = useCallback(async () => {
    try {
      setIsLoading(true);
      const stored = await AsyncStorage.getItem(FEEDBACK_STORAGE_KEY);
      if (stored) {
        const items = JSON.parse(stored);
        setFeedbackItems(items);
      }
    } catch (error) {
      console.error('Error loading feedback:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save feedback to storage
  const saveFeedback = useCallback(async (items: FeedbackItem[]) => {
    try {
      await AsyncStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Error saving feedback:', error);
    }
  }, []);

  // Submit new feedback
  const submitFeedback = useCallback(async (feedback: Omit<FeedbackItem, 'id' | 'userId' | 'userName' | 'userRole' | 'timestamp' | 'status' | 'priority'>) => {
    if (!user) {
      throw new Error('User must be logged in to submit feedback');
    }

    try {
      setIsSubmitting(true);
      
      const newFeedback: FeedbackItem = {
        ...feedback,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        timestamp: new Date().toISOString(),
        status: 'pending',
        priority: feedback.type === 'bug' ? 'high' : 'medium',
      };

      const updatedItems = [newFeedback, ...feedbackItems];
      setFeedbackItems(updatedItems);
      await saveFeedback(updatedItems);

      // In a real app, you would send this to your backend
      console.log('Feedback submitted:', newFeedback);
      
      return newFeedback;
    } catch (error) {
      console.error('Error submitting feedback:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [user, feedbackItems, saveFeedback]);

  // Get user's feedback
  const getUserFeedback = useCallback(() => {
    if (!user) return [];
    return feedbackItems.filter(item => item.userId === user.id);
  }, [feedbackItems, user]);

  // Get feedback by status
  const getFeedbackByStatus = useCallback((status: FeedbackItem['status']) => {
    return feedbackItems.filter(item => item.status === status);
  }, [feedbackItems]);

  // Update feedback status (for admin/advocate use)
  const updateFeedbackStatus = useCallback(async (feedbackId: string, status: FeedbackItem['status']) => {
    try {
      const updatedItems = feedbackItems.map(item => 
        item.id === feedbackId ? { ...item, status } : item
      );
      setFeedbackItems(updatedItems);
      await saveFeedback(updatedItems);
    } catch (error) {
      console.error('Error updating feedback status:', error);
      throw error;
    }
  }, [feedbackItems, saveFeedback]);

  // Get device info
  const getDeviceInfo = useCallback(() => {
    return {
      platform: Platform.OS,
      version: Platform.Version.toString(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    };
  }, []);

  return {
    feedbackItems,
    isLoading,
    isSubmitting,
    loadFeedback,
    submitFeedback,
    getUserFeedback,
    getFeedbackByStatus,
    updateFeedbackStatus,
    getDeviceInfo,
  };
});