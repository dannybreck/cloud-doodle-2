import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Cloud, Mail, Lock, User } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';

export default function AuthScreen() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const colorScheme = useColorScheme();
  const { signIn, signUp, continueAsGuest } = useAuth();
  const router = useRouter();

  const isDark = colorScheme === 'dark';

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    if (isSignUp && !name.trim()) {
      Alert.alert('Error', 'Please enter your name.');
      return;
    }

    setIsLoading(true);

    try {
      if (isSignUp) {
        await signUp(email.trim(), password, name.trim());
      } else {
        await signIn(email.trim(), password);
      }
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestMode = async () => {
    try {
      await continueAsGuest();
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Error', 'Failed to continue as guest.');
    }
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <LinearGradient
          colors={isDark ? ['#1a1a1a', '#2a2a2a'] : ['#f8f8ff', '#e6f3ff']}
          style={styles.gradient}
        >
          {/* Header */}
          <View style={styles.header}>
            <Cloud size={64} color="#87CEEB" strokeWidth={1.5} />
            <Text style={[styles.title, isDark && styles.titleDark]}>Cloud Doodle</Text>
            <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
              Transform your cloud photos into whimsical doodles
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {isSignUp && (
              <View style={styles.inputContainer}>
                <User size={20} color={isDark ? '#87CEEB' : '#4A90E2'} strokeWidth={2} />
                <TextInput
                  style={[styles.input, isDark && styles.inputDark]}
                  placeholder="Full Name"
                  placeholderTextColor={isDark ? '#888' : '#666'}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  autoComplete="name"
                />
              </View>
            )}

            <View style={styles.inputContainer}>
              <Mail size={20} color={isDark ? '#87CEEB' : '#4A90E2'} strokeWidth={2} />
              <TextInput
                style={[styles.input, isDark && styles.inputDark]}
                placeholder="Email"
                placeholderTextColor={isDark ? '#888' : '#666'}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>

            <View style={styles.inputContainer}>
              <Lock size={20} color={isDark ? '#87CEEB' : '#4A90E2'} strokeWidth={2} />
              <TextInput
                style={[styles.input, isDark && styles.inputDark]}
                placeholder="Password"
                placeholderTextColor={isDark ? '#888' : '#666'}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="password"
              />
            </View>

            <TouchableOpacity
              style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#87CEEB', '#4A90E2']}
                style={styles.submitButtonGradient}
              >
                <Text style={styles.submitButtonText}>
                  {isLoading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.toggleButton}
              onPress={() => setIsSignUp(!isSignUp)}
              activeOpacity={0.8}
            >
              <Text style={[styles.toggleButtonText, isDark && styles.toggleButtonTextDark]}>
                {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
              </Text>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={[styles.dividerLine, isDark && styles.dividerLineDark]} />
              <Text style={[styles.dividerText, isDark && styles.dividerTextDark]}>or</Text>
              <View style={[styles.dividerLine, isDark && styles.dividerLineDark]} />
            </View>

            <TouchableOpacity
              style={[styles.guestButton, isDark && styles.guestButtonDark]}
              onPress={handleGuestMode}
              activeOpacity={0.8}
            >
              <Text style={[styles.guestButtonText, isDark && styles.guestButtonTextDark]}>
                Continue as Guest
              </Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8ff',
  },
  containerDark: {
    backgroundColor: '#1a1a1a',
  },
  keyboardContainer: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  titleDark: {
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  subtitleDark: {
    color: '#ccc',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#333',
    paddingVertical: 16,
    paddingLeft: 12,
  },
  inputDark: {
    color: '#fff',
    backgroundColor: '#2a2a2a',
  },
  submitButton: {
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
  toggleButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  toggleButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#4A90E2',
  },
  toggleButtonTextDark: {
    color: '#87CEEB',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e5e5',
  },
  dividerLineDark: {
    backgroundColor: '#444',
  },
  dividerText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginHorizontal: 16,
  },
  dividerTextDark: {
    color: '#ccc',
  },
  guestButton: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#e5e5e5',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestButtonDark: {
    backgroundColor: '#2a2a2a',
    borderColor: '#444',
  },
  guestButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#666',
  },
  guestButtonTextDark: {
    color: '#ccc',
  },
});