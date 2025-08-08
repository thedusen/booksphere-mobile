// components/navigation/ActionChoiceModal.tsx
import { Camera, ScanLine, X, LucideIcon } from 'lucide-react-native';
import { styled } from 'nativewind';
import React from 'react';
import * as Haptics from 'expo-haptics';
import {
  Modal,
  TouchableOpacity as RNTouchableOpacity,
  View as RNView,
  Text as RNText,
  Pressable,
} from 'react-native';

// Apply NativeWind styling
const View = styled(RNView);
const Text = styled(RNText);
const TouchableOpacity = styled(RNTouchableOpacity);

// Hero Button Component for primary actions (same as dashboard)
const HeroButton = ({
  icon: IconComponent,
  title,
  onPress,
  variant = 'primary',
  isLoading = false,
}: {
  icon: LucideIcon;
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  isLoading?: boolean;
}) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={isLoading}
    className={`flex-1 mx-2 rounded-3xl px-3 py-6 h-36 justify-center items-center border-2 ${
      variant === 'primary' 
        ? 'bg-primary/5 border-primary/20' 
        : 'bg-secondary/5 border-secondary/20'
    } ${isLoading ? 'opacity-50' : ''}`}
    activeOpacity={0.7}
    accessibilityLabel={title}
    accessibilityRole="button"
    accessibilityHint={`Navigate to ${title.toLowerCase()} screen`}
    accessibilityState={{ disabled: isLoading }}
  >
    <View className={`p-4 rounded-full mb-3 ${
      variant === 'primary' ? 'bg-primary/10' : 'bg-secondary/10'
    }`}>
      <IconComponent 
        size={36} 
        color={variant === 'primary' ? '#C7006F' : '#1FB1AB'} 
        strokeWidth={1.5} 
      />
    </View>
    <Text className="text-text text-base font-semibold text-center">{title}</Text>
  </TouchableOpacity>
);

interface ActionChoiceModalProps {
  visible: boolean;
  onClose: () => void;
  onScanISBN: () => void;
  onTakePhotos: () => void;
}


export default function ActionChoiceModal({
  visible,
  onClose,
  onScanISBN,
  onTakePhotos,
}: ActionChoiceModalProps) {
  const handleScanISBN = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onScanISBN();
    onClose();
  };

  const handleTakePhotos = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onTakePhotos();
    onClose();
  };

  const handleClose = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <Pressable 
        className="flex-1 bg-black/50"
        onPress={handleClose}
      >
        {/* Modal Content */}
        <View className="flex-1 justify-end">
          <View className="bg-gray-50 rounded-t-3xl px-6 py-8">
            {/* Header */}
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-bold text-gray-900">
                Add Books to Inventory
              </Text>
              <TouchableOpacity
                onPress={handleClose}
                className="w-8 h-8 items-center justify-center"
                accessibilityLabel="Close modal"
                accessibilityRole="button"
              >
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Action Options - Dashboard Style HeroButtons */}
            <View className="flex-row mb-4">
              <HeroButton
                icon={ScanLine}
                title="Scan ISBN"
                onPress={handleScanISBN}
                variant="primary"
              />
              <HeroButton
                icon={Camera}
                title="Take Photos"
                onPress={handleTakePhotos}
                variant="secondary"
              />
            </View>

            {/* Bottom Safe Area */}
            <View className="h-4" />
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}