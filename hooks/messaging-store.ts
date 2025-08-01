import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect } from 'react';
import { Message, Attachment } from '@/types';
import { useAuth } from './auth-store';

// Mock messages
const mockMessages: Message[] = [
  {
    id: '1',
    senderId: '2', // advocate
    receiverId: '1', // parent
    content: "Hello! I've reviewed John's IEP and have some initial thoughts. When would be a good time to discuss?",
    timestamp: '2025-07-20T14:30:00Z',
    isRead: true
  },
  {
    id: '2',
    senderId: '1', // parent
    receiverId: '2', // advocate
    content: "Thank you for reviewing it! I'm available tomorrow afternoon or Friday morning.",
    timestamp: '2025-07-20T15:45:00Z',
    isRead: true
  },
  {
    id: '3',
    senderId: '2', // advocate
    receiverId: '1', // parent
    content: "Great! Let's connect tomorrow at 3pm. I'll send you a list of questions to think about before our call.",
    timestamp: '2025-07-20T16:10:00Z',
    isRead: false
  }
];

export const [MessagingProvider, useMessaging] = createContextHook(() => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMessages = async () => {
      if (!user) {
        setMessages([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // In a real app, we would fetch from an API
        // For now, use mock data
        const userMessages = mockMessages.filter(
          msg => msg.senderId === user.id || msg.receiverId === user.id
        );
        
        setMessages(userMessages);
      } catch (err) {
        console.error('Failed to load messages:', err);
        setError('Failed to load messages');
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();
  }, [user]);

  const sendMessage = async (receiverId: string, content: string, attachments?: Attachment[]) => {
    try {
      if (!user) {
        throw new Error('You must be logged in to send messages');
      }
      
      const newMessage: Message = {
        id: `${Date.now()}`,
        senderId: user.id,
        receiverId,
        content,
        timestamp: new Date().toISOString(),
        isRead: false,
        attachments
      };
      
      const updatedMessages = [...messages, newMessage];
      setMessages(updatedMessages);
      
      // In a real app, we would save to a database
      await AsyncStorage.setItem('messages', JSON.stringify(updatedMessages));
      
      return newMessage;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
      throw err;
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      const updatedMessages = messages.map(msg => 
        msg.id === messageId ? { ...msg, isRead: true } : msg
      );
      
      setMessages(updatedMessages);
      await AsyncStorage.setItem('messages', JSON.stringify(updatedMessages));
    } catch (err) {
      console.error('Failed to mark message as read:', err);
      setError('Failed to update message status');
    }
  };

  const getConversation = (otherUserId: string) => {
    if (!user) return [];
    
    return messages.filter(
      msg => 
        (msg.senderId === user.id && msg.receiverId === otherUserId) ||
        (msg.senderId === otherUserId && msg.receiverId === user.id)
    ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  };

  const getUnreadCount = () => {
    if (!user) return 0;
    
    return messages.filter(msg => msg.receiverId === user.id && !msg.isRead).length;
  };

  const getConversations = () => {
    if (!user) return [];
    
    const conversationMap = new Map<string, { otherUserId: string; lastMessage: Message; unreadCount: number }>();
    
    messages.forEach(msg => {
      const otherUserId = msg.senderId === user.id ? msg.receiverId : msg.senderId;
      const existing = conversationMap.get(otherUserId);
      
      if (!existing || new Date(msg.timestamp) > new Date(existing.lastMessage.timestamp)) {
        const unreadCount = messages.filter(
          m => m.senderId === otherUserId && m.receiverId === user.id && !m.isRead
        ).length;
        
        conversationMap.set(otherUserId, {
          otherUserId,
          lastMessage: msg,
          unreadCount
        });
      }
    });
    
    return Array.from(conversationMap.values()).sort(
      (a, b) => new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime()
    );
  };

  const conversations = getConversations();

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    markAsRead,
    getConversation,
    getUnreadCount,
    conversations
  };
});