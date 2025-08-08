// components/navigation/FloatingActionButton.tsx
import { useRouter } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { styled } from 'nativewind';
import React, { useState } from 'react';
import * as Haptics from 'expo-haptics';
import {
  TouchableOpacity as RNTouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import ActionChoiceModal from './ActionChoiceModal';

// Apply NativeWind styling
const TouchableOpacity = styled(RNTouchableOpacity);

interface FloatingActionButtonProps {
  style?: any;
}

export default function FloatingActionButton({ style }: FloatingActionButtonProps) {
  const router = useRouter();
  const [isPressed, setIsPressed] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const scaleAnim = useState(new Animated.Value(1))[0];

  const handlePress = async () => {
    // Haptic feedback
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Scale animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Show action choice modal
    setModalVisible(true);
  };

  const handleScanISBN = () => {
    router.push('/scan');
  };

  const handleTakePhotos = () => {
    router.push('/catalog-new');
  };

  const accessibilityLabel = 'Add books to inventory';
  const accessibilityHint = 'Opens options to scan barcodes or take photos for cataloging';

  return (
    <>
      <Animated.View
        style={[
          {
            position: 'absolute',
            bottom: Platform.OS === 'ios' ? 49 : 39, // Overlap bottom nav - center at tab bar top edge
            alignSelf: 'center',
            zIndex: 1000,
            transform: [{ scale: scaleAnim }],
          },
          style,
        ]}
      >
        <TouchableOpacity
          onPress={handlePress}
          onPressIn={() => setIsPressed(true)}
          onPressOut={() => setIsPressed(false)}
          className="w-14 h-14 rounded-full items-center justify-center bg-primary shadow-lg"
          style={{
            // Platform-specific shadows
            ...Platform.select({
              ios: {
                shadowColor: '#000',
                shadowOffset: {
                  width: 0,
                  height: 4,
                },
                shadowOpacity: 0.3,
                shadowRadius: 6,
              },
              android: {
                elevation: 8,
              },
            }),
            // Subtle press state
            opacity: isPressed ? 0.9 : 1,
          }}
          activeOpacity={0.9}
          accessibilityLabel={accessibilityLabel}
          accessibilityRole="button"
          accessibilityHint={accessibilityHint}
          accessibilityState={{ 
            selected: false,
            expanded: modalVisible 
          }}
        >
          <Plus
            size={28}
            color="white"
            strokeWidth={2}
          />
        </TouchableOpacity>
      </Animated.View>

      {/* Action Choice Modal */}
      <ActionChoiceModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onScanISBN={handleScanISBN}
        onTakePhotos={handleTakePhotos}
      />
    </>
  );
}