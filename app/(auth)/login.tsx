import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { useAuth } from '@/hooks/auth-store';
import Colors from '@/constants/colors';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, isLoading } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    try {
      setError(null);
      const user = await signIn(email, password);
      
      if (user) {
        // Navigate based on user role
        if (user.role === 'parent' || user.role === 'advocate') {
          router.replace('/(tabs)');
        } else if (user.role === 'admin') {
          router.replace('/admin');
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign in';
      setError(errorMessage);
    }
  };
  
  // For demo purposes, add quick login buttons
  const quickLogin = (role: 'parent' | 'advocate' | 'admin') => {
    if (role === 'parent') {
      setEmail('parent@example.com');
      setPassword('password');
    } else if (role === 'advocate') {
      setEmail('advocate@example.com');
      setPassword('password');
    } else {
      setEmail('admin@example.com');
      setPassword('password');
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
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>
                Sign in to continue to My IEP Hero
              </Text>
            </View>
            
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
            
            <View style={styles.form}>
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
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                testID="password-input"
              />
              
              <TouchableOpacity style={styles.forgotPassword}>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
              
              <Button
                title="Sign In"
                onPress={handleLogin}
                loading={isLoading}
                disabled={isLoading}
                style={styles.button}
                testID="login-button"
              />
            </View>
            
            <View style={styles.demoContainer}>
              <Text style={styles.demoTitle}>Demo Accounts</Text>
              <View style={styles.demoButtons}>
                <Button
                  title="Parent"
                  onPress={() => quickLogin('parent')}
                  variant="outline"
                  size="small"
                  style={styles.demoButton}
                />
                <Button
                  title="Advocate"
                  onPress={() => quickLogin('advocate')}
                  variant="outline"
                  size="small"
                  style={styles.demoButton}
                />
                <Button
                  title="Admin"
                  onPress={() => quickLogin('admin')}
                  variant="outline"
                  size="small"
                  style={styles.demoButton}
                />
              </View>
            </View>
            
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Don't have an account?{' '}
                <Text
                  style={styles.footerLink}
                  onPress={() => router.push('/register')}
                >
                  Create Account
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
    marginBottom: 32,
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: Colors.primary,
    fontSize: 14,
  },
  button: {
    marginTop: 8,
  },
  demoContainer: {
    marginTop: 32,
    padding: 16,
    backgroundColor: '#F5F7FF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  demoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 12,
    textAlign: 'center',
  },
  demoButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  demoButton: {
    flex: 1,
    marginHorizontal: 4,
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