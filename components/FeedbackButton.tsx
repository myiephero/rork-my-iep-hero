import React from 'react';
import { StyleSheet, TouchableOpacity, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { MessageSquare } from 'lucide-react-native';
import Colors from '@/constants/colors';

interface FeedbackButtonProps {
  location?: string;
  type?: 'bug' | 'feature' | 'general' | 'ui' | 'performance';
  title?: string;
  variant?: 'floating' | 'inline' | 'minimal';
  style?: any;
  testID?: string;
}

export default function FeedbackButton({
  location = 'Unknown',
  type = 'general',
  title,
  variant = 'inline',
  style,
  testID,
}: FeedbackButtonProps) {
  const router = useRouter();

  const handlePress = () => {
    const params = new URLSearchParams({
      location,
      type,
      ...(title && { title }),
    });
    
    router.push(`/feedback?${params.toString()}`);
  };

  if (variant === 'floating') {
    return (
      <TouchableOpacity
        style={[styles.floatingButton, style]}
        onPress={handlePress}
        testID={testID || "feedback-floating-button"}
      >
        <MessageSquare size={24} color="#fff" />
      </TouchableOpacity>
    );
  }

  if (variant === 'minimal') {
    return (
      <TouchableOpacity
        style={[styles.minimalButton, style]}
        onPress={handlePress}
        testID={testID || "feedback-minimal-button"}
      >
        <MessageSquare size={16} color={Colors.primary} />
        <Text style={styles.minimalText}>Feedback</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.inlineButton, style]}
      onPress={handlePress}
      testID={testID || "feedback-inline-button"}
    >
      <MessageSquare size={20} color={Colors.primary} />
      <Text style={styles.inlineText}>Send Feedback</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    zIndex: 1000,
  },
  inlineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: 'transparent',
  },
  inlineText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
    marginLeft: 8,
  },
  minimalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  minimalText: {
    fontSize: 12,
    color: Colors.primary,
    marginLeft: 4,
  },
});