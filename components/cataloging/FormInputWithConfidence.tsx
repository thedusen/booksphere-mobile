// components/cataloging/FormInputWithConfidence.tsx
import { styled } from 'nativewind';
import React from 'react';
import { 
  View as RNView, 
  Text as RNText, 
  TextInput as RNTextInput,
  KeyboardTypeOptions 
} from 'react-native';
import { ConfidenceIndicator } from './ConfidenceIndicator';

const View = styled(RNView);
const Text = styled(RNText);
const TextInput = styled(RNTextInput);

interface FormInputWithConfidenceProps {
  label: string;
  value?: string;
  onChangeText: (text: string) => void;
  confidence?: number;
  fieldName?: string;
  multiline?: boolean;
  keyboardType?: KeyboardTypeOptions;
  placeholder?: string;
  required?: boolean;
}

/**
 * FormInputWithConfidence - Enhanced form input with AI confidence indicator
 * 
 * This component combines the existing FormInput functionality with the new
 * ConfidenceIndicator to provide visual feedback on AI extraction confidence.
 * 
 * Design Features:
 * - Maintains existing form styling and behavior
 * - Adds subtle confidence indicator in the top-right
 * - Preserves all accessibility features
 * - Works seamlessly with the existing catalog review workflow
 */
export const FormInputWithConfidence: React.FC<FormInputWithConfidenceProps> = ({
  label,
  value,
  onChangeText,
  confidence,
  fieldName,
  multiline = false,
  keyboardType = 'default',
  placeholder = '',
  required = false,
}) => {
  return (
    <View className="mb-4">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-muted-foreground text-sm font-medium">
          {label}
          {required && <Text className="text-primary"> *</Text>}
        </Text>
        {confidence !== undefined && (
          <ConfidenceIndicator 
            confidence={confidence} 
            fieldName={fieldName || label.toLowerCase()} 
            size="small" 
          />
        )}
      </View>
      <TextInput
        className={`bg-input border border-border text-text rounded-lg px-4 py-4 text-base min-h-[50px] ${
          multiline ? 'h-32' : ''
        }`}
        value={value || ''}
        onChangeText={onChangeText}
        multiline={multiline}
        keyboardType={keyboardType}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        textAlignVertical={multiline ? "top" : "center"}
      />
    </View>
  );
};

export default FormInputWithConfidence;