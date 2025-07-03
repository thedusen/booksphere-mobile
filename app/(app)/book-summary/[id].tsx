// app/(app)/book-summary/[id].tsx
import { FlashList } from "@shopify/flash-list";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Plus } from "lucide-react-native";
import { styled } from "nativewind";
import React, { useCallback } from "react";
import {
    ActivityIndicator,
    Image,
    SafeAreaView as RNSafeAreaView,
    Text as RNText,
    TouchableOpacity as RNTouchableOpacity,
    View as RNView,
} from "react-native";

import { StockItemRow } from "@/components/inventory/StockItemRow";
import { useAuth } from '@/context/AuthContext';
import { useBookSummary } from '@/hooks/useInventory';
import type { StockItem } from "@/types/inventory";

// Apply NativeWind styling
const View = styled(RNView);
const Text = styled(RNText);
const TouchableOpacity = styled(RNTouchableOpacity);
const SafeAreaView = styled(RNSafeAreaView);

export default function BookSummaryScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { organizationId } = useAuth();

  const {
    data: bookData,
    isLoading,
    error,
    refetch,
  } = useBookSummary({
    bookId: id || '',
    organizationId: organizationId || '',
  });

  const handleStockItemPress = useCallback((item: StockItem) => {
    router.push(`/stock-item/${item.stock_item_id}`);
  }, [router]);

  const handleAddNew = useCallback(() => {
    // Navigate to catalog screen with the book context
    router.push('/catalog-new');
  }, [router]);

  const renderStockItem = useCallback(({ item }: { item: StockItem }) => (
    <StockItemRow 
      item={item} 
      onPress={() => handleStockItemPress(item)} 
    />
  ), [handleStockItemPress]);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#1FB1AB" />
          <Text className="text-muted-foreground mt-4">Loading book details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !bookData) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 justify-center items-center px-8">
          <Text className="text-xl font-semibold text-destructive mb-2">Error Loading Book</Text>
          <Text className="text-muted-foreground text-center mb-6">
            {error?.message || 'Unable to load book details.'}
          </Text>
          <TouchableOpacity 
            onPress={() => refetch()} 
            className="bg-primary px-6 py-3 rounded-lg"
          >
            <Text className="text-primary-foreground font-medium">Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <Stack.Screen 
        options={{ 
          headerTitle: "Book Details",
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => router.back()}
              className="p-2 -ml-2"
            >
              <ArrowLeft size={24} color="#1FB1AB" />
            </TouchableOpacity>
          ),
        }} 
      />

      {/* Book Header Section */}
      <View className="bg-card border-b border-border p-6">
        <View className="flex-row">
          {bookData.cover_image_url && (
            <Image
              source={{ uri: bookData.cover_image_url }}
              className="w-24 h-36 rounded mr-6 bg-gray-200"
              resizeMode="cover"
            />
          )}
          <View className="flex-1">
            <Text className="text-xl font-bold text-foreground leading-tight">
              {bookData.title}
            </Text>
            {bookData.subtitle && (
              <Text className="text-lg text-muted-foreground mt-1">
                {bookData.subtitle}
              </Text>
            )}
            <Text className="text-base text-muted-foreground mt-2">
              {bookData.primary_author}
            </Text>
            {bookData.isbn13 && (
              <Text className="text-sm text-muted-foreground mt-2">
                ISBN: {bookData.isbn13}
              </Text>
            )}
          </View>
        </View>

        {/* Quick Stats */}
        <View className="flex-row justify-between mt-6 pt-4 border-t border-border/30">
          <View className="items-center">
            <Text className="text-2xl font-bold text-foreground">{bookData.total_copies}</Text>
            <Text className="text-sm text-muted-foreground">Total Copies</Text>
          </View>
          <View className="items-center">
            <Text className="text-2xl font-bold text-foreground">
              {bookData.price_range.min === bookData.price_range.max 
                ? `$${bookData.price_range.min.toFixed(0)}`
                : `$${bookData.price_range.min.toFixed(0)} - $${bookData.price_range.max.toFixed(0)}`
              }
            </Text>
            <Text className="text-sm text-muted-foreground">
              {bookData.price_range.min === bookData.price_range.max ? 'Price' : 'Price Range'}
            </Text>
          </View>
          <View className="items-center">
            <Text className="text-2xl font-bold text-foreground">{bookData.editions_count}</Text>
            <Text className="text-sm text-muted-foreground">Editions</Text>
          </View>
        </View>
      </View>

      {/* Stock Items Header */}
      <View className="px-6 py-4 bg-background border-b border-border/30">
        <Text className="text-lg font-semibold text-foreground">
          Inventory Items ({bookData.stock_items.length})
        </Text>
      </View>

      {/* Stock Items List */}
      <FlashList
        data={bookData.stock_items}
        renderItem={renderStockItem}
        keyExtractor={(item) => item.stock_item_id}
        estimatedItemSize={100}
        contentContainerStyle={{ paddingBottom: 100 }}
        removeClippedSubviews={true}
        ListEmptyComponent={() => (
          <View className="flex-1 justify-center items-center py-12">
            <Text className="text-muted-foreground">No inventory items found</Text>
          </View>
        )}
      />

      {/* Floating Action Button */}
      <TouchableOpacity 
        className="absolute bottom-6 right-6 w-14 h-14 bg-secondary rounded-full items-center justify-center shadow-lg elevation-8"
        onPress={handleAddNew}
        activeOpacity={0.8}
      >
        <Plus size={28} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}