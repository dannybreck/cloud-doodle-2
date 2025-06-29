import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  useColorScheme,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Camera, FileImage, Sparkles } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CloudBackground from '@/components/CloudBackground';
import GlassCard from '@/components/GlassCard';
import FloatingActionButton from '@/components/FloatingActionButton';

interface RecentEdit {
  id: string;
  originalUri: string;
  timestamp: number;
}

export default function EditTab() {
  const [recentEdits, setRecentEdits] = useState<RecentEdit[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const colorScheme = useColorScheme();
  const router = useRouter();
  const { user } = useAuth();

  const isDark = colorScheme === 'dark';

  useEffect(() => {
    loadRecentEdits();
  }, []);

  const loadRecentEdits = async () => {
    try {
      const storedEdits = await AsyncStorage.getItem('recentEdits');
      if (storedEdits) {
        const edits = JSON.parse(storedEdits);
        setRecentEdits(edits.slice(0, 5)); // Keep only 5 most recent
      }
    } catch (error) {
      console.error('Error loading recent edits:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRecentEdits();
    setRefreshing(false);
  };

  const navigateToCapture = () => {
    router.push('/(tabs)/');
  };

  const openRecentEdit = (edit: RecentEdit) => {
    router.push(`/edit/${encodeURIComponent(edit.originalUri)}`);
  };

  const clearRecentEdits = () => {
    Alert.alert(
      'Clear Recent Edits',
      'Are you sure you want to clear all recent edits?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('recentEdits');
              setRecentEdits([]);
            } catch (error) {
              console.error('Error clearing recent edits:', error);
            }
          },
        },
      ]
    );
  };

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <CloudBackground intensity={0.5}>
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, isDark && styles.titleDark]}>Edit</Text>
            <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
              Transform your photos into whimsical doodles
            </Text>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <GlassCard style={styles.actionCard}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={navigateToCapture}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#87CEEB', '#4A90E2']}
                  style={styles.actionButtonGradient}
                >
                  <Camera size={24} color="white" strokeWidth={2} />
                  <Text style={styles.actionButtonText}>Take Photo</Text>
                </LinearGradient>
              </TouchableOpacity>
            </GlassCard>

            <GlassCard style={styles.actionCard}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => router.push('/(tabs)/')}
                activeOpacity={0.8}
              >
                <View style={[styles.actionButtonGradient, styles.secondaryAction]}>
                  <FileImage size={24} color={isDark ? '#87CEEB' : '#4A90E2'} strokeWidth={2} />
                  <Text style={[styles.actionButtonText, styles.secondaryActionText, isDark && styles.secondaryActionTextDark]}>
                    From Gallery
                  </Text>
                </View>
              </TouchableOpacity>
            </GlassCard>
          </View>

          {/* Recent Edits */}
          {recentEdits.length > 0 && (
            <View style={styles.recentSection}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
                  Recent Edits
                </Text>
                <TouchableOpacity onPress={clearRecentEdits} activeOpacity={0.8}>
                  <Text style={styles.clearButton}>Clear</Text>
                </TouchableOpacity>
              </View>

              {recentEdits.map((edit) => (
                <GlassCard key={edit.id} style={styles.recentItemCard}>
                  <TouchableOpacity
                    style={styles.recentItem}
                    onPress={() => openRecentEdit(edit)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.recentItemIcon}>
                      <Sparkles size={20} color="#87CEEB" strokeWidth={2} />
                    </View>
                    <View style={styles.recentItemContent}>
                      <Text style={[styles.recentItemTitle, isDark && styles.recentItemTitleDark]}>
                        Cloud Doodle Edit
                      </Text>
                      <Text style={[styles.recentItemTime, isDark && styles.recentItemTimeDark]}>
                        {formatTimestamp(edit.timestamp)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </GlassCard>
              ))}
            </View>
          )}

          {/* Empty State */}
          {recentEdits.length === 0 && !loading && (
            <View style={styles.emptyState}>
              <Sparkles size={64} color="#87CEEB" strokeWidth={1} />
              <Text style={[styles.emptyTitle, isDark && styles.emptyTitleDark]}>
                Start Creating Doodles
              </Text>
              <Text style={[styles.emptyDescription, isDark && styles.emptyDescriptionDark]}>
                Capture a cloud photo or select one from your gallery to begin creating magical doodles
              </Text>
              <FloatingActionButton
                onPress={navigateToCapture}
                icon={Camera}
                style={styles.emptyButton}
              />
            </View>
          )}
        </ScrollView>
      </CloudBackground>
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
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#333',
    marginBottom: 8,
  },
  titleDark: {
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666',
    lineHeight: 24,
  },
  subtitleDark: {
    color: '#ccc',
  },
  quickActions: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  actionButton: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  primaryAction: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  actionButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
    marginLeft: 12,
  },
  secondaryAction: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#e5e5e5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  secondaryActionDark: {
    backgroundColor: '#2a2a2a',
    borderColor: '#444',
  },
  secondaryActionText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#4A90E2',
    marginLeft: 12,
  },
  secondaryActionTextDark: {
    color: '#87CEEB',
  },
  recentSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#333',
  },
  sectionTitleDark: {
    color: '#fff',
  },
  clearButton: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#87CEEB',
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  recentItemDark: {
    backgroundColor: '#2a2a2a',
  },
  recentItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(135, 206, 235, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  recentItemContent: {
    flex: 1,
  },
  recentItemTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 4,
  },
  recentItemTitleDark: {
    color: '#fff',
  },
  recentItemTime: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  recentItemTimeDark: {
    color: '#ccc',
  },
  emptyState: {
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
  },
  emptyDescriptionDark: {
    color: '#ccc',
  },
  actionCard: {
    marginBottom: 16,
  },
  recentItemCard: {
    marginBottom: 12,
  },
  emptyButton: {
    marginTop: 24,
  },
});