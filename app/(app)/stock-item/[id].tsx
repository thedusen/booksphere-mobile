// app/(app)/stock-item/[id].tsx
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { styled } from 'nativewind';
import React, { useState } from 'react'; // Added useState
import { ActivityIndicator, Alert, SafeAreaView as RNSafeAreaView, Text as RNText, TouchableOpacity as RNTouchableOpacity, View as RNView, ScrollView } from 'react-native';

import { AccordionSection } from '@/components/common/AccordionSection';
import { HeroSection } from '@/components/stock-item/HeroSection';
import { useAuth } from '@/context/AuthContext';
import { StockItemDetails, useStockItem } from '@/hooks/useInventory';

// NEW: Import the modal
import { EditDetailsModal } from '@/components/stock-item/EditDetailsModal';

// Styled components
const View = styled(RNView);
const Text = styled(RNText);
const SafeAreaView = styled(RNSafeAreaView);
const TouchableOpacity = styled(RNTouchableOpacity);

// --- Sub-components for Accordion Content ---

const DetailRow = ({ label, value }: { label: string, value: string | null | undefined }) => (
    <View className="py-3 border-b border-border/30">
        <Text className="text-sm text-muted-foreground mb-1">{label}</Text>
        <Text className="text-base text-text">{value || 'Not set'}</Text>
    </View>
);

// MODIFIED: Added onEdit prop
const CoreDetailsContent = ({ stockItem, onEdit }: { stockItem: StockItemDetails; onEdit: () => void; }) => (
    <View>
        <DetailRow label="Condition" value={stockItem.condition_name} />
        <DetailRow label="SKU" value={stockItem.sku} />
        <DetailRow label="Location" value={stockItem.location_in_store_text} />
        <DetailRow label="Condition Notes" value={stockItem.condition_notes} />
        <DetailRow label="Internal Notes" value={stockItem.internal_notes} />
        
        {/* MODIFIED: This button now triggers the modal */}
        <TouchableOpacity 
          onPress={onEdit}
          className="bg-input border border-border mt-4 py-3 rounded-lg"
        >
          <Text className="text-secondary font-bold text-center">Edit Core Details & Notes</Text>
        </TouchableOpacity>
    </View>
);


const MarketplaceListings = ({ stockItem }: { stockItem: StockItemDetails }) => {
  const existingListings = new Map(stockItem.marketplace_listings.map(l => [l.marketplace_id, l]));

  return (
    <View>
      {stockItem.all_available_marketplaces.map((marketplace) => {
        const listing = existingListings.get(marketplace.marketplace_id);
        const isActive = !!listing;

        return (
          <View key={marketplace.marketplace_id} className="flex-row items-center justify-between p-3 bg-card border border-border rounded-lg mb-3">
            <View className="flex-1">
              <Text className={`text-base font-bold ${isActive ? 'text-text' : 'text-muted-foreground'}`}>{marketplace.name}</Text>
              {isActive ? (
                <Text className="text-secondary font-semibold">${listing.current_price.toFixed(2)}</Text>
              ) : (
                <Text className="text-sm text-muted-foreground">Not listed</Text>
              )}
            </View>
            <TouchableOpacity 
              onPress={() => Alert.alert(isActive ? 'Manage Listing' : 'Add Listing', `Workflow for ${marketplace.name} will be implemented here.`)}
              className={`px-4 py-2 rounded-lg ${isActive ? 'bg-secondary' : 'bg-input border border-border'}`}
            >
              <Text className={`font-bold ${isActive ? 'text-white' : 'text-secondary'}`}>
                {isActive ? 'Manage' : 'Add'}
              </Text>
            </TouchableOpacity>
          </View>
        );
      })}
    </View>
  );
};

const AttributesContent = ({ attributes }: { attributes: StockItemDetails['attributes'] }) => (
    <View>
        <View className="flex-row flex-wrap">
            {attributes.length > 0 ? attributes.map((attr, index) => (
                <View key={index} className="bg-secondary/20 px-3 py-1 rounded-full mr-2 mb-2">
                    <Text className="text-secondary text-sm font-medium">{attr.name}</Text>
                </View>
            )) : (
                <Text className="text-muted-foreground text-center p-4">No special attributes assigned.</Text>
            )}
        </View>
        <TouchableOpacity 
          onPress={() => Alert.alert("Edit Attributes", "Attribute editing screen will be implemented here.")}
          className="bg-input border border-border mt-4 py-3 rounded-lg"
        >
          <Text className="text-secondary font-bold text-center">Add / Edit Attributes</Text>
        </TouchableOpacity>
    </View>
);

// --- Main Screen Component ---
export default function StockItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { organizationId } = useAuth();
  const router = useRouter();
  
  // NEW: State to control the modal visibility
  const [isEditModalVisible, setEditModalVisible] = useState(false);

  const { data: stockItemData, isLoading, error } = useStockItem(id || '', organizationId || '');

  const handleFlagPress = () => {
    Alert.alert(
        "Flag Incorrect Data", 
        "This will notify administrators to review the canonical book information (title, author, ISBN, etc.).",
        [{ text: "OK"}]
    );
  };

  if (isLoading) {
    return <View className="flex-1 justify-center items-center bg-background"><ActivityIndicator size="large" color="#1FB1AB"/></View>;
  }

  if (error || !stockItemData) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 justify-center items-center bg-background p-4">
            <Text className="text-lg font-bold text-destructive">Error Loading Item</Text>
            <Text className="text-muted-foreground text-center mt-2">{error?.message || 'The requested item could not be found.'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView>
        <HeroSection data={stockItemData} onFlagPress={handleFlagPress} />
        
        <View className="p-4">
            <AccordionSection title="Core Details & Notes" defaultExpanded={true}>
                <CoreDetailsContent stockItem={stockItemData} onEdit={() => setEditModalVisible(true)} />
            </AccordionSection>

            <AccordionSection title="Marketplace Listings" defaultExpanded={true}>
                <MarketplaceListings stockItem={stockItemData} />
            </AccordionSection>

            <AccordionSection title="Attributes">
                <AttributesContent attributes={stockItemData.attributes} />
            </AccordionSection>

            <AccordionSection title="Photos">
                 <View className="items-center justify-center h-48">
                    <Text className="text-muted-foreground">Photo management coming soon.</Text>
                </View>
            </AccordionSection>
            
            <AccordionSection title="⚠️ Danger Zone">
                 <TouchableOpacity 
                    className="border border-destructive rounded-lg p-3"
                    onPress={() => Alert.alert("Confirm Delete", "Are you sure you want to permanently delete this stock item? This cannot be undone.")}
                >
                    <Text className="text-destructive font-bold text-center">Delete This Stock Item</Text>
                </TouchableOpacity>
            </AccordionSection>
        </View>
      </ScrollView>

      {/* NEW: Render the modal */}
      <EditDetailsModal 
        isVisible={isEditModalVisible}
        onClose={() => setEditModalVisible(false)}
        stockItem={stockItemData}
      />
    </SafeAreaView>
  );
}