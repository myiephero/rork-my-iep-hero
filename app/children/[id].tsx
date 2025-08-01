import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useAuth } from '@/hooks/auth-store';
import { useIEP } from '@/hooks/iep-store';
import { useCase } from '@/hooks/case-store';
import Card from '@/components/Card';
import Button from '@/components/Button';
import FileUpload from '@/components/FileUpload';
import IEPSummaryCard from '@/components/IEPSummaryCard';
import Colors from '@/constants/colors';
import { formatDate } from '@/utils/date';
import { FileText, Upload, MessageSquare, AlertTriangle } from 'lucide-react-native';

export default function ChildDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { getChild, getChildIEPs, uploadIEP, isLoading: iepLoading } = useIEP();
  const { getChildCase, isLoading: caseLoading } = useCase();
  
  const [selectedFile, setSelectedFile] = useState<{ uri: string; name: string; type: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  
  if (!id || !user || user.role !== 'parent') {
    router.replace('/(tabs)');
    return null;
  }
  
  const child = getChild(id);
  const ieps = getChildIEPs(id);
  const childCase = getChildCase(id);
  
  if (iepLoading || caseLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }
  
  if (!child) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Child not found</Text>
        <Button
          title="Go Back"
          onPress={() => router.back()}
          variant="outline"
          style={styles.errorButton}
        />
      </View>
    );
  }
  
  const handleFileSelected = (file: { uri: string; name: string; type: string }) => {
    setSelectedFile(file);
  };
  
  const handleUploadIEP = async () => {
    if (!selectedFile || !selectedFile.uri) {
      Alert.alert('Error', 'Please select a file to upload');
      return;
    }
    
    try {
      setUploading(true);
      await uploadIEP(id, selectedFile.name, selectedFile.uri);
      
      Alert.alert(
        'Success',
        'IEP uploaded successfully. Our AI is analyzing it now.',
        [
          {
            text: 'OK',
            onPress: () => setSelectedFile(null),
          },
        ]
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload IEP';
      Alert.alert('Error', errorMessage);
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: child.name }} />
      
      <View style={styles.childInfoCard}>
        <View style={styles.childHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{child.name.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.childInfo}>
            <Text style={styles.childName}>{child.name}</Text>
            {child.grade && <Text style={styles.childDetail}>{child.grade}</Text>}
            {child.school && <Text style={styles.childDetail}>{child.school}</Text>}
            {child.dateOfBirth && (
              <Text style={styles.childDetail}>
                DOB: {formatDate(child.dateOfBirth)}
              </Text>
            )}
          </View>
        </View>
        
        <View style={styles.buttonContainer}>
          <Button
            title="Edit Information"
            onPress={() => router.push(`/children/edit/${id}`)}
            variant="outline"
            style={styles.actionButton}
            testID="edit-child-button"
          />
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>IEP Documents</Text>
        
        {ieps.length === 0 ? (
          <Card style={styles.emptyCard}>
            <View style={styles.emptyContent}>
              <FileText size={40} color={Colors.primary} />
              <Text style={styles.emptyTitle}>No IEPs Uploaded</Text>
              <Text style={styles.emptyText}>
                Upload your child's IEP to get AI-powered insights and advocate support.
              </Text>
            </View>
          </Card>
        ) : (
          ieps.map((iep) => (
            <Card key={iep.id} style={styles.iepCard} onPress={() => router.push(`/iep/${iep.id}`)}>
              <View style={styles.iepHeader}>
                <FileText size={24} color={Colors.primary} />
                <View style={styles.iepInfo}>
                  <Text style={styles.iepName}>{iep.fileName}</Text>
                  <Text style={styles.iepDate}>
                    Uploaded on {formatDate(iep.uploadDate)}
                  </Text>
                </View>
              </View>
              
              {iep.summary ? (
                <Button
                  title="View Summary"
                  onPress={() => router.push(`/iep/${iep.id}`)}
                  variant="outline"
                  size="small"
                  style={styles.viewSummaryButton}
                  testID={`view-summary-${iep.id}-button`}
                />
              ) : (
                <View style={styles.processingContainer}>
                  <ActivityIndicator size="small" color={Colors.primary} />
                  <Text style={styles.processingText}>Processing...</Text>
                </View>
              )}
            </Card>
          ))
        )}
        
        <Card style={styles.uploadCard}>
          <Text style={styles.uploadTitle}>Upload New IEP</Text>
          <FileUpload
            onFileSelected={handleFileSelected}
            selectedFile={selectedFile}
            loading={uploading}
            testID="file-upload"
          />
          
          <Button
            title="Upload IEP"
            onPress={handleUploadIEP}
            loading={uploading}
            disabled={!selectedFile || !selectedFile.uri || uploading}
            style={styles.uploadButton}
            testID="upload-button"
            icon={<Upload size={20} color="#fff" />}
          />
        </Card>
      </View>
      
      {ieps.length > 0 && ieps[0].summary && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Latest IEP Summary</Text>
          <IEPSummaryCard
            summary={ieps[0].summary}
            testID="iep-summary"
          />
        </View>
      )}
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Advocate Support</Text>
        
        {childCase ? (
          <Card style={styles.caseCard}>
            <View style={styles.caseHeader}>
              <Text style={styles.caseTitle}>Current Support Case</Text>
              <View style={[
                styles.caseStatus,
                childCase.status === 'active' ? styles.caseStatusActive : 
                childCase.status === 'pending' ? styles.caseStatusPending : 
                styles.caseStatusCompleted
              ]}>
                <Text style={styles.caseStatusText}>
                  {childCase.status.charAt(0).toUpperCase() + childCase.status.slice(1)}
                </Text>
              </View>
            </View>
            
            <View style={styles.caseDetails}>
              <Text style={styles.caseDetailLabel}>Help Type:</Text>
              <Text style={styles.caseDetailValue}>{childCase.helpType}</Text>
            </View>
            
            <View style={styles.caseActions}>
              <Button
                title="View Details"
                onPress={() => router.push(`/cases/${childCase.id}`)}
                variant="outline"
                size="small"
                style={styles.caseActionButton}
                testID="view-case-button"
              />
              <Button
                title="Message Advocate"
                onPress={() => router.push(`/messages/${childCase.advocateId}`)}
                variant="primary"
                size="small"
                style={styles.caseActionButton}
                testID="message-advocate-button"
                icon={<MessageSquare size={16} color="#fff" />}
              />
            </View>
          </Card>
        ) : (
          <Card style={styles.requestCard}>
            <View style={styles.requestContent}>
              <MessageSquare size={40} color={Colors.primary} />
              <Text style={styles.requestTitle}>Need Help with Your IEP?</Text>
              <Text style={styles.requestText}>
                Connect with a qualified advocate who can help you understand and navigate your child's IEP.
              </Text>
            </View>
            <Button
              title="Request Advocate Support"
              onPress={() => router.push(`/request-help?childId=${id}`)}
              style={styles.requestButton}
              testID="request-help-button"
            />
          </Card>
        )}
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
  childInfoCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  childHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  childInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  childName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textDark,
    marginBottom: 4,
  },
  childDetail: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 2,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    minWidth: 140,
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
  emptyCard: {
    padding: 24,
  },
  emptyContent: {
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textDark,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 24,
  },
  iepCard: {
    marginBottom: 12,
  },
  iepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
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
  viewSummaryButton: {
    alignSelf: 'flex-end',
  },
  processingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  processingText: {
    fontSize: 14,
    color: Colors.textLight,
    marginLeft: 8,
    fontStyle: 'italic',
  },
  uploadCard: {
    marginTop: 16,
  },
  uploadTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 12,
  },
  uploadButton: {
    marginTop: 16,
    alignSelf: 'flex-end',
  },

  caseCard: {
    marginBottom: 12,
  },
  caseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  caseTitle: {
    fontSize: 16,
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
  caseDetailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 4,
  },
  caseDetailValue: {
    fontSize: 14,
    color: Colors.text,
  },
  caseActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  caseActionButton: {
    marginLeft: 8,
  },
  requestCard: {
    padding: 16,
  },
  requestContent: {
    alignItems: 'center',
    marginBottom: 16,
  },
  requestTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textDark,
    marginTop: 16,
    marginBottom: 8,
  },
  requestText: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 8,
  },
  requestButton: {
    alignSelf: 'center',
    minWidth: 200,
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