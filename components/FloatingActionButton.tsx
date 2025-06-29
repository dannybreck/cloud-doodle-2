import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  runOnJS
} from 'react-native-reanimated';
import { LucideIcon } from 'lucide-react-native';

interface FloatingActionButtonProps {
  onPress: () => void;
  icon: LucideIcon;
  size?: number;
  style?: ViewStyle;
  disabled?: boolean;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export default function FloatingActionButton({ 
  onPress, 
  icon: Icon, 
  size = 56, 
  style,
  disabled = false 
}: FloatingActionButtonProps) {
  const scale = useSharedValue(1);

  const handlePress = () => {
    scale.value = withSequence(
      withSpring(0.95, { duration: 100 }),
      withSpring(1, { duration: 100 }, () => {
        runOnJS(onPress)();
      })
    );
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedTouchableOpacity
      style={[styles.container, { width: size, height: size }, style, animatedStyle]}
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={disabled ? ['#ccc', '#aaa'] : ['#87CEEB', '#4A90E2']}
        style={[styles.gradient, { borderRadius: size / 2 }]}
      >
        <Icon size={size * 0.4} color="white" strokeWidth={2} />
      </LinearGradient>
    </AnimatedTouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});