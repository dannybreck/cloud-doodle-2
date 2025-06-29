import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  interpolate
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

interface CloudBackgroundProps {
  children: React.ReactNode;
  intensity?: number;
}

export default function CloudBackground({ children, intensity = 1 }: CloudBackgroundProps) {
  const cloudAnimation = useSharedValue(0);

  React.useEffect(() => {
    cloudAnimation.value = withRepeat(
      withTiming(1, { duration: 8000 }),
      -1,
      true
    );
  }, []);

  const cloud1Style = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: interpolate(
            cloudAnimation.value,
            [0, 1],
            [-50, 50]
          ) * intensity,
        },
      ],
      opacity: interpolate(cloudAnimation.value, [0, 0.5, 1], [0.3, 0.6, 0.3]),
    };
  });

  const cloud2Style = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: interpolate(
            cloudAnimation.value,
            [0, 1],
            [30, -30]
          ) * intensity,
        },
      ],
      opacity: interpolate(cloudAnimation.value, [0, 0.5, 1], [0.2, 0.5, 0.2]),
    };
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#87CEEB', '#E0F6FF', '#F8F8FF']}
        style={styles.background}
      >
        <Animated.View style={[styles.cloud, styles.cloud1, cloud1Style]} />
        <Animated.View style={[styles.cloud, styles.cloud2, cloud2Style]} />
      </LinearGradient>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  cloud: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 50,
  },
  cloud1: {
    width: 100,
    height: 60,
    top: height * 0.2,
    left: width * 0.1,
  },
  cloud2: {
    width: 80,
    height: 40,
    top: height * 0.15,
    right: width * 0.1,
  },
});