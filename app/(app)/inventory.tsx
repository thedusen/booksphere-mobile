// app/(app)/inventory.tsx
import { FlashList } from "@shopify/flash-list";
import { Stack, useRouter } from "expo-router";
import { Barcode, Plus, Search, XCircle } from "lucide-react-native";
import { styled } from "nativewind";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView as RNSafeAreaView,
  ScrollView as RNScrollView,
  Text as RNText,
  TextInput as RNTextInput,
  TouchableOpacity as RNTouchableOpacity,
  View as RNView,
} from "react-native";

import { EmptyState } from "@/components/inventory/EmptyState";
import { FilterChip } from "@/components/inventory/FilterChip";
import { GroupedEditionCard } from "@/components/inventory/GroupedEditionCard";
import { InventoryDashboardHeader } from "@/components/inventory/InventoryDashboardHeader";
import { useAuth } from '@/context/AuthContext';
import { useDebounce, useInventory, useInventorySummaryMetrics } from '@/hooks/useInventory';
import type { FilterType, GroupedEdition, StockItem } from "@/types/inventory";

// Apply NativeWind styling
const View = styled(RNView);
const Text = styled(RNText);
const TextInput = styled(RNTextInput);
const TouchableOpacity = styled(RNTouchableOpacity);
const ScrollView = styled(RNScrollView);
const SafeAreaView = styled(RNSafeAreaView);

export default function InventoryScreen() {
  const router = useRouter();
  const { organizationId } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("All");

  const filters: FilterType[] = [
    "All", 
    "Available", 
    "Listed on Amazon", 
    "Listed on eBay", 
    "Needs Photos", 
    "Flagged", 
    "Low Stock"
  ];

  const debouncedSearch = useDebounce(searchQuery, 300);

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInventory({
    searchQuery: debouncedSearch.length >= 2 ? debouncedSearch : '',
    filterType: activeFilter,
    organizationId: organizationId || '',
  });

  const { data: summaryMetrics, isLoading: summaryLoading } = useInventorySummaryMetrics({
    searchQuery: debouncedSearch.length >= 2 ? debouncedSearch : '',
    filterType: activeFilter,
    organizationId: organizationId || '',
  });

  const inventory = useMemo(() => 
    data?.pages.flat() || [], 
    [data]
  );

  // Navigation handler for when a user taps on a specific stock item row.
  const handleStockItemPress = useCallback((item: StockItem) => {
    router.push(`/stock-item/${item.stock_item_id}`);
  }, [router]);

  // Navigation handler for when a user taps on the book header to go to Book Summary
  const handleBookPress = useCallback((bookId: string) => {
    router.push({
      pathname: "/book-summary/[id]" as any,
      params: { id: bookId }
    });
  }, [router]);

  const handleScanToFind = useCallback(() => {
    router.push('/scan');
  }, [router]);

  const handleAddNew = useCallback(() => {
    router.push('/scan');
  }, [router]);

  // renderItem now passes both navigation handlers to the card.
  const renderItem = useCallback(({ item }: { item: GroupedEdition }) => (
    <GroupedEditionCard 
      edition={item} 
      onStockItemPress={handleStockItemPress}
      onBookPress={handleBookPress}
    />
  ), [handleStockItemPress, handleBookPress]);

  if (isLoading && !data) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#1FB1AB" />
          <Text className="text-muted-foreground mt-4">Loading inventory...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 justify-center items-center px-8">
          <Text className="text-xl font-semibold text-destructive mb-2">Error Loading Inventory</Text>
          <Text className="text-muted-foreground text-center mb-6">
            {error.message || 'Something went wrong while loading your inventory.'}
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
          headerTitle: "Inventory",
          headerLargeTitle: true,
        }} 
      />

      {/* Header Section */}
      <View className="px-4 pt-2 pb-4 bg-background border-b border-border/30">
        {/* New Dashboard Header */}
        <InventoryDashboardHeader
  bookCount={summaryMetrics?.book_count || 0}
  totalValueInCents={summaryMetrics?.total_value_in_cents || 0}
  // ✅ ADDED: Pass the new totalItemCount prop
  totalItemCount={summaryMetrics?.total_item_count || 0}
  isLoading={summaryLoading}
/>

        <View 
          className="flex-row items-center bg-input border border-border rounded-lg px-3" 
          style={{ marginVertical: 12 }}
        >
          <View className="mr-2">
            <Search size={20} color="#a1a1aa" />
          </View>
          <TextInput
            className="flex-1 text-foreground text-base"
            style={{
              paddingVertical: 12,
              minHeight: 48,
            }}
            placeholder="Search by Title, Author, ISBN, SKU..."
            placeholderTextColor="#a1a1aa"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              className="p-2"
            >
              <XCircle size={20} color="#a1a1aa" />
            </TouchableOpacity>
          )}
          <TouchableOpacity className="ml-2 p-2" onPress={handleScanToFind}>
            <Barcode size={24} color="#1fb1ab" />
          </TouchableOpacity>
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={{ paddingRight: 20 }}
        >
          {filters.map((filter) => (
            <FilterChip
              key={filter}
              label={filter}
              isActive={activeFilter === filter}
              onPress={() => setActiveFilter(filter)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Main Content */}
      <FlashList
        data={inventory}
        renderItem={renderItem}
        keyExtractor={(item) => item.edition_id}
        ListEmptyComponent={<EmptyState searchQuery={debouncedSearch} />}
        estimatedItemSize={150} // Increased slightly to account for multiple stock items
        contentContainerStyle={{ paddingBottom: 100, paddingTop: 8 }}
        removeClippedSubviews={true}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.3}
        ListFooterComponent={() => 
          isFetchingNextPage ? (
            <View className="py-4 items-center">
              <ActivityIndicator color="#1FB1AB" />
              <Text className="text-muted-foreground mt-2">Loading more...</Text>
            </View>
          ) : null
        }
      />

      {/* Floating Action Button */}
      <TouchableOpacity 
        className="absolute bottom-6 right-6 w-14 h-14 bg-secondary rounded-full items-center justify-center shadow-lg elevation-8"
        onPress={handleAddNew}
        activeOpacity={0.8}
      >
        <Plus size={28} color="white" />
      </TouchableOpacity>

      {/* The ContextMenu component has been removed entirely */}
    </SafeAreaView>
  );
}