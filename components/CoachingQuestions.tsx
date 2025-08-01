import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { HelpCircle, RefreshCw, CheckCircle } from 'lucide-react-native';
import Colors from '@/constants/colors';

interface CoachingQuestionsProps {
  questions: string[];
  onGenerateQuestions: () => Promise<void>;
  isLoading?: boolean;
  testID?: string;
}

export function CoachingQuestions({ 
  questions, 
  onGenerateQuestions, 
  isLoading = false,
  testID 
}: CoachingQuestionsProps) {
  const [checkedQuestions, setCheckedQuestions] = useState<Set<number>>(new Set());

  const toggleQuestion = (index: number) => {
    const newChecked = new Set(checkedQuestions);
    if (newChecked.has(index)) {
      newChecked.delete(index);
    } else {
      newChecked.add(index);
    }
    setCheckedQuestions(newChecked);
  };

  if (isLoading) {
    return (
      <View style={styles.container} testID={testID}>
        <View style={styles.header}>
          <HelpCircle size={20} color={Colors.primary} />
          <Text style={styles.title}>Coaching Questions</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Generating personalized questions...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.header}>
        <HelpCircle size={20} color={Colors.primary} />
        <Text style={styles.title}>Coaching Questions</Text>
        <TouchableOpacity 
          onPress={onGenerateQuestions}
          style={styles.refreshButton}
          testID={`${testID}-refresh`}
        >
          <RefreshCw size={16} color={Colors.primary} />
        </TouchableOpacity>
      </View>
      
      <Text style={styles.subtitle}>
        These AI-generated questions will help you prepare for IEP meetings and advocate for your child.
      </Text>

      <ScrollView style={styles.questionsContainer} showsVerticalScrollIndicator={false}>
        {questions.length > 0 ? (
          questions.map((question, index) => {
            const cleanQuestion = String(question).trim();
            if (!cleanQuestion) return null;
            
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.questionItem,
                  checkedQuestions.has(index) && styles.questionItemChecked
                ]}
                onPress={() => toggleQuestion(index)}
                testID={`${testID}-question-${index}`}
              >
                <View style={styles.questionContent}>
                  <Text style={[
                    styles.questionText,
                    checkedQuestions.has(index) && styles.questionTextChecked
                  ]}>
                    {cleanQuestion}
                  </Text>
                  <View style={[
                    styles.checkbox,
                    checkedQuestions.has(index) && styles.checkboxChecked
                  ]}>
                    {checkedQuestions.has(index) && (
                      <CheckCircle size={16} color={Colors.success} />
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              Click the refresh button to generate personalized coaching questions.
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Tip: Check off questions as you prepare answers or discuss them with your advocate.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text,
    marginLeft: 8,
    flex: 1,
  },
  refreshButton: {
    padding: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 16,
    lineHeight: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 12,
  },
  questionsContainer: {
    maxHeight: 300,
  },
  questionItem: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  questionItemChecked: {
    backgroundColor: Colors.success + '10',
    borderColor: Colors.success,
  },
  questionContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  questionText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
    flex: 1,
    marginRight: 8,
  },
  questionTextChecked: {
    color: Colors.textLight,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    borderColor: Colors.success,
    backgroundColor: Colors.success + '20',
  },
  footer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  footerText: {
    fontSize: 12,
    color: Colors.textLight,
    fontStyle: 'italic' as const,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 20,
  },
});