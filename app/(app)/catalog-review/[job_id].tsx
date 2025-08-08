// app/(app)/catalog-review/[job_id].tsx
import { Contributor, ContributorsEditor } from '@/components/ContributorsEditor';
import { useAuth } from '@/context/AuthContext';
import { CatalogJob } from '@/hooks/useCatalogJobs';
import { supabase } from '@/lib/supabase';
import { getJobType, getJobDisplayInfo } from '@/utils/catalogJobs';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronDown, ChevronRight, ChevronUp, Maximize, Minimize, Search, X } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Modal, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// Constants
const DEFAULT_AUTHOR_TYPE_ID = '8d3afa07-239b-49bb-afd9-b2dc85348b03'; // "Author" type
const DEFAULT_CONDITION_ID = 'd405bb2e-45a7-4c28-bcab-48188a2f14f5';

// Role to author_type_id mapping
const ROLE_TO_AUTHOR_TYPE_ID: Record<string, string> = {
    'Author': '8d3afa07-239b-49bb-afd9-b2dc85348b03',
    'Editor': 'c3c44423-ff5c-4b0c-a6e1-22c88835fa0c',
    'Foreword': '7a29b4dc-48fa-4426-8b90-b0822d298554',
    'Illustrator': 'd346048d-3917-4eda-a2e2-d3bddfe59c1d',
    'Introduction': '6987cdf7-9283-4c68-8989-eea96e1cf4b6',
    'Photographer': 'dace9ee1-9f62-4901-b3cb-71fc8ef42b2e',
    'Translator': '980a495a-2a3d-4546-8d99-49348cc2aa6a'
};

// Types
type AttributeCategory = {
  category_id: string;
  name: string;
};

type AttributeType = {
  attribute_type_id: string;
  name: string;
  category_id: string;
};

type Condition = {
  condition_id: string;
  standard_name: string;
  description?: string;
};

// Data fetching functions
const fetchConditions = async (): Promise<Condition[]> => {
  const { data, error } = await supabase
    .from('condition_standards')
    .select('condition_id, standard_name, description')
    .order('sort_order', { ascending: true });
  if (error) throw new Error(error.message);
  return data;
};

const fetchAttributeCategories = async (): Promise<AttributeCategory[]> => {
  const { data, error } = await supabase
    .from('attribute_categories')
    .select('category_id, name')
    .order('name', { ascending: true });
  if (error) throw new Error(error.message);
  return data;
};

const fetchAttributeTypes = async (): Promise<AttributeType[]> => {
  const { data, error } = await supabase
    .from('attribute_types')
    .select('attribute_type_id, name, category_id')
    .order('name', { ascending: true });
  if (error) throw new Error(error.message);
  return data;
};

// Helper component for form inputs
const FormInput = ({ label, value, onChangeText, multiline = false, keyboardType = 'default', placeholder = '' }: any) => (
    <View className="mb-4">
        <Text className="text-muted-foreground text-sm font-medium mb-2">{label}</Text>
        <TextInput
            className={`bg-input border border-border text-text rounded-lg px-4 py-4 text-base min-h-[50px] ${multiline ? 'h-32' : ''}`}
            value={value || ''}
            onChangeText={onChangeText}
            multiline={multiline}
            keyboardType={keyboardType}
            placeholder={placeholder}
            placeholderTextColor="#9CA3AF"
            textAlignVertical={multiline ? "top" : "center"}
        />
    </View>
);

// --- Wizard Step Components ---

