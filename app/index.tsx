import { GitHubIcon } from '@/components/auth-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { makeRedirectUri } from 'expo-auth-session';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../lib/supabase';

// Handle auth session completion
WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  
  // Create and log the redirect URI
  const redirectTo = makeRedirectUri();
  console.log('MY REDIRECT URL:', redirectTo);

  useEffect(() => {
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', { event, session });
      if (event === 'SIGNED_IN' && session) {
        console.log('Navigating to feed...');
        router.replace('/feed');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleGuestLogin = async () => {
    try {
      console.log('Starting guest login...');
      const { error } = await supabase.auth.signInAnonymously();
      
      if (error) {
        console.error('Guest login error:', error);
        Alert.alert('Guest Login Failed', error.message);
        return;
      }
      
      console.log('Guest login successful');
      // The useEffect listener will catch this and route to /feed
    } catch (err: any) {
      console.error('Guest login error:', err);
      Alert.alert('Guest Login Failed', 'An unexpected error occurred');
    }
  };

  const handleGithubLogin = async () => {
    try {
      console.log('Starting GitHub login...');
      const redirectUrl = makeRedirectUri();
      console.log('MY REDIRECT URL:', redirectUrl);
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true,
        },
      });

      if (error) {
        console.error('OAuth error:', error);
        Alert.alert('Error', error.message);
        return;
      }

      if (!data?.url) return;

      console.log('Opening auth session with URL:', data.url);
      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
      
      console.log('Auth session result:', result);
      if (result.type === 'success' && result.url) {
        // Parse the return URL to extract the token
        const urlParams = new URLSearchParams(result.url.split('#')[1]);
        const accessToken = urlParams.get('access_token');
        const refreshToken = urlParams.get('refresh_token');
        const errorCode = urlParams.get('error_code');
        
        if (errorCode) {
          throw new Error(errorCode);
        }
        
        if (accessToken) {
          console.log('Setting session with token...');
          // Manually establish the Supabase session
          await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || '',
          });
          console.log('Session established successfully');
        }
      } else {
        console.log('Auth session was cancelled');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      Alert.alert('Login Error', err.message);
    }
  };

  return (
    <View style={[styles.container, isDark && styles.darkContainer]}>
      <View style={styles.content}>
        <Text style={[styles.title, isDark && styles.darkTitle]}>
          Reels for Devs
        </Text>
        
        <Text style={[styles.subtitle, isDark && styles.darkSubtitle]}>
          The video platform built for developers to share, learn, and grow together.
        </Text>
        
        <TouchableOpacity 
          style={[styles.githubButton, isDark && styles.darkGithubButton]}
          activeOpacity={0.8}
          onPress={handleGithubLogin}
        >
          <GitHubIcon size={24} color="#ffffff" />
          <Text style={styles.githubButtonText}>
            Continue with GitHub
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.guestButton}
          onPress={handleGuestLogin}
        >
          <Text style={[styles.guestButtonText, isDark && styles.darkGuestButtonText]}>
            Continue as Guest
          </Text>
        </TouchableOpacity>
        
        <Text style={[styles.note, isDark && styles.darkNote]}>
          Uploading content requires a linked GitHub account.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  darkContainer: {
    backgroundColor: '#0a0a0a',
  },
  content: {
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
  },
  title: {
    fontSize: 42,
    fontWeight: '800',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  darkTitle: {
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  darkSubtitle: {
    color: '#a0a0a0',
  },
  githubButton: {
    backgroundColor: '#24292e',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  darkGithubButton: {
    backgroundColor: '#0d1117',
    shadowOpacity: 0.4,
  },
  githubButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginLeft: 12,
  },
  guestButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
  },
  guestButtonText: {
    color: '#666666',
    fontSize: 15,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  darkGuestButtonText: {
    color: '#999999',
  },
  note: {
    fontSize: 12,
    fontWeight: '400',
    color: '#999999',
    textAlign: 'center',
    lineHeight: 18,
  },
  darkNote: {
    color: '#666666',
  },
});
