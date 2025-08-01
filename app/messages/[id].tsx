import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform,
  TouchableOpacity,
  ActivityIndicator,
  Image
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useAuth } from '@/hooks/auth-store';
import { useMessaging } from '@/hooks/messaging-store';
import { useIEP } from '@/hooks/iep-store';
import { useCase } from '@/hooks/case-store';
import ChatMessage from '@/components/ChatMessage';
import Colors from '@/constants/colors';
import { Send, Paperclip } from 'lucide-react-native';

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { getConversation, sendMessage, markAsRead, isLoading } = useMessaging();
  const { children } = useIEP();
  const { cases } = useCase();
  
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  
  const flatListRef = useRef<FlatList>(null);
  
  const conversation = useMemo(() => {
    return id ? getConversation(id) : [];
  }, [id, getConversation]);
  
  // Mark unread messages as read
  useEffect(() => {
    if (!id || !user) {
      router.replace('/(tabs)/' as any);
      return;
    }
    const unreadMessages = conversation.filter(
      msg => msg.receiverId === user.id && !msg.isRead
    );
    
    unreadMessages.forEach(msg => {
      markAsRead(msg.id);
    });
  }, [conversation, user, id, router, markAsRead]);
  
  // Get partner name based on role
  const getPartnerName = () => {
    if (!user) return 'User';
    
    if (user.role === 'parent') {
      return 'Advocate'; // In a real app, we'd fetch the advocate's name
    } else if (user.role === 'advocate') {
      const childCase = cases.find(c => c.parentId === id);
      if (childCase) {
        const child = children.find(c => c.id === childCase.childId);
        return child ? `${child.name}'s Parent` : 'Parent';
      }
      return 'Parent';
    }
    return 'User';
  };
  
  const handleSend = async () => {
    if (!message.trim() || !id) return;
    
    try {
      setSending(true);
      await sendMessage(id, message.trim());
      setMessage('');
      
      // Scroll to bottom after sending
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (err) {
      console.error('Failed to send message:', err);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <Stack.Screen options={{ title: getPartnerName() }} />
      
      {conversation.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1577563908411-5077b6dc7624?q=80&w=200&auto=format&fit=crop' }}
            style={styles.emptyImage}
          />
          <Text style={styles.emptyTitle}>Start a Conversation</Text>
          <Text style={styles.emptyText}>
            Send a message to begin your conversation with {getPartnerName()}.
          </Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={conversation}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => {
            const isCurrentUser = user ? item.senderId === user.id : false;
            const showAvatar = index === 0 || 
              conversation[index - 1].senderId !== item.senderId;
            
            return (
              <ChatMessage
                message={item}
                isCurrentUser={isCurrentUser}
                showAvatar={showAvatar}
                testID={`message-${item.id}`}
              />
            );
          }}
          contentContainerStyle={styles.messageList}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
          showsVerticalScrollIndicator={false}
          testID="message-list"
        />
      )}
      
      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.attachButton} testID="attach-button">
          <Paperclip size={24} color={Colors.textLight} />
        </TouchableOpacity>
        
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={message}
          onChangeText={setMessage}
          multiline
          maxLength={500}
          testID="message-input"
        />
        
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!message.trim() || sending) && styles.sendButtonDisabled
          ]}
          onPress={handleSend}
          disabled={!message.trim() || sending}
          testID="send-button"
        >
          {sending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Send size={20} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageList: {
    paddingVertical: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textDark,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: '#fff',
  },
  attachButton: {
    padding: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#F5F7FF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
    marginHorizontal: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: Colors.disabled,
  },
});