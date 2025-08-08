// app/(app)/settings.tsx
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { LogOut, User, Mail, Building2, Info } from 'lucide-react-native';
import { styled } from 'nativewind';
import React from 'react';
import BottomTabBar from '@/components/navigation/BottomTabBar';
import FloatingActionButton from '@/components/navigation/FloatingActionButton';
import {
  SafeAreaView as RNSafeAreaView,
  ScrollView as RNScrollView,
  Text as RNText,
  TouchableOpacity as RNTouchableOpacity,
  View as RNView,
  Alert,
} from 'react-native';

// Apply NativeWind styling
const View = styled(RNView);
const Text = styled(RNText);
const TouchableOpacity = styled(RNTouchableOpacity);
const SafeAreaView = styled(RNSafeAreaView);
const ScrollView = styled(RNScrollView);

// Settings Item Component
const SettingsItem = ({
  icon: IconComponent,
  label,
  value,
  onPress,
  variant = 'default',
}: {
  icon: any;
  label: string;
  value?: string;
  onPress?: () => void;
  variant?: 'default' | 'danger';
}) => (
  <TouchableOpacity
    onPress={onPress}
    className={`mx-4 p-4 bg-card border border-border rounded-2xl mb-3 ${
      onPress ? 'active:opacity-70' : ''
    }`}
    activeOpacity={onPress ? 0.7 : 1}
    accessibilityLabel={label}
    accessibilityRole={onPress ? 'button' : 'text'}
    accessibilityHint={onPress ? `Tap to ${label.toLowerCase()}` : undefined}
  >
    <View className="flex-row items-center">
      <View className={`p-2 rounded-full mr-3 ${
        variant === 'danger' ? 'bg-red-50' : 'bg-muted'
      }`}>
        <IconComponent 
          size={20} 
          color={variant === 'danger' ? '#DC2626' : '#6B7280'} 
          strokeWidth={1.5} 
        />
      </View>
      <View className="flex-1">
        <Text className={`text-base font-medium ${
          variant === 'danger' ? 'text-red-600' : 'text-text'
        }`}>
          {label}
        </Text>
        {value && (
          <Text className="text-sm text-muted-foreground mt-1">
            {value}
          </Text>
        )}
      </View>
    </View>
  </TouchableOpacity>
);

// Settings Section Header
const SectionHeader = ({ title }: { title: string }) => (
  <View className="mx-4 mb-3 mt-6">
    <Text className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
      {title}
    </Text>
  </View>
);

export default function SettingsScreen() {
  const { user, organizationId } = useAuth();

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await supabase.auth.signOut();
            // The AuthContext listener will handle the redirect automatically
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleAbout = () => {
    Alert.alert(
      'About Booksphere',
      'Version 1.0.0\n\nA professional book inventory management app for dealers and collectors.\n\n© 2025 Booksphere',
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header Spacing */}
        <View className="h-4" />

        {/* Account Section */}
        <SectionHeader title="Account" />
        
        <SettingsItem
          icon={User}
          label="User ID"
          value={user?.id || 'Not available'}
        />
        
        <SettingsItem
          icon={Mail}
          label="Email"
          value={user?.email || 'Not available'}
        />
        
        <SettingsItem
          icon={Building2}
          label="Organization"
          value={organizationId ? `ID: ${organizationId.slice(-8)}` : 'Not assigned'}
        />

        {/* App Section */}
        <SectionHeader title="Application" />
        
        <SettingsItem
          icon={Info}
          label="About Booksphere"
          onPress={handleAbout}
        />

        {/* Actions Section */}
        <SectionHeader title="Actions" />
        
        <SettingsItem
          icon={LogOut}
          label="Sign Out"
          onPress={handleSignOut}
          variant="danger"
        />

        {/* Bottom Spacing for FAB */}
        <View className="h-24" />
      </ScrollView>
      <BottomTabBar />
      <FloatingActionButton />
    </SafeAreaView>
  );
}