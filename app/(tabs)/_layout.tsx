import { Tabs } from 'expo-router';
import { Camera, Edit3, Images } from 'lucide-react-native';
import { useColorScheme, Platform } from 'react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  
  const isDark = colorScheme === 'dark';
  const tabBarStyle = {
    backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
    borderTopColor: isDark ? '#333' : '#e5e5e5',
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    height: Platform.OS === 'ios' ? 88 : 68,
  };

  const activeColor = '#87CEEB';
  const inactiveColor = isDark ? '#888' : '#666';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle,
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        tabBarLabelStyle: {
          fontFamily: 'Inter-SemiBold',
          fontSize: 12,
          marginTop: 4,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Capture',
          tabBarIcon: ({ size, color }) => (
            <Camera size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="edit"
        options={{
          title: 'Edit',
          tabBarIcon: ({ size, color }) => (
            <Edit3 size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="gallery"
        options={{
          title: 'Gallery',
          tabBarIcon: ({ size, color }) => (
            <Images size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
    </Tabs>
  );
}