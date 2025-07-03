// app/(app)/add-to-inventory.tsx

import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { BookData } from '@/types/api';
import { useQuery } from '@tanstack/react-query';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronDown, ChevronRight, ChevronUp, Search, X, Maximize, Minimize } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Modal, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// Types
type AttributeCategory = {
  category_id: string;
  name: string;
};

type AttributeType = {
  attribute_type_id: string;
  name: string;
  category_id: string;
};

type Condition = {
  condition_id: string;
  standard_name: string;
  description?: string;
};

// Data fetching functions
const fetchConditions = async (): Promise<Condition[]> => {
  const { data, error } = await supabase
    .from('condition_standards')
    .select('condition_id, standard_name, description')
    .order('sort_order', { ascending: true });
  if (error) throw new Error(error.message);
  return data;
};

const fetchAttributeCategories = async (): Promise<AttributeCategory[]> => {
  const { data, error } = await supabase
    .from('attribute_categories')
    .select('category_id, name')
    .order('name', { ascending: true });
  if (error) throw new Error(error.message);
  return data;
};

const fetchAttributeTypes = async (): Promise<AttributeType[]> => {
  const { data, error } = await supabase
    .from('attribute_types')
    .select('attribute_type_id, name, category_id')
    .order('name', { ascending: true });
  if (error) throw new Error(error.message);
  return data;
};

// --- Wizard Step Components ---

