import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useAuth } from '@/hooks/auth-store';
import { useCase } from '@/hooks/case-store';
import { useIEP } from '@/hooks/iep-store';
import Card from '@/components/Card';
import Button from '@/components/Button';
import IEPSummaryCard from '@/components/IEPSummaryCard';
import Colors from '@/constants/colors';
import { formatDate } from '@/utils/date';
import { MessageSquare, FileText, CheckCircle, AlertTriangle } from 'lucide-react-native';

export default function CaseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user, isAdvocate } = useAuth();
  const { getCase, updateCaseStatus, isLoading: caseLoading } = useCase();
  const { getChild, ieps, isLoading: iepLoading } = useIEP();
  
  const [updating, setUpdating] = useState(false);
  
  if (!id || !user) {
    router.replace('/(tabs)');
    return null;
  }
  
  if (caseLoading || iepLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }
  
  const caseItem = getCase(id);
  
  if (!caseItem) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Case not found</Text>
        <Button
          title="Go Back"
          onPress={() => router.back()}
          variant="outline"
          style={styles.errorButton}
        />
      </View>
    );
  }
  
  const child = getChild(caseItem.childId);
  const iep = ieps.find(i => i.id === caseItem.iepId);
  
  const handleUpdateStatus = async (status: 'pending' | 'active' | 'completed') => {
    try {
      setUpdating(true);
      await updateCaseStatus(id, status);
      
      Alert.alert(
        'Success',
        `Case status updated to ${status}`,
        [
          {
            text: 'OK',
          },
        ]
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update case status';
      Alert.alert('Error', errorMessage);
    } finally {
      setUpdating(false);
    }
  };
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: 'Case Details' }} />
      
      <Card style={styles.caseCard}>
        <View style={styles.caseHeader}>
          <Text style={styles.caseTitle}>
            {child ? child.name : 'Unknown Child'}
          </Text>
          <View style={[
            styles.caseStatus,
            caseItem.status === 'active' ? styles.caseStatusActive : 
            caseItem.status === 'pending' ? styles.caseStatusPending : 
            styles.caseStatusCompleted
          ]}>
            <Text style={styles.caseStatusText}>
              {caseItem.status.charAt(0).toUpperCase() + caseItem.status.slice(1)}
            </Text>
          </View>
        </View>
        
        <View style={styles.caseDetails}>
          <View style={styles.caseDetailItem}>
            <Text style={styles.caseDetailLabel}>Help Type:</Text>
            <Text style={styles.caseDetailValue}>{caseItem.helpType}</Text>
          </View>
          
          <View style={styles.caseDetailItem}>
            <Text style={styles.caseDetailLabel}>Created:</Text>
            <Text style={styles.caseDetailValue}>
              {formatDate(caseItem.createdAt)}
            </Text>
          </View>
          
          {child && (
            <>
              <View style={styles.caseDetailItem}>
                <Text style={styles.caseDetailLabel}>Child:</Text>
                <Text style={styles.caseDetailValue}>{child.name}</Text>
              </View>
              
              {child.grade && (
                <View style={styles.caseDetailItem}>
                  <Text style={styles.caseDetailLabel}>Grade:</Text>
                  <Text style={styles.caseDetailValue}>{child.grade}</Text>
                </View>
              )}
              
              {child.school && (
                <View style={styles.caseDetailItem}>
                  <Text style={styles.caseDetailLabel}>School:</Text>
                  <Text style={styles.caseDetailValue}>{child.school}</Text>
                </View>
              )}
            </>
          )}
        </View>
        
        {isAdvocate && (
          <View style={styles.statusActions}>
            <Text style={styles.statusActionsTitle}>Update Status:</Text>
            <View style={styles.statusButtons}>
              <Button
                title="Pending"
                variant={caseItem.status === 'pending' ? 'primary' : 'outline'}
                size="small"
                onPress={() => handleUpdateStatus('pending')}
                disabled={caseItem.status === 'pending' || updating}
                style={styles.statusButton}
                testID="pending-button"
              />
              <Button
                title="Active"
                variant={caseItem.status === 'active' ? 'primary' : 'outline'}
                size="small"
                onPress={() => handleUpdateStatus('active')}
                disabled={caseItem.status === 'active' || updating}
                style={styles.statusButton}
                testID="active-button"
              />
              <Button
                title="Completed"
                variant={caseItem.status === 'completed' ? 'primary' : 'outline'}
                size="small"
                onPress={() => handleUpdateStatus('completed')}
                disabled={caseItem.status === 'completed' || updating}
                style={styles.statusButton}
                testID="completed-button"
              />
            </View>
          </View>
        )}
      </Card>
      
      {iep && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>IEP Document</Text>
          <Card style={styles.iepCard} onPress={() => router.push(`/iep/${iep.id}`)}>
            <View style={styles.iepHeader}>
              <FileText size={24} color={Colors.primary} />
              <View style={styles.iepInfo}>
                <Text style={styles.iepName}>{iep.fileName}</Text>
                <Text style={styles.iepDate}>
                  Uploaded on {formatDate(iep.uploadDate)}
                </Text>
              </View>
            </View>
            
            <Button
              title="View IEP Details"
              onPress={() => router.push(`/iep/${iep.id}`)}
              variant="outline"
              size="small"
              style={styles.viewIepButton}
              testID="view-iep-button"
            />
          </Card>
        </View>
      )}
      
      {iep && iep.summary && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>IEP Summary</Text>
          <IEPSummaryCard
            summary={iep.summary}
            testID="iep-summary"
          />
        </View>
      )}
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Communication</Text>
        <Card style={styles.communicationCard}>
          <Button
            title={isAdvocate ? "Message Parent" : "Message Advocate"}
            onPress={() => router.push(`/messages/${isAdvocate ? caseItem.parentId : caseItem.advocateId}`)}
            style={styles.messageButton}
            testID="message-button"
            icon={<MessageSquare size={20} color="#fff" style={styles.buttonIcon} />}
          />
        </Card>
      </View>
      
      <View style={styles.disclaimerContainer}>
        <AlertTriangle size={16} color={Colors.warning} />
        <Text style={styles.disclaimerText}>
          My IEP Hero is not a FERPA-compliant system. This MVP is for educational guidance only.
        </Text>
      </View>
    </ScrollView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: Colors.error,
    marginBottom: 16,
  },
  errorButton: {
    minWidth: 120,
  },
  caseCard: {
    marginBottom: 24,
  },
  caseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  caseTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textDark,
  },
  caseStatus: {
    paddingHorizontal: 10,
    paddingVertical: 5,
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
    fontSize: 14,
    fontWeight: '500',
  },
  caseDetails: {
    backgroundColor: '#F5F7FF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  caseDetailItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  caseDetailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textDark,
    width: 80,
  },
  caseDetailValue: {
    fontSize: 14,
    color: Colors.text,
    flex: 1,
  },
  statusActions: {
    marginTop: 8,
  },
  statusActionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 8,
  },
  statusButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusButton: {
    flex: 1,
    marginHorizontal: 4,
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
  iepCard: {
    padding: 16,
  },
  iepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iepInfo: {
    flex: 1,
    marginLeft: 12,
  },
  iepName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 4,
  },
  iepDate: {
    fontSize: 14,
    color: Colors.textLight,
  },
  viewIepButton: {
    alignSelf: 'flex-end',
  },
  communicationCard: {
    padding: 16,
  },
  messageButton: {
    alignSelf: 'center',
    minWidth: 200,
  },
  buttonIcon: {
    marginRight: 8,
  },
  disclaimerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  disclaimerText: {
    fontSize: 12,
    color: Colors.textLight,
    marginLeft: 8,
    flex: 1,
  },
});