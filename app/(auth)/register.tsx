import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { useAuth } from '@/hooks/auth-store';
import Colors from '@/constants/colors';
import { UserRole } from '@/types';

export default function RegisterScreen() {
  const router = useRouter();
  const { signUp, isLoading } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('parent');
  const [error, setError] = useState<string | null>(null);
  
  const handleRegister = async () => {
    // Validate inputs
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    try {
      setError(null);
      await signUp(email, password, name, role);
      
      // Navigate to waitlist page
      router.push('/waitlist');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create account';
      setError(errorMessage);
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>
                Join My IEP Hero to get support for your special education journey
              </Text>
            </View>
            
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
            
            <View style={styles.form}>
              <Input
                label="Full Name"
                placeholder="Enter your full name"
                value={name}
                onChangeText={setName}
                testID="name-input"
              />
              
              <Input
                label="Email"
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                testID="email-input"
              />
              
              <Input
                label="Password"
                placeholder="Create a password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                testID="password-input"
              />
              
              <Input
                label="Confirm Password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                testID="confirm-password-input"
              />
              
              <View style={styles.roleContainer}>
                <Text style={styles.roleLabel}>I am a:</Text>
                <View style={styles.roleButtons}>
                  <Button
                    title="Parent"
                    onPress={() => setRole('parent')}
                    variant={role === 'parent' ? 'primary' : 'outline'}
                    style={styles.roleButton}
                    testID="parent-role-button"
                  />
                  <Button
                    title="Advocate"
                    onPress={() => setRole('advocate')}
                    variant={role === 'advocate' ? 'primary' : 'outline'}
                    style={styles.roleButton}
                    testID="advocate-role-button"
                  />
                </View>
              </View>
              
              <Button
                title="Create Account"
                onPress={handleRegister}
                loading={isLoading}
                disabled={isLoading}
                style={styles.button}
                testID="register-button"
              />
            </View>
            
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Already have an account?{' '}
                <Text
                  style={styles.footerLink}
                  onPress={() => router.push('/login')}
                >
                  Sign In
                </Text>
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.textDark,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textLight,
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: Colors.error,
    fontSize: 14,
  },
  form: {
    marginBottom: 24,
  },
  roleContainer: {
    marginBottom: 24,
  },
  roleLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 12,
  },
  roleButtons: {
    flexDirection: 'row',
  },
  roleButton: {
    flex: 1,
    marginRight: 12,
  },
  button: {
    marginTop: 8,
  },
  footer: {
    marginTop: 'auto',
    paddingVertical: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 16,
    color: Colors.textLight,
  },
  footerLink: {
    color: Colors.primary,
    fontWeight: '600',
  },
});