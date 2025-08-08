// app/manual-entry.tsx

import { useAuth } from '@/context/AuthContext';
import { useSnackbar } from '@/hooks/useSnackbar';
import { supabase } from '@/lib/supabase';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, SafeAreaView, Text, TextInput, TouchableOpacity } from 'react-native';
// NEW: Import the ArrowLeft icon for the back button.
import { ArrowLeft } from 'lucide-react-native';

export default function ManualEntryScreen() {
  const [isbn, setIsbn] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { user, organizationId } = useAuth();
  const { showSnackbar } = useSnackbar();


  const handleSubmit = async () => {
    if (isbn.trim().length === 0) return;
    
    if (!user || !organizationId) {
      showSnackbar('error', 'You must be logged in to submit ISBN.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create cataloging job first (matching scan.tsx quick-add pattern)
      console.log(`📝 Manual Entry - Creating cataloging job for ISBN: ${isbn.trim()}`);
      
      const { data: newJobId, error } = await supabase.rpc('create_cataloging_job', {
        image_urls_payload: {
          isbn: isbn.trim(),
          method: 'manual',
          job_type: 'isbn_manual'
        }
      });
      
      if (error) {
        console.error('❌ Failed to create manual entry job:', error);
        throw error;
      }
      
      console.log(`✅ Manual Entry job created: ${newJobId}`);
      
      // Navigate to review screen with both ISBN and job ID (matching scan.tsx pattern)
      console.log(`🧭 Navigating to review screen`);
      router.push({ 
        pathname: '/review', 
        params: { 
          isbn: isbn.trim(),
          job_id: newJobId
        } 
      });
      
    } catch (error: any) {
      console.error('Failed to process manual ISBN:', error);
      showSnackbar('error', `Failed to create cataloging job for ISBN: ${isbn.trim()}`);
    } finally {
      setIsSubmitting(false);
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
          disabled={!isbn.trim() || isSubmitting}
          className={`mt-6 w-full p-4 rounded-lg ${!isbn.trim() || isSubmitting ? 'bg-primary/50' : 'bg-primary'}`}
        >
          {isSubmitting ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text className="text-white text-lg font-bold text-center">Find Book</Text>
          )}
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}