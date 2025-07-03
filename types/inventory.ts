// types/inventory.ts

export interface StockItem {
    stock_item_id: string;
    condition_name: string; // From condition_standards join
    selling_price_amount: number;
    sku: string | null;
    location_in_store_text: string | null;
    date_added_to_stock: string;
    is_active_for_sale: boolean;
    
    // Computed fields (from joins/aggregations)
    marketplace_listings: MarketplaceListing[];
    attributes: StockItemAttribute[];
    has_photos: boolean; // Will be computed from photo table when we build it
  }
  
  export interface MarketplaceListing {
    marketplace_name: string; // 'Amazon' | 'eBay' | etc.
    status: 'active' | 'inactive' | 'sold';
    current_price: number;
    marketplace_sku: string | null;
  }
  
  export interface StockItemAttribute {
    name: string;
    value: boolean | string | number;
    category: string;
  }
  
  export interface GroupedEdition {
    edition_id: string;
    book_id: string;  // Added book_id for navigation
    title: string;
    primary_author: string;
    cover_image_url: string | null;
    isbn13: string | null;
    isbn10: string | null;
    publisher_name: string | null;
    published_date: string | null;
    stock_items: StockItem[];
    total_copies: number;
    price_range: { min: number; max: number };
  }
  
  export type FilterType = "All" | "Available" | "Listed on Amazon" | "Listed on eBay" | "Needs Photos" | "Flagged" | "Low Stock";