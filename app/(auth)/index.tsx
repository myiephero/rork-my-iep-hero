import React from 'react';
import { StyleSheet, Text, View, Image, SafeAreaView, Platform } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import Button from '@/components/Button';
import Colors from '@/constants/colors';

export default function WelcomeScreen() {
  const router = useRouter();
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={[Colors.primary, Colors.secondary]}
        style={styles.background}
      />
      
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Image
            source={{ uri: 'https://r2-pub.rork.com/attachments/sqa03nwwcy65i7c3chdgc' }}
            style={styles.logo}
          />
          <Text style={styles.appName}>My IEP Hero</Text>
        </View>
        
        <View style={styles.heroContainer}>
          <Text style={styles.heroTitle}>
            Navigate Special Education with Confidence
          </Text>
          <Text style={styles.heroSubtitle}>
            Connect with advocates, understand your child's IEP, and get the support you need.
          </Text>
        </View>
        
        <View style={styles.buttonContainer}>
          <Button
            title="Sign In"
            onPress={() => router.push('/login')}
            variant="primary"
            style={styles.button}
          />
          <Button
            title="Create Account"
            onPress={() => router.push('/register')}
            variant="outline"
            style={styles.button}
            textStyle={styles.createAccountText}
          />
          <Link href="/waitlist" asChild>
            <Text style={styles.waitlistLink}>
              Join our waitlist for early access
            </Text>
          </Link>
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By continuing, you agree to our{' '}
            <Text style={styles.footerLink}>Terms of Service</Text> and{' '}
            <Text style={styles.footerLink}>Privacy Policy</Text>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: Platform.OS === 'ios' ? 60 : 40,
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
  },
  heroContainer: {
    alignItems: 'center',
    marginVertical: 40,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    marginBottom: 40,
  },
  button: {
    marginBottom: 16,
  },
  createAccountText: {
    color: '#fff',
  },
  waitlistLink: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 16,
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  footer: {
    marginBottom: 20,
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    fontSize: 12,
  },
  footerLink: {
    textDecorationLine: 'underline',
  },
});