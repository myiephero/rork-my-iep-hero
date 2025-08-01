import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useAuth } from '@/hooks/auth-store';
import { useIEP } from '@/hooks/iep-store';
import Input from '@/components/Input';
import Button from '@/components/Button';
import Colors from '@/constants/colors';

export default function AddChildScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { addChild, isLoading } = useIEP();
  
  const [name, setName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [grade, setGrade] = useState('');
  const [school, setSchool] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  if (!user || user.role !== 'parent') {
    router.replace('/(tabs)');
    return null;
  }
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!name.trim()) {
      newErrors.name = 'Child name is required';
    }
    
    // Optional validation for date format if provided
    if (dateOfBirth && !/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateOfBirth)) {
      newErrors.dateOfBirth = 'Please use MM/DD/YYYY format';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      await addChild({
        name,
        dateOfBirth,
        grade,
        school,
        notes,
      });
      
      Alert.alert(
        'Success',
        'Child added successfully',
        [
          {
            text: 'OK',
            onPress: () => router.push('/children'),
          },
        ]
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add child';
      Alert.alert('Error', errorMessage);
    }
  };
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <Stack.Screen options={{ title: 'Add Child' }} />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Child Information</Text>
          <Text style={styles.subtitle}>
            Add information about your child to get personalized IEP support
          </Text>
        </View>
        
        <View style={styles.form}>
          <Input
            label="Child's Name *"
            placeholder="Enter your child's full name"
            value={name}
            onChangeText={setName}
            error={errors.name}
            testID="name-input"
          />
          
          <Input
            label="Date of Birth"
            placeholder="MM/DD/YYYY"
            value={dateOfBirth}
            onChangeText={setDateOfBirth}
            error={errors.dateOfBirth}
            testID="dob-input"
          />
          
          <Input
            label="Grade Level"
            placeholder="e.g. 3rd Grade, 7th Grade"
            value={grade}
            onChangeText={setGrade}
            testID="grade-input"
          />
          
          <Input
            label="School"
            placeholder="Enter school name"
            value={school}
            onChangeText={setSchool}
            testID="school-input"
          />
          
          <Input
            label="Additional Notes"
            placeholder="Any additional information about your child's needs"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            style={styles.notesInput}
            testID="notes-input"
          />
          
          <View style={styles.buttonContainer}>
            <Button
              title="Cancel"
              onPress={() => router.back()}
              variant="outline"
              style={styles.button}
              testID="cancel-button"
            />
            <Button
              title="Add Child"
              onPress={handleSubmit}
              loading={isLoading}
              disabled={isLoading}
              style={styles.button}
              testID="submit-button"
            />
          </View>
        </View>
        
        <Text style={styles.requiredText}>* Required fields</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
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
  form: {
    marginBottom: 24,
  },
  notesInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
  },
  requiredText: {
    fontSize: 14,
    color: Colors.textLight,
    fontStyle: 'italic',
  },
});