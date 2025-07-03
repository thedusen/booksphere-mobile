// components/inventory/FilterChip.tsx
import React from "react";
import { Text, TouchableOpacity } from "react-native";

interface FilterChipProps {
  label: string;
  isActive: boolean;
  onPress: () => void;
}

export const FilterChip: React.FC<FilterChipProps> = ({ label, isActive, onPress }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`px-4 py-2 rounded-full mr-2 ${isActive ? "bg-secondary" : "bg-input border border-border"}`}
    >
      <Text className={`text-sm font-medium ${isActive ? "text-white" : "text-muted-foreground"}`}>{label}</Text>
    </TouchableOpacity>
  );
};