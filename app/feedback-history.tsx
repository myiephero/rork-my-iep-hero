import React, { useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useFeedback } from '@/hooks/feedback-store';
import Card from '@/components/Card';
import FeedbackButton from '@/components/FeedbackButton';
import Colors from '@/constants/colors';
import { formatDistanceToNow } from '@/utils/date';
import {
  ArrowLeft,
  Bug,
  Lightbulb,
  MessageSquare,
  Palette,
  Zap,
  Clock,
  CheckCircle,
  Eye,
  Plus,
} from 'lucide-react-native';

const feedbackTypeIcons = {
  bug: Bug,
  feature: Lightbulb,
  ui: Palette,
  performance: Zap,
  general: MessageSquare,
};

const statusColors = {
  pending: Colors.warning,
  reviewed: Colors.primary,
  resolved: Colors.success,
};

const statusIcons = {
  pending: Clock,
  reviewed: Eye,
  resolved: CheckCircle,
};

export default function FeedbackHistoryScreen() {
  const router = useRouter();
  const { getUserFeedback, loadFeedback, isLoading } = useFeedback();
  
  const [refreshing, setRefreshing] = React.useState(false);
  
  useEffect(() => {
    loadFeedback();
  }, [loadFeedback]);
  
  const userFeedback = getUserFeedback();
  
  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await loadFeedback();
    setRefreshing(false);
  }, [loadFeedback]);
  
  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Under Review';
      case 'reviewed':
        return 'Reviewed';
      case 'resolved':
        return 'Resolved';
      default:
        return status;
    }
  };
  
  const renderFeedbackItem = (item: any) => {
    const TypeIcon = feedbackTypeIcons[item.type as keyof typeof feedbackTypeIcons];
    const StatusIcon = statusIcons[item.status as keyof typeof statusIcons];
    const statusColor = statusColors[item.status as keyof typeof statusColors];
    
    return (
      <Card key={item.id} style={styles.feedbackCard}>
        <View style={styles.feedbackHeader}>
          <View style={styles.typeContainer}>
            <TypeIcon size={20} color={Colors.primary} />
            <Text style={styles.typeText}>
              {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
            </Text>
          </View>
          
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
            <StatusIcon size={14} color={statusColor} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {getStatusText(item.status)}
            </Text>
          </View>
        </View>
        
        <Text style={styles.feedbackTitle}>{item.title}</Text>
        <Text style={styles.feedbackDescription} numberOfLines={3}>
          {item.description}
        </Text>
        
        <View style={styles.feedbackFooter}>
          <Text style={styles.feedbackDate}>
            {formatDistanceToNow(new Date(item.timestamp))} ago
          </Text>
          {item.location && (
            <Text style={styles.feedbackLocation}>
              {item.location}
            </Text>
          )}
        </View>
        
        {item.rating && (
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingLabel}>Rating: </Text>
            <Text style={styles.ratingValue}>{item.rating}/5 ⭐</Text>
          </View>
        )}
      </Card>
    );
  };
  
  const groupedFeedback = userFeedback.reduce((groups: any, item: any) => {
    const status = item.status;
    if (!groups[status]) {
      groups[status] = [];
    }
    groups[status].push(item);
    return groups;
  }, {});
  
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Feedback History',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color="#fff" />
            </TouchableOpacity>
          ),
        }}
      />
      
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>Your Feedback</Text>
          <Text style={styles.subtitle}>
            Track the status of your submitted feedback and suggestions.
          </Text>
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{userFeedback.length}</Text>
            <Text style={styles.statLabel}>Total Submitted</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: statusColors.pending }]}>
              {groupedFeedback.pending?.length || 0}
            </Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: statusColors.resolved }]}>
              {groupedFeedback.resolved?.length || 0}
            </Text>
            <Text style={styles.statLabel}>Resolved</Text>
          </View>
        </View>
        
        {userFeedback.length === 0 ? (
          <View style={styles.emptyState}>
            <MessageSquare size={64} color={Colors.textLight} />
            <Text style={styles.emptyTitle}>No Feedback Yet</Text>
            <Text style={styles.emptyDescription}>
              Your submitted feedback will appear here. Help us improve the app by sharing your thoughts!
            </Text>
            <FeedbackButton
              location="Feedback History - Empty State"
              variant="inline"
              style={styles.emptyActionButton}
            />
          </View>
        ) : (
          <>
            {Object.entries(groupedFeedback).map(([status, items]: [string, any]) => (
              <View key={status} style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>
                    {getStatusText(status)} ({items.length})
                  </Text>
                </View>
                {items.map(renderFeedbackItem)}
              </View>
            ))}
          </>
        )}
        
        <View style={styles.actionSection}>
          <FeedbackButton
            location="Feedback History - Bottom"
            variant="inline"
            style={styles.newFeedbackButton}
            title="Submit New Feedback"
          />
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    paddingBottom: 40,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textDark,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 22,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.background,
    borderRadius: 12,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textLight,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textDark,
  },
  feedbackCard: {
    marginBottom: 12,
  },
  feedbackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typeText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.primary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  feedbackTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 8,
  },
  feedbackDescription: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
    marginBottom: 12,
  },
  feedbackFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  feedbackDate: {
    fontSize: 12,
    color: Colors.textLight,
  },
  feedbackLocation: {
    fontSize: 12,
    color: Colors.textLight,
    fontStyle: 'italic',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  ratingLabel: {
    fontSize: 12,
    color: Colors.textLight,
  },
  ratingValue: {
    fontSize: 12,
    color: Colors.warning,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.textDark,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  emptyActionButton: {
    alignSelf: 'center',
  },
  actionSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  newFeedbackButton: {
    alignSelf: 'center',
  },
});