// components/cataloging/ConfidenceIndicator.tsx
import { styled } from 'nativewind';
import React, { useState } from 'react';
import { 
  View as RNView, 
  Text as RNText, 
  TouchableOpacity as RNTouchableOpacity,
  Modal,
  Pressable,
  StyleSheet
} from 'react-native';
import { CheckCircle, AlertTriangle, XCircle, HelpCircle } from 'lucide-react-native';

const View = styled(RNView);
const Text = styled(RNText);
const TouchableOpacity = styled(RNTouchableOpacity);

// Confidence level thresholds and styling
const CONFIDENCE_LEVELS = {
  HIGH: { min: 0.8, color: '#10B981', bgColor: 'bg-emerald-500', textColor: 'text-emerald-500', icon: CheckCircle },
  MEDIUM: { min: 0.6, color: '#F59E0B', bgColor: 'bg-amber-500', textColor: 'text-amber-500', icon: AlertTriangle },
  LOW: { min: 0.4, color: '#EF4444', bgColor: 'bg-red-500', textColor: 'text-red-500', icon: XCircle },
  VERY_LOW: { min: 0, color: '#DC2626', bgColor: 'bg-red-600', textColor: 'text-red-600', icon: XCircle },
} as const;

// Size variants
const SIZE_VARIANTS = {
  small: {
    container: 'w-5 h-5',
    text: 'text-xs',
    icon: 12,
    modalIcon: 24,
  },
  medium: {
    container: 'w-6 h-6',
    text: 'text-sm',
    icon: 14,
    modalIcon: 28,
  },
  large: {
    container: 'w-8 h-8',
    text: 'text-base',
    icon: 18,
    modalIcon: 32,
  },
} as const;

interface ConfidenceIndicatorProps {
  /** Confidence score from 0.0 to 1.0 */
  confidence?: number;
  /** Field name for accessibility and tooltips */
  fieldName?: string;
  /** Size variant */
  size?: 'small' | 'medium' | 'large';
  /** Whether to show text label alongside the indicator */
  showLabel?: boolean;
  /** Whether the indicator should be pressable to show details */
  showTooltip?: boolean;
}

/**
 * ConfidenceIndicator - A beautiful, accessible component that displays AI confidence levels
 * 
 * Design Philosophy:
 * - Uses subtle circular badges with semantic colors for immediate understanding
 * - Provides optional detailed explanations through press interactions
 * - Maintains consistency with the app's design system
 * - Prioritizes accessibility with proper ARIA labels and contrast ratios
 */