const Step1_ReviewAndDetails = ({ formData, handleInputChange, contributors, setContributors, conditionId, setConditionId, price, setPrice, sku, setSku, onNext, conditions, isLoadingConditions, jobType }: any) => {
  const [isPickerVisible, setPickerVisible] = useState(false);
  const selectedCondition = conditions?.find((c: Condition) => c.condition_id === conditionId);

  if (isLoadingConditions) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#C7006F" />
        <Text className="text-muted-foreground mt-2">Loading conditions...</Text>
      </View>
    );
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
      <Text className="text-text text-lg font-bold mb-2">
        {jobType === 'ai' ? 'AI Extracted Data' : 
         jobType === 'isbn_scan' ? 'ISBN Scanned Data' : 
         jobType === 'isbn_manual' ? 'Manually Entered Data' : 
         'Book Data'}
      </Text>
      <Text className="text-muted-foreground text-sm mb-6">
        {jobType === 'ai' ? 'Please review and correct the details below.' :
         'Please review and adjust the details before adding to inventory.'}
      </Text>
      
      <FormInput 
        label="Title" 
        value={formData.title} 
        onChangeText={(val: string) => handleInputChange('title', val)} 
      />
      
      <FormInput 
        label="Subtitle" 
        value={formData.subtitle} 
        onChangeText={(val: string) => handleInputChange('subtitle', val)} 
      />
      
      <ContributorsEditor 
        contributors={contributors}
        onContributorsChange={setContributors}
        label="Contributors"
      />
      
      <FormInput 
        label="Publisher" 
        value={formData.publisher} 
        onChangeText={(val: string) => handleInputChange('publisher', val)} 
      />
      
      <FormInput 
        label="Publication Year" 
        value={formData.publication_year?.toString()} 
        onChangeText={(val: string) => handleInputChange('publication_year', val)} 
        keyboardType="number-pad"
      />
      
      <FormInput 
        label="Edition Statement" 
        value={formData.edition_statement} 
        onChangeText={(val: string) => handleInputChange('edition_statement', val)} 
      />

      <Text className="text-text text-lg font-bold mb-4 mt-6">Listing Details</Text>
      
      <View className="flex-row gap-x-4 mb-6">
        <View className="flex-1">
          <Text className="text-muted-foreground text-sm font-medium mb-2">Condition</Text>
          <TouchableOpacity onPress={() => setPickerVisible(true)} className="bg-input border border-border rounded-lg px-4 py-4 flex-row justify-between items-center min-h-[50px]">
            <Text className="text-text text-base">{selectedCondition?.standard_name || 'Select condition'}</Text>
            <ChevronDown size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
      </View>

      <View className="mb-6">
        <Text className="text-muted-foreground text-sm font-medium mb-2">Price</Text>
        <View className="flex-row items-center bg-input border border-border rounded-lg px-4 min-h-[50px]">
          <Text className="text-muted-foreground text-base mr-2">$</Text>
          <TextInput 
            className="flex-1 py-4 text-base text-text" 
            value={price} 
            onChangeText={setPrice} 
            placeholder="24.99" 
            placeholderTextColor="#9CA3AF" 
            keyboardType="decimal-pad"
            textAlignVertical="center"
            multiline={false}
            numberOfLines={1}
          />
        </View>
      </View>

      <View className="mb-8">
        <Text className="text-muted-foreground text-sm font-medium mb-2">SKU (Optional)</Text>
        <TextInput 
          className="bg-input border border-border text-text rounded-lg px-4 py-4 text-base min-h-[50px]" 
          value={sku} 
          onChangeText={setSku} 
          placeholder="Leave blank to auto-generate" 
          placeholderTextColor="#9CA3AF"
          textAlignVertical="center"
          multiline={false}
          numberOfLines={1}
        />
      </View>

      <TouchableOpacity onPress={() => {
        if (!price || parseFloat(price) <= 0) {
          Alert.alert('Invalid Price', 'Please enter a valid price.');
          return;
        }
        if (!conditionId) {
          Alert.alert('Missing Information', 'Please select a condition.');
          return;
        }
        onNext();
      }} className="bg-primary p-4 rounded-lg flex-row items-center justify-center">
        <Text className="text-white text-lg font-bold">Next: Add Attributes</Text>
        <ChevronRight size={22} color="white" className="ml-2" />
      </TouchableOpacity>

      <Modal transparent={true} visible={isPickerVisible} animationType="slide" onRequestClose={() => setPickerVisible(false)}>
        <Pressable onPress={() => setPickerVisible(false)} style={StyleSheet.absoluteFill} className="bg-black/50" />
        <View className="absolute bottom-0 w-full bg-background rounded-t-2xl p-4 pb-10">
          <Text className="text-text text-lg font-bold text-center mb-4">Select Condition</Text>
          {conditions?.map((condition: Condition) => (
            <TouchableOpacity key={condition.condition_id} onPress={() => { setConditionId(condition.condition_id); setPickerVisible(false); }} className="p-4 border-b border-border">
              <Text className="text-text text-base">{condition.standard_name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Modal>
    </ScrollView>
  );
};

const Step2_Attributes = ({ selectedIds, onToggle, onNext, attributeCategories, attributeTypes, isLoadingAttributes }: any) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openCategories, setOpenCategories] = useState<string[]>([]);
  const hasAutoOpened = React.useRef(false);

  // Auto-open first category when data loads
  React.useEffect(() => {
    if (attributeCategories && attributeCategories.length > 0 && !hasAutoOpened.current) {
      setOpenCategories([attributeCategories[0].category_id]);
      hasAutoOpened.current = true;
    }
  }, [attributeCategories]);

  const toggleCategory = (categoryId: string) => {
    setOpenCategories(prev => prev.includes(categoryId) ? prev.filter(id => id !== categoryId) : [...prev, categoryId]);
  };

  const filteredAttributes = useMemo(() => {
    if (!attributeTypes) return [];
    if (!searchTerm) return attributeTypes;
    return attributeTypes.filter((attr: AttributeType) => attr.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [searchTerm, attributeTypes]);

  // Expand/Collapse All functionality
  const visibleCategories = useMemo(() => {
    if (!attributeCategories) return [];
    return attributeCategories.filter((category: AttributeCategory) => {
      const categoryAttributes = filteredAttributes.filter((attr: AttributeType) => attr.category_id === category.category_id);
      return categoryAttributes.length > 0 || !searchTerm;
    });
  }, [attributeCategories, filteredAttributes, searchTerm]);

  const allCategoriesOpen = visibleCategories.length > 0 && visibleCategories.every((cat: AttributeCategory) => openCategories.includes(cat.category_id));

  const handleExpandCollapseAll = () => {
    if (allCategoriesOpen) {
      // Collapse all
      setOpenCategories([]);
    } else {
      // Expand all visible categories
      setOpenCategories(visibleCategories.map((cat: AttributeCategory) => cat.category_id));
    }
  };

  const selectedAttributes = attributeTypes?.filter((attr: AttributeType) => selectedIds.includes(attr.attribute_type_id)) || [];

  if (isLoadingAttributes) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#C7006F" />
        <Text className="text-muted-foreground mt-2">Loading attributes...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <View className="flex-row items-center bg-input border border-border rounded-lg px-3 mb-4 min-h-[50px]">
        <Search size={20} color="#9CA3AF" />
        <TextInput 
          className="flex-1 p-3 text-base text-text" 
          value={searchTerm} 
          onChangeText={setSearchTerm} 
          placeholder="Search attributes..." 
          placeholderTextColor="#9CA3AF"
          textAlignVertical="center"
        />
        {searchTerm.length > 0 && <TouchableOpacity onPress={() => setSearchTerm('')}><X size={20} color="#9CA3AF" /></TouchableOpacity>}
      </View>

      {selectedAttributes.length > 0 && (
        <View className="mb-4 p-3 border border-border rounded-lg">
          <Text className="text-muted-foreground text-sm font-bold mb-2">Selected ({selectedAttributes.length})</Text>
          <View className="flex-row flex-wrap">
            {selectedAttributes.map((attr: AttributeType) => (
              <TouchableOpacity key={attr.attribute_type_id} onPress={() => onToggle(attr.attribute_type_id)} className="flex-row items-center bg-primary/20 rounded-full m-1 pl-3 pr-2 py-1">
                <Text className="text-primary font-semibold">{attr.name}</Text>
                <X size={14} color="#C7006F" className="ml-1" />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Expand/Collapse All Button */}
      {visibleCategories.length > 1 && (
        <View className="flex-row justify-end mb-3">
          <TouchableOpacity 
            onPress={handleExpandCollapseAll}
            className="flex-row items-center px-3 py-2 bg-input/50 rounded-lg border border-border/50"
          >
            {allCategoriesOpen ? (
              <Minimize size={16} color="#9CA3AF" />
            ) : (
              <Maximize size={16} color="#9CA3AF" />
            )}
            <Text className="text-muted-foreground text-sm font-medium ml-2">
              {allCategoriesOpen ? 'Collapse All' : 'Expand All'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        {attributeCategories?.map((category: AttributeCategory) => {
          const categoryAttributes = filteredAttributes.filter((attr: AttributeType) => attr.category_id === category.category_id);
          if (categoryAttributes.length === 0 && !searchTerm) return null;
          const isOpen = openCategories.includes(category.category_id);
          return (
            <View key={category.category_id} className="mb-2 bg-input rounded-lg">
              <TouchableOpacity onPress={() => toggleCategory(category.category_id)} className="flex-row justify-between items-center p-4">
                <Text className="text-text font-bold">{category.name}</Text>
                {isOpen ? <ChevronUp size={20} color="#3B3B3A" /> : <ChevronDown size={20} color="#3B3B3A" />}
              </TouchableOpacity>
              {isOpen && (
                <View className="flex-row flex-wrap p-3 border-t border-border">
                  {categoryAttributes.map((attr: AttributeType) => (
                    <TouchableOpacity key={attr.attribute_type_id} onPress={() => onToggle(attr.attribute_type_id)} className={`py-2 px-4 rounded-full m-1 border ${selectedIds.includes(attr.attribute_type_id) ? 'bg-primary border-primary' : 'bg-background border-border'}`}>
                      <Text className={selectedIds.includes(attr.attribute_type_id) ? 'text-white' : 'text-text'}>{attr.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
      
      <View className="pt-4">
        <TouchableOpacity onPress={onNext} className="bg-primary p-4 rounded-lg flex-row items-center justify-center">
          <Text className="text-white text-lg font-bold">Next: Add Notes</Text>
          <ChevronRight size={22} color="white" className="ml-2" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const Step3_NotesAndSave = ({ notes, setNotes, onSave, isSaving }: any) => (
  <View className="flex-1">
    <Text className="text-muted-foreground text-sm font-medium mb-2">Condition Notes (Optional)</Text>
    <TextInput 
      multiline 
      value={notes} 
      onChangeText={setNotes} 
      placeholder="e.g., Minor shelf wear on jacket. Previous owner's signature on front flyleaf." 
      placeholderTextColor="#9CA3AF" 
      className="bg-input border border-border text-text rounded-lg px-4 py-4 text-base h-32" 
      textAlignVertical="top" 
    />
    <View className="flex-1" />
    <TouchableOpacity onPress={onSave} disabled={isSaving} className="bg-primary p-4 rounded-lg">
      {isSaving ? (
        <ActivityIndicator color="white" />
      ) : (
        <Text className="text-white text-lg font-bold text-center">Save to Inventory</Text>
      )}
    </TouchableOpacity>
  </View>
);

// --- Main Component ---
export default function CatalogReviewScreen() {
    const { job_id } = useLocalSearchParams<{ job_id: string }>();
    const { organizationId } = useAuth();
    const router = useRouter();
    const queryClient = useQueryClient();

    // Wizard state
    const [step, setStep] = useState(1);
    const [conditionId, setConditionId] = useState<string>('');
    const [price, setPrice] = useState('');
    const [sku, setSku] = useState('');
    const [selectedAttributeIds, setSelectedAttributeIds] = useState<string[]>([]);
    const [notes, setNotes] = useState('');
    const [contributors, setContributors] = useState<Contributor[]>([]);

    // State for the form data, initialized by the AI's output
    const [formData, setFormData] = useState<any>(null);

    // Fetch the specific job details
    const { data: job, isLoading, error } = useQuery<CatalogJob>({
        queryKey: ['catalog-job', job_id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('cataloging_jobs')
                .select('*')
                .eq('job_id', job_id)
                .single();
            if (error) throw new Error(error.message);
            return data;
        },
        enabled: !!job_id && !!organizationId
    });

    // Determine job type
    const jobType = job ? getJobType(job) : null;
    const displayInfo = job ? getJobDisplayInfo(job) : null;

    // Fetch conditions, categories, and attribute types
    const { data: conditions, isLoading: isLoadingConditions } = useQuery<Condition[]>({
        queryKey: ['conditions'],
        queryFn: fetchConditions,
    });

    const { data: attributeCategories, isLoading: isLoadingCategories } = useQuery<AttributeCategory[]>({
        queryKey: ['attributeCategories'],
        queryFn: fetchAttributeCategories,
    });

    const { data: attributeTypes, isLoading: isLoadingTypes } = useQuery<AttributeType[]>({
        queryKey: ['attributeTypes'],
        queryFn: fetchAttributeTypes,
    });

    const isLoadingAttributes = isLoadingCategories || isLoadingTypes;

    // Set default condition when conditions load
    React.useEffect(() => {
        if (conditions && conditions.length > 0 && !conditionId) {
            // Default to "Very Good" or the third condition
            const defaultCondition = conditions.find(c => c.standard_name === 'Very Good') || conditions[2] || conditions[0];
            setConditionId(defaultCondition.condition_id);
        }
    }, [conditions, conditionId]);

    const finalizeMutation = useMutation<string, Error, any>({
        mutationFn: async (variables: any) => {
            console.log('Finalizing cataloging job with variables:', JSON.stringify(variables, null, 2));
            const { data, error } = await supabase.rpc('finalize_cataloging_job', variables).single();
            if (error) {
                console.error('Finalize cataloging job error:', error);
                throw error;
            }
            return data as string;
        },
        onSuccess: (newStockItemId) => {
            console.log('Successfully created stock item:', newStockItemId);
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
            queryClient.invalidateQueries({ queryKey: ['catalog-jobs'] });
            
            // Create book data object to pass to success screen
            const bookData = {
                title: formData.title,
                subtitle: formData.subtitle,
                authors: contributors.filter(c => c.name.trim()).map(c => c.name.trim()),
                publisher: formData.publisher,
                cover_image_url: job?.image_urls?.cover_url || null,
                isbn: formData.isbn || null,
                page_count: formData.page_count || null,
                published_date: formData.publication_year?.toString() || null,
                format_type: formData.format_type || null
            };
            
            router.replace({
                pathname: '/add-success',
                params: { 
                    stock_item_id: newStockItemId,
                    book: JSON.stringify(bookData)
                }
            });
        },
        onError: (err) => {
            console.error('Finalize mutation error:', err);
            Alert.alert("Error", `Failed to save to inventory: ${err.message}`);
        }
    });

    // Pre-fill the form once the job data is loaded
    useEffect(() => {
        if (job?.extracted_data) {
            setFormData({
                ...job.extracted_data,
                condition_notes: ''
            });
            
            // Initialize contributors from authors data
            if (job.extracted_data.authors && Array.isArray(job.extracted_data.authors)) {
                const initialContributors = job.extracted_data.authors.map((author: any) => {
                    if (typeof author === 'string') {
                        return {
                            name: author,
                            author_type_id: DEFAULT_AUTHOR_TYPE_ID
                        };
                    }
                    
                    // Map role string to author_type_id if available
                    let authorTypeId = author.author_type_id || DEFAULT_AUTHOR_TYPE_ID;
                    if (author.role && ROLE_TO_AUTHOR_TYPE_ID[author.role]) {
                        authorTypeId = ROLE_TO_AUTHOR_TYPE_ID[author.role];
                    }
                    
                    return {
                        name: author.name || author,
                        author_type_id: authorTypeId,
                        role: author.role || 'Author'
                    };
                });
                setContributors(initialContributors.length > 0 ? initialContributors : [{ name: '', author_type_id: DEFAULT_AUTHOR_TYPE_ID }]);
            } else {
                setContributors([{ name: '', author_type_id: DEFAULT_AUTHOR_TYPE_ID }]);
            }
        } else if (job && job.status === 'pending') {
            // For pending jobs without extracted_data, set minimal formData
            const isbn = job.image_urls?.isbn || '';
            setFormData({
                title: isbn ? `Book (ISBN: ${isbn})` : 'Pending Book',
                subtitle: '',
                description: '',
                authors: [],
                publisher: '',
                isbn: isbn,
                page_count: null,
                publication_year: null,
                cover_image_url: null,
                format_type: '',
                condition_notes: ''
            });
            
            // Set empty contributor for pending jobs
            setContributors([{ name: '', author_type_id: DEFAULT_AUTHOR_TYPE_ID }]);
        }
    }, [job]);

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev: any) => ({ ...prev, [field]: value }));
    };
    
    const handleSave = () => {
        if (!formData.title) {
            Alert.alert("Missing Information", "Please provide a title.");
            return;
        }

        if (!contributors || contributors.length === 0 || !contributors.some(c => c.name.trim())) {
            Alert.alert("Missing Information", "At least one contributor is required.");
            return;
        }

        // Filter out empty contributors and ensure they have the correct author_type_id
        console.log('Original contributors data:', contributors);
        const authorsWithType = contributors
            .filter(contributor => contributor.name.trim())
            .map((contributor: Contributor) => {
                return {
                    name: contributor.name.trim(),
                    author_type_id: contributor.author_type_id || DEFAULT_AUTHOR_TYPE_ID,
                    role: contributor.role || 'Author'
                };
            });
        console.log('Processed authors with type:', authorsWithType);

        const variables = {
            p_job_id: job_id,
            p_title: formData.title,
            p_subtitle: formData.subtitle,
            p_authors: authorsWithType,
            p_publisher_name: formData.publisher,
            p_publication_year: formData.publication_year,
            p_publication_location: formData.publication_location,
            p_edition_statement: formData.edition_statement,
            p_has_dust_jacket: formData.has_dust_jacket,
            p_condition_id: conditionId,
            p_price: parseFloat(price),
            p_sku: sku || null,
            p_condition_notes: notes || null,
            p_organization_id: organizationId,
            p_selected_attributes: selectedAttributeIds,
        };

        finalizeMutation.mutate(variables);
    };

    const renderStep = () => {
        switch (step) {
            case 1: return <Step1_ReviewAndDetails {...{ formData, handleInputChange, contributors, setContributors, conditionId, setConditionId, price, setPrice, sku, setSku, onNext: () => setStep(2), conditions, isLoadingConditions, jobType }} />;
            case 2: return <Step2_Attributes selectedIds={selectedAttributeIds} onToggle={(id: string) => setSelectedAttributeIds(p => p.includes(id) ? p.filter(i => i !== id) : [...p, id])} onNext={() => setStep(3)} attributeCategories={attributeCategories} attributeTypes={attributeTypes} isLoadingAttributes={isLoadingAttributes} />;
            case 3: return <Step3_NotesAndSave {...{ notes, setNotes, onSave: handleSave, isSaving: finalizeMutation.isPending }} />;
            default: return null;
        }
    };

    if (isLoading || !formData) {
        return <View className="flex-1 justify-center items-center bg-background"><ActivityIndicator size="large" color="#C7006F" /></View>;
    }

    if (error) {
        return <View className="flex-1 justify-center items-center bg-background"><Text className="text-red-500">Error: {error.message}</Text></View>;
    }

    return (
        <SafeAreaView className="flex-1 bg-background">
            <Stack.Screen options={{ 
                headerShown: true, 
                headerTitle: displayInfo ? `${displayInfo.displayName} - Step ${step} of 3` : `Step ${step} of 3`,
                headerBackTitle: "Cataloging Jobs",
                headerLeft: () => (
                    <TouchableOpacity onPress={() => step === 1 ? router.back() : setStep(step - 1)} className="p-2">
                        <Text className="text-secondary text-base">{step === 1 ? 'Cancel' : 'Back'}</Text>
                    </TouchableOpacity>
                ), 
            }} />
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }} keyboardVerticalOffset={90}>
                <View className="flex-1 px-6 py-4">{renderStep()}</View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}