// hooks/useInventory.ts
import { RPCResponse, supabase, Tables } from '@/lib/supabase';
import type { FilterType, GroupedEdition, StockItem } from '@/types/inventory';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

interface InventoryParams {
  searchQuery: string;
  filterType: FilterType;
  organizationId: string;
}

interface InventoryStats {
  total_books: number;
  active_listings: number;
  needs_photos: number;
  unique_editions: number;
  amazon_listings: number;
  ebay_listings: number;
}

interface InventorySummaryMetrics {
  book_count: number;
  total_value_in_cents: number;
  needs_photos_count: number;
  total_item_count: number;
}

// New interface for Book Summary screen data
export interface BookSummary {
  book_id: string;
  title: string;
  subtitle: string | null;
  primary_author: string;
  cover_image_url: string | null;
  isbn13: string | null;
  total_copies: number;
  editions_count: number;
  price_range: { min: number; max: number };
  stock_items: StockItem[];
}

interface BookSummaryParams {
  bookId: string;
  organizationId: string;
}

// UPDATED: The final type definition for the detail screen
export interface StockItemDetails {
  stock_item_id: string;
  sku: string;
  selling_price_amount: number;
  location_in_store_text: string | null;
  date_added_to_stock: string;
  is_active_for_sale: boolean;
  internal_notes: string | null;
  condition_id: string;
  condition_name: string;
  condition_notes: string | null;
  has_photos: boolean;
  edition_details: {
    edition_id: string;
    title: string;
    primary_author: string;
    cover_image_url: string | null;
    isbn13: string | null;
    isbn10: string | null;
    publisher_name: string | null;
    published_date: string | null;
  };
  marketplace_listings: {
    marketplace_id: string;
    marketplace_name: string;
    status: string;
    current_price: number;
    marketplace_sku: string | null;
    listing_url: string | null;
  }[];
  all_available_marketplaces: {
      marketplace_id: string;
      name: string;
      code: string;
      is_active: boolean;
  }[];
  attributes: {
      name: string;
      value: string | null;
      category: string;
  }[];
}

const ITEMS_PER_PAGE = 20;

// Type-safe definitions using the generated RPC types
type SearchInventoryResponse = RPCResponse<'search_inventory'>;
type GetInventoryStatsResponse = RPCResponse<'get_inventory_stats'>;
type GetInventorySummaryMetricsResponse = RPCResponse<'get_inventory_summary_metrics'>;

export const useInventory = ({ searchQuery, filterType, organizationId }: InventoryParams) => {
  return useInfiniteQuery({
    queryKey: ['inventory', searchQuery, filterType, organizationId],
    queryFn: async ({ pageParam }: { pageParam: { lastDateAdded?: string; lastEditionId?: string } | undefined }) => {
      const { data, error } = await supabase.rpc('search_inventory', {
        p_org_id: organizationId,
        p_search_query: searchQuery,
        p_filter_type: filterType,
        p_limit_count: ITEMS_PER_PAGE,
        p_last_date_added: pageParam?.lastDateAdded || undefined,
        p_last_edition_id: pageParam?.lastEditionId || undefined,
      });

      if (error) {
        console.error('Inventory search error:', error);
        throw error;
      }

      // Now properly typed using the generated RPC response type
      const typedData = data as SearchInventoryResponse;
      
      const transformedData: GroupedEdition[] = (typedData || []).map((item) => ({
        edition_id: item.edition_id,
        book_id: item.book_id,
        title: item.title,
        primary_author: item.primary_author,
        cover_image_url: item.cover_image_url,
        isbn13: item.isbn13,
        isbn10: item.isbn10,
        publisher_name: item.publisher_name,
        published_date: item.published_date,
        total_copies: item.total_copies,
        price_range: {
          min: item.min_price,
          max: item.max_price,
        },
        stock_items: Array.isArray(item.stock_items) ? item.stock_items.map((stockItem: any) => ({
          stock_item_id: stockItem.stock_item_id,
          condition_name: stockItem.condition_name,
          selling_price_amount: parseFloat(stockItem.selling_price_amount || '0'),
          sku: stockItem.sku,
          location_in_store_text: stockItem.location_in_store_text,
          date_added_to_stock: stockItem.date_added_to_stock,
          is_active_for_sale: stockItem.is_active_for_sale,
          has_photos: stockItem.has_photos,
          marketplace_listings: stockItem.marketplace_listings || [],
          attributes: stockItem.attributes || [],
        })) : [],
      }));

      return transformedData;
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage: GroupedEdition[], pages: GroupedEdition[][], allPages: any) => {
      if (lastPage.length < ITEMS_PER_PAGE) return undefined;
      
      // Use the max_date_added from the last item for cursor pagination
      const lastItem = lastPage[lastPage.length - 1];
      if (!lastItem) return undefined;
      
      return {
        lastDateAdded: lastItem.stock_items[0]?.date_added_to_stock,
        lastEditionId: lastItem.edition_id
      };
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    enabled: !!organizationId,
  });
};

export const useInventoryStats = (organizationId: string) => {
  return useQuery({
    queryKey: ['inventory-stats', organizationId],
    queryFn: async (): Promise<InventoryStats> => {
      const { data, error } = await supabase.rpc('get_inventory_stats', {
        org_id: organizationId,
      });

      if (error) {
        console.error('Inventory stats error:', error);
        throw error;
      }

      // Use the properly typed response
      const typedData = data as GetInventoryStatsResponse;
      const stats = typedData?.[0] || {};
      
      return {
        total_books: stats.total_books || 0,
        active_listings: stats.active_listings || 0,
        needs_photos: stats.needs_photos || 0,
        unique_editions: stats.unique_editions || 0,
        amazon_listings: stats.amazon_listings || 0,
        ebay_listings: stats.ebay_listings || 0,
      };
    },
    staleTime: 1 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    enabled: !!organizationId,
  });
};

export const useInventorySearchCount = ({ searchQuery, filterType, organizationId }: InventoryParams) => {
  return useQuery({
    queryKey: ['inventory-search-count', searchQuery, filterType, organizationId],
    queryFn: async (): Promise<number> => {
      const { data, error } = await supabase.rpc('get_inventory_search_count', {
        org_id: organizationId,
        search_query: searchQuery,
        filter_type: filterType,
      });

      if (error) {
        console.error('Inventory search count error:', error);
        throw error;
      }

      // The RPC returns a number directly, not an array
      return typeof data === 'number' ? data : 0;
    },
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!organizationId,
  });
};

export const useStockItem = (stockItemId: string, organizationId: string) => {
  return useQuery<StockItemDetails>({
    queryKey: ['stock-item', stockItemId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_stock_item_details', {
        stock_item_id_in: stockItemId,
        org_id_in: organizationId,
      });

      if (error) {
        console.error('Stock item detail error:', error);
        throw new Error(error.message);
      }
      
      // Since the RPC returns Json, we need to validate and transform it
      // This is safer than using 'as unknown as' because we're explicitly handling the Json type
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid stock item data received');
      }
      
      return data as unknown as StockItemDetails;
    },
    enabled: !!stockItemId && !!organizationId,
  });
};

