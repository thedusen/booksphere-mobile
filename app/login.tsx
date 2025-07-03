// app/login.tsx
import { supabase } from '@/lib/supabase';
import { Stack } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, SafeAreaView, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }
    setIsSubmitting(true);
    try {
      // This is all we need. We sign in, and the AuthContext listener does the rest.
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (error) {
        throw error;
      }
      // No redirect logic here. It's all handled by the layouts now.

    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = () => {
    Alert.alert('Sign Up', 'Sign-up functionality will be implemented next.');
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 justify-center p-6"
      >
        <View className="mb-10 items-center">
            <Text className="text-4xl font-bold text-text">Booksphere</Text>
            <Text className="text-lg text-muted-foreground">Welcome Back</Text>
        </View>

        <View className="mb-4">
          <Text className="text-muted-foreground text-sm font-medium mb-1">Email</Text>
          <TextInput
            className="bg-input border border-border text-text rounded-lg px-4 text-base"
            style={{ 
              height: 56,
              paddingVertical: 0,
              paddingTop: 16,
              paddingBottom: 16,
              textAlignVertical: 'center',
              lineHeight: 20,
              includeFontPadding: false
            }}
            placeholder="you@example.com"
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            textContentType="emailAddress"
            multiline={false}
            numberOfLines={1}
          />
        </View>

        <View className="mb-6">
          <Text className="text-muted-foreground text-sm font-medium mb-1">Password</Text>
          <TextInput
            className="bg-input border border-border text-text rounded-lg px-4 text-base"
            style={{ 
              height: 56,
              paddingVertical: 0,
              paddingTop: 16,
              paddingBottom: 16,
              textAlignVertical: 'center',
              lineHeight: 20,
              includeFontPadding: false
            }}
            placeholder="••••••••"
            placeholderTextColor="#9CA3AF"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            textContentType="password"
            multiline={false}
            numberOfLines={1}
          />
        </View>

        <TouchableOpacity
          onPress={handleLogin}
          disabled={isSubmitting}
          className="bg-primary p-4 rounded-lg"
        >
          {isSubmitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-lg font-bold text-center">Sign In</Text>
          )}
        </TouchableOpacity>

        <View className="flex-row justify-center mt-6">
            <Text className="text-muted-foreground">Don&apos;t have an account? </Text>
            <TouchableOpacity onPress={handleSignUp}>
                <Text className="text-primary font-bold">Sign Up</Text>
            </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}