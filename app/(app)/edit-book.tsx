// app/(app)/edit-book.tsx

import { supabase } from '@/lib/supabase';
import { BookData } from '@/types/api';
import { ContributorsEditor, Contributor } from '@/components/ContributorsEditor';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Flag } from 'lucide-react-native';
import { styled } from 'nativewind';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Image as RNImage,
  Pressable as RNPressable,
  SafeAreaView as RNSafeAreaView,
  ScrollView as RNScrollView,
  Text as RNText,
  TextInput as RNTextInput,
  TouchableOpacity as RNTouchableOpacity,
  View as RNView,
  StyleSheet,
} from 'react-native';

// Apply NativeWind styling to React Native components
const View = styled(RNView);
const Text = styled(RNText);
const TextInput = styled(RNTextInput);
const TouchableOpacity = styled(RNTouchableOpacity);
const SafeAreaView = styled(RNSafeAreaView);
const ScrollView = styled(RNScrollView);
const Image = styled(RNImage);
const Pressable = styled(RNPressable);


// --- Helper Components ---
const FormInput = ({ label, value, onChangeText, placeholder, keyboardType = 'default', multiline = false }: any) => (
  <View className="mb-4">
    <Text className="text-muted-foreground text-sm font-medium mb-2">{label}</Text>
    <TextInput
      className={`bg-input border border-border text-text rounded-lg px-4 text-base ${multiline ? 'h-24 py-4' : 'min-h-[50px]'}`}
      style={{
        paddingVertical: multiline ? 16 : 0,
        textAlignVertical: multiline ? 'top' : 'center',
        includeFontPadding: false,
        lineHeight: multiline ? undefined : 20,
      }}
      value={String(value || '')}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#9CA3AF"
      keyboardType={keyboardType}
      multiline={multiline}
      numberOfLines={multiline ? undefined : 1}
    />
  </View>
);


// --- Main Screen Component ---
export default function EditBookScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const initialBookData = JSON.parse(params.book as string) as BookData;
  const queryClient = useQueryClient();

  const AUTHOR_ID_DEFAULT = '8d3afa07-239b-49bb-afd9-b2dc85348b03';

  const [contributors, setContributors] = useState<Contributor[]>(
    (initialBookData.authors?.length > 0 ? initialBookData.authors : ['']).map(name => ({ name, author_type_id: AUTHOR_ID_DEFAULT }))
  );
  const [formData, setFormData] = useState<Partial<BookData>>(initialBookData);
  const [isSaving, setIsSaving] = useState(false);
  const [isFlagged, setIsFlagged] = useState(false);
  const [language, setLanguage] = useState('English');
  const [series, setSeries] = useState('');

  const handleSave = async () => {
    setIsSaving(true);
    const finalData = { ...formData, contributors, language, series };
    console.log("Saving data:", finalData);
    await new Promise(resolve => setTimeout(resolve, 1000));
    queryClient.invalidateQueries({ queryKey: ['bookDetails', initialBookData.isbn] });
    setIsSaving(false);
    router.back();
  };

  const handleInputChange = (field: keyof BookData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };



  return (
    <SafeAreaView className="flex-1 bg-background">
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: "Edit Catalog Entry",
          headerBackTitle: "Back",
          headerRight: () => <TouchableOpacity onPress={handleSave} className="p-2" disabled={isSaving}>{isSaving ? <ActivityIndicator /> : <Text className="text-primary text-base font-bold">Save</Text>}</TouchableOpacity>,
        }}
      />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }} keyboardVerticalOffset={90}>
        <ScrollView className="px-6 py-4" contentContainerStyle={{ paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
          <View className="items-center mb-6">
            <Image source={{ uri: formData.cover_image_url }} className="w-32 h-48 rounded-md bg-input" />
            <TouchableOpacity
              onPress={() => setIsFlagged(true)}
              disabled={isFlagged}
              className={`mt-3 px-4 py-2 rounded-lg flex-row items-center ${isFlagged ? 'bg-yellow-100' : 'bg-input border border-border'}`}
            >
              <View className="mr-2">
                <Flag size={16} color={isFlagged ? '#F59E0B' : '#6B7280'} />
              </View>
              <Text className={isFlagged ? 'text-yellow-600 font-semibold' : 'text-text'}>
                {isFlagged ? 'Image Flagged' : 'Flag Incorrect Image'}
              </Text>
            </TouchableOpacity>
          </View>

          <FormInput 
            label="Title" 
            value={formData.title} 
            onChangeText={(text: string) => handleInputChange('title', text)} 
            multiline={true}
          />
          
          <ContributorsEditor 
            contributors={contributors}
            onContributorsChange={setContributors}
            label="Contributors"
          />

          <FormInput 
            label="Publisher" 
            value={formData.publisher} 
            onChangeText={(text: string) => handleInputChange('publisher', text)} 
            multiline={true}
          />
          <FormInput 
            label="Published Date" 
            value={formData.published_date} 
            onChangeText={(text: string) => handleInputChange('published_date', text)} 
            placeholder="YYYY-MM-DD" 
          />
          <FormInput 
            label="Language" 
            value={language} 
            onChangeText={setLanguage} 
          />
          <FormInput 
            label="Series" 
            value={series} 
            onChangeText={setSeries} 
            placeholder="e.g., Harry Potter, Lord of the Rings"
            multiline={true}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}