// app/(app)/dashboard.tsx
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { useCatalogJobs } from '@/hooks/useCatalogJobs';
import { useJobStatusSnackbars } from '@/hooks/useJobStatusSnackbars';
import { BookCheck, Camera, Library, LogOut, LucideIcon, ScanLine, Type } from 'lucide-react-native';
import { styled } from 'nativewind';
import React, { useState } from 'react';
import * as Haptics from 'expo-haptics';
import {
  SafeAreaView as RNSafeAreaView,
  ScrollView as RNScrollView,
  Text as RNText,
  TouchableOpacity as RNTouchableOpacity,
  View as RNView,
} from 'react-native';
import BottomTabBar from '@/components/navigation/BottomTabBar';
import FloatingActionButton from '@/components/navigation/FloatingActionButton';

// Apply NativeWind styling
const View = styled(RNView);
const Text = styled(RNText);
const TouchableOpacity = styled(RNTouchableOpacity);
const SafeAreaView = styled(RNSafeAreaView);
const ScrollView = styled(RNScrollView);

// Hero Button Component for primary actions
const HeroButton = ({
  icon: IconComponent,
  title,
  onPress,
  variant = 'primary',
  isLoading = false,
}: {
  icon: LucideIcon;
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  isLoading?: boolean;
}) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={isLoading}
    className={`flex-1 mx-2 rounded-3xl px-3 py-6 h-36 justify-center items-center border-2 ${
      variant === 'primary' 
        ? 'bg-primary/5 border-primary/20' 
        : 'bg-secondary/5 border-secondary/20'
    } ${isLoading ? 'opacity-50' : ''}`}
    activeOpacity={0.7}
    accessibilityLabel={title}
    accessibilityRole="button"
    accessibilityHint={`Navigate to ${title.toLowerCase()} screen`}
    accessibilityState={{ disabled: isLoading }}
  >
    <View className={`p-4 rounded-full mb-3 ${
      variant === 'primary' ? 'bg-primary/10' : 'bg-secondary/10'
    }`}>
      <IconComponent 
        size={36} 
        color={variant === 'primary' ? '#C7006F' : '#1FB1AB'} 
        strokeWidth={1.5} 
      />
    </View>
    <Text className="text-text text-base font-semibold text-center">{title}</Text>
  </TouchableOpacity>
);

// Secondary Button Component
const SecondaryButton = ({
  icon: IconComponent,
  label,
  onPress,
  isLoading = false,
}: {
  icon: LucideIcon;
  label: string;
  onPress: () => void;
  isLoading?: boolean;
}) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={isLoading}
    className={`bg-card border border-border rounded-2xl p-4 h-20 mx-4 flex-row items-center justify-center ${isLoading ? 'opacity-50' : ''}`}
    activeOpacity={0.7}
    accessibilityLabel={label}
    accessibilityRole="button"
    accessibilityHint={`Navigate to ${label.toLowerCase()} screen`}
    accessibilityState={{ disabled: isLoading }}
  >
    <View className="bg-muted p-2 rounded-full mr-3">
      <IconComponent size={24} color="#6B7280" strokeWidth={1.5} />
    </View>
    <Text className="text-text text-base font-semibold">{label}</Text>
  </TouchableOpacity>
);

