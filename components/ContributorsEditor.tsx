// components/ContributorsEditor.tsx

import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, PlusCircle, Trash2 } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';

// --- Type Definitions ---
interface AuthorType {
  author_type_id: string;
  name: string;
}

export interface Contributor {
  name: string;
  author_type_id: string;
  role?: string; // For display purposes, derived from author_type
}

// --- Data Fetching ---
const fetchAuthorTypes = async (): Promise<AuthorType[]> => {
  const { data, error } = await supabase.from('author_types').select('author_type_id, name');
  if (error) throw new Error(error.message);
  return data;
};

const ContributorRow = ({ contributor, onUpdate, onRemove, authorTypes, isFirst }: any) => {
  const [isPickerVisible, setPickerVisible] = useState(false);
  const selectedType = authorTypes.find((t: AuthorType) => t.author_type_id === contributor.author_type_id);

  return (
    <View className="flex-row items-center mb-3 p-3 bg-input rounded-lg space-x-3">
      <TextInput
        placeholder="Contributor Name"
        value={contributor.name}
        onChangeText={(name) => onUpdate({ ...contributor, name })}
        className="text-text text-base flex-1"
        style={{
          paddingVertical: 12,
          minHeight: 40,
          textAlignVertical: 'center',
          includeFontPadding: false,
          lineHeight: 20,
        }}
        multiline={false}
        numberOfLines={1}
        placeholderTextColor="#9CA3AF"
      />
      <TouchableOpacity onPress={() => setPickerVisible(true)} className="flex-row items-center bg-background px-3 py-2 rounded-md min-h-[40px]">
        <Text className="text-muted-foreground mr-1" style={{ color: '#6B7280' }}>
          {selectedType?.name || 'Select Role'}
        </Text>
        <ChevronDown size={16} color="#6B7280" />
      </TouchableOpacity>
      {!isFirst && (
        <TouchableOpacity onPress={onRemove} className="p-2">
          <Trash2 size={20} color="#EF4444" />
        </TouchableOpacity>
      )}

      <Modal transparent={true} visible={isPickerVisible} animationType="fade" onRequestClose={() => setPickerVisible(false)}>
        <Pressable onPress={() => setPickerVisible(false)} style={StyleSheet.absoluteFill} className="bg-black/50" />
        <View style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: [{ translateX: -150 }, { translateY: -200 }],
          backgroundColor: 'white',
          borderRadius: 16,
          padding: 16,
          width: 300,
          maxHeight: 400,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 4,
          elevation: 5,
        }}>
          <Text className="text-text text-lg font-bold text-center mb-2" style={{ color: '#111827' }}>
            Select Role
          </Text>
          <ScrollView>
            {authorTypes.map((type: AuthorType) => (
              <TouchableOpacity 
                key={type.author_type_id} 
                onPress={() => { 
                  onUpdate({ ...contributor, author_type_id: type.author_type_id }); 
                  setPickerVisible(false); 
                }} 
                className="p-3 border-b border-border"
                style={{ borderBottomColor: '#E5E7EB' }}
              >
                <Text className="text-text text-base" style={{ color: '#111827' }}>
                  {type.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

interface ContributorsEditorProps {
  contributors: Contributor[];
  onContributorsChange: (contributors: Contributor[]) => void;
  label?: string;
}

export const ContributorsEditor: React.FC<ContributorsEditorProps> = ({
  contributors,
  onContributorsChange,
  label = "Contributors"
}) => {
  const { data: authorTypes, isLoading: isLoadingTypes } = useQuery<AuthorType[]>({
    queryKey: ['authorTypes'],
    queryFn: fetchAuthorTypes,
  });

  const AUTHOR_ID_DEFAULT = '8d3afa07-239b-49bb-afd9-b2dc85348b03';

  const updateContributor = (index: number, updatedContributor: Contributor) => {
    const newContributors = [...contributors];
    newContributors[index] = updatedContributor;
    onContributorsChange(newContributors);
  };

  const addContributor = () => {
    onContributorsChange([...contributors, { name: '', author_type_id: AUTHOR_ID_DEFAULT }]);
  };

  const removeContributor = (index: number) => {
    onContributorsChange(contributors.filter((_, i) => i !== index));
  };

  if (isLoadingTypes) {
    return (
      <View className="mb-4">
        <Text className="text-muted-foreground text-sm font-medium mb-2" style={{ color: '#6B7280' }}>
          {label}
        </Text>
        <View className="flex-1 justify-center items-center p-4">
          <ActivityIndicator size="small" color="#C7006F" />
        </View>
      </View>
    );
  }

  return (
    <View className="mb-4">
      <Text className="text-muted-foreground text-sm font-medium mb-2" style={{ color: '#6B7280' }}>
        {label}
      </Text>
      {contributors.map((contributor, index) => (
        <ContributorRow
          key={index}
          contributor={contributor}
          onUpdate={(updated: Contributor) => updateContributor(index, updated)}
          onRemove={() => removeContributor(index)}
          authorTypes={authorTypes || []}
          isFirst={index === 0}
        />
      ))}
      <TouchableOpacity 
        onPress={addContributor} 
        className="flex-row items-center justify-center p-3 mt-2 rounded-lg border-2 border-dashed"
        style={{ borderColor: '#1FB1AB' }}
      >
        <View className="mr-2">
          <PlusCircle size={20} color="#1FB1AB" />
        </View>
        <Text className="font-bold" style={{ color: '#1FB1AB' }}>
          Add Contributor
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ContributorsEditor;