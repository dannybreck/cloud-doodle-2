import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Database types
export interface User {
  id: string;
  email: string;
  name?: string;
  profile_image_url?: string;
  created_at: string;
}

export interface Doodle {
  id: string;
  user_id: string;
  title?: string;
  original_image_url: string;
  final_image_url: string;
  doodle_data_json: {
    drawingPaths?: any[];
    doodleOverlays?: any[];
  };
  created_at: string;
  updated_at: string;
}