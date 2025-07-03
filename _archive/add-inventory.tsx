// app/add-inventory.tsx

import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronDown, ChevronRight, ChevronUp, Search, X } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AttributeType, mockAttributeCategories, mockAttributeTypes, mockConditions } from '../lib/mockData';

// --- Wizard Step Components ---

const Step1_CoreDetails = ({ conditionId, setConditionId, price, setPrice, sku, setSku, quantity, setQuantity, onNext }: any) => {
  const [isPickerVisible, setPickerVisible] = useState(false);
  const selectedCondition = mockConditions.find(c => c.condition_id === conditionId);

  return (
    <View>
      <View className="flex-row gap-x-4">
        <View className="flex-1">
          <Text className="text-muted-foreground text-sm font-medium mb-1">Condition</Text>
          <TouchableOpacity onPress={() => setPickerVisible(true)} className="bg-input border border-border rounded-lg px-4 py-3 flex-row justify-between items-center">
            <Text className="text-text text-base">{selectedCondition?.standard_name}</Text>
            <ChevronDown size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
        <View>
          <Text className="text-muted-foreground text-sm font-medium mb-1">Quantity</Text>
          <TextInput className="bg-input border border-border text-text rounded-lg px-4 py-3 text-base w-20 text-center" value={quantity} onChangeText={setQuantity} defaultValue="1" keyboardType="number-pad" />
        </View>
      </View>

      <View className="my-6">
        <Text className="text-muted-foreground text-sm font-medium mb-1">Price</Text>
        <View className="flex-row items-center bg-input border border-border rounded-lg px-4">
          <Text className="text-muted-foreground text-base mr-2">$</Text>
          <TextInput className="flex-1 py-3 text-base text-text" value={price} onChangeText={setPrice} placeholder="24.99" placeholderTextColor="#9CA3AF" keyboardType="decimal-pad" />
        </View>
      </View>

      <View className="mb-6">
        <Text className="text-muted-foreground text-sm font-medium mb-1">SKU (Optional)</Text>
        <TextInput className="bg-input border border-border text-text rounded-lg px-4 py-3 text-base" value={sku} onChangeText={setSku} placeholder="Leave blank to auto-generate" placeholderTextColor="#9CA3AF" />
      </View>

      <TouchableOpacity onPress={onNext} className="bg-primary p-4 rounded-lg flex-row items-center justify-center">
        <Text className="text-white text-lg font-bold">Next: Add Attributes</Text>
        <ChevronRight size={22} color="white" className="ml-2" />
      </TouchableOpacity>

      <Modal transparent={true} visible={isPickerVisible} animationType="slide" onRequestClose={() => setPickerVisible(false)}>
        <Pressable onPress={() => setPickerVisible(false)} style={StyleSheet.absoluteFill} className="bg-black/50" />
        <View className="absolute bottom-0 w-full bg-background rounded-t-2xl p-4 pb-10">
          <Text className="text-text text-lg font-bold text-center mb-4">Select Condition</Text>
          {mockConditions.map(condition => (
            <TouchableOpacity key={condition.condition_id} onPress={() => { setConditionId(condition.condition_id); setPickerVisible(false); }} className="p-4 border-b border-border">
              <Text className="text-text text-base">{condition.standard_name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Modal>
    </View>
  );
};

const Step2_Attributes = ({ selectedIds, onToggle, onNext }: any) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openCategories, setOpenCategories] = useState([mockAttributeCategories[0]?.category_id]);

  const toggleCategory = (categoryId: string) => {
    setOpenCategories(prev => prev.includes(categoryId) ? prev.filter(id => id !== categoryId) : [...prev, categoryId]);
  };

  const filteredAttributes = useMemo(() => {
    if (!searchTerm) return mockAttributeTypes;
    return mockAttributeTypes.filter(attr => attr.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [searchTerm]);

  const selectedAttributes = mockAttributeTypes.filter(attr => selectedIds.includes(attr.attribute_type_id));

  return (
    <View className="flex-1">
      <View className="flex-row items-center bg-input border border-border rounded-lg px-3 mb-4">
        <Search size={20} color="#9CA3AF" />
        <TextInput className="flex-1 p-3 text-base text-text" value={searchTerm} onChangeText={setSearchTerm} placeholder="Search attributes..." placeholderTextColor="#9CA3AF" />
        {searchTerm.length > 0 && <TouchableOpacity onPress={() => setSearchTerm('')}><X size={20} color="#9CA3AF" /></TouchableOpacity>}
      </View>

      {selectedAttributes.length > 0 && (
        <View className="mb-4 p-2 border border-border rounded-lg">
          <Text className="text-muted-foreground text-sm font-bold mb-2">Selected ({selectedAttributes.length})</Text>
          <View className="flex-row flex-wrap">
            {selectedAttributes.map(attr => (
              <TouchableOpacity key={attr.attribute_type_id} onPress={() => onToggle(attr.attribute_type_id)} className="flex-row items-center bg-primary/20 rounded-full m-1 pl-3 pr-2 py-1">
                <Text className="text-primary font-semibold">{attr.name}</Text>
                <X size={14} color="#C7006F" className="ml-1" />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      <ScrollView>
        {mockAttributeCategories.map(category => {
          const categoryAttributes = filteredAttributes.filter(attr => attr.category_id === category.category_id);
          if (categoryAttributes.length === 0 && !searchTerm) return null;
          const isOpen = openCategories.includes(category.category_id);
          return (
            <View key={category.category_id} className="mb-2 bg-input rounded-lg">
              <TouchableOpacity onPress={() => toggleCategory(category.category_id)} className="flex-row justify-between items-center p-3">
                <Text className="text-text font-bold">{category.name}</Text>
                {isOpen ? <ChevronUp size={20} color="#3B3B3A" /> : <ChevronDown size={20} color="#3B3B3A" />}
              </TouchableOpacity>
              {isOpen && (
                <View className="flex-row flex-wrap p-3 border-t border-border">
                  {categoryAttributes.map((attr: AttributeType) => (
                    <TouchableOpacity key={attr.attribute_type_id} onPress={() => onToggle(attr.attribute_type_id)} className={`py-2 px-4 rounded-full m-1 border ${selectedIds.includes(attr.attribute_type_id) ? 'bg-primary border-primary' : 'bg-background border-border'}`}>
                      <Text className={selectedIds.includes(attr.attribute_type_id) ? 'text-white' : 'text-text'}>{attr.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
      <TouchableOpacity onPress={onNext} className="bg-primary mt-4 p-4 rounded-lg flex-row items-center justify-center">
        <Text className="text-white text-lg font-bold">Next: Add Notes</Text>
        <ChevronRight size={22} color="white" className="ml-2" />
      </TouchableOpacity>
    </View>
  );
};

// Step 3 component remains the same as before.
const Step3_NotesAndSave = ({ notes, setNotes, onSave }: any) => (
  <View className="flex-1">
    <Text className="text-muted-foreground text-sm font-medium mb-1">Condition Notes (Optional)</Text>
    <TextInput multiline value={notes} onChangeText={setNotes} placeholder="e.g., Minor shelf wear on jacket. Previous owner's signature on front flyleaf." placeholderTextColor="#9CA3AF" className="bg-input border border-border text-text rounded-lg px-4 py-3 text-base h-32" textAlignVertical="top" />
    <View className="flex-1" />
    <TouchableOpacity onPress={onSave} className="bg-primary p-4 rounded-lg">
      <Text className="text-white text-lg font-bold text-center">Save to Inventory</Text>
    </TouchableOpacity>
  </View>
);

// --- Main Wizard Component ---
export default function AddToInventoryScreen() {
  const router = useRouter();
  const { book: bookDataString } = useLocalSearchParams();
  
  const [step, setStep] = useState(1);
  const [conditionId, setConditionId] = useState(mockConditions[2].condition_id);
  const [price, setPrice] = useState('');
  const [sku, setSku] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [selectedAttributeIds, setSelectedAttributeIds] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  const handleSave = () => {
    const inventoryItem = { conditionId, sku, price, quantity: parseInt(quantity) || 1, notes, attributes: selectedAttributeIds, bookData: JSON.parse(bookDataString as string) };
    console.log("SAVING INVENTORY ITEM:", JSON.stringify(inventoryItem, null, 2));
    router.push({ pathname: '/add-success', params: { book: bookDataString } });
  };

  const renderStep = () => {
    switch (step) {
      case 1: return <Step1_CoreDetails {...{ conditionId, setConditionId, price, setPrice, sku, setSku, quantity, setQuantity, onNext: () => setStep(2) }} />;
      case 2: return <Step2_Attributes selectedIds={selectedAttributeIds} onToggle={(id: string) => setSelectedAttributeIds(p => p.includes(id) ? p.filter(i => i !== id) : [...p, id])} onNext={() => setStep(3)} />;
      case 3: return <Step3_NotesAndSave {...{ notes, setNotes, onSave: handleSave }} />;
      default: return null;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <Stack.Screen options={{ headerShown: true, headerTitle: `Step ${step} of 3`, headerLeft: () => (<TouchableOpacity onPress={() => step === 1 ? router.back() : setStep(step - 1)} className="p-2"><Text className="text-secondary text-base">{step === 1 ? 'Cancel' : 'Back'}</Text></TouchableOpacity>), }} />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }} keyboardVerticalOffset={90}>
        <View className="flex-1 p-6">{renderStep()}</View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}