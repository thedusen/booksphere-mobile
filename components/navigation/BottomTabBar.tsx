// components/navigation/BottomTabBar.tsx
import React from 'react';
import { View, TouchableOpacity, Text, Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Home, Briefcase, Package, Settings } from 'lucide-react-native';
import { styled } from 'nativewind';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import JobStatusBadge from './JobStatusBadge';
import { useAuth } from '@/context/AuthContext';

const StyledView = styled(View);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledText = styled(Text);

interface TabItem {
  name: string;
  route: string;
  icon: any;
  label: string;
}

const tabs: TabItem[] = [
  { name: 'index', route: '/dashboard', icon: Home, label: 'Home' },
  { name: 'catalog-jobs', route: '/catalog-jobs', icon: Briefcase, label: 'Jobs' },
  { name: 'inventory', route: '/inventory', icon: Package, label: 'Inventory' },
  { name: 'settings', route: '/settings', icon: Settings, label: 'Settings' },
];

export default function BottomTabBar() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { organizationId } = useAuth();

  // Hide bottom navigation during camera workflows and full-screen experiences
  const shouldHide = pathname.includes('/catalog-new') || 
                    pathname.includes('/scan') ||
                    pathname.includes('/manual-entry') ||
                    pathname.includes('/catalog-review') ||
                    pathname.includes('/book-summary') ||
                    pathname.includes('/stock-item') ||
                    pathname.includes('/add-to-inventory') ||
                    pathname.includes('/edit-book') ||
                    pathname.includes('/add-success');

  if (shouldHide) return null;

  const isActive = (route: string) => {
    if (route === '/dashboard' && pathname === '/') return true;
    return pathname === route;
  };

  return (
    <StyledView 
      className="absolute left-0 right-0 bg-background border-t border-border"
      style={{
        bottom: 0, // Back to normal bottom position
        paddingBottom: insets.bottom || 8, // Normal padding
        height: (Platform.OS === 'ios' ? 60 : 50) + (insets.bottom || 0), // Reduced background height
      }}
    >
      <StyledView className="flex-row justify-around items-center pt-2">
        {tabs.map((tab, index) => {
          const Icon = tab.icon;
          const active = isActive(tab.route);
          
          // Add extra spacing around the FAB position (between index 1 and 2)
          const isBeforeFAB = index === 1;
          const isAfterFAB = index === 2;
          
          return (
            <StyledTouchableOpacity
              key={tab.name}
              onPress={() => router.push(tab.route as any)}
              className="flex-1 items-center justify-center py-2"
              style={{
                marginRight: isBeforeFAB ? 28 : 0, // Add space before FAB
                marginLeft: isAfterFAB ? 28 : 0,  // Add space after FAB
              }}
              accessibilityLabel={tab.label}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
            >
              <StyledView className="relative">
                <Icon 
                  size={24} 
                  color={active ? '#C7006F' : '#6B7280'} 
                  strokeWidth={1.5} 
                />
                {tab.name === 'catalog-jobs' && (
                  <JobStatusBadge 
                    organizationId={organizationId || ''} 
                    color={active ? '#C7006F' : '#6B7280'} 
                    size={24} 
                  />
                )}
              </StyledView>
              <StyledText 
                className={`text-xs mt-1 ${active ? 'text-primary' : 'text-muted-foreground'}`}
                style={{ fontWeight: active ? '600' : '500' }}
              >
                {tab.label}
              </StyledText>
            </StyledTouchableOpacity>
          );
        })}
      </StyledView>
    </StyledView>
  );
}