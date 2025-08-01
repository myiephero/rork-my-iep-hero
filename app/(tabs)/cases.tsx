import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/auth-store';
import { useCase } from '@/hooks/case-store';
import { useIEP } from '@/hooks/iep-store';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Colors from '@/constants/colors';
import { Search, Filter } from 'lucide-react-native';
import Input from '@/components/Input';
import { formatDate } from '@/utils/date';

export default function CasesScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { cases, isLoading } = useCase();
  const { children } = useIEP();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending' | 'completed'>('all');
  
  useEffect(() => {
    if (!user || user.role !== 'advocate') {
      router.replace('/(tabs)');
    }
  }, [user, router]);
  
  if (!user || user.role !== 'advocate') {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }
  
  // Filter cases by status and search query
  const filteredCases = cases.filter(caseItem => {
    // Apply status filter
    if (statusFilter !== 'all' && caseItem.status !== statusFilter) {
      return false;
    }
    
    // Apply search filter
    if (searchQuery) {
      const child = children.find(c => c.id === caseItem.childId);
      const childName = child ? child.name.toLowerCase() : '';
      const helpType = caseItem.helpType.toLowerCase();
      
      return (
        childName.includes(searchQuery.toLowerCase()) ||
        helpType.includes(searchQuery.toLowerCase())
      );
    }
    
    return true;
  });
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Search size={20} color={Colors.textLight} style={styles.searchIcon} />
          <Input
            placeholder="Search cases..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            containerStyle={styles.searchInputContainer}
            inputStyle={styles.searchInput}
            testID="search-input"
          />
        </View>
      </View>
      
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Status:</Text>
        <View style={styles.filterButtons}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              statusFilter === 'all' && styles.filterButtonActive
            ]}
            onPress={() => setStatusFilter('all')}
            testID="filter-all-button"
          >
            <Text
              style={[
                styles.filterButtonText,
                statusFilter === 'all' && styles.filterButtonTextActive
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.filterButton,
              statusFilter === 'active' && styles.filterButtonActive
            ]}
            onPress={() => setStatusFilter('active')}
            testID="filter-active-button"
          >
            <Text
              style={[
                styles.filterButtonText,
                statusFilter === 'active' && styles.filterButtonTextActive
              ]}
            >
              Active
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.filterButton,
              statusFilter === 'pending' && styles.filterButtonActive
            ]}
            onPress={() => setStatusFilter('pending')}
            testID="filter-pending-button"
          >
            <Text
              style={[
                styles.filterButtonText,
                statusFilter === 'pending' && styles.filterButtonTextActive
              ]}
            >
              Pending
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.filterButton,
              statusFilter === 'completed' && styles.filterButtonActive
            ]}
            onPress={() => setStatusFilter('completed')}
            testID="filter-completed-button"
          >
            <Text
              style={[
                styles.filterButtonText,
                statusFilter === 'completed' && styles.filterButtonTextActive
              ]}
            >
              Completed
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {cases.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No Cases Assigned</Text>
          <Text style={styles.emptyText}>
            You don't have any cases assigned yet. New cases will appear here when parents request help.
          </Text>
        </View>
      ) : filteredCases.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No Results Found</Text>
          <Text style={styles.emptyText}>
            No cases match your search criteria.
          </Text>
          <Button
            title="Clear Filters"
            onPress={() => {
              setSearchQuery('');
              setStatusFilter('all');
            }}
            variant="outline"
            style={styles.emptyButton}
            testID="clear-filters-button"
          />
        </View>
      ) : (
        <FlatList
          data={filteredCases}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const child = children.find(c => c.id === item.childId);
            
            return (
              <Card 
                style={styles.caseCard} 
                onPress={() => router.push(`/cases/${item.id}`)}
                testID={`case-card-${item.id}`}
              >
                <View style={styles.caseHeader}>
                  <View style={styles.caseNameContainer}>
                    <Text style={styles.caseName}>{child?.name || 'Unknown Child'}</Text>
                    <View style={[
                      styles.caseStatus,
                      item.status === 'active' ? styles.caseStatusActive : 
                      item.status === 'pending' ? styles.caseStatusPending : 
                      styles.caseStatusCompleted
                    ]}>
                      <Text style={styles.caseStatusText}>
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </Text>
                    </View>
                  </View>
                </View>
                
                <View style={styles.caseDetails}>
                  <View style={styles.caseDetailItem}>
                    <Text style={styles.caseDetailLabel}>Help Type:</Text>
                    <Text style={styles.caseDetailValue}>{item.helpType}</Text>
                  </View>
                  
                  <View style={styles.caseDetailItem}>
                    <Text style={styles.caseDetailLabel}>Created:</Text>
                    <Text style={styles.caseDetailValue}>
                      {formatDate(item.createdAt)}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.caseActions}>
                  <Button
                    title="View Details"
                    variant="outline"
                    size="small"
                    onPress={() => router.push(`/cases/${item.id}`)}
                    style={styles.caseActionButton}
                    testID={`view-case-${item.id}-button`}
                  />
                  <Button
                    title="Message Parent"
                    variant="primary"
                    size="small"
                    onPress={() => router.push(`/messages/${item.parentId}`)}
                    style={styles.caseActionButton}
                    testID={`message-parent-${item.parentId}-button`}
                  />
                </View>
              </Card>
            );
          }}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          testID="cases-list"
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
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginRight: 12,
  },
  filterButtons: {
    flexDirection: 'row',
    flex: 1,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: Colors.primaryLight,
  },
  filterButtonText: {
    fontSize: 14,
    color: Colors.textLight,
  },
  filterButtonTextActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  listContent: {
    padding: 20,
  },
  caseCard: {
    marginBottom: 16,
  },
  caseHeader: {
    marginBottom: 12,
  },
  caseNameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  caseName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textDark,
  },
  caseStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  caseStatusActive: {
    backgroundColor: '#E8F5E9',
  },
  caseStatusPending: {
    backgroundColor: '#FFF8E1',
  },
  caseStatusCompleted: {
    backgroundColor: '#E3F2FD',
  },
  caseStatusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  caseDetails: {
    backgroundColor: '#F5F7FF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  caseDetailItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  caseDetailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textDark,
    width: 100,
  },
  caseDetailValue: {
    fontSize: 14,
    color: Colors.text,
    flex: 1,
  },
  caseActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  caseActionButton: {
    marginLeft: 8,
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
    marginBottom: 24,
    lineHeight: 24,
  },
  emptyButton: {
    minWidth: 150,
  },
});