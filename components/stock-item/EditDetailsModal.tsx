// components/stock-item/EditDetailsModal.tsx
import { useAuth } from '@/context/AuthContext';
import { StockItemDetails, useConditions } from '@/hooks/useInventory';
import { supabase } from '@/lib/supabase';
import { useQueryClient } from '@tanstack/react-query';
import { ChevronDown, X } from 'lucide-react-native';
import { styled } from 'nativewind';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Modal, Platform, Pressable as RNPressable, Text as RNText, TextInput as RNTextInput, TouchableOpacity as RNTouchableOpacity, View as RNView, ScrollView } from 'react-native';

// Styled Components
const View = styled(RNView);
const Text = styled(RNText);
const TextInput = styled(RNTextInput);
const TouchableOpacity = styled(RNTouchableOpacity);
const Pressable = styled(RNPressable);

interface EditDetailsModalProps {
  isVisible: boolean;
  onClose: () => void;
  stockItem: StockItemDetails;
}

// FIX: Combined into a single, smarter FormInput component
const FormInput = ({ label, value, onChangeText, placeholder, multiline = false }: any) => (
  <View className="mb-4">
    <Text className="text-muted-foreground text-sm font-medium mb-1">{label}</Text>
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#9CA3AF"
      multiline={multiline}
      textAlignVertical={multiline ? 'top' : 'center'}
      className={`bg-input border border-border text-text rounded-lg px-4 py-3 text-base ${multiline ? 'h-32' : 'min-h-[50px]'}`}
    />
  </View>
);

const ConditionPicker = ({ label, selectedConditionId, onSelect }: any) => {
    const [isPickerVisible, setPickerVisible] = useState(false);
    const { data: conditions, isLoading } = useConditions();
    const selectedCondition = conditions?.find(c => c.condition_id === selectedConditionId);

    return (
        <View className="mb-4">
            <Text className="text-muted-foreground text-sm font-medium mb-1">{label}</Text>
            <TouchableOpacity 
                onPress={() => setPickerVisible(true)} 
                disabled={isLoading}
                className="bg-input border border-border rounded-lg px-4 py-3 flex-row justify-between items-center"
            >
                <Text className="text-text text-base">{isLoading ? 'Loading...' : selectedCondition?.standard_name || 'Select a condition'}</Text>
                <ChevronDown size={20} color="#6B7280" />
            </TouchableOpacity>

            <Modal transparent={true} visible={isPickerVisible} animationType="fade" onRequestClose={() => setPickerVisible(false)}>
                <Pressable onPress={() => setPickerVisible(false)} className="flex-1 bg-black/60 justify-center items-center p-4">
                    <View className="bg-background rounded-xl w-full max-w-sm max-h-[60%]">
                        <Text className="text-lg font-bold p-4 border-b border-border">Select Condition</Text>
                        <ScrollView>
                            {conditions?.map(condition => (
                                <TouchableOpacity key={condition.condition_id} onPress={() => { onSelect(condition.condition_id); setPickerVisible(false); }} className="p-4 border-b border-border">
                                    <Text className="text-text text-base">{condition.standard_name}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </Pressable>
            </Modal>
        </View>
    );
}

export const EditDetailsModal = ({ isVisible, onClose, stockItem }: EditDetailsModalProps) => {
  const { organizationId } = useAuth();
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    conditionId: stockItem.condition_id,
    sku: stockItem.sku,
    location: stockItem.location_in_store_text,
    conditionNotes: stockItem.condition_notes,
    internalNotes: stockItem.internal_notes,
  });

  // Reset form when modal opens with new item data
  useEffect(() => {
    if (isVisible) {
      setFormData({
        conditionId: stockItem.condition_id,
        sku: stockItem.sku,
        location: stockItem.location_in_store_text,
        conditionNotes: stockItem.condition_notes,
        internalNotes: stockItem.internal_notes,
      });
    }
  }, [isVisible, stockItem]);

  const handleInputChange = (field: keyof typeof formData, value: string | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
        const { error } = await supabase.rpc('update_stock_item_details', {
            p_stock_item_id: stockItem.stock_item_id,
            p_organization_id: organizationId,
            p_condition_id: formData.conditionId,
            p_sku: formData.sku,
            p_location_in_store_text: formData.location,
            p_condition_notes: formData.conditionNotes,
            p_internal_notes: formData.internalNotes,
        });

        if (error) throw error;
        
        Alert.alert("Success", "Details have been updated.");
        queryClient.invalidateQueries({ queryKey: ['stock-item', stockItem.stock_item_id] });
        onClose();
    } catch (error: any) {
        console.error("Failed to save details:", error);
        Alert.alert("Error", "Could not save details. " + error.message);
    } finally {
        setIsSaving(false);
    }
  };

  return (
    <Modal visible={isVisible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 justify-end">
        <Pressable onPress={onClose} className="flex-1 bg-transparent" />
        {/* FIX: Removed max-h-[85%] to allow KeyboardAvoidingView to work properly */}
        <View className="bg-background rounded-t-2xl p-4 shadow-2xl border-t border-border">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold text-text">Edit Details</Text>
            <TouchableOpacity onPress={onClose} className="p-2">
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          
          <ScrollView showsVerticalScrollIndicator={false}>
            <ConditionPicker label="Condition" selectedConditionId={formData.conditionId} onSelect={(id: string) => handleInputChange('conditionId', id)} />
            <FormInput label="SKU" value={formData.sku} onChangeText={(text: string) => handleInputChange('sku', text)} placeholder="Item's Stock Keeping Unit" />
            <FormInput label="Location in Store" value={formData.location} onChangeText={(text: string) => handleInputChange('location', text)} placeholder="e.g., Section A, Shelf 3" />
            <FormInput label="Condition Notes" value={formData.conditionNotes} onChangeText={(text: string) => handleInputChange('conditionNotes', text)} placeholder="e.g., Light foxing on page edges." multiline={true} />
            <FormInput label="Internal Notes" value={formData.internalNotes} onChangeText={(text: string) => handleInputChange('internalNotes', text)} placeholder="e.g., Purchased from Smith estate." multiline={true} />
          </ScrollView>

          <View className="flex-row gap-x-4 pt-4">
            <TouchableOpacity onPress={onClose} className="flex-1 bg-input border border-border p-4 rounded-lg">
                <Text className="text-text font-bold text-center">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSave} disabled={isSaving} className="flex-1 bg-primary p-4 rounded-lg">
              {isSaving ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-center">Save Changes</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};