// app/add-success.tsx

import { BookData } from '@/types/api';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { CheckCircle2 } from 'lucide-react-native';
import React from 'react';
import { Image, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';

export default function AddSuccessScreen() {
  const router = useRouter();
  const { book: bookDataString, stock_item_id: stockItemId } = useLocalSearchParams();
  
  if (!bookDataString) {
    return (
      <SafeAreaView className="flex-1 bg-background justify-center items-center p-6">
        <Text className="text-text">An unexpected error occurred.</Text>
        <TouchableOpacity onPress={() => router.replace('/')} className="mt-4 bg-primary p-3 rounded-lg">
          <Text className="text-white">Go to Dashboard</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }
  
  const bookData = JSON.parse(bookDataString as string) as BookData;

  const handleScanNext = () => {
    router.replace('/scan');
  };

  const handleViewEdit = () => {
    router.push({
      pathname: '/edit-book',
      params: { 
        book: bookDataString,
        stock_item_id: stockItemId 
      },
    });
  };

  // NEW: Handler to go back to the dashboard
  const handleGoToDashboard = () => {
    router.replace('/');
  };

  return (
    <SafeAreaView className="flex-1 bg-background justify-center items-center p-6">
      <Stack.Screen options={{ headerShown: false }} />

      <View className="items-center">
        <CheckCircle2 size={80} color="#22C55E" />
        <Text className="text-3xl font-bold text-text mt-6">Success!</Text>
        <Text className="text-lg text-muted-foreground mt-2 text-center">
          The book has been added to your inventory.
        </Text>
      </View>

      <View className="my-12 items-center">
        <Image
          source={{ uri: bookData.cover_image_url }}
          className="w-32 h-48 rounded-lg bg-input"
          resizeMode="cover"
        />
        <Text className="text-text text-xl font-bold text-center mt-4">{bookData.title}</Text>
        <Text className="text-muted-foreground text-base mt-1">{bookData.authors?.join(', ')}</Text>
      </View>

      {/* Container for all action buttons at the bottom of the screen */}
      <View className="w-full px-6 absolute bottom-10">
        <TouchableOpacity
          onPress={handleScanNext}
          className="bg-primary p-4 rounded-lg w-full mb-4"
        >
          <Text className="text-white text-lg font-bold text-center">Scan Next Book</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleViewEdit}
          className="bg-secondary p-4 rounded-lg w-full mb-4"
        >
          <Text className="text-white text-lg font-bold text-center">View/Edit Entry</Text>
        </TouchableOpacity>
        {/* NEW: Back to Dashboard button */}
        <TouchableOpacity
          onPress={handleGoToDashboard}
          className="bg-input border border-border p-4 rounded-lg w-full"
        >
          <Text className="text-text font-bold text-center">Back to Dashboard</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}