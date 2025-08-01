import React from 'react';
import { StyleSheet, Text, View, ScrollView, SafeAreaView } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useAuth } from '@/hooks/auth-store';
import { useIEP } from '@/hooks/iep-store';
import { useCase } from '@/hooks/case-store';
import { useMessaging } from '@/hooks/messaging-store';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Colors from '@/constants/colors';
import { Users, FileText, MessageSquare, Settings } from 'lucide-react-native';

export default function AdminScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { children, ieps } = useIEP();
  const { cases } = useCase();
  const { messages, conversations } = useMessaging();
  
  if (!user || user.role !== 'admin') {
    router.replace('/(auth)');
    return null;
  }
  
  const stats = {
    totalChildren: children.length,
    totalIEPs: ieps.length,
    totalCases: cases.length,
    totalMessages: messages.length,
    totalConversations: conversations.length,
    activeCases: cases.filter(c => c.status === 'active').length,
    pendingCases: cases.filter(c => c.status === 'pending').length,
  };
  
  const handleSignOut = async () => {
    await signOut();
    router.replace('/(auth)');
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: 'Admin Dashboard' }} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Admin Dashboard</Text>
          <Text style={styles.subtitle}>My IEP Hero MVP</Text>
        </View>
        
        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <Users size={24} color={Colors.primary} />
            <Text style={styles.statNumber}>{stats.totalChildren}</Text>
            <Text style={styles.statLabel}>Children</Text>
          </Card>
          
          <Card style={styles.statCard}>
            <FileText size={24} color={Colors.primary} />
            <Text style={styles.statNumber}>{stats.totalIEPs}</Text>
            <Text style={styles.statLabel}>IEPs</Text>
          </Card>
          
          <Card style={styles.statCard}>
            <Settings size={24} color={Colors.primary} />
            <Text style={styles.statNumber}>{stats.activeCases}</Text>
            <Text style={styles.statLabel}>Active Cases</Text>
          </Card>
          
          <Card style={styles.statCard}>
            <MessageSquare size={24} color={Colors.primary} />
            <Text style={styles.statNumber}>{stats.totalMessages}</Text>
            <Text style={styles.statLabel}>Messages</Text>
          </Card>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Case Status Overview</Text>
          <Card style={styles.overviewCard}>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewLabel}>Pending Cases:</Text>
              <Text style={styles.overviewValue}>{stats.pendingCases}</Text>
            </View>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewLabel}>Active Cases:</Text>
              <Text style={styles.overviewValue}>{stats.activeCases}</Text>
            </View>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewLabel}>Total Cases:</Text>
              <Text style={styles.overviewValue}>{stats.totalCases}</Text>
            </View>
          </Card>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionButtons}>
            <Button
              title="View All Cases"
              onPress={() => router.push('/(tabs)/cases')}
              variant="outline"
              style={styles.actionButton}
              testID="view-cases-button"
            />
            <Button
              title="View Messages"
              onPress={() => router.push('/(tabs)/messages')}
              variant="outline"
              style={styles.actionButton}
              testID="view-messages-button"
            />
          </View>
        </View>
        
        <View style={styles.signOutSection}>
          <Button
            title="Sign Out"
            onPress={handleSignOut}
            variant="outline"
            style={styles.signOutButton}
            textStyle={styles.signOutButtonText}
            testID="admin-sign-out-button"
          />
        </View>
        
        <View style={styles.disclaimerContainer}>
          <Text style={styles.disclaimerText}>
            My IEP Hero Admin Dashboard - MVP for educational guidance only.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textDark,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textLight,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    width: '48%',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textDark,
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.textLight,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 12,
  },
  overviewCard: {
    padding: 16,
  },
  overviewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  overviewLabel: {
    fontSize: 16,
    color: Colors.text,
  },
  overviewValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textDark,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  signOutSection: {
    alignItems: 'center',
    marginTop: 16,
  },
  signOutButton: {
    borderColor: Colors.error,
    minWidth: 120,
  },
  signOutButtonText: {
    color: Colors.error,
  },
  disclaimerContainer: {
    alignItems: 'center',
    marginTop: 24,
    padding: 12,
    backgroundColor: '#F5F7FF',
    borderRadius: 8,
  },
  disclaimerText: {
    fontSize: 12,
    color: Colors.textLight,
    textAlign: 'center',
  },
});