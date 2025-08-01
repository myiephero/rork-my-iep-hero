import React from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import { formatDistanceToNow } from '@/utils/date';
import Colors from '@/constants/colors';
import { Message } from '@/types';

interface ChatMessageProps {
  message: Message;
  isCurrentUser: boolean;
  showAvatar?: boolean;
  testID?: string;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isCurrentUser,
  showAvatar = true,
  testID
}) => {
  return (
    <View 
      style={[
        styles.container, 
        isCurrentUser ? styles.currentUserContainer : styles.otherUserContainer
      ]}
      testID={testID}
    >
      {showAvatar && !isCurrentUser && (
        <View style={styles.avatar}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=100&auto=format&fit=crop' }} 
            style={styles.avatarImage} 
          />
        </View>
      )}
      
      <View style={[
        styles.messageContainer,
        isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage
      ]}>
        <Text style={[
          styles.messageText,
          isCurrentUser ? styles.currentUserText : styles.otherUserText
        ]}>
          {message.content}
        </Text>
        
        {message.attachments && message.attachments.length > 0 && (
          <View style={styles.attachmentsContainer}>
            {message.attachments.map((attachment) => (
              <View key={attachment.id} style={styles.attachment}>
                <Text style={styles.attachmentName} numberOfLines={1}>
                  {attachment.name}
                </Text>
              </View>
            ))}
          </View>
        )}
        
        <Text style={[
          styles.timestamp,
          isCurrentUser ? styles.currentUserTimestamp : styles.otherUserTimestamp
        ]}>
          {formatDistanceToNow(new Date(message.timestamp))}
        </Text>
      </View>
      
      {showAvatar && isCurrentUser && (
        <View style={styles.avatar}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop' }} 
            style={styles.avatarImage} 
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginVertical: 8,
    paddingHorizontal: 16,
  },
  currentUserContainer: {
    justifyContent: 'flex-end',
  },
  otherUserContainer: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginHorizontal: 8,
  },
  avatarImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  messageContainer: {
    maxWidth: '70%',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  currentUserMessage: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  otherUserMessage: {
    backgroundColor: '#F5F7FF',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
  },
  currentUserText: {
    color: '#fff',
  },
  otherUserText: {
    color: Colors.text,
  },
  timestamp: {
    fontSize: 12,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  currentUserTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  otherUserTimestamp: {
    color: Colors.textLight,
  },
  attachmentsContainer: {
    marginTop: 8,
  },
  attachment: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: 6,
    marginTop: 4,
  },
  attachmentName: {
    fontSize: 14,
    color: '#fff',
  },
});

export default ChatMessage;