// Enhanced Management Button Component with rich activity indicators
const ManagementButton = ({
  label,
  onPress,
  isLoading = false,
  badge,
  jobStatus,
  matchHeight = false,
}: {
  label: string;
  onPress: () => void;
  isLoading?: boolean;
  badge?: {
    count: number;
    color: 'primary' | 'secondary' | 'warning';
  };
  jobStatus?: {
    processing: number;
    completed: number;
    failed: number;
  };
  matchHeight?: boolean;
}) => {
  // Both buttons use h-20 to match when one has jobStatus
  const buttonHeight = jobStatus || matchHeight ? 'h-20' : 'h-16';
  
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isLoading}
      className={`flex-1 mx-2 bg-card border border-border rounded-2xl p-3 ${isLoading ? 'opacity-50' : ''} ${buttonHeight}`}
      activeOpacity={0.7}
      accessibilityLabel={`${label}${badge ? ` (${badge.count} items)` : ''}`}
      accessibilityRole="button"
      accessibilityHint={`Navigate to ${label.toLowerCase()} screen`}
      accessibilityState={{ disabled: isLoading }}
    >
      <View className="flex-1 justify-center items-center">
        <View className="items-center">
          <Text className="text-text text-sm font-semibold text-center">{label}</Text>
          
          {/* Rich job status for Catalog Jobs */}
          {jobStatus && (
            <View className="flex-row justify-center items-center space-x-3 mt-2">
              {jobStatus.processing > 0 && (
                <View className="flex-row items-center">
                  <View className="w-2 h-2 bg-amber-500 rounded-full mr-1" />
                  <Text className="text-xs text-amber-600 font-medium">{jobStatus.processing}</Text>
                </View>
              )}
              {jobStatus.completed > 0 && (
                <View className="flex-row items-center">
                  <View className="w-2 h-2 bg-secondary rounded-full mr-1" />
                  <Text className="text-xs text-secondary font-medium">{jobStatus.completed}</Text>
                </View>
              )}
              {jobStatus.failed > 0 && (
                <View className="flex-row items-center">
                  <View className="w-2 h-2 bg-red-500 rounded-full mr-1" />
                  <Text className="text-xs text-red-600 font-medium">{jobStatus.failed}</Text>
                </View>
              )}
              {jobStatus.processing === 0 && jobStatus.completed === 0 && jobStatus.failed === 0 && (
                <Text className="text-xs text-muted-foreground">All clear</Text>
              )}
            </View>
          )}
          
          {/* Standard badge for other buttons */}
          {badge && badge.count > 0 && !jobStatus && (
            <View className="flex-row items-center justify-center mt-2">
              <View className={`w-2 h-2 rounded-full mr-1 ${
                badge.color === 'primary' ? 'bg-primary' : 
                badge.color === 'secondary' ? 'bg-secondary' : 
                'bg-amber-500'
              }`} />
              <Text className="text-xs text-muted-foreground">
                {badge.count} active
              </Text>
            </View>
          )}
          
          {/* Invisible spacer to maintain consistent height for matchHeight buttons */}
          {matchHeight && !badge && !jobStatus && (
            <Text className="text-xs text-muted-foreground opacity-0 mt-2">All clear</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function DashboardScreen() {
  const router = useRouter();
  const { organizationId } = useAuth();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  
  // Get catalog jobs data and setup real-time snackbar notifications
  const { data: jobs } = useCatalogJobs(organizationId || '');
  useJobStatusSnackbars({ 
    organizationId: organizationId || '',
    enableNotifications: true 
  });

  // Calculate detailed job stats for enhanced UI
  const processingJobs = jobs?.filter(job => job.status === 'pending' || job.status === 'processing') || [];
  const completedJobs = jobs?.filter(job => job.status === 'completed') || [];
  const failedJobs = jobs?.filter(job => job.status === 'failed') || [];
  
  // Job status summary for Catalog Jobs button
  const jobStatusSummary = {
    processing: processingJobs.length,
    completed: completedJobs.length,
    failed: failedJobs.length,
  };

  const handleNavigate = async (route: string, buttonId: string) => {
    setIsLoading(buttonId);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(route as any);
    // Reset loading state after navigation
    setTimeout(() => setIsLoading(null), 100);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    // The AuthContext listener will handle the redirect automatically
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 p-6 pb-24">
        {/* Header - Smaller Title */}
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-xl font-bold text-text">Booksphere</Text>
          <TouchableOpacity 
            onPress={handleSignOut} 
            className="p-2"
            accessibilityLabel="Sign out"
            accessibilityRole="button"
            accessibilityHint="Sign out of your account"
          >
            <LogOut size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Management at Top - Less Frequent Actions */}
        <View className="mb-6">
          <View className="flex-row">
            <ManagementButton
              label="Inventory"
              onPress={() => handleNavigate('/inventory', 'inventory')}
              isLoading={isLoading === 'inventory'}
              matchHeight={true}
            />
            <ManagementButton
              label="Catalog Jobs"
              onPress={() => handleNavigate('/catalog-jobs', 'jobs')}
              isLoading={isLoading === 'jobs'}
              jobStatus={jobStatusSummary}
            />
          </View>
        </View>

        {/* Quick Review Section - Actionable Completed Jobs (Max Height Protected) */}
        {completedJobs.length > 0 && (
          <TouchableOpacity
            onPress={() => handleNavigate('/catalog-jobs', 'review-all')}
            className="mx-4 mb-6 p-4 bg-secondary/5 border border-secondary/20 rounded-2xl"
            style={{ maxHeight: 200 }}
            activeOpacity={0.7}
            accessibilityLabel="Ready to review jobs"
            accessibilityRole="button"
            accessibilityHint="Navigate to catalog jobs to review completed items"
          >
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center">
                <BookCheck size={18} color="#1FB1AB" />
                <Text className="ml-2 text-base font-semibold text-text">
                  Ready to Review
                </Text>
              </View>
              <View className="bg-secondary/10 px-3 py-1 rounded-full">
                <Text className="text-xs font-medium text-secondary">View All</Text>
              </View>
            </View>
            
            <ScrollView 
              className="flex-1" 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ gap: 8 }}
            >
              {completedJobs.slice(0, 3).map((job, index) => {
                const imageCount = job.image_urls ? Object.keys(job.image_urls as any).length : 0;
                return (
                  <View
                    key={job.job_id}
                    className="flex-row items-center justify-between p-3 bg-card border border-border rounded-xl mb-2"
                  >
                    <View className="flex-1">
                      <Text className="text-sm font-medium text-text" numberOfLines={1}>
                        Job #{job.job_id.slice(-8)}
                      </Text>
                      <Text className="text-xs text-muted-foreground mt-1" numberOfLines={1}>
                        {new Date(job.created_at).toLocaleDateString()} • {imageCount} photos
                      </Text>
                    </View>
                    <View className="ml-3 bg-secondary/10 px-2 py-1 rounded-full">
                      <Text className="text-xs font-medium text-secondary">Review</Text>
                    </View>
                  </View>
                );
              })}
              
              {completedJobs.length > 3 && (
                <View className="p-2 items-center">
                  <Text className="text-xs text-secondary font-medium">
                    +{completedJobs.length - 3} more ready for review
                  </Text>
                </View>
              )}
            </ScrollView>
          </TouchableOpacity>
        )}

        {/* Flexible spacer to push primary actions toward bottom */}
        <View className="flex-1" />

        {/* Primary Actions at Bottom - Optimal Thumb Zone */}
        <View className="mb-8">
          <View className="flex-row">
            <HeroButton
              icon={ScanLine}
              title="Scan ISBN"
              onPress={() => handleNavigate('/scan', 'scan')}
              variant="primary"
              isLoading={isLoading === 'scan'}
            />
            <HeroButton
              icon={Camera}
              title="Take Photos"
              onPress={() => handleNavigate('/catalog-new', 'photos')}
              variant="secondary"
              isLoading={isLoading === 'photos'}
            />
          </View>
        </View>

        {/* Manual Entry - Bottom Position */}
        <View className="mb-8">
          <SecondaryButton
            icon={Type}
            label="Enter ISBN Manually"
            onPress={() => handleNavigate('/manual-entry', 'manual')}
            isLoading={isLoading === 'manual'}
          />
        </View>
      </View>
      <BottomTabBar />
      <FloatingActionButton />
    </SafeAreaView>
  );
}