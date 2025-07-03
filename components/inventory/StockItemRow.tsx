// components/inventory/StockItemRow.tsx
import type { StockItem } from "@/types/inventory";
import { MoreVertical, ShoppingBag, Store } from "lucide-react-native";
import { styled } from "nativewind";
import React from "react";
import { Text as RNText, TouchableOpacity as RNTouchableOpacity, View as RNView } from "react-native";

const View = styled(RNView);
const Text = styled(RNText);
const TouchableOpacity = styled(RNTouchableOpacity);

interface StockItemRowProps {
  item: StockItem;
  onMenuPress?: (item: StockItem) => void;
  onPress?: () => void;
}

export const StockItemRow: React.FC<StockItemRowProps> = ({ item, onMenuPress, onPress }) => {
  const isListedOn = (marketplace: string) => {
    return item.marketplace_listings.some(
      listing => listing.marketplace_name === marketplace && listing.status === 'active'
    );
  };

  const RowContent = (
    <View className="flex-row items-center py-3 px-4 border-b border-border/30 last:border-b-0">
      <View className="flex-1">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-foreground font-medium text-base">
            {item.condition_name} - ${item.selling_price_amount.toFixed(2)}
          </Text>
          {item.sku && (
            <Text className="text-muted-foreground text-xs">
              SKU: {item.sku}
            </Text>
          )}
        </View>

        <View className="flex-row items-center flex-wrap">
          <View className="flex-row items-center mr-4">
            <View className="mr-2">
              <ShoppingBag 
                size={16} 
                color={isListedOn('Amazon') ? "#FF9900" : "#71717a"} 
              />
            </View>
            <View className="mr-3">
              <Store 
                size={16} 
                color={isListedOn('eBay') ? "#0064D2" : "#71717a"} 
              />
            </View>
          </View>

          <View className="flex-row flex-wrap">
            {item.attributes.map((attr, index) => (
              <View key={index} className="bg-secondary/20 px-2 py-1 rounded mr-2 mb-1">
                <Text className="text-secondary text-xs font-medium">{attr.name}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {onMenuPress && (
        <TouchableOpacity onPress={() => onMenuPress(item)} className="p-2 ml-2">
          <MoreVertical size={16} color="#a1a1aa" />
        </TouchableOpacity>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.6}>
        {RowContent}
      </TouchableOpacity>
    );
  }

  return RowContent;
};