export const ConfidenceIndicator: React.FC<ConfidenceIndicatorProps> = ({
  confidence,
  fieldName = 'field',
  size = 'small',
  showLabel = false,
  showTooltip = true,
}) => {
  const [isTooltipVisible, setTooltipVisible] = useState(false);

  // Handle missing confidence scores gracefully
  if (confidence === undefined || confidence === null) {
    const IconComponent = HelpCircle;
    const sizeConfig = SIZE_VARIANTS[size];
    
    return (
      <View className="flex-row items-center gap-2">
        <View className={`${sizeConfig.container} bg-muted rounded-full items-center justify-center`}>
          <IconComponent size={sizeConfig.icon} color="#9CA3AF" />
        </View>
        {showLabel && (
          <Text className={`${sizeConfig.text} text-muted-foreground`}>
            No confidence data
          </Text>
        )}
      </View>
    );
  }

  // Determine confidence level and styling
  const getConfidenceLevel = (score: number) => {
    if (score >= CONFIDENCE_LEVELS.HIGH.min) return { ...CONFIDENCE_LEVELS.HIGH, level: 'High' };
    if (score >= CONFIDENCE_LEVELS.MEDIUM.min) return { ...CONFIDENCE_LEVELS.MEDIUM, level: 'Medium' };
    if (score >= CONFIDENCE_LEVELS.LOW.min) return { ...CONFIDENCE_LEVELS.LOW, level: 'Low' };
    return { ...CONFIDENCE_LEVELS.VERY_LOW, level: 'Very Low' };
  };

  const confidenceData = getConfidenceLevel(confidence);
  const sizeConfig = SIZE_VARIANTS[size];
  const IconComponent = confidenceData.icon;

  // Format confidence score for display
  const formattedScore = Math.round(confidence * 100);

  // Generate accessibility label
  const accessibilityLabel = `${fieldName} confidence: ${confidenceData.level}, ${formattedScore} percent`;

  // Get detailed description for tooltip
  const getConfidenceDescription = (level: string, score: number) => {
    const percentage = Math.round(score * 100);
    switch (level) {
      case 'High':
        return `AI is very confident (${percentage}%) about this ${fieldName}. The extracted data is likely accurate and can be trusted.`;
      case 'Medium':
        return `AI has moderate confidence (${percentage}%) about this ${fieldName}. Please review the extracted data for accuracy.`;
      case 'Low':
        return `AI has low confidence (${percentage}%) about this ${fieldName}. The extracted data may need correction.`;
      case 'Very Low':
        return `AI has very low confidence (${percentage}%) about this ${fieldName}. Please carefully verify and likely correct the extracted data.`;
      default:
        return `Confidence level: ${percentage}%`;
    }
  };

  const renderIndicator = () => (
    <View className="flex-row items-center gap-2">
      <View 
        className={`${sizeConfig.container} ${confidenceData.bgColor} rounded-full items-center justify-center shadow-sm`}
        style={{ 
          shadowColor: confidenceData.color,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.2,
          shadowRadius: 2,
          elevation: 2,
        }}
      >
        <IconComponent size={sizeConfig.icon} color="white" />
      </View>
      {showLabel && (
        <View className="flex-row items-center gap-1">
          <Text className={`${sizeConfig.text} ${confidenceData.textColor} font-medium`}>
            {confidenceData.level}
          </Text>
          <Text className={`${sizeConfig.text} text-muted-foreground`}>
            ({formattedScore}%)
          </Text>
        </View>
      )}
    </View>
  );

  if (!showTooltip) {
    return (
      <View accessibilityLabel={accessibilityLabel} accessibilityRole="text">
        {renderIndicator()}
      </View>
    );
  }

  return (
    <>
      <TouchableOpacity
        onPress={() => setTooltipVisible(true)}
        className="flex-row items-center"
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        accessibilityHint={`Double tap to learn more about ${fieldName} confidence level`}
        activeOpacity={0.7}
      >
        {renderIndicator()}
      </TouchableOpacity>

      <Modal
        transparent={true}
        visible={isTooltipVisible}
        animationType="fade"
        onRequestClose={() => setTooltipVisible(false)}
      >
        <Pressable 
          onPress={() => setTooltipVisible(false)} 
          style={StyleSheet.absoluteFill} 
          className="bg-black/50 items-center justify-center p-6"
        >
          <View className="bg-card rounded-2xl p-6 max-w-sm w-full shadow-xl border border-border/50">
            <View className="flex-row items-center gap-3 mb-4">
              <View className={`w-10 h-10 ${confidenceData.bgColor} rounded-full items-center justify-center`}>
                <IconComponent size={sizeConfig.modalIcon} color="white" />
              </View>
              <View className="flex-1">
                <Text className="text-text text-lg font-bold capitalize">
                  {confidenceData.level} Confidence
                </Text>
                <Text className="text-muted-foreground text-sm">
                  {formattedScore}% confident
                </Text>
              </View>
            </View>
            
            <Text className="text-text text-base leading-6 mb-6">
              {getConfidenceDescription(confidenceData.level, confidence)}
            </Text>

            <TouchableOpacity
              onPress={() => setTooltipVisible(false)}
              className="bg-primary p-4 rounded-lg"
              activeOpacity={0.8}
            >
              <Text className="text-white text-center font-medium text-base">
                Got it
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </>
  );
};

// Export default for backwards compatibility
export default ConfidenceIndicator;