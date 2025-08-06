// components/cataloging/ReprocessingFeedbackModal.tsx

import React, { useState, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { X, MessageSquare, ChevronDown, ChevronUp, RefreshCw, Zap } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { 
  ReprocessingFeedbackModalProps, 
  ReprocessingFeedbackData, 
  FeedbackReason,
  FEEDBACK_REASONS 
} from '@/types/ai-feedback';

/**
 * ReprocessingFeedbackModal - A beautiful, user-friendly modal for collecting reprocessing feedback
 * 
 * Design Philosophy:
 * - Make feedback feel helpful, not burdensome
 * - Clear visual hierarchy between required and optional elements
 * - Mobile-optimized with touch-friendly interactions
 * - Consistent with Booksphere's design system
 * - Encourages feedback without making it mandatory
 */
export const ReprocessingFeedbackModal: React.FC<ReprocessingFeedbackModalProps> = ({
  isVisible,
  onClose,
  onSubmit,
  onReprocessWithoutFeedback,
  jobTitle,
}) => {
  // Local state for feedback form
  const [selectedReasons, setSelectedReasons] = useState<FeedbackReason[]>([]);
  const [customText, setCustomText] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (isVisible) {
      setSelectedReasons([]);
      setCustomText('');
      setShowCustomInput(false);
    }
  }, [isVisible]);

  // Handle reason selection with haptic feedback
  const toggleReason = async (reason: FeedbackReason) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    setSelectedReasons(prev => {
      const isSelected = prev.includes(reason);
      if (isSelected) {
        // Deselect reason
        if (reason === 'other') {
          setShowCustomInput(false);
          setCustomText('');
        }
        return prev.filter(r => r !== reason);
      } else {
        // Select reason
        if (reason === 'other') {
          setShowCustomInput(true);
        }
        return [...prev, reason];
      }
    });
  };

  // Handle submission with feedback
  const handleSubmitWithFeedback = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    const feedbackData: ReprocessingFeedbackData = {
      reason: selectedReasons[0] || 'other', // Primary reason for analytics
      custom_reason: selectedReasons.includes('other') ? customText : undefined,
      user_comment: selectedReasons.length > 1 ? 
        `Multiple reasons: ${selectedReasons.map(r => FEEDBACK_REASONS[r]).join(', ')}` : 
        undefined,
      reprocess_timestamp: new Date().toISOString(),
    };
    
    onSubmit(feedbackData);
  };

  // Handle skip feedback
  const handleSkipFeedback = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onReprocessWithoutFeedback();
  };

  // Handle modal close
  const handleClose = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  // Memoized feedback reasons for performance
  const feedbackOptions = useMemo(() => {
    return Object.entries(FEEDBACK_REASONS).map(([key, label]) => ({
      key: key as FeedbackReason,
      label,
    }));
  }, []);

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
      accessibilityViewIsModal={true}
    >
      <KeyboardAvoidingView 
        style={StyleSheet.absoluteFill} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Backdrop */}
        <Pressable 
          onPress={handleClose}
          style={StyleSheet.absoluteFill} 
          className="bg-black/50"
          accessibilityRole="button"
          accessibilityLabel="Close feedback modal"
        />

        {/* Modal Content */}
        <View className="absolute bottom-0 left-0 right-0 bg-background rounded-t-3xl shadow-2xl">
          <ScrollView 
            className="max-h-[85vh]"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <View className="px-6 pt-6 pb-4 border-b border-border/30">
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center gap-3">
                  <View className="w-10 h-10 bg-primary/10 rounded-full items-center justify-center">
                    <RefreshCw size={20} color="#C7006F" />
                  </View>
                  <Text className="text-xl font-bold text-text">
                    Help Us Improve
                  </Text>
                </View>
                
                <TouchableOpacity
                  onPress={handleClose}
                  className="w-8 h-8 rounded-full bg-muted items-center justify-center"
                  accessibilityRole="button"
                  accessibilityLabel="Close"
                  activeOpacity={0.7}
                >
                  <X size={18} color="#6B7280" />
                </TouchableOpacity>
              </View>
              
              <Text className="text-sm text-muted-foreground leading-5">
                {jobTitle ? 
                  `We'll reprocess "${jobTitle}" with improved AI. Your feedback helps us get better results.` :
                  'We\'ll reprocess this book with improved AI. Your feedback helps us get better results.'
                }
              </Text>
            </View>

            {/* Feedback Options */}
            <View className="px-6 py-6">
              <Text className="text-base font-medium text-text mb-4">
                What would you like us to improve? 
                <Text className="text-muted-foreground font-normal"> (Optional)</Text>
              </Text>

              <View className="gap-3">
                {feedbackOptions.map(({ key, label }) => {
                  const isSelected = selectedReasons.includes(key);
                  
                  return (
                    <TouchableOpacity
                      key={key}
                      onPress={() => toggleReason(key)}
                      className={`
                        p-4 rounded-xl border-2 flex-row items-center justify-between
                        ${isSelected ? 'border-primary bg-primary/5' : 'border-border bg-card'}
                      `}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: isSelected }}
                      accessibilityLabel={label}
                      activeOpacity={0.7}
                      style={{
                        transform: [{ scale: isSelected ? 0.98 : 1 }],
                        shadowColor: isSelected ? '#C7006F' : 'transparent',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                        elevation: isSelected ? 2 : 0,
                      }}
                    >
                      <Text className={`
                        text-sm font-medium
                        ${isSelected ? 'text-primary' : 'text-text'}
                      `}>
                        {label}
                      </Text>
                      
                      <View className={`
                        w-6 h-6 rounded-full border-2 items-center justify-center
                        ${isSelected ? 'border-primary bg-primary' : 'border-muted-foreground'}
                      `}>
                        {isSelected && (
                          <View className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Custom Text Input for "Other" */}
              {showCustomInput && (
                <View className="mt-4 p-4 bg-card rounded-xl border border-border">
                  <View className="flex-row items-center gap-2 mb-3">
                    <MessageSquare size={16} color="#6B7280" />
                    <Text className="text-sm font-medium text-text">
                      Tell us more
                    </Text>
                  </View>
                  
                  <TextInput
                    value={customText}
                    onChangeText={setCustomText}
                    placeholder="What specific issues did you encounter?"
                    placeholderTextColor="#9CA3AF"
                    multiline={true}
                    numberOfLines={3}
                    className="text-text text-base leading-5 min-h-[72px]"
                    style={{
                      textAlignVertical: 'top',
                      includeFontPadding: false,
                    }}
                    maxLength={500}
                    accessibilityLabel="Additional feedback details"
                  />
                  
                  <Text className="text-xs text-muted-foreground mt-2 text-right">
                    {customText.length}/500
                  </Text>
                </View>
              )}
            </View>

            {/* Action Buttons */}
            <View className="px-6 pb-6 gap-3 border-t border-border/30 pt-6">
              {/* Primary Action - Submit with Feedback */}
              <TouchableOpacity
                onPress={handleSubmitWithFeedback}
                className="h-14 bg-primary rounded-xl flex-row items-center justify-center gap-3 shadow-lg"
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Reprocess with feedback to help improve AI"
                style={{
                  shadowColor: '#C7006F',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 4,
                }}
              >
                <Zap size={20} color="white" />
                <Text className="text-white text-base font-semibold">
                  {selectedReasons.length > 0 ? 'Reprocess with Feedback' : 'Reprocess Now'}
                </Text>
              </TouchableOpacity>

              {/* Secondary Action - Skip Feedback */}
              <TouchableOpacity
                onPress={handleSkipFeedback}
                className="h-14 bg-secondary rounded-xl flex-row items-center justify-center gap-3"
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Skip feedback and reprocess immediately"
              >
                <RefreshCw size={20} color="white" />
                <Text className="text-white text-base font-medium">
                  Skip Feedback & Reprocess
                </Text>
              </TouchableOpacity>

              {/* Subtle explanation */}
              <Text className="text-xs text-muted-foreground text-center mt-2 leading-4">
                Both options will reprocess your book images with improved AI extraction
              </Text>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default ReprocessingFeedbackModal;