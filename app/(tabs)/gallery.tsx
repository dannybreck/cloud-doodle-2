import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  Alert,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import * as Sharing from 'expo-sharing';
import { Trash2, Share, User, Cloud } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const itemWidth = (width - 48) / 2; // 2 columns with padding

interface DoodleItem {
  id: string;
  finalImageUri: string;
  originalImageUri: string;
  timestamp: number;
  title?: string;
}

export default function GalleryTab() {
  const [doodles, setDoodles] = useState<DoodleItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const colorScheme = useColorScheme();
  const { user, signOut } = useAuth();
  const router = useRouter();

  const isDark = colorScheme === 'dark';

  useEffect(() => {
    loadDoodles();
  }, []);

  const loadDoodles = async () => {
    try {
      const storedDoodles = await AsyncStorage.getItem('savedDoodles');
      if (storedDoodles) {
        const doodleData = JSON.parse(storedDoodles);
        setDoodles(doodleData.sort((a: DoodleItem, b: DoodleItem) => b.timestamp - a.timestamp));
      }
    } catch (error) {
      console.error('Error loading doodles:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDoodles();
    setRefreshing(false);
  };

  const shareDoodle = async (doodle: DoodleItem) => {
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(doodle.finalImageUri, {
          mimeType: 'image/jpeg',
          dialogTitle: 'Share your Cloud Doodle',
        });
      } else {
        Alert.alert('Sharing not available', 'Sharing is not available on this device.');
      }
    } catch (error) {
      console.error('Error sharing doodle:', error);
      Alert.alert('Error', 'Failed to share doodle. Please try again.');
    }
  };

  const deleteDoodle = (doodle: DoodleItem) => {
    Alert.alert(
      'Delete Doodle',
      'Are you sure you want to delete this doodle? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedDoodles = doodles.filter(d => d.id !== doodle.id);
              setDoodles(updatedDoodles);
              await AsyncStorage.setItem('savedDoodles', JSON.stringify(updatedDoodles));
            } catch (error) {
              console.error('Error deleting doodle:', error);
              Alert.alert('Error', 'Failed to delete doodle. Please try again.');
            }
          },
        },
      ]
    );
  };

  const openDoodle = (doodle: DoodleItem) => {
    router.push(`/edit/${encodeURIComponent(doodle.originalImageUri)}`);
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: signOut },
      ]
    );
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, isDark && styles.titleDark]}>Gallery</Text>
          <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
            {doodles.length} cloud doodle{doodles.length !== 1 ? 's' : ''}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.profileButton, isDark && styles.profileButtonDark]}
          onPress={handleSignOut}
          activeOpacity={0.8}
        >
          <User size={20} color={isDark ? '#87CEEB' : '#4A90E2'} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Doodles Grid */}
        {doodles.length > 0 ? (
          <View style={styles.grid}>
            {doodles.map((doodle) => (
              <TouchableOpacity
                key={doodle.id}
                style={styles.doodleItem}
                onPress={() => openDoodle(doodle)}
                activeOpacity={0.8}
              >
                <Image
                  source={{ uri: doodle.finalImageUri }}
                  style={styles.doodleImage}
                  contentFit="cover"
                />
                <View style={styles.doodleOverlay}>
                  <Text style={styles.doodleDate}>
                    {formatDate(doodle.timestamp)}
                  </Text>
                  <View style={styles.doodleActions}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => shareDoodle(doodle)}
                      activeOpacity={0.8}
                    >
                      <Share size={16} color="white" strokeWidth={2} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => deleteDoodle(doodle)}
                      activeOpacity={0.8}
                    >
                      <Trash2 size={16} color="white" strokeWidth={2} />
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Cloud size={64} color="#87CEEB" strokeWidth={1} />
            <Text style={[styles.emptyTitle, isDark && styles.emptyTitleDark]}>
              No Doodles Yet
            </Text>
            <Text style={[styles.emptyDescription, isDark && styles.emptyDescriptionDark]}>
              Start capturing cloud photos and creating magical doodles. Your creations will appear here.
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => router.push('/(tabs)/')}
              activeOpacity={0.8}
            >
              <Text style={styles.emptyButtonText}>Get Started</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#333',
    marginBottom: 4,
  },
  titleDark: {
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  subtitleDark: {
    color: '#ccc',
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  profileButtonDark: {
    backgroundColor: '#2a2a2a',
  },
  scrollView: {
    flex: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  doodleItem: {
    width: itemWidth,
    height: itemWidth,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  doodleImage: {
    width: '100%',
    height: '100%',
  },
  doodleOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  doodleDate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: 'white',
  },
  doodleActions: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#333',
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyTitleDark: {
    color: '#fff',
  },
  emptyDescription: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  emptyDescriptionDark: {
    color: '#ccc',
  },
  emptyButton: {
    backgroundColor: '#87CEEB',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  emptyButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
});