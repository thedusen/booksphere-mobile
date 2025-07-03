// components/common/AccordionSection.tsx
import { ChevronDown } from 'lucide-react-native';
import { styled } from 'nativewind';
import React, { useState } from 'react';
import { LayoutAnimation, Platform, Text as RNText, TouchableOpacity as RNTouchableOpacity, View as RNView, UIManager } from 'react-native';

const View = styled(RNView);
const Text = styled(RNText);
const TouchableOpacity = styled(RNTouchableOpacity);

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface AccordionProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

export const AccordionSection = ({ title, children, defaultExpanded = false }: AccordionProps) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
  };

  return (
    <View className="border border-border rounded-lg mb-4 overflow-hidden">
      <TouchableOpacity
        onPress={toggleExpand}
        className="flex-row justify-between items-center p-4 bg-input/50"
        activeOpacity={0.8}
      >
        <Text className="text-text font-bold text-base">{title}</Text>
        <ChevronDown size={22} color="#3B3B3A" style={{ transform: [{ rotate: isExpanded ? '180deg' : '0deg' }] }} />
      </TouchableOpacity>
      {isExpanded && (
        <View className="p-4">
          {children}
        </View>
      )}
    </View>
  );
};