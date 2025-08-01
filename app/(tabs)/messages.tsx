import React, { useState, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  TouchableOpacity, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator,
  Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/auth-store';
import { useMessaging } from '@/hooks/messaging-store';
import { useIEP } from '@/hooks/iep-store';
import { useCase } from '@/hooks/case-store';
import Colors from '@/constants/colors';
import { formatDistanceToNow } from '@/utils/date';
import { Search, Send } from 'lucide-react-native';
import Input from '@/components/Input';

export default function MessagesScreen() {
  const router = useRouter();
  const { user, isParent, isAdvocate } = useAuth();
  const { messages, isLoading, getConversation } = useMessaging();
  const { children } = useIEP();
  const { cases } = useCase();
  
  const [searchQuery, setSearchQuery] = useState('');
  
  if (!user) {
    router.replace('/(auth)');
    return null;
  }
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }
  
  // Get unique conversation partners
  const conversationPartners = messages.reduce((acc, message) => {
    const partnerId = message.senderId === user.id ? message.receiverId : message.senderId;
    if (!acc.includes(partnerId)) {
      acc.push(partnerId);
    }
    return acc;
  }, [] as string[]);
  
  // For parents, they'll only see advocates
  // For advocates, they'll see parents
  const getPartnerName = (partnerId: string) => {
    if (isParent) {
      return 'Advocate'; // In a real app, we'd fetch the advocate's name
    } else if (isAdvocate) {
      const childCase = cases.find(c => c.parentId === partnerId);
      if (childCase) {
        const child = children.find(c => c.id === childCase.childId);
        return child ? `${child.name}'s Parent` : 'Parent';
      }
      return 'Parent';
    }
    return 'User';
  };
  
  const getLastMessage = (partnerId: string) => {
    const conversation = getConversation(partnerId);
    return conversation.length > 0 ? conversation[conversation.length - 1] : null;
  };
  
  const filteredPartners = searchQuery
    ? conversationPartners.filter(partnerId => 
        getPartnerName(partnerId).toLowerCase().includes(searchQuery.toLowerCase())
      )
    : conversationPartners;
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Search size={20} color={Colors.textLight} style={styles.searchIcon} />
          <Input
            placeholder="Search messages..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            containerStyle={styles.searchInputContainer}
            inputStyle={styles.searchInput}
            testID="search-input"
          />
        </View>
      </View>
      
      {conversationPartners.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No Messages Yet</Text>
          <Text style={styles.emptyText}>
            {isParent 
              ? "You'll see messages from your advocate here once you're connected."
              : "You'll see messages from parents here once you're assigned to cases."}
          </Text>
        </View>
      ) : filteredPartners.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No Results Found</Text>
          <Text style={styles.emptyText}>
            No conversations match your search criteria.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredPartners}
          keyExtractor={(item) => item}
          renderItem={({ item: partnerId }) => {
            const lastMessage = getLastMessage(partnerId);
            const hasUnread = messages.some(
              msg => msg.receiverId === user.id && msg.senderId === partnerId && !msg.isRead
            );
            
            return (
              <TouchableOpacity
                style={styles.conversationItem}
                onPress={() => router.push(`/messages/${partnerId}`)}
                testID={`conversation-${partnerId}`}
              >
                <View style={styles.avatar}>
                  <Image 
                    source={{ uri: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=100&auto=format&fit=crop' }} 
                    style={styles.avatarImage} 
                  />
                </View>
                
                <View style={styles.conversationContent}>
                  <View style={styles.conversationHeader}>
                    <Text style={styles.conversationName}>
                      {getPartnerName(partnerId)}
                    </Text>
                    {lastMessage && (
                      <Text style={styles.conversationTime}>
                        {formatDistanceToNow(new Date(lastMessage.timestamp))}
                      </Text>
                    )}
                  </View>
                  
                  {lastMessage && (
                    <Text 
                      style={[
                        styles.conversationPreview,
                        hasUnread && styles.conversationUnread
                      ]}
                      numberOfLines={1}
                    >
                      {lastMessage.senderId === user.id ? 'You: ' : ''}
                      {lastMessage.content}
                    </Text>
                  )}
                </View>
                
                {hasUnread && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadBadgeText}>
                      {messages.filter(
                        msg => msg.receiverId === user.id && 
                        msg.senderId === partnerId && 
                        !msg.isRead
                      ).length}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          }}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          testID="conversations-list"
        />
      )}
    </View>
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
  header: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: 12,
    zIndex: 1,
  },
  searchInputContainer: {
    flex: 1,
    marginBottom: 0,
  },
  searchInput: {
    paddingLeft: 40,
    backgroundColor: '#F5F7FF',
  },
  listContent: {
    paddingVertical: 8,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
  },
  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  conversationName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textDark,
  },
  conversationTime: {
    fontSize: 12,
    color: Colors.textLight,
  },
  conversationPreview: {
    fontSize: 14,
    color: Colors.textLight,
  },
  conversationUnread: {
    fontWeight: '600',
    color: Colors.text,
  },
  unreadBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  unreadBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
});