// components/inventory/GroupedEditionCard.tsx
import type { GroupedEdition, StockItem } from '@/types/inventory';
import { ChevronRight } from 'lucide-react-native';
import { styled } from 'nativewind';
import React from 'react';
import { Image, Text as RNText, TouchableOpacity as RNTouchableOpacity, View as RNView } from 'react-native';

const View = styled(RNView);
const Text = styled(RNText);
const TouchableOpacity = styled(RNTouchableOpacity);

interface GroupedEditionCardProps {
  edition: GroupedEdition;
  onStockItemPress: (item: StockItem) => void;
  onBookPress?: (bookId: string) => void;
}

// A small component for the attribute pills
const AttributePill = ({ label }: { label: string }) => (
  <View className="bg-secondary/10 rounded-full px-2 py-1 mr-2">
    <Text className="text-secondary text-xs font-medium">{label}</Text>
  </View>
);

export const GroupedEditionCard = ({ edition, onStockItemPress, onBookPress }: GroupedEditionCardProps) => {
  return (
    <View className="bg-card border border-border rounded-lg mx-4 mb-4 shadow-sm">
      {/* Main Edition Info - Tappable to go to Book Summary */}
      <TouchableOpacity 
        className="flex-row p-4"
        onPress={() => onBookPress?.(edition.book_id)}
        activeOpacity={onBookPress ? 0.6 : 1.0}
      >
        {edition.cover_image_url && (
          <Image
            source={{ uri: edition.cover_image_url }}
            className="w-16 h-24 rounded mr-4 bg-gray-200"
            resizeMode="cover"
          />
        )}
        <View className="flex-1">
          <Text className="text-base font-semibold text-text leading-snug" numberOfLines={2}>
            {edition.title}
          </Text>
          <Text className="text-sm text-muted-foreground mt-1">
            {edition.primary_author}
          </Text>
          <Text className="text-xs text-muted-foreground mt-2">
            ISBN: {edition.isbn13 || edition.isbn10 || 'N/A'}
          </Text>
          {edition.total_copies > 1 && (
            <Text className="text-xs text-secondary mt-1 font-medium">
              {edition.total_copies} copies available
            </Text>
          )}
        </View>
        {onBookPress && (
          <View className="justify-center pl-2">
            <ChevronRight size={20} color="#9CA3AF" />
          </View>
        )}
      </TouchableOpacity>

      {/* Stock Items List */}
      <View className="border-t border-border/50">
        {edition.stock_items.map((item) => (
          // ✅ This TouchableOpacity now handles navigation for the entire row
          <TouchableOpacity
            key={item.stock_item_id}
            onPress={() => onStockItemPress(item)}
            className="flex-row items-center p-3 last:border-b-0 border-b border-border/30"
            style={{ backgroundColor: '#F9F9F9' }}
            activeOpacity={0.6}
          >
            <View className="flex-1">
              <View className="flex-row items-center justify-between">
                <Text className="text-sm font-medium text-text">{item.condition_name}</Text>
                <Text className="text-base font-semibold text-text">
                  ${item.selling_price_amount.toFixed(2)}
                </Text>
              </View>
              <View className="flex-row items-center mt-2">
                {/* ✅ RE-ADDED: Attribute Pills */}
                {item.marketplace_listings.some(l => l.marketplace_name === 'Amazon' && l.status === 'active') && <AttributePill label="Amazon" />}
                {item.marketplace_listings.some(l => l.marketplace_name === 'eBay' && l.status === 'active') && <AttributePill label="eBay" />}
                {!item.has_photos && <AttributePill label="Needs Photos" />}
              </View>
            </View>
            <View className="pl-3">
              <ChevronRight size={20} color="#9CA3AF" />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};