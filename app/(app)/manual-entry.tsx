// app/manual-entry.tsx

import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, SafeAreaView, Text, TextInput, TouchableOpacity } from 'react-native';
// NEW: Import the ArrowLeft icon for the back button.
import { ArrowLeft } from 'lucide-react-native';

export default function ManualEntryScreen() {
  const [isbn, setIsbn] = useState('');
  const router = useRouter();

  const handleSubmit = () => {
    if (isbn.trim().length > 0) {
      console.log('Manually entered ISBN:', isbn);
      router.replace({
        pathname: '/review',
        params: { isbn: isbn.trim() },
      });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* NEW: Explicit Back Button */}
      <TouchableOpacity
        onPress={() => router.back()}
        className="absolute top-16 left-6 z-10 p-2"
      >
        <ArrowLeft size={28} color="#3B3B3A" />
      </TouchableOpacity>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 justify-center items-center p-6"
      >
        <Text className="text-2xl font-bold text-text mb-2">Enter ISBN</Text>
        <Text className="text-muted-foreground text-center mb-8">
          Type the 10 or 13-digit ISBN found on the book&apos;s copyright page or back cover.
        </Text>

        <TextInput
          className="bg-input border border-border text-text rounded-lg px-4 py-4 text-lg w-full text-center min-h-[50px]"
          style={{ textAlignVertical: 'center' }}
          placeholder="e.g., 9780143126562"
          placeholderTextColor="#9CA3AF"
          keyboardType="number-pad"
          value={isbn}
          onChangeText={setIsbn}
          autoFocus={true}
        />

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={!isbn.trim()}
          className={`mt-6 w-full p-4 rounded-lg ${!isbn.trim() ? 'bg-primary/50' : 'bg-primary'}`}
        >
          <Text className="text-white text-lg font-bold text-center">Find Book</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}