const Step1_CoreDetails = ({ conditionId, setConditionId, price, setPrice, sku, setSku, quantity, setQuantity, onNext, conditions, isLoadingConditions }: any) => {
  const [isPickerVisible, setPickerVisible] = useState(false);
  const selectedCondition = conditions?.find((c: Condition) => c.condition_id === conditionId);

  if (isLoadingConditions) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#C7006F" />
        <Text className="text-muted-foreground mt-2">Loading conditions...</Text>
      </View>
    );
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
      <View className="flex-row gap-x-4 mb-6">
        <View className="flex-1">
          <Text className="text-muted-foreground text-sm font-medium mb-2">Condition</Text>
          <TouchableOpacity onPress={() => setPickerVisible(true)} className="bg-input border border-border rounded-lg px-4 py-4 flex-row justify-between items-center min-h-[50px]">
            <Text className="text-text text-base">{selectedCondition?.standard_name || 'Select condition'}</Text>
            <ChevronDown size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
        <View className="w-24">
          <Text className="text-muted-foreground text-sm font-medium mb-2">Quantity</Text>
          <TextInput 
            className="bg-input border border-border text-text rounded-lg px-4 py-4 text-base text-center min-h-[50px]" 
            value={quantity} 
            onChangeText={setQuantity} 
            defaultValue="1" 
            keyboardType="number-pad"
            textAlignVertical="center"
          />
        </View>
      </View>

      <View className="mb-6">
        <Text className="text-muted-foreground text-sm font-medium mb-2">Price</Text>
        <View className="flex-row items-center bg-input border border-border rounded-lg px-4 min-h-[50px]">
          <Text className="text-muted-foreground text-base mr-2">$</Text>
          <TextInput 
            className="flex-1 py-4 text-base text-text" 
            value={price} 
            onChangeText={setPrice} 
            placeholder="24.99" 
            placeholderTextColor="#9CA3AF" 
            keyboardType="decimal-pad"
            textAlignVertical="center"
            multiline={false}
            numberOfLines={1}
          />
        </View>
      </View>

      <View className="mb-8">
        <Text className="text-muted-foreground text-sm font-medium mb-2">SKU (Optional)</Text>
        <TextInput 
          className="bg-input border border-border text-text rounded-lg px-4 py-4 text-base min-h-[50px]" 
          value={sku} 
          onChangeText={setSku} 
          placeholder="Leave blank to auto-generate" 
          placeholderTextColor="#9CA3AF"
          textAlignVertical="center"
          multiline={false}
          numberOfLines={1}
        />
      </View>

      <TouchableOpacity onPress={onNext} className="bg-primary p-4 rounded-lg flex-row items-center justify-center">
        <Text className="text-white text-lg font-bold">Next: Add Attributes</Text>
        <ChevronRight size={22} color="white" className="ml-2" />
      </TouchableOpacity>

      <Modal transparent={true} visible={isPickerVisible} animationType="slide" onRequestClose={() => setPickerVisible(false)}>
        <Pressable onPress={() => setPickerVisible(false)} style={StyleSheet.absoluteFill} className="bg-black/50" />
        <View className="absolute bottom-0 w-full bg-background rounded-t-2xl p-4 pb-10">
          <Text className="text-text text-lg font-bold text-center mb-4">Select Condition</Text>
          {conditions?.map((condition: Condition) => (
            <TouchableOpacity key={condition.condition_id} onPress={() => { setConditionId(condition.condition_id); setPickerVisible(false); }} className="p-4 border-b border-border">
              <Text className="text-text text-base">{condition.standard_name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Modal>
    </ScrollView>
  );
};

const Step2_Attributes = ({ selectedIds, onToggle, onNext, attributeCategories, attributeTypes, isLoadingAttributes }: any) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openCategories, setOpenCategories] = useState<string[]>([]);
  const hasAutoOpened = React.useRef(false);

  // Auto-open first category when data loads
  React.useEffect(() => {
    if (attributeCategories && attributeCategories.length > 0 && !hasAutoOpened.current) {
      setOpenCategories([attributeCategories[0].category_id]);
      hasAutoOpened.current = true;
    }
  }, [attributeCategories]);

  const toggleCategory = (categoryId: string) => {
    setOpenCategories(prev => prev.includes(categoryId) ? prev.filter(id => id !== categoryId) : [...prev, categoryId]);
  };

  const filteredAttributes = useMemo(() => {
    if (!attributeTypes) return [];
    if (!searchTerm) return attributeTypes;
    return attributeTypes.filter((attr: AttributeType) => attr.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [searchTerm, attributeTypes]);

  // Expand/Collapse All functionality
  const visibleCategories = useMemo(() => {
    if (!attributeCategories) return [];
    return attributeCategories.filter((category: AttributeCategory) => {
      const categoryAttributes = filteredAttributes.filter((attr: AttributeType) => attr.category_id === category.category_id);
      return categoryAttributes.length > 0 || !searchTerm;
    });
  }, [attributeCategories, filteredAttributes, searchTerm]);

  const allCategoriesOpen = visibleCategories.length > 0 && visibleCategories.every((cat: AttributeCategory) => openCategories.includes(cat.category_id));

  const handleExpandCollapseAll = () => {
    if (allCategoriesOpen) {
      // Collapse all
      setOpenCategories([]);
    } else {
      // Expand all visible categories
      setOpenCategories(visibleCategories.map((cat: AttributeCategory) => cat.category_id));
    }
  };

  const selectedAttributes = attributeTypes?.filter((attr: AttributeType) => selectedIds.includes(attr.attribute_type_id)) || [];

  if (isLoadingAttributes) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#C7006F" />
        <Text className="text-muted-foreground mt-2">Loading attributes...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <View className="flex-row items-center bg-input border border-border rounded-lg px-3 mb-4 min-h-[50px]">
        <Search size={20} color="#9CA3AF" />
        <TextInput 
          className="flex-1 p-3 text-base text-text" 
          value={searchTerm} 
          onChangeText={setSearchTerm} 
          placeholder="Search attributes..." 
          placeholderTextColor="#9CA3AF"
          textAlignVertical="center"
        />
        {searchTerm.length > 0 && <TouchableOpacity onPress={() => setSearchTerm('')}><X size={20} color="#9CA3AF" /></TouchableOpacity>}
      </View>

      {selectedAttributes.length > 0 && (
        <View className="mb-4 p-3 border border-border rounded-lg">
          <Text className="text-muted-foreground text-sm font-bold mb-2">Selected ({selectedAttributes.length})</Text>
          <View className="flex-row flex-wrap">
            {selectedAttributes.map((attr: AttributeType) => (
              <TouchableOpacity key={attr.attribute_type_id} onPress={() => onToggle(attr.attribute_type_id)} className="flex-row items-center bg-primary/20 rounded-full m-1 pl-3 pr-2 py-1">
                <Text className="text-primary font-semibold">{attr.name}</Text>
                <X size={14} color="#C7006F" className="ml-1" />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Expand/Collapse All Button */}
      {visibleCategories.length > 1 && (
        <View className="flex-row justify-end mb-3">
          <TouchableOpacity 
            onPress={handleExpandCollapseAll}
            className="flex-row items-center px-3 py-2 bg-input/50 rounded-lg border border-border/50"
          >
            {allCategoriesOpen ? (
              <Minimize size={16} color="#9CA3AF" />
            ) : (
              <Maximize size={16} color="#9CA3AF" />
            )}
            <Text className="text-muted-foreground text-sm font-medium ml-2">
              {allCategoriesOpen ? 'Collapse All' : 'Expand All'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        {attributeCategories?.map((category: AttributeCategory) => {
          const categoryAttributes = filteredAttributes.filter((attr: AttributeType) => attr.category_id === category.category_id);
          if (categoryAttributes.length === 0 && !searchTerm) return null;
          const isOpen = openCategories.includes(category.category_id);
          return (
            <View key={category.category_id} className="mb-2 bg-input rounded-lg">
              <TouchableOpacity onPress={() => toggleCategory(category.category_id)} className="flex-row justify-between items-center p-4">
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
      
      <View className="pt-4">
        <TouchableOpacity onPress={onNext} className="bg-primary p-4 rounded-lg flex-row items-center justify-center">
          <Text className="text-white text-lg font-bold">Next: Add Notes</Text>
          <ChevronRight size={22} color="white" className="ml-2" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const Step3_NotesAndSave = ({ notes, setNotes, onSave, isSaving }: any) => (
  <View className="flex-1">
    <Text className="text-muted-foreground text-sm font-medium mb-2">Condition Notes (Optional)</Text>
    <TextInput 
      multiline 
      value={notes} 
      onChangeText={setNotes} 
      placeholder="e.g., Minor shelf wear on jacket. Previous owner's signature on front flyleaf." 
      placeholderTextColor="#9CA3AF" 
      className="bg-input border border-border text-text rounded-lg px-4 py-4 text-base h-32" 
      textAlignVertical="top" 
    />
    <View className="flex-1" />
    <TouchableOpacity onPress={onSave} disabled={isSaving} className="bg-primary p-4 rounded-lg">
      {isSaving ? (
        <ActivityIndicator color="white" />
      ) : (
        <Text className="text-white text-lg font-bold text-center">Save to Inventory</Text>
      )}
    </TouchableOpacity>
  </View>
);

// --- Main Wizard Component ---
export default function AddToInventoryScreen() {
  const router = useRouter();
  const { organizationId } = useAuth();
  const { book: bookDataString } = useLocalSearchParams();
  
  const [step, setStep] = useState(1);
  const [conditionId, setConditionId] = useState<string>('');
  const [price, setPrice] = useState('');
  const [sku, setSku] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [selectedAttributeIds, setSelectedAttributeIds] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const bookData = JSON.parse(bookDataString as string) as BookData;

  // Fetch data
  const { data: conditions, isLoading: isLoadingConditions } = useQuery<Condition[]>({
    queryKey: ['conditions'],
    queryFn: fetchConditions,
  });

  const { data: attributeCategories, isLoading: isLoadingCategories } = useQuery<AttributeCategory[]>({
    queryKey: ['attributeCategories'],
    queryFn: fetchAttributeCategories,
  });

  const { data: attributeTypes, isLoading: isLoadingTypes } = useQuery<AttributeType[]>({
    queryKey: ['attributeTypes'],
    queryFn: fetchAttributeTypes,
  });

  const isLoadingAttributes = isLoadingCategories || isLoadingTypes;

  // Set default condition when conditions load
  React.useEffect(() => {
    if (conditions && conditions.length > 0 && !conditionId) {
      // Default to "Very Good" or the third condition
      const defaultCondition = conditions.find(c => c.standard_name === 'Very Good') || conditions[2] || conditions[0];
      setConditionId(defaultCondition.condition_id);
    }
  }, [conditions, conditionId]);

  const handleSave = async () => {
    if (!conditionId) {
      Alert.alert('Missing Information', 'Please select a condition.');
      return;
    }
    if (!price || parseFloat(price) <= 0) {
      Alert.alert('Invalid Price', 'Please enter a valid price.');
      return;
    }

    setIsSaving(true);

    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    if (!userId || !organizationId) {
      Alert.alert('Authentication Error', 'Could not identify user. Please log in again.');
      setIsSaving(false);
      return;
    }

    const payload = {
      p_organization_id: organizationId,
      p_user_id: userId,
      p_isbn13: bookData.isbn,
      p_title: bookData.title ?? null,
      p_subtitle: bookData.subtitle ?? null,
      p_authors: (bookData.authors ?? []).map(name => ({ name })),
      p_publisher_name: bookData.publisher ?? null,
      p_publish_date_text: bookData.published_date ?? null,
      p_page_count: bookData.page_count ?? null,
      p_format_name: (bookData as any).format_type ?? null,
      p_language_name: 'English',
      p_image_url: bookData.cover_image_url ?? null,
      p_condition_id: conditionId,
      p_price: parseFloat(price),
      p_condition_notes: notes || null,
      p_selected_attributes: selectedAttributeIds, // Add this line
    };

    try {
      // Use explicit type casting to resolve function overloading ambiguity
      const { data: newStockItemId, error } = await supabase.rpc('add_edition_to_inventory', payload, {
        count: 'exact'
      });
      if (error) throw error;

      console.log("SAVED INVENTORY ITEM:", JSON.stringify({
        stockItemId: newStockItemId,
        conditionId, 
        sku, 
        price, 
        quantity: parseInt(quantity) || 1, 
        notes, 
        attributes: selectedAttributeIds, 
        bookData
      }, null, 2));

      router.replace({
        pathname: '/add-success',
        params: { 
          stock_item_id: newStockItemId,
          book: bookDataString
        }
      });

    } catch (error: any) {
      console.error('Error saving to inventory:', error);
      Alert.alert('Save Failed', error.message || 'Could not add book to inventory. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1: return <Step1_CoreDetails {...{ conditionId, setConditionId, price, setPrice, sku, setSku, quantity, setQuantity, onNext: () => setStep(2), conditions, isLoadingConditions }} />;
      case 2: return <Step2_Attributes selectedIds={selectedAttributeIds} onToggle={(id: string) => setSelectedAttributeIds(p => p.includes(id) ? p.filter(i => i !== id) : [...p, id])} onNext={() => setStep(3)} attributeCategories={attributeCategories} attributeTypes={attributeTypes} isLoadingAttributes={isLoadingAttributes} />;
      case 3: return <Step3_NotesAndSave {...{ notes, setNotes, onSave: handleSave, isSaving }} />;
      default: return null;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <Stack.Screen options={{ 
        headerShown: true, 
        headerTitle: `Step ${step} of 3`,
        headerBackTitle: "Back",
        headerLeft: () => (
          <TouchableOpacity onPress={() => step === 1 ? router.back() : setStep(step - 1)} className="p-2">
            <Text className="text-secondary text-base">{step === 1 ? 'Cancel' : 'Back'}</Text>
          </TouchableOpacity>
        ), 
      }} />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }} keyboardVerticalOffset={90}>
        <View className="flex-1 px-6 py-4">{renderStep()}</View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}