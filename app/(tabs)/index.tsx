import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
  Platform,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Camera, RotateCcw, ImageIcon, Sun } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import CloudBackground from '@/components/CloudBackground';
import FloatingActionButton from '@/components/FloatingActionButton';

const { width, height } = Dimensions.get('window');

export default function CaptureTab() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [isCapturing, setIsCapturing] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const router = useRouter();
  const { user } = useAuth();

  const triggerHapticFeedback = () => {
    if (Platform.OS === 'web') {
      // Web vibration API
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
    } else {
      // Import haptics dynamically for non-web platforms
      import('expo-haptics').then((Haptics) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      });
    }
  };

  const requestMediaLibraryPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'We need access to your photo library to select images.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const capturePhoto = async () => {
    if (!cameraRef.current || isCapturing) return;

    triggerHapticFeedback();
    setIsCapturing(true);

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });

      if (photo?.uri) {
        router.push(`/edit/${encodeURIComponent(photo.uri)}`);
      }
    } catch (error) {
      console.error('Error capturing photo:', error);
      Alert.alert('Error', 'Failed to capture photo. Please try again.');
    } finally {
      setIsCapturing(false);
    }
  };

  const pickFromGallery = async () => {
    const hasPermission = await requestMediaLibraryPermissions();
    if (!hasPermission) return;

    triggerHapticFeedback();

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]?.uri) {
        router.push(`/edit/${encodeURIComponent(result.assets[0].uri)}`);
      }
    } catch (error) {
      console.error('Error picking from gallery:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const toggleCameraFacing = () => {
    triggerHapticFeedback();
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  if (!permission) {
    return (
      <SafeAreaView style={styles.container}>
        <CloudBackground>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading camera...</Text>
          </View>
        </CloudBackground>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <CloudBackground>
          <View style={styles.permissionContainer}>
            <Camera size={64} color="#87CEEB" strokeWidth={1.5} />
            <Text style={styles.permissionTitle}>Camera Access Required</Text>
            <Text style={styles.permissionText}>
              Cloud Doodle needs camera access to capture beautiful cloud photos for your doodles.
            </Text>
            <FloatingActionButton
              onPress={requestPermission}
              icon={Camera}
              size={64}
              style={styles.permissionButton}
            />
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </View>
        </CloudBackground>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
        <LinearGradient
          colors={['rgba(0,0,0,0.3)', 'transparent', 'rgba(0,0,0,0.6)']}
          style={styles.overlay}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Cloud Doodle</Text>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={toggleCameraFacing}
              activeOpacity={0.8}
            >
              <RotateCcw size={24} color="white" strokeWidth={2} />
            </TouchableOpacity>
          </View>

          {/* Instructions */}
          <View style={styles.instructionsContainer}>
            <Sun size={32} color="rgba(255,255,255,0.8)" strokeWidth={1.5} />
            <Text style={styles.instructionsText}>
              Point your camera at interesting clouds
            </Text>
          </View>

          {/* Bottom Controls */}
          <View style={styles.bottomControls}>
            <TouchableOpacity
              style={styles.galleryButton}
              onPress={pickFromGallery}
              activeOpacity={0.8}
            >
              <ImageIcon size={28} color="white" strokeWidth={2} />
            </TouchableOpacity>

            <FloatingActionButton
              onPress={capturePhoto}
              icon={Camera}
              size={80}
              disabled={isCapturing}
            />

            <View style={styles.placeholder} />
          </View>
        </LinearGradient>
      </CameraView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontFamily: 'Inter-Regular',
    color: '#333',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  permissionTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#333',
    marginTop: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  permissionButton: {
    marginBottom: 16,
  },
  permissionButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    textAlign: 'center',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: 'white',
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructionsContainer: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  instructionsText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginTop: 12,
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingBottom: 32,
  },
  galleryButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    width: 56,
    height: 56,
  },
});