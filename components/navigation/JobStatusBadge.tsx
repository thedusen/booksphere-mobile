// components/navigation/JobStatusBadge.tsx
import { useCatalogJobs } from '@/hooks/useCatalogJobs';
import React from 'react';
import { View, Text } from 'react-native';

interface JobStatusBadgeProps {
  organizationId: string;
  color: string;
  size: number;
}

export default function JobStatusBadge({ organizationId, color, size }: JobStatusBadgeProps) {
  const { data: jobs } = useCatalogJobs(organizationId || '');

  if (!jobs || jobs.length === 0) return null;

  // Calculate job counts
  const processingJobs = jobs.filter(job => job.status === 'pending' || job.status === 'processing').length;
  const completedJobs = jobs.filter(job => job.status === 'completed').length;
  const failedJobs = jobs.filter(job => job.status === 'failed').length;

  // Show badge if there are active jobs (processing, completed, or failed)
  const totalActiveJobs = processingJobs + completedJobs + failedJobs;
  
  if (totalActiveJobs === 0) return null;

  // Determine badge color based on job states
  let badgeColor = '#1FB1AB'; // Default teal for completed
  if (failedJobs > 0) {
    badgeColor = '#DC2626'; // Red for failed
  } else if (processingJobs > 0) {
    badgeColor = '#F59E0B'; // Amber for processing
  }

  return (
    <View
      style={{
        position: 'absolute',
        top: -2,
        right: -6,
        backgroundColor: badgeColor,
        borderRadius: 10,
        minWidth: 16,
        height: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#F9FBF9', // Off-white border
      }}
    >
      <Text
        style={{
          color: 'white',
          fontSize: 10,
          fontWeight: '600',
          textAlign: 'center',
        }}
        accessibilityLabel={`${totalActiveJobs} active jobs`}
      >
        {totalActiveJobs > 99 ? '99+' : totalActiveJobs}
      </Text>
    </View>
  );
}