export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Use the generated type for condition standards table
export type ConditionStandard = Tables<'condition_standards'>;

// New hook to fetch all condition standards
export const useConditions = () => {
    return useQuery<ConditionStandard[]>({
        queryKey: ['condition_standards'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('condition_standards')
                .select('condition_id, standard_name, description, sort_order, created_at')
                .order('sort_order', { ascending: true });

            if (error) {
                console.error('Error fetching conditions:', error);
                throw new Error(error.message);
            }
            return data;
        },
        staleTime: 60 * 60 * 1000, // Stale after 1 hour
        gcTime: 60 * 60 * 1000 * 24, // Garbage collect after 24 hours
    });
};

// Hook to fetch detailed book summary with all stock items
export const useBookSummary = ({ bookId, organizationId }: BookSummaryParams) => {
    return useQuery<BookSummary>({
        queryKey: ['book-summary', bookId, organizationId],
        queryFn: async () => {
            const { data, error } = await supabase.rpc('get_book_summary', {
                book_id_in: bookId,
                org_id_in: organizationId,
            });

            if (error) {
                console.error('Book summary error:', error);
                throw new Error(error.message);
            }

            // Since the RPC returns Json, we need to validate and transform it
            if (!data || typeof data !== 'object') {
                throw new Error('Invalid book summary data received');
            }

            return data as unknown as BookSummary;
        },
        enabled: !!bookId && !!organizationId,
        staleTime: 2 * 60 * 1000, // 2 minutes
        gcTime: 5 * 60 * 1000, // 5 minutes
    });
};

// In hooks/useInventory.ts

export const useInventorySummaryMetrics = ({ searchQuery, filterType, organizationId }: InventoryParams) => {
  return useQuery({
    queryKey: ['inventory-summary-metrics', searchQuery, filterType, organizationId],
    queryFn: async (): Promise<InventorySummaryMetrics> => {
      const { data, error } = await supabase.rpc('get_inventory_summary_metrics', {
        org_id: organizationId,
        search_query: searchQuery,
        filter_type: filterType,
      });

      if (error) {
        console.error('Inventory summary metrics error:', error);
        throw error;
      }

      // Use the properly typed response
      const typedData = data as GetInventorySummaryMetricsResponse;
      const metrics = typedData?.[0] || {};
      
      return {
        book_count: metrics.book_count || 0,
        total_item_count: metrics.total_item_count || 0,
        total_value_in_cents: metrics.total_value_in_cents || 0,
        needs_photos_count: metrics.needs_photos_count || 0,
      };
    },
    staleTime: 30 * 1000,
    gcTime: 2 * 60 * 1000,
    enabled: !!organizationId,
  });
};