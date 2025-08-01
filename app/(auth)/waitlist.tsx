import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, Image, Share, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Button from '@/components/Button';
import Colors from '@/constants/colors';
import { Mail, Share2 } from 'lucide-react-native';

export default function WaitlistScreen() {
  const router = useRouter();
  const [shared, setShared] = useState(false);
  
  const handleShare = async () => {
    const shareText = 'Join My IEP Hero to get support for your special education journey! Sign up at https://myiephero.com';
    
    try {
      if (Platform.OS === 'web') {
        // Try Web Share API first (requires user gesture and HTTPS)
        if (navigator.share && window.isSecureContext) {
          try {
            await navigator.share({
              title: 'Join My IEP Hero',
              text: 'Join My IEP Hero to get support for your special education journey!',
              url: 'https://myiephero.com',
            });
            setShared(true);
            return;
          } catch (shareError) {
            console.log('Web Share API failed, trying clipboard:', shareError);
          }
        }
        
        // Try clipboard API (requires user gesture and permissions)
        if (navigator.clipboard && window.isSecureContext) {
          try {
            await navigator.clipboard.writeText(shareText);
            alert('Link copied to clipboard!');
            setShared(true);
            return;
          } catch (clipboardError) {
            console.log('Clipboard API failed:', clipboardError);
          }
        }
        
        // Final fallback: show the text for manual copying
        const userWantsToCopy = confirm(
          `Copy this link to share My IEP Hero:\n\n${shareText}\n\nClick OK to select the text for copying.`
        );
        
        if (userWantsToCopy) {
          // Create a temporary text area for manual selection
          const textArea = document.createElement('textarea');
          textArea.value = shareText;
          textArea.style.position = 'fixed';
          textArea.style.left = '-999999px';
          textArea.style.top = '-999999px';
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          
          try {
            // Try the old execCommand as final fallback
            document.execCommand('copy');
            alert('Link copied to clipboard!');
            setShared(true);
          } catch {
            alert('Please manually copy the link from the previous dialog.');
          } finally {
            document.body.removeChild(textArea);
          }
        }
      } else {
        // Native sharing for mobile
        const result = await Share.share({
          message: shareText,
          title: 'Join My IEP Hero',
          url: 'https://myiephero.com',
        });
        
        if (result.action === Share.sharedAction) {
          setShared(true);
        }
      }
    } catch (error) {
      console.error('All sharing methods failed:', error);
      alert('Unable to share automatically. Please copy this link manually: https://myiephero.com');
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.content}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: 'https://r2-pub.rork.com/attachments/sqa03nwwcy65i7c3chdgc' }}
            style={styles.image}
          />
        </View>
        
        <View style={styles.textContainer}>
          <Text style={styles.title}>You're on the Waitlist!</Text>
          <Text style={styles.description}>
            Thank you for your interest in My IEP Hero. We're currently in beta and are adding new users gradually to ensure the best experience.
          </Text>
          <Text style={styles.description}>
            We'll notify you by email when your account is approved. In the meantime, you can help us grow by sharing with others who might benefit.
          </Text>
        </View>
        
        <View style={styles.shareContainer}>
          <Text style={styles.shareTitle}>
            {shared ? 'Thanks for sharing!' : 'Help us grow'}
          </Text>
          <Button
            title="Share My IEP Hero"
            onPress={handleShare}
            variant="primary"
            style={styles.shareButton}
            testID="share-button"
            icon={<Share2 size={20} color="#fff" style={styles.buttonIcon} />}
          />
        </View>
        
        <View style={styles.contactContainer}>
          <Text style={styles.contactTitle}>Have questions?</Text>
          <Button
            title="Contact Support"
            onPress={() => {}}
            variant="outline"
            style={styles.contactButton}
            testID="contact-button"
            icon={<Mail size={20} color={Colors.primary} style={styles.buttonIcon} />}
          />
        </View>
        
        <View style={styles.footer}>
          <Button
            title="Back to Sign In"
            onPress={() => router.push('/login')}
            variant="text"
            testID="back-button"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
  },
  imageContainer: {
    marginTop: 20,
    marginBottom: 32,
  },
  image: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textDark,
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 24,
  },
  shareContainer: {
    width: '100%',
    marginBottom: 24,
    alignItems: 'center',
  },
  shareTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 16,
  },
  shareButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactContainer: {
    width: '100%',
    marginBottom: 32,
    alignItems: 'center',
  },
  contactTitle: {
    fontSize: 16,
    color: Colors.textLight,
    marginBottom: 12,
  },
  contactButton: {
    width: '100%',
  },
  buttonIcon: {
    marginRight: 8,
  },
  footer: {
    marginTop: 'auto',
    paddingVertical: 16,
  },
});