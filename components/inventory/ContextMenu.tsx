// components/inventory/ContextMenu.tsx
import type { StockItem } from "@/types/inventory";
import { Camera, Edit, Store, Trash2 } from "lucide-react-native";
import { styled } from "nativewind";
import React from "react";
import {
    Modal,
    Pressable as RNPressable,
    Text as RNText,
    TouchableOpacity as RNTouchableOpacity,
    View as RNView
} from "react-native";

const View = styled(RNView);
const Text = styled(RNText);
const TouchableOpacity = styled(RNTouchableOpacity);
const Pressable = styled(RNPressable);

interface ContextMenuProps {
  visible: boolean;
  item: StockItem | null;
  onClose: () => void;
  onEdit: (item: StockItem) => void;
  onManagePhotos: (item: StockItem) => void;
  onListOnMarketplace: (item: StockItem) => void;
  onDelete: (item: StockItem) => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  visible,
  item,
  onClose,
  onEdit,
  onManagePhotos,
  onListOnMarketplace,
  onDelete,
}) => {
  if (!item) return null;

  const menuItems = [
    { icon: Edit, label: "Edit Details", action: () => onEdit(item) },
    { icon: Camera, label: "Manage Photos", action: () => onManagePhotos(item) },
    { icon: Store, label: "List on Marketplace", action: () => onListOnMarketplace(item) },
    { icon: Trash2, label: "Delete", action: () => onDelete(item), danger: true },
  ];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/50 justify-center items-center" onPress={onClose}>
        <Pressable className="bg-background rounded-xl mx-8 py-2 shadow-2xl border border-border min-w-[250px]">
          {menuItems.map((menuItem, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => {
                menuItem.action();
                onClose();
              }}
              className="flex-row items-center px-4 py-4 active:bg-muted"
            >
              <View className="mr-3">
                <menuItem.icon
                  size={20}
                  color={menuItem.danger ? "#ef4444" : "#6b7280"}
                />
              </View>
              <Text className={`text-base ${menuItem.danger ? "text-destructive" : "text-foreground"}`}>
                {menuItem.label}
              </Text>
            </TouchableOpacity>
          ))}
        </Pressable>
      </Pressable>
    </Modal>
  );
};