// app/(app)/index.tsx
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { BookCheck, Library, LogOut, LucideIcon, ScanLine } from 'lucide-react-native';
import { styled } from 'nativewind';
import React from 'react';
import {
  SafeAreaView as RNSafeAreaView,
  Text as RNText,
  TouchableOpacity as RNTouchableOpacity,
  View as RNView,
} from 'react-native';

// Apply NativeWind styling
const View = styled(RNView);
const Text = styled(RNText);
const TouchableOpacity = styled(RNTouchableOpacity);
const SafeAreaView = styled(RNSafeAreaView);

// Reusable Dashboard Button Component
const DashboardButton = ({
  icon: IconComponent,
  label,
  onPress,
}: {
  icon: LucideIcon;
  label: string;
  onPress: () => void;
}) => (
  <TouchableOpacity
    onPress={onPress}
    className="bg-card border border-border rounded-2xl p-4 w-[48%] aspect-square justify-center items-center shadow-sm mb-4"
    activeOpacity={0.7}
  >
    <View className="bg-primary/10 p-3 rounded-full mb-3">
      <IconComponent size={32} color="#1FB1AB" strokeWidth={1.5} />
    </View>
    <Text className="text-text text-base font-semibold text-center">{label}</Text>
  </TouchableOpacity>
);

export default function DashboardScreen() {
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    // The AuthContext listener will handle the redirect automatically
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 p-6">
        <View className="flex-row justify-between items-center mb-8">
          <Text className="text-3xl font-bold text-text">Booksphere</Text>
          <TouchableOpacity onPress={handleSignOut} className="p-2">
            <LogOut size={24} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
        <View className="flex-row flex-wrap justify-between">
  <DashboardButton icon={ScanLine} label="Scan New Book" onPress={() => router.push('/scan')} />
  <DashboardButton icon={Library} label="Manage Inventory" onPress={() => router.push('/inventory')} />
  {/* ✅ ADD THIS NEW BUTTON */}
  <DashboardButton icon={BookCheck} label="Cataloging Jobs" onPress={() => router.push('/catalog-jobs')} />
</View>
      </View>
    </SafeAreaView>
  );
}