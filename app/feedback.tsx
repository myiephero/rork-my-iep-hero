import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { useFeedback } from '@/hooks/feedback-store';
import Button from '@/components/Button';
import Colors from '@/constants/colors';
import {
  Bug,
  Lightbulb,
  MessageSquare,
  Palette,
  Zap,
  Star,
  Send,
  ArrowLeft,
} from 'lucide-react-native';

const feedbackTypes = [
  { id: 'bug', label: 'Bug Report', icon: Bug, color: Colors.error },
  { id: 'feature', label: 'Feature Request', icon: Lightbulb, color: Colors.warning },
  { id: 'ui', label: 'UI/UX Feedback', icon: Palette, color: Colors.primary },
  { id: 'performance', label: 'Performance Issue', icon: Zap, color: Colors.primary },
  { id: 'general', label: 'General Feedback', icon: MessageSquare, color: Colors.success },
];

export default function FeedbackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { submitFeedback, isSubmitting, getDeviceInfo } = useFeedback();
  
  const [selectedType, setSelectedType] = useState<string>('general');
  
  const handleTypeSelection = (typeId: string) => {
    console.log('Selecting feedback type:', typeId, 'current:', selectedType);
    setSelectedType(typeId);
    console.log('After setting, selectedType should be:', typeId);
  };
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [rating, setRating] = useState<number | undefined>(undefined);
  const [category, setCategory] = useState('');
  
  // Pre-fill location from params
  const location = (params.location as string) || 'Unknown';
  
  useEffect(() => {
    if (params.type && typeof params.type === 'string') {
      setSelectedType(params.type);
    }
    if (params.title && typeof params.title === 'string') {
      setTitle(params.title);
    }
  }, [params]);

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert('Missing Information', 'Please fill in both title and description.');
      return;
    }

    try {
      await submitFeedback({
        type: selectedType as any,
        category: category || selectedType,
        title: title.trim(),
        description: description.trim(),
        rating,
        deviceInfo: getDeviceInfo(),
        location,
      });

      Alert.alert(
        'Feedback Submitted',
        'Thank you for your feedback! We\'ll review it and get back to you if needed.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to submit feedback. Please try again.');
    }
  };

  const renderStarRating = () => {
    return (
      <View style={styles.ratingContainer}>
        <Text style={styles.ratingLabel}>Overall Rating (Optional)</Text>
        <View style={styles.starsContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity
              key={star}
              onPress={() => setRating(star)}
              style={styles.starButton}
            >
              <Star
                size={32}
                color={rating && star <= rating ? Colors.warning : Colors.border}
                fill={rating && star <= rating ? Colors.warning : 'transparent'}
              />
            </TouchableOpacity>
          ))}
        </View>
        {rating && (
          <TouchableOpacity onPress={() => setRating(undefined)} style={styles.clearRating}>
            <Text style={styles.clearRatingText}>Clear Rating</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Send Feedback',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color="#fff" />
            </TouchableOpacity>
          ),
        }}
      />
      
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>We'd love your feedback!</Text>
          <Text style={styles.subtitle}>
            Help us improve My IEP Hero by sharing your thoughts and experiences.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Feedback Type</Text>
          <View style={styles.typeGrid}>
            {feedbackTypes.map((type) => {
              const IconComponent = type.icon;
              const isSelected = selectedType === type.id;
              
              console.log(`Rendering ${type.id}: isSelected=${isSelected}, selectedType=${selectedType}`);
              
              return (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.typeButton,
                    isSelected && styles.typeButtonSelected,
                    isSelected && { 
                      backgroundColor: type.color + '20', 
                      borderColor: type.color
                    }
                  ]}
                  onPress={() => handleTypeSelection(type.id)}
                  activeOpacity={0.7}
                  testID={`feedback-type-${type.id}`}
                >
                  <IconComponent
                    size={24}
                    color={isSelected ? type.color : Colors.textLight}
                  />
                  <Text style={[
                    styles.typeLabel,
                    isSelected && { color: type.color, fontWeight: '600' }
                  ]}>
                    {type.label}
                  </Text>
                  {isSelected && (
                    <View style={[styles.selectedIndicator, { backgroundColor: type.color }]} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Title</Text>
          <TextInput
            style={styles.titleInput}
            value={title}
            onChangeText={setTitle}
            placeholder="Brief summary of your feedback"
            placeholderTextColor={Colors.textLight}
            maxLength={100}
          />
          <Text style={styles.charCount}>{title.length}/100</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <TextInput
            style={styles.descriptionInput}
            value={description}
            onChangeText={setDescription}
            placeholder="Please provide detailed information about your feedback..."
            placeholderTextColor={Colors.textLight}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            maxLength={1000}
          />
          <Text style={styles.charCount}>{description.length}/1000</Text>
        </View>

        {renderStarRating()}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Category (Optional)</Text>
          <TextInput
            style={styles.titleInput}
            value={category}
            onChangeText={setCategory}
            placeholder="e.g., Dashboard, File Upload, Messages"
            placeholderTextColor={Colors.textLight}
            maxLength={50}
          />
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Additional Information</Text>
          <Text style={styles.infoText}>
            • Location: {location}
          </Text>
          <Text style={styles.infoText}>
            • Platform: {Platform.OS} {Platform.Version}
          </Text>
          <Text style={styles.infoText}>
            • This feedback will be reviewed by our team
          </Text>
        </View>

        <View style={styles.submitSection}>
          <Button
            title="Submit Feedback"
            onPress={handleSubmit}
            loading={isSubmitting}
            disabled={!title.trim() || !description.trim()}
            icon={<Send size={20} color="#fff" />}
            testID="submit-feedback-button"
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
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 12,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: '#fff',
    minWidth: '45%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  typeButtonSelected: {
    borderWidth: 2,
    shadowOpacity: 0.15,
    elevation: 3,
  },
  typeLabel: {
    fontSize: 14,
    color: Colors.text,
    marginLeft: 8,
    flex: 1,
  },
  titleInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text,
    backgroundColor: '#fff',
  },
  descriptionInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text,
    backgroundColor: '#fff',
    minHeight: 120,
  },
  charCount: {
    fontSize: 12,
    color: Colors.textLight,
    textAlign: 'right',
    marginTop: 4,
  },
  ratingContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 12,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  starButton: {
    padding: 4,
  },
  clearRating: {
    marginTop: 8,
  },
  clearRatingText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  infoSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
    backgroundColor: Colors.background,
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 16,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: Colors.textLight,
    marginBottom: 4,
  },
  submitSection: {
    paddingHorizontal: 20,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});