import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useAuth } from '@/hooks/auth-store';
import { useIEP } from '@/hooks/iep-store';
import { useCase } from '@/hooks/case-store';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Colors from '@/constants/colors';
import { MessageSquare, AlertTriangle } from 'lucide-react-native';

const HELP_TYPES = [
  'IEP Review and Recommendations',
  'Meeting Preparation',
  'Understanding Services and Accommodations',
  'Dispute Resolution',
  'Transition Planning',
  'Other'
];

export default function RequestHelpScreen() {
  const { childId, iepId } = useLocalSearchParams<{ childId?: string; iepId?: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { children, ieps } = useIEP();
  const { createCase, isLoading } = useCase();
  
  const [selectedChildId, setSelectedChildId] = useState<string>(childId || '');
  const [selectedIepId, setSelectedIepId] = useState<string>(iepId || '');
  const [helpType, setHelpType] = useState<string>(HELP_TYPES[0]);
  const [notes, setNotes] = useState<string>('');
  
  if (!user || user.role !== 'parent') {
    router.replace('/(tabs)');
    return null;
  }
  
  // Get child's IEPs
  const childIEPs = selectedChildId 
    ? ieps.filter(iep => iep.childId === selectedChildId)
    : [];
  
  const handleSubmit = async () => {
    if (!selectedChildId) {
      Alert.alert('Error', 'Please select a child');
      return;
    }
    
    if (!selectedIepId) {
      Alert.alert('Error', 'Please select an IEP');
      return;
    }
    
    try {
      await createCase(selectedChildId, selectedIepId, helpType);
      
      Alert.alert(
        'Success',
        'Your request has been submitted. An advocate will be assigned to your case soon.',
        [
          {
            text: 'OK',
            onPress: () => router.push('/(tabs)'),
          },
        ]
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit request';
      Alert.alert('Error', errorMessage);
    }
  };
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: 'Request Advocate Help' }} />
      
      <View style={styles.header}>
        <Text style={styles.title}>Connect with an Advocate</Text>
        <Text style={styles.subtitle}>
          Get personalized guidance from a special education advocate who can help you navigate your child's IEP.
        </Text>
      </View>
      
      <Card style={styles.formCard}>
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Select Child</Text>
          <View style={styles.childrenContainer}>
            {children.map((child) => (
              <Button
                key={child.id}
                title={child.name}
                variant={selectedChildId === child.id ? 'primary' : 'outline'}
                onPress={() => {
                  setSelectedChildId(child.id);
                  setSelectedIepId(''); // Reset IEP selection when child changes
                }}
                style={styles.childButton}
                testID={`child-button-${child.id}`}
              />
            ))}
          </View>
        </View>
        
        {selectedChildId && (
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Select IEP</Text>
            {childIEPs.length === 0 ? (
              <View style={styles.noIepsContainer}>
                <Text style={styles.noIepsText}>
                  No IEPs found for this child. Please upload an IEP first.
                </Text>
                <Button
                  title="Upload IEP"
                  onPress={() => router.push(`/children/${selectedChildId}`)}
                  variant="outline"
                  style={styles.uploadButton}
                  testID="upload-iep-button"
                />
              </View>
            ) : (
              <View style={styles.iepsContainer}>
                {childIEPs.map((iep) => (
                  <Button
                    key={iep.id}
                    title={iep.fileName}
                    variant={selectedIepId === iep.id ? 'primary' : 'outline'}
                    onPress={() => setSelectedIepId(iep.id)}
                    style={styles.iepButton}
                    testID={`iep-button-${iep.id}`}
                  />
                ))}
              </View>
            )}
          </View>
        )}
        
        {selectedChildId && selectedIepId && (
          <>
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>What type of help do you need?</Text>
              <View style={styles.helpTypesContainer}>
                {HELP_TYPES.map((type) => (
                  <Button
                    key={type}
                    title={type}
                    variant={helpType === type ? 'primary' : 'outline'}
                    onPress={() => setHelpType(type)}
                    style={styles.helpTypeButton}
                    testID={`help-type-button-${type}`}
                  />
                ))}
              </View>
            </View>
            
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Additional Notes (Optional)</Text>
              <Input
                placeholder="Provide any specific questions or concerns you have..."
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={4}
                style={styles.notesInput}
                testID="notes-input"
              />
            </View>
          </>
        )}
      </Card>
      
      <View style={styles.submitContainer}>
        <Button
          title="Cancel"
          onPress={() => router.back()}
          variant="outline"
          style={styles.actionButton}
          testID="cancel-button"
        />
        <Button
          title="Submit Request"
          onPress={handleSubmit}
          loading={isLoading}
          disabled={!selectedChildId || !selectedIepId || isLoading}
          style={styles.actionButton}
          testID="submit-button"
          icon={<MessageSquare size={20} color="#fff" style={styles.buttonIcon} />}
        />
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
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textDark,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textLight,
    lineHeight: 24,
  },
  formCard: {
    marginBottom: 24,
  },
  formSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 12,
  },
  childrenContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  childButton: {
    margin: 4,
    minWidth: 120,
  },
  noIepsContainer: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F5F7FF',
    borderRadius: 8,
  },
  noIepsText: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 12,
  },
  uploadButton: {
    minWidth: 120,
  },
  iepsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  iepButton: {
    margin: 4,
    minWidth: 150,
  },
  helpTypesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  helpTypeButton: {
    margin: 4,
    minWidth: 150,
  },
  notesInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 8,
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
  },
  disclaimerText: {
    fontSize: 12,
    color: Colors.textLight,
    marginLeft: 8,
    flex: 1,
  },
});