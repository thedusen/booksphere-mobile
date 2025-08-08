// app/(app)/review.tsx
import { ApiResponse, BookData } from '@/types/api';
import { useQuery } from '@tanstack/react-query';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Edit3 } from 'lucide-react-native';
import { styled } from 'nativewind';
import React, { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
  ActivityIndicator,
  Image as RNImage,
  SafeAreaView as RNSafeAreaView,
  ScrollView as RNScrollView,
  Text as RNText,
  TouchableOpacity as RNTouchableOpacity,
  View as RNView,
} from 'react-native';

// Apply NativeWind styling
const View = styled(RNView);
const Text = styled(RNText);
const TouchableOpacity = styled(RNTouchableOpacity);
const SafeAreaView = styled(RNSafeAreaView);
const ScrollView = styled(RNScrollView);
const Image = styled(RNImage);

const fetchBookDataByIsbn = async (isbn: string): Promise<BookData> => {
  const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
  const response = await fetch(`${baseUrl}/getEnrichedBookDataByIsbn?isbn=${isbn}`);
  if (!response.ok) throw new Error(`API request failed with status ${response.status}`);
  const data: ApiResponse = await response.json();
  if (data.jsonResult && data.jsonResult.bookData) return data.jsonResult.bookData;
  throw new Error("Book data not found for this ISBN.");
};

export default function ReviewScreen() {
  const router = useRouter();
  const { isbn, job_id } = useLocalSearchParams<{ isbn: string; job_id?: string }>();

  const { data: bookData, isLoading, error, refetch } = useQuery<BookData, Error>({
    queryKey: ['bookDetails', isbn],
    queryFn: () => fetchBookDataByIsbn(isbn!),
    enabled: !!isbn,
  });

  // Update job status when data is successfully fetched or when error persists
  useEffect(() => {
    if (bookData && job_id) {
      console.log(`📝 Updating job ${job_id} status to completed`);
      supabase
        .from('cataloging_jobs')
        .update({ 
          extracted_data: bookData, 
          status: 'completed' 
        })
        .eq('job_id', job_id)
        .then(({ error }) => {
          if (error) {
            console.error(`❌ Failed to update job ${job_id}:`, error);
          } else {
            console.log(`✅ Job ${job_id} updated to completed`);
          }
        });
    } else if (error && job_id) {
      // If we have a persistent error and job_id, mark the job as failed
      console.log(`⚠️ Marking job ${job_id} as failed due to persistent API error`);
      supabase
        .from('cataloging_jobs')
        .update({ 
          status: 'failed',
          error_message: error.message
        })
        .eq('job_id', job_id)
        .then(({ error: updateError }) => {
          if (updateError) {
            console.error(`❌ Failed to mark job ${job_id} as failed:`, updateError);
          } else {
            console.log(`✅ Job ${job_id} marked as failed`);
          }
        });
    }
  }, [bookData, error, job_id]);

  const handleAddToInventory = () => {
    if (!bookData) return;
    router.push({ pathname: '/add-to-inventory', params: { book: JSON.stringify(bookData) } });
  };

  const handleEdit = () => {
    if (!bookData) return;
    router.push({ pathname: '/edit-book', params: { book: JSON.stringify(bookData) } });
  };

  const handleGoBack = () => {
    // FIX: Navigate reliably to the dashboard to prevent loops.
    router.replace('/');
  }

  const renderContent = () => {
    if (isLoading) {
      return <View className="flex-1 justify-center items-center"><ActivityIndicator size="large" color="#C7006F" /></View>;
    }
    if (error) {
      return (
        <View className="flex-1 justify-center items-center p-4">
          <Text className="text-primary text-center text-lg mb-4">{error.message}</Text>
          <TouchableOpacity onPress={() => refetch()} className="bg-primary py-3 px-6 rounded-lg">
            <Text className="text-white font-bold">Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }
    if (bookData) {
      return (
        <View className="flex-1">
          <View className="items-center mb-6">
            <Image source={{ uri: bookData.cover_image_url }} className="w-48 h-72 rounded-lg bg-gray-200" resizeMode="cover" />
            <View className="mt-6 w-full items-center">
              <Text className="text-text text-2xl font-bold text-center">{bookData.title}</Text>
              <Text className="text-muted-foreground text-lg mt-2">{bookData.authors?.join(', ')}</Text>
              <Text className="text-muted-foreground text-base mt-1">{bookData.publisher} ({bookData.published_date?.substring(0, 4)})</Text>
            </View>
          </View>
          <View className="flex-1" />
          <View className="space-y-4">
            <TouchableOpacity onPress={handleAddToInventory} className="bg-primary p-4 rounded-lg">
              <Text className="text-white text-lg font-bold text-center">Add to Inventory</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleEdit} className="bg-secondary p-4 rounded-lg flex-row items-center justify-center">
              <View className="mr-2"><Edit3 size={20} color="#FFFFFF" /></View>
              <Text className="text-white text-lg font-bold">Edit Details</Text>
            </TouchableOpacity>
            {/* FIX: This button now also reliably returns to the dashboard. */}
            <TouchableOpacity onPress={handleGoBack} className="mt-2 py-2">
              <Text className="text-center text-muted-foreground underline">Not this book? Scan again.</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
    return null;
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* FIX: The header back button now reliably returns to the dashboard. */}
      <Stack.Screen 
        options={{ 
          headerShown: true, 
          headerTitle: "Review Book",
        }} 
      />
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24 }}>
        {renderContent()}
      </ScrollView>
    </SafeAreaView>
  );
}