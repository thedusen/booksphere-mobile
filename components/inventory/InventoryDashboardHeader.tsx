import { styled } from "nativewind";
import React from "react";
import { Text as RNText, View as RNView } from "react-native";

// Apply NativeWind styling
const View = styled(RNView);
const Text = styled(RNText);

interface InventoryDashboardHeaderProps {
  bookCount: number;
  totalItemCount: number; // Renamed for clarity in props
  totalValueInCents: number;
  isLoading?: boolean;
}

export const InventoryDashboardHeader: React.FC<InventoryDashboardHeaderProps> = ({
  bookCount,
  totalItemCount,
  totalValueInCents,
  isLoading = false,
}) => {
  // Format numbers with commas
  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-US').format(num);
  };
  
  // Format the total value from cents to currency string
  const formatCurrency = (cents: number): string => {
    const dollars = cents / 100;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(dollars);
  };

  if (isLoading) {
    return (
      <View className="mb-4">
        <Text className="font-bold text-foreground mb-2" style={{ fontSize: 18 }}>
          Loading...
        </Text>
        <View className="flex-row justify-between">
          <Text className="text-muted-foreground" style={{ fontSize: 13 }}>...</Text>
          <Text className="text-muted-foreground" style={{ fontSize: 13 }}>...</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="mb-4">
      {/* Main count - prominent display */}
      <Text className="font-bold text-foreground mb-2" style={{ fontSize: 18 }}>
        {formatNumber(bookCount)} UNIQUE BOOK{bookCount !== 1 ? 'S' : ''} FOUND
      </Text>
      
      {/* Secondary metrics - horizontal layout */}
      <View className="flex-row justify-between">
        <Text className="text-muted-foreground" style={{ fontSize: 13 }}>
          Total Items: {formatNumber(totalItemCount)}
        </Text>
        <Text className="text-muted-foreground" style={{ fontSize: 13 }}>
          Total Value: {formatCurrency(totalValueInCents)}
        </Text>
      </View>
    </View>
  );
};