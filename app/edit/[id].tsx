import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
  PanResponder,
  Animated,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { 
  ArrowLeft, 
  Save, 
  Undo2, 
  Redo2, 
  Palette, 
  Eraser,
  Minus,
  Plus
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

interface DrawingPath {
  id: string;
  path: string;
  color: string;
  strokeWidth: number;
}

interface DoodleOverlay {
  id: string;
  type: string;
  x: number;
  y: number;
  scale: number;
}

const DOODLE_SUGGESTIONS = [
  { id: '1', type: 'bunny', emoji: '🐰' },
  { id: '2', type: 'dragon', emoji: '🐉' },
  { id: '3', type: 'castle', emoji: '🏰' },
  { id: '4', type: 'whale', emoji: '🐋' },
  { id: '5', type: 'balloon', emoji: '🎈' },
];

const COLORS = [
  '#87CEEB', // Sky Blue
  '#FFB347', // Sunset Orange  
  '#98FB98', // Pale Green
  '#DDA0DD', // Plum
  '#F0E68C', // Khaki
  '#FFA07A', // Light Salmon
  '#20B2AA', // Light Sea Green
  '#FF69B4', // Hot Pink
];

export default function EditScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const imageUri = decodeURIComponent(id as string);

  const [drawingPaths, setDrawingPaths] = useState<DrawingPath[]>([]);
  const [currentPath, setCurrentPath] = useState('');
  const [currentColor, setCurrentColor] = useState(COLORS[0]);
  const [strokeWidth, setStrokeWidth] = useState(8);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEraser, setIsEraser] = useState(false);
  const [undoStack, setUndoStack] = useState<DrawingPath[][]>([]);
  const [redoStack, setRedoStack] = useState<DrawingPath[][]>([]);
  const [doodleOverlays, setDoodleOverlays] = useState<DoodleOverlay[]>([]);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const pathRef = useRef('');
  const canvasRef = useRef<View>(null);

  const triggerHapticFeedback = () => {
    if (Platform.OS === 'web') {
      // Web vibration API
      if ('vibrate' in navigator) {
        navigator.vibrate(30);
      }
    } else {
      // Import haptics dynamically for non-web platforms
      import('expo-haptics').then((Haptics) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      });
    }
  };

  useEffect(() => {
    // Save to recent edits when opening
    saveToRecentEdits();
  }, []);

  const saveToRecentEdits = async () => {
    try {
      const storedEdits = await AsyncStorage.getItem('recentEdits');
      const edits = storedEdits ? JSON.parse(storedEdits) : [];
      
      const newEdit = {
        id: Date.now().toString(),
        originalUri: imageUri,
        timestamp: Date.now(),
      };

      const updatedEdits = [newEdit, ...edits.filter((e: any) => e.originalUri !== imageUri)];
      await AsyncStorage.setItem('recentEdits', JSON.stringify(updatedEdits.slice(0, 5)));
    } catch (error) {
      console.error('Error saving to recent edits:', error);
    }
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,

    onPanResponderGrant: (evt) => {
      triggerHapticFeedback();
      setIsDrawing(true);
      
      // Save current state to undo stack
      setUndoStack(prev => [...prev, drawingPaths]);
      setRedoStack([]);

      const { locationX, locationY } = evt.nativeEvent;
      pathRef.current = `M${locationX},${locationY}`;
      setCurrentPath(pathRef.current);
    },

    onPanResponderMove: (evt) => {
      if (!isDrawing) return;

      const { locationX, locationY } = evt.nativeEvent;
      pathRef.current += ` L${locationX},${locationY}`;
      setCurrentPath(pathRef.current);
    },

    onPanResponderRelease: () => {
      if (!isDrawing) return;

      setIsDrawing(false);
      
      if (pathRef.current.length > 0) {
        const newPath: DrawingPath = {
          id: Date.now().toString(),
          path: pathRef.current,
          color: isEraser ? 'transparent' : currentColor,
          strokeWidth: strokeWidth,
        };

        setDrawingPaths(prev => [...prev, newPath]);
      }

      pathRef.current = '';
      setCurrentPath('');
    },
  });

  const addDoodleOverlay = (doodle: typeof DOODLE_SUGGESTIONS[0]) => {
    triggerHapticFeedback();
    
    const newOverlay: DoodleOverlay = {
      id: Date.now().toString(),
      type: doodle.type,
      x: width / 2 - 50,
      y: height / 2 - 50,
      scale: 1,
    };

    setDoodleOverlays(prev => [...prev, newOverlay]);
  };

  const undo = () => {
    if (undoStack.length === 0) return;
    
    triggerHapticFeedback();
    const lastState = undoStack[undoStack.length - 1];
    setRedoStack(prev => [...prev, drawingPaths]);
    setDrawingPaths(lastState);
    setUndoStack(prev => prev.slice(0, -1));
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    
    triggerHapticFeedback();
    const nextState = redoStack[redoStack.length - 1];
    setUndoStack(prev => [...prev, drawingPaths]);
    setDrawingPaths(nextState);
    setRedoStack(prev => prev.slice(0, -1));
  };

  const adjustStrokeWidth = (delta: number) => {
    triggerHapticFeedback();
    setStrokeWidth(prev => Math.max(2, Math.min(20, prev + delta)));
  };

  const saveDoodle = async () => {
    if (isSaving) return;
    
    setIsSaving(true);
    triggerHapticFeedback();

    try {
      // In a real app, you would capture the canvas as an image
      // For now, we'll save the original image URI as the final result
      const doodle = {
        id: Date.now().toString(),
        originalImageUri: imageUri,
        finalImageUri: imageUri, // In real app, this would be the captured canvas
        timestamp: Date.now(),
        drawingPaths,
        doodleOverlays,
      };

      const storedDoodles = await AsyncStorage.getItem('savedDoodles');
      const doodles = storedDoodles ? JSON.parse(storedDoodles) : [];
      const updatedDoodles = [doodle, ...doodles];
      
      await AsyncStorage.setItem('savedDoodles', JSON.stringify(updatedDoodles));
      
      Alert.alert(
        'Doodle Saved!',
        'Your cloud doodle has been saved to your gallery.',
        [
          { text: 'View Gallery', onPress: () => router.push('/(tabs)/gallery') },
          { text: 'Continue Editing', style: 'cancel' },
        ]
      );
    } catch (error) {
      console.error('Error saving doodle:', error);
      Alert.alert('Error', 'Failed to save doodle. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <ArrowLeft size={24} color="white" strokeWidth={2} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Edit Doodle</Text>
        
        <TouchableOpacity
          style={styles.headerButton}
          onPress={saveDoodle}
          disabled={isSaving}
          activeOpacity={0.8}
        >
          <Save size={24} color="white" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      {/* Main Canvas */}
      <View style={styles.canvasContainer}>
        <Image
          source={{ uri: imageUri }}
          style={styles.backgroundImage}
          contentFit="cover"
        />
        
        {/* Drawing Canvas */}
        <View
          style={styles.drawingCanvas}
          ref={canvasRef}
          {...panResponder.panHandlers}
        >
          <Svg style={StyleSheet.absoluteFillObject}>
            {/* Saved paths */}
            {drawingPaths.map((path) => (
              <Path
                key={path.id}
                d={path.path}
                stroke={path.color}
                strokeWidth={path.strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            ))}
            
            {/* Current drawing path */}
            {currentPath && (
              <Path
                d={currentPath}
                stroke={isEraser ? 'transparent' : currentColor}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            )}
          </Svg>
          
          {/* Doodle Overlays */}
          {doodleOverlays.map((overlay) => (
            <View
              key={overlay.id}
              style={[
                styles.doodleOverlay,
                {
                  left: overlay.x,
                  top: overlay.y,
                  transform: [{ scale: overlay.scale }],
                },
              ]}
            >
              <Text style={styles.doodleEmoji}>
                {DOODLE_SUGGESTIONS.find(d => d.type === overlay.type)?.emoji}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Doodle Suggestions */}
      <View style={styles.suggestionsContainer}>
        <Text style={styles.suggestionsTitle}>Doodle Ideas</Text>
        <View style={styles.suggestions}>
          {DOODLE_SUGGESTIONS.map((doodle) => (
            <TouchableOpacity
              key={doodle.id}
              style={styles.suggestionItem}
              onPress={() => addDoodleOverlay(doodle)}
              activeOpacity={0.8}
            >
              <Text style={styles.suggestionEmoji}>{doodle.emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Drawing Tools */}
      <View style={styles.toolsContainer}>
        {/* Color Picker */}
        {showColorPicker && (
          <View style={styles.colorPicker}>
            {COLORS.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorButton,
                  { backgroundColor: color },
                  currentColor === color && styles.selectedColor,
                ]}
                onPress={() => {
                  setCurrentColor(color);
                  setIsEraser(false);
                  setShowColorPicker(false);
                  triggerHapticFeedback();
                }}
                activeOpacity={0.8}
              />
            ))}
          </View>
        )}

        <View style={styles.tools}>
          {/* Undo/Redo */}
          <TouchableOpacity
            style={[styles.tool, undoStack.length === 0 && styles.toolDisabled]}
            onPress={undo}
            disabled={undoStack.length === 0}
            activeOpacity={0.8}
          >
            <Undo2 size={20} color="white" strokeWidth={2} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tool, redoStack.length === 0 && styles.toolDisabled]}
            onPress={redo}
            disabled={redoStack.length === 0}
            activeOpacity={0.8}
          >
            <Redo2 size={20} color="white" strokeWidth={2} />
          </TouchableOpacity>

          {/* Stroke Width */}
          <TouchableOpacity
            style={styles.tool}
            onPress={() => adjustStrokeWidth(-2)}
            activeOpacity={0.8}
          >
            <Minus size={20} color="white" strokeWidth={2} />
          </TouchableOpacity>

          <View style={styles.strokeIndicator}>
            <Text style={styles.strokeText}>{strokeWidth}</Text>
          </View>

          <TouchableOpacity
            style={styles.tool}
            onPress={() => adjustStrokeWidth(2)}
            activeOpacity={0.8}
          >
            <Plus size={20} color="white" strokeWidth={2} />
          </TouchableOpacity>

          {/* Color Picker Toggle */}
          <TouchableOpacity
            style={[styles.tool, { backgroundColor: currentColor }]}
            onPress={() => {
              setShowColorPicker(!showColorPicker);
              triggerHapticFeedback();
            }}
            activeOpacity={0.8}
          >
            <Palette size={20} color="white" strokeWidth={2} />
          </TouchableOpacity>

          {/* Eraser */}
          <TouchableOpacity
            style={[styles.tool, isEraser && styles.toolActive]}
            onPress={() => {
              setIsEraser(!isEraser);
              triggerHapticFeedback();
            }}
            activeOpacity={0.8}
          >
            <Eraser size={20} color="white" strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
  canvasContainer: {
    flex: 1,
    position: 'relative',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  drawingCanvas: {
    ...StyleSheet.absoluteFillObject,
  },
  doodleOverlay: {
    position: 'absolute',
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doodleEmoji: {
    fontSize: 48,
  },
  suggestionsContainer: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  suggestionsTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
    marginBottom: 8,
  },
  suggestions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  suggestionItem: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestionEmoji: {
    fontSize: 24,
  },
  toolsContainer: {
    backgroundColor: 'rgba(0,0,0,0.9)',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  colorPicker: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  colorButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginHorizontal: 4,
    marginVertical: 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColor: {
    borderColor: 'white',
  },
  tools: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tool: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toolActive: {
    backgroundColor: '#87CEEB',
  },
  toolDisabled: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    opacity: 0.5,
  },
  strokeIndicator: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  strokeText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
});