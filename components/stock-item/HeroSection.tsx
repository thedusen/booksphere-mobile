// components/stock-item/HeroSection.tsx
import { StockItemDetails } from '@/hooks/useInventory';
import { Flag } from 'lucide-react-native';
import { styled } from 'nativewind';
import React from 'react';
import { Image, Text as RNText, View as RNView, TouchableOpacity } from 'react-native';

const View = styled(RNView);
const Text = styled(RNText);

export const HeroSection = ({ data, onFlagPress }: { data: StockItemDetails, onFlagPress: () => void }) => (
  <View className="p-4 border-b border-border bg-card">
    <View className="flex-row">
      {data.edition_details.cover_image_url && (
        <Image
          source={{ uri: data.edition_details.cover_image_url }}
          className="w-24 h-36 rounded mr-4 bg-gray-200"
        />
      )}
      <View className="flex-1">
        <Text className="text-xl font-bold text-text leading-tight">{data.edition_details.title}</Text>
        <Text className="text-base text-muted-foreground mt-1">{data.edition_details.primary_author}</Text>
        <Text className="text-sm text-muted-foreground mt-1">{data.edition_details.publisher_name || 'No Publisher'}</Text>
        
        <View className="mt-3 pt-3 border-t border-border/50">
            <Text className="text-xs text-muted-foreground">ISBN-13: {data.edition_details.isbn13 || 'N/A'}</Text>
            <Text className="text-xs text-muted-foreground">ISBN-10: {data.edition_details.isbn10 || 'N/A'}</Text>
        </View>

        <TouchableOpacity onPress={onFlagPress} className="flex-row items-center mt-3">
          <Flag size={14} color="#6B7280" />
          <Text className="text-xs text-muted-foreground ml-1 underline">Report incorrect book data</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
);