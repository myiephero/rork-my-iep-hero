import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/auth-store';
import { useIEP } from '@/hooks/iep-store';
import ChildCard from '@/components/ChildCard';
import Button from '@/components/Button';
import FeedbackButton from '@/components/FeedbackButton';
import Colors from '@/constants/colors';
import { Plus, Search } from 'lucide-react-native';
import Input from '@/components/Input';

export default function ChildrenScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { children, ieps, isLoading } = useIEP();
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    if (!user || user.role !== 'parent') {
      router.replace('/(tabs)');
    }
  }, [user, router]);
  
  if (!user || user.role !== 'parent') {
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
  
  const filteredChildren = searchQuery
    ? children.filter(child => 
        child.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (child.school && child.school.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (child.grade && child.grade.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : children;
  
  const getChildIEPs = (childId: string) => {
    return ieps.filter(iep => iep.childId === childId);
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Search size={20} color={Colors.textLight} style={styles.searchIcon} />
          <Input
            placeholder="Search children..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            containerStyle={styles.searchInputContainer}
            inputStyle={styles.searchInput}
            testID="search-input"
          />
        </View>
        
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/children/add')}
          testID="add-child-button"
        >
          <Plus size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      
      {children.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No Children Added</Text>
          <Text style={styles.emptyText}>
            Add your child's information to get started with IEP support.
          </Text>
          <Button
            title="Add Child"
            onPress={() => router.push('/children/add')}
            style={styles.emptyButton}
            testID="empty-add-child-button"
          />
        </View>
      ) : filteredChildren.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No Results Found</Text>
          <Text style={styles.emptyText}>
            No children match your search criteria.
          </Text>
          <Button
            title="Clear Search"
            onPress={() => setSearchQuery('')}
            variant="outline"
            style={styles.emptyButton}
            testID="clear-search-button"
          />
        </View>
      ) : (
        <FlatList
          data={filteredChildren}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ChildCard
              child={item}
              ieps={getChildIEPs(item.id)}
              onPress={() => router.push(`/children/${item.id}`)}
              testID={`child-card-${item.id}`}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          testID="children-list"
        />
      )}
      
      <FeedbackButton
        location="Children Screen"
        variant="floating"
      />
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchContainer: {
    flex: 1,
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
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  listContent: {
    padding: 20,
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