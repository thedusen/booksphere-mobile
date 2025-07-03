// components/inventory/EmptyState.tsx
import { Search } from "lucide-react-native";
import { styled } from "nativewind";
import React from "react";
import { Text as RNText, View as RNView } from "react-native";

const View = styled(RNView);
const Text = styled(RNText);

interface EmptyStateProps {
  searchQuery?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ searchQuery }) => {
  return (
    <View className="flex-1 justify-center items-center px-8">
      <Search size={64} color="#71717a" />
      <Text className="text-foreground text-xl font-semibold mt-4 mb-2 text-center">
        {searchQuery ? "No Results Found" : "No Inventory Items"}
      </Text>
      <Text className="text-muted-foreground text-center leading-6">
        {searchQuery
          ? `No items match "${searchQuery}". Try adjusting your search terms or filters.`
          : "Start building your inventory by adding your first book."}
      </Text>
    </View>
  );
};