import React from 'react';
import { StyleSheet, Text, View, ScrollView, Switch, TouchableOpacity, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/auth-store';
import { useFeedback } from '@/hooks/feedback-store';
import Button from '@/components/Button';
import FeedbackButton from '@/components/FeedbackButton';
import Colors from '@/constants/colors';
import { 
  LogOut, 
  Bell, 
  Lock, 
  HelpCircle, 
  FileText, 
  ChevronRight,
  Shield,
  User,
  MessageSquare,
  History
} from 'lucide-react-native';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, signOut, isParent, isAdvocate } = useAuth();
  const { getUserFeedback, loadFeedback } = useFeedback();
  
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  
  React.useEffect(() => {
    loadFeedback();
  }, [loadFeedback]);
  
  const userFeedback = getUserFeedback();
  const pendingFeedback = userFeedback.filter(f => f.status === 'pending').length;
  
  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          onPress: async () => {
            await signOut();
            router.replace('/(auth)');
          },
        },
      ]
    );
  };
  
  if (!user) {
    router.replace('/(auth)');
    return null;
  }
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.profileSection}>
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user.name.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user.name}</Text>
            <Text style={styles.profileEmail}>{user.email}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </Text>
            </View>
          </View>
        </View>
        
        <TouchableOpacity style={styles.editProfileButton}>
          <Text style={styles.editProfileText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        
        <TouchableOpacity style={styles.settingItem}>
          <User size={20} color={Colors.text} style={styles.settingIcon} />
          <View style={styles.settingContent}>
            <Text style={styles.settingLabel}>Personal Information</Text>
          </View>
          <ChevronRight size={20} color={Colors.textLight} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingItem}>
          <Lock size={20} color={Colors.text} style={styles.settingIcon} />
          <View style={styles.settingContent}>
            <Text style={styles.settingLabel}>Password & Security</Text>
          </View>
          <ChevronRight size={20} color={Colors.textLight} />
        </TouchableOpacity>
        
        {isAdvocate && (
          <TouchableOpacity style={styles.settingItem}>
            <FileText size={20} color={Colors.text} style={styles.settingIcon} />
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Credentials & Expertise</Text>
            </View>
            <ChevronRight size={20} color={Colors.textLight} />
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        
        <View style={styles.settingItem}>
          <Bell size={20} color={Colors.text} style={styles.settingIcon} />
          <View style={styles.settingContent}>
            <Text style={styles.settingLabel}>Notifications</Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: Colors.disabled, true: Colors.primaryLight }}
            thumbColor={notificationsEnabled ? Colors.primary : '#f4f3f4'}
            ios_backgroundColor={Colors.disabled}
          />
        </View>
        
        <TouchableOpacity style={styles.settingItem}>
          <Shield size={20} color={Colors.text} style={styles.settingIcon} />
          <View style={styles.settingContent}>
            <Text style={styles.settingLabel}>Privacy Settings</Text>
          </View>
          <ChevronRight size={20} color={Colors.textLight} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        
        <TouchableOpacity style={styles.settingItem}>
          <HelpCircle size={20} color={Colors.text} style={styles.settingIcon} />
          <View style={styles.settingContent}>
            <Text style={styles.settingLabel}>Help Center</Text>
          </View>
          <ChevronRight size={20} color={Colors.textLight} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.settingItem}
          onPress={() => router.push('/feedback?location=Settings')}
        >
          <MessageSquare size={20} color={Colors.text} style={styles.settingIcon} />
          <View style={styles.settingContent}>
            <Text style={styles.settingLabel}>Send Feedback</Text>
            <Text style={styles.settingDescription}>Help us improve the app</Text>
          </View>
          <ChevronRight size={20} color={Colors.textLight} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.settingItem}
          onPress={() => router.push('/feedback-history')}
        >
          <History size={20} color={Colors.text} style={styles.settingIcon} />
          <View style={styles.settingContent}>
            <Text style={styles.settingLabel}>Feedback History</Text>
            <Text style={styles.settingDescription}>
              {userFeedback.length} submitted{pendingFeedback > 0 ? `, ${pendingFeedback} pending` : ''}
            </Text>
          </View>
          <ChevronRight size={20} color={Colors.textLight} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingItem}>
          <FileText size={20} color={Colors.text} style={styles.settingIcon} />
          <View style={styles.settingContent}>
            <Text style={styles.settingLabel}>Terms of Service</Text>
          </View>
          <ChevronRight size={20} color={Colors.textLight} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingItem}>
          <Shield size={20} color={Colors.text} style={styles.settingIcon} />
          <View style={styles.settingContent}>
            <Text style={styles.settingLabel}>Privacy Policy</Text>
          </View>
          <ChevronRight size={20} color={Colors.textLight} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.signOutSection}>
        <Button
          title="Sign Out"
          onPress={handleSignOut}
          variant="outline"
          style={styles.signOutButton}
          textStyle={styles.signOutButtonText}
          testID="sign-out-button"
          icon={<LogOut size={20} color={Colors.error} style={styles.signOutIcon} />}
        />
      </View>
      
      <View style={styles.feedbackSection}>
        <Text style={styles.sectionTitle}>Beta Testing</Text>
        <View style={styles.betaCard}>
          <Text style={styles.betaTitle}>Help Us Improve!</Text>
          <Text style={styles.betaDescription}>
            You're using the beta version of My IEP Hero. Your feedback is crucial for making this app better for all families.
          </Text>
          <FeedbackButton 
            location="Settings - Beta Card"
            variant="inline"
            style={styles.feedbackButton}
          />
        </View>
      </View>
      
      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>My IEP Hero v1.0.0 Beta</Text>
        <Text style={styles.disclaimerText}>
          This is a beta version for testing purposes.
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
    paddingBottom: 40,
  },
  profileSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textDark,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 8,
  },
  roleBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  editProfileButton: {
    alignSelf: 'flex-end',
  },
  editProfileText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  settingIcon: {
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    color: Colors.text,
  },
  settingDescription: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 2,
  },
  signOutSection: {
    paddingHorizontal: 20,
    paddingTop: 32,
  },
  signOutButton: {
    borderColor: Colors.error,
  },
  signOutButtonText: {
    color: Colors.error,
  },
  signOutIcon: {
    marginRight: 8,
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: 40,
    paddingHorizontal: 20,
  },
  versionText: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 4,
  },
  disclaimerText: {
    fontSize: 12,
    color: Colors.textLight,
    textAlign: 'center',
  },
  feedbackSection: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  betaCard: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  betaTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 8,
  },
  betaDescription: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
    marginBottom: 16,
  },
  feedbackButton: {
    alignSelf: 'flex-start',
  },
});