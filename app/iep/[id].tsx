import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useAuth } from '@/hooks/auth-store';
import { useIEP } from '@/hooks/iep-store';
import Card from '@/components/Card';
import Button from '@/components/Button';
import IEPSummaryCard from '@/components/IEPSummaryCard';
import { CoachingQuestions } from '@/components/CoachingQuestions';
import Colors from '@/constants/colors';
import { formatDate } from '@/utils/date';
import { FileText, Download, MessageSquare, AlertTriangle, RefreshCw, Sparkles } from 'lucide-react-native';

export default function IEPDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { ieps, isLoading, generateIEPSummary, generateCoachingQuestions, error, clearError } = useIEP();
  const [isGeneratingSummary, setIsGeneratingSummary] = useState<boolean>(false);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState<boolean>(false);
  const [coachingQuestions, setCoachingQuestions] = useState<string[]>([]);
  
  if (!id || !user) {
    router.replace('/(tabs)');
    return null;
  }
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }
  
  const iep = ieps.find(i => i.id === id);
  
  if (!iep) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>IEP not found</Text>
        <Button
          title="Go Back"
          onPress={() => router.back()}
          variant="outline"
          style={styles.errorButton}
        />
      </View>
    );
  }
  
  const handleOpenDocument = async () => {
    if (!iep) return;
    
    // Check if this is a local file URI (uploaded file) or a mock URL
    if (iep.fileUrl.startsWith('file://') || iep.fileUrl.startsWith('content://')) {
      // This is an uploaded file - in a real app, you would open it with a PDF viewer
      Alert.alert(
        'Document Preview',
        `This would open the uploaded document "${iep.fileName}". In a production app, this would use a PDF viewer to display the actual file content.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'View Summary Instead', 
            onPress: () => {
              // Scroll to summary section or ensure it's visible
              console.log('Showing AI summary instead of document');
            }
          }
        ]
      );
    } else {
      // This is a mock URL - show demo message
      Alert.alert(
        'Document Preview',
        `This is a demo document "${iep.fileName}". The AI has analyzed the content to provide the summary below. In a production app, this would open the actual PDF file.`,
        [{ text: 'OK' }]
      );
    }
  };

  const handleRegenerateSummary = async () => {
    if (!iep) return;
    
    Alert.alert(
      'Regenerate Summary',
      'This will create a new AI analysis of the IEP document. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Regenerate',
          onPress: async () => {
            try {
              setIsGeneratingSummary(true);
              clearError();
              await generateIEPSummary(iep.id);
            } catch (err) {
              console.error('Failed to regenerate summary:', err);
              Alert.alert('Error', 'Failed to regenerate summary. Please try again.');
            } finally {
              setIsGeneratingSummary(false);
            }
          }
        }
      ]
    );
  };

  const handleGenerateCoachingQuestions = async () => {
    if (!iep) return;
    
    try {
      setIsGeneratingQuestions(true);
      clearError();
      const questions = await generateCoachingQuestions(iep.id);
      setCoachingQuestions(questions);
    } catch (err) {
      console.error('Failed to generate coaching questions:', err);
      Alert.alert('Error', 'Failed to generate coaching questions. Please ensure the IEP has been analyzed first.');
    } finally {
      setIsGeneratingQuestions(false);
    }
  };
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: 'IEP Details' }} />
      
      <Card style={styles.documentCard}>
        <View style={styles.documentHeader}>
          <FileText size={32} color={Colors.primary} />
          <View style={styles.documentInfo}>
            <Text style={styles.documentName}>{iep.fileName}</Text>
            <Text style={styles.documentDate}>
              Uploaded on {formatDate(iep.uploadDate)}
            </Text>
          </View>
        </View>
        
        <Button
          title="Open Document"
          onPress={handleOpenDocument}
          variant="outline"
          style={styles.documentButton}
          testID="open-document-button"
          icon={<Download size={20} color={Colors.primary} />}
        />
      </Card>
      
      {!iep.summary && !isGeneratingSummary ? (
        <Card style={styles.processingCard}>
          <View style={styles.processingContent}>
            <Sparkles size={32} color={Colors.primary} />
            <Text style={styles.processingTitle}>Ready for AI Analysis</Text>
            <Text style={styles.processingText}>
              Generate an AI-powered summary of this IEP document to understand goals, services, and accommodations.
            </Text>
            <Button
              title="Analyze with AI"
              onPress={() => handleRegenerateSummary()}
              style={styles.analyzeButton}
              testID="analyze-iep-button"
              icon={<Sparkles size={20} color="white" />}
            />
          </View>
        </Card>
      ) : isGeneratingSummary ? (
        <Card style={styles.processingCard}>
          <View style={styles.processingContent}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.processingTitle}>Analyzing IEP</Text>
            <Text style={styles.processingText}>
              Our AI is currently analyzing this IEP document. This may take a few minutes.
            </Text>
          </View>
        </Card>
      ) : iep.summary ? (
        <View style={styles.summarySection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>AI-Generated Summary</Text>
            <Button
              title="Regenerate"
              onPress={handleRegenerateSummary}
              variant="outline"
              size="small"
              testID="regenerate-summary-button"
              icon={<RefreshCw size={16} color={Colors.primary} />}
            />
          </View>
          <IEPSummaryCard
            summary={iep.summary}
            testID="iep-summary"
          />
        </View>
      ) : null}
      
      {iep.summary && (
        <View style={styles.section}>
          <CoachingQuestions
            questions={coachingQuestions}
            onGenerateQuestions={handleGenerateCoachingQuestions}
            isLoading={isGeneratingQuestions}
            testID="coaching-questions"
          />
        </View>
      )}
      
      {error && (
        <Card style={styles.errorCard}>
          <View style={styles.errorContent}>
            <AlertTriangle size={24} color={Colors.error} />
            <Text style={styles.errorTitle}>Error</Text>
            <Text style={styles.errorMessage}>{String(error)}</Text>
            <Button
              title="Dismiss"
              onPress={clearError}
              variant="outline"
              size="small"
              style={styles.dismissButton}
            />
          </View>
        </Card>
      )}
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Need Help Understanding?</Text>
        <Card style={styles.helpCard}>
          <View style={styles.helpContent}>
            <MessageSquare size={32} color={Colors.primary} />
            <View style={styles.helpInfo}>
              <Text style={styles.helpTitle}>Connect with an Advocate</Text>
              <Text style={styles.helpText}>
                Get personalized guidance from a special education advocate who can help you understand this IEP.
              </Text>
            </View>
          </View>
          
          <Button
            title="Request Advocate Support"
            onPress={() => router.push(`/request-help?iepId=${id}`)}
            style={styles.helpButton}
            testID="request-help-button"
          />
        </Card>
      </View>
      
      <View style={styles.disclaimerContainer}>
        <AlertTriangle size={16} color={Colors.warning} />
        <Text style={styles.disclaimerText}>
          This AI-generated summary is not legal advice. My IEP Hero is not a FERPA-compliant system. This MVP is for educational guidance only.
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
  documentCard: {
    marginBottom: 24,
  },
  documentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  documentInfo: {
    flex: 1,
    marginLeft: 16,
  },
  documentName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 4,
  },
  documentDate: {
    fontSize: 14,
    color: Colors.textLight,
  },
  documentButton: {
    alignSelf: 'flex-end',
  },

  analyzeButton: {
    marginTop: 16,
    minWidth: 160,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  errorCard: {
    marginBottom: 16,
    backgroundColor: Colors.error + '10',
    borderColor: Colors.error,
    borderWidth: 1,
  },
  errorContent: {
    alignItems: 'center',
    padding: 8,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.error,
    marginTop: 8,
    marginBottom: 4,
  },
  errorMessage: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 12,
  },
  dismissButton: {
    minWidth: 100,
  },
  processingCard: {
    marginBottom: 24,
    padding: 24,
  },
  processingContent: {
    alignItems: 'center',
  },
  processingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textDark,
    marginTop: 16,
    marginBottom: 8,
  },
  processingText: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 24,
  },
  summarySection: {
    marginBottom: 24,
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
  helpCard: {
    padding: 16,
  },
  helpContent: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  helpInfo: {
    flex: 1,
    marginLeft: 16,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 4,
  },
  helpText: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 20,
  },
  helpButton: {
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