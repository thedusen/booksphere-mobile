// lib/mockData.ts

// --- TYPE DEFINITIONS ---
export interface Condition {
    condition_id: string;
    standard_name: string;
    description: string;
    sort_order: number;
  }
  
  export interface AttributeCategory {
    category_id: string;
    name: string;
    description: string;
    sort_order: number;
  }
  
  export interface AttributeType {
    attribute_type_id: string;
    category_id: string;
    name: string;
    description: string;
    data_type: 'boolean' | 'text' | 'numeric';
    is_value_required: boolean;
    affects_pricing: boolean;
  }
  
  // --- MOCK DATA ---
  export const mockConditions: Condition[] = [
      { "condition_id": "580deeed-546b-4837-86a9-dc7af4cf8169", "standard_name": "New", "description": "Brand new, unused, unopened, in original packaging", "sort_order": 1 },
      { "condition_id": "df86dcf8-a68f-484d-8b86-a11732904bcd", "standard_name": "Like New", "description": "Appears new, minimal wear, all accessories included", "sort_order": 2 },
      { "condition_id": "d405bb2e-45a7-4c28-bcab-48188a2f14f5", "standard_name": "Very Good", "description": "Minor cosmetic imperfections, fully functional", "sort_order": 3 },
      { "condition_id": "49c07b8c-665f-4f00-ad3f-b236a0039186", "standard_name": "Good", "description": "Moderate wear, fully functional, some cosmetic damage", "sort_order": 4 },
      { "condition_id": "6742e75c-84ec-4cf3-8eeb-8a7a42ecb019", "standard_name": "Acceptable", "description": "Significant wear, still functional", "sort_order": 5 },
      { "condition_id": "09e91ee0-222c-4d37-b370-6d9dd89dfabf", "standard_name": "Poor", "description": "Heavy wear, may have functional issues", "sort_order": 6 }
  ];
  
  export const mockAttributeCategories: AttributeCategory[] = [
      { "category_id": "73b89593-295d-4b6c-b18e-b8b0cfca2813", "name": "Edition & Printing", "description": "Affects rarity and collector interest", "sort_order": 1 },
      { "category_id": "d6207494-cb30-41b7-b3b1-84935a22729e", "name": "Author/Provenance Marks", "description": "Signatures and ownership", "sort_order": 2 },
      { "category_id": "3b6e411c-d273-4dfc-a480-66072c6dc3d7", "name": "Binding & Physical Features", "description": "Physical characteristics", "sort_order": 3 },
      { "category_id": "12e9edaa-21c1-4798-b607-51144e1bac91", "name": "Format & Publication Variant", "description": "Publication format variations", "sort_order": 4 },
      { "category_id": "a54a327a-b4c9-47f1-8e1e-a60b80a3b6b7", "name": "Condition & Completeness", "description": "Overall condition factors", "sort_order": 5 },
      { "category_id": "02417e7a-ddd5-4cf0-979d-369fe67d091a", "name": "Errors & Special Interest", "description": "Unique characteristics", "sort_order": 6 },
      { "category_id": "96d4965b-7d6a-40c6-b569-9d2dcbdbff24", "name": "Provenance & History", "description": "Historical significance", "sort_order": 7 }
  ];
  
  export const mockAttributeTypes: AttributeType[] = [
      { "attribute_type_id": "27a65d90-ffbe-45db-9493-f2132978c936", "category_id": "73b89593-295d-4b6c-b18e-b8b0cfca2813", "name": "Reprint", "description": "Later printing, usually less valuable", "data_type": "boolean", "is_value_required": false, "affects_pricing": true },
      { "attribute_type_id": "d889af3b-6622-47a5-a777-b8b009df10ec", "category_id": "73b89593-295d-4b6c-b18e-b8b0cfca2813", "name": "Deluxe Edition", "description": "Higher quality materials or packaging", "data_type": "boolean", "is_value_required": false, "affects_pricing": true },
      { "attribute_type_id": "a5f77a17-96e0-41a9-a944-c0a91eebe5af", "category_id": "73b89593-295d-4b6c-b18e-b8b0cfca2813", "name": "Special Edition", "description": "Includes extra content, packaging, or features", "data_type": "boolean", "is_value_required": false, "affects_pricing": true },
      { "attribute_type_id": "a22d6c68-959c-49dc-8d85-efb650195bd4", "category_id": "73b89593-295d-4b6c-b18e-b8b0cfca2813", "name": "Uncorrected Proof", "description": "Early pre-publication version with potential errors", "data_type": "boolean", "is_value_required": false, "affects_pricing": true },
      { "attribute_type_id": "14b4668e-6cb3-4884-829c-fa9c6deac5dc", "category_id": "73b89593-295d-4b6c-b18e-b8b0cfca2813", "name": "Advance Review Copy", "description": "Distributed before publication for review", "data_type": "boolean", "is_value_required": false, "affects_pricing": true },
      { "attribute_type_id": "bf89375c-0b35-4607-a3d5-6c0695931ad9", "category_id": "73b89593-295d-4b6c-b18e-b8b0cfca2813", "name": "Signed Limited Edition", "description": "Signed by author and part of limited print run", "data_type": "boolean", "is_value_required": false, "affects_pricing": true },
      { "attribute_type_id": "deba852d-4884-44c7-a894-f7b3de03ef4a", "category_id": "73b89593-295d-4b6c-b18e-b8b0cfca2813", "name": "Numbered Copy", "description": "Part of a limited edition with number", "data_type": "text", "is_value_required": true, "affects_pricing": true },
      { "attribute_type_id": "020c846d-8eb3-4b45-af13-890ca0179a48", "category_id": "73b89593-295d-4b6c-b18e-b8b0cfca2813", "name": "Limited Edition", "description": "Printed in a limited quantity, often numbered", "data_type": "boolean", "is_value_required": false, "affects_pricing": true },
      { "attribute_type_id": "a1b03e04-6ab7-4f1a-ab28-e9c26ccbcd1d", "category_id": "73b89593-295d-4b6c-b18e-b8b0cfca2813", "name": "First Printing", "description": "The very first print run of the first edition", "data_type": "boolean", "is_value_required": false, "affects_pricing": true },
      { "attribute_type_id": "40395d1c-d9b3-4469-b7ce-d35eced7bc77", "category_id": "73b89593-295d-4b6c-b18e-b8b0cfca2813", "name": "First Edition", "description": "The first commercial printing of a book", "data_type": "boolean", "is_value_required": false, "affects_pricing": true },
      { "attribute_type_id": "9f4f6fa6-a92d-409d-9c7c-be0bf79a0f99", "category_id": "d6207494-cb30-41b7-b3b1-84935a22729e", "name": "Association Copy", "description": "Given by author to someone significant", "data_type": "text", "is_value_required": true, "affects_pricing": true },
      { "attribute_type_id": "56ca8f46-6821-41d9-9c9f-1be5a09deef3", "category_id": "d6207494-cb30-41b7-b3b1-84935a22729e", "name": "Marginalia", "description": "Annotations or notes in margins", "data_type": "text", "is_value_required": true, "affects_pricing": true },
      { "attribute_type_id": "03b798e7-d53f-4e5d-8cd7-03cbdadead18", "category_id": "d6207494-cb30-41b7-b3b1-84935a22729e", "name": "Ownership Signature", "description": "Signed by previous owner", "data_type": "text", "is_value_required": true, "affects_pricing": true },
      { "attribute_type_id": "b96f2a67-b981-4653-80dd-784438ece306", "category_id": "d6207494-cb30-41b7-b3b1-84935a22729e", "name": "Bookplate of Notable Person", "description": "Book ownership by known figure", "data_type": "text", "is_value_required": true, "affects_pricing": true },
      { "attribute_type_id": "67fbdd5f-d454-4f77-867c-d8807ad45ddc", "category_id": "d6207494-cb30-41b7-b3b1-84935a22729e", "name": "Signed by Other Notables", "description": "Signature by celebrity or notable person", "data_type": "text", "is_value_required": true, "affects_pricing": true },
      { "attribute_type_id": "0fb8888d-5040-4060-81b7-4243a147b07e", "category_id": "d6207494-cb30-41b7-b3b1-84935a22729e", "name": "Signed by Illustrator", "description": "Illustrator signature present", "data_type": "boolean", "is_value_required": false, "affects_pricing": true },
      { "attribute_type_id": "553a8c5f-3207-46d1-b836-18d62384e6fe", "category_id": "d6207494-cb30-41b7-b3b1-84935a22729e", "name": "Inscribed by Author", "description": "Personal note from author", "data_type": "text", "is_value_required": true, "affects_pricing": true },
      { "attribute_type_id": "fbd901c7-6f88-41ea-bf4b-79a5fb181d0e", "category_id": "d6207494-cb30-41b7-b3b1-84935a22729e", "name": "Signed by Author", "description": "Author signature present", "data_type": "boolean", "is_value_required": false, "affects_pricing": true },
      { "attribute_type_id": "6fd158f2-9d80-4724-891d-1ff80d627548", "category_id": "3b6e411c-d273-4dfc-a480-66072c6dc3d7", "name": "Misprints", "description": "Printing errors that may add value", "data_type": "text", "is_value_required": true, "affects_pricing": true },
      { "attribute_type_id": "a63d2510-7280-4073-97c6-449e4f3916fc", "category_id": "3b6e411c-d273-4dfc-a480-66072c6dc3d7", "name": "Deckle Edges", "description": "Rough, uncut page edges", "data_type": "boolean", "is_value_required": false, "affects_pricing": true },
      { "attribute_type_id": "7fb48311-a24f-43c0-9b9b-bea49e0216c2", "category_id": "3b6e411c-d273-4dfc-a480-66072c6dc3d7", "name": "Decorative Features", "description": "Decorative endpapers, gilding, etc.", "data_type": "text", "is_value_required": true, "affects_pricing": true },
      { "attribute_type_id": "5ac6af09-d17a-410e-99d2-4eaff1a27bea", "category_id": "3b6e411c-d273-4dfc-a480-66072c6dc3d7", "name": "Slipcase Present", "description": "Includes slipcase or clamshell case", "data_type": "boolean", "is_value_required": false, "affects_pricing": true },
      { "attribute_type_id": "e5c22c7c-7f28-42ce-ba72-dde25c94bfda", "category_id": "3b6e411c-d273-4dfc-a480-66072c6dc3d7", "name": "Publisher Variant Binding", "description": "Rare alternate binding style", "data_type": "boolean", "is_value_required": false, "affects_pricing": true },
      { "attribute_type_id": "12db384e-e1c6-409e-8e97-b0507c69b441", "category_id": "3b6e411c-d273-4dfc-a480-66072c6dc3d7", "name": "Custom Binding", "description": "Leather, gilded edges, marbled endpapers", "data_type": "text", "is_value_required": true, "affects_pricing": true },
      { "attribute_type_id": "71a7ebee-e878-4142-96ca-87ce0e471b99", "category_id": "3b6e411c-d273-4dfc-a480-66072c6dc3d7", "name": "Original Binding", "description": "In original publisher binding", "data_type": "boolean", "is_value_required": false, "affects_pricing": true },
      { "attribute_type_id": "dd0489d2-edc6-45f5-bf57-227e41e2a537", "category_id": "3b6e411c-d273-4dfc-a480-66072c6dc3d7", "name": "Dust Jacket Condition", "description": "Condition of dust jacket", "data_type": "text", "is_value_required": true, "affects_pricing": true },
      { "attribute_type_id": "063cef56-8395-4307-8acc-cfbb7cb6ff2c", "category_id": "3b6e411c-d273-4dfc-a480-66072c6dc3d7", "name": "Dust Jacket Present", "description": "Original dust jacket included", "data_type": "boolean", "is_value_required": false, "affects_pricing": true },
      { "attribute_type_id": "ff48aa20-9217-4f69-ab37-f398e97c2a6f", "category_id": "12e9edaa-21c1-4798-b607-51144e1bac91", "name": "Library Edition", "description": "Specifically printed for libraries", "data_type": "boolean", "is_value_required": false, "affects_pricing": true },
      { "attribute_type_id": "7fa03650-b530-4007-930c-6c29c3a6b0d2", "category_id": "12e9edaa-21c1-4798-b607-51144e1bac91", "name": "Book Club Edition", "description": "Book club specific edition", "data_type": "boolean", "is_value_required": false, "affects_pricing": true },
      { "attribute_type_id": "f96d39ee-3dce-46c3-90ab-2cbf8f37de8f", "category_id": "12e9edaa-21c1-4798-b607-51144e1bac91", "name": "International Edition", "description": "Published for international markets", "data_type": "boolean", "is_value_required": false, "affects_pricing": true },
      { "attribute_type_id": "4ba6e31b-b06f-4266-8a4f-728aec9ef143", "category_id": "12e9edaa-21c1-4798-b607-51144e1bac91", "name": "Large Print Edition", "description": "Large print format", "data_type": "boolean", "is_value_required": false, "affects_pricing": true },
      { "attribute_type_id": "596e1ec3-7b33-4b47-8652-5f67a2d8b4aa", "category_id": "12e9edaa-21c1-4798-b607-51144e1bac91", "name": "Library Binding", "description": "Sturdy library-specific binding", "data_type": "boolean", "is_value_required": false, "affects_pricing": true },
      { "attribute_type_id": "498bafa4-acc0-4c94-bdb2-586833d8b13e", "category_id": "12e9edaa-21c1-4798-b607-51144e1bac91", "name": "Paperback", "description": "Paperback format", "data_type": "boolean", "is_value_required": false, "affects_pricing": true },
      { "attribute_type_id": "13b383ea-06ec-4d90-91a1-b626de25a85a", "category_id": "12e9edaa-21c1-4798-b607-51144e1bac91", "name": "Hardcover", "description": "Hardcover format", "data_type": "boolean", "is_value_required": false, "affects_pricing": true },
      { "attribute_type_id": "f4f827f8-dbd8-4c59-9a57-662646de0aad", "category_id": "a54a327a-b4c9-47f1-8e1e-a60b80a3b6b7", "name": "Binding Tightness", "description": "Condition of binding", "data_type": "text", "is_value_required": true, "affects_pricing": true },
      { "attribute_type_id": "9c23c0b9-5717-48cf-8f71-eeab2a4e67d7", "category_id": "a54a327a-b4c9-47f1-8e1e-a60b80a3b6b7", "name": "Damage Notes", "description": "Smells, stains, foxing, mold, etc.", "data_type": "text", "is_value_required": true, "affects_pricing": true },
      { "attribute_type_id": "5c6b7e0f-c1c5-4d1e-ac8b-ebbc4f16460f", "category_id": "a54a327a-b4c9-47f1-8e1e-a60b80a3b6b7", "name": "Restorations", "description": "Professional repairs or restorations", "data_type": "text", "is_value_required": true, "affects_pricing": true },
      { "attribute_type_id": "69973045-4a12-4a70-8163-9fc37b7f75a0", "category_id": "a54a327a-b4c9-47f1-8e1e-a60b80a3b6b7", "name": "Completeness", "description": "All pages and illustrations present", "data_type": "boolean", "is_value_required": false, "affects_pricing": true },
      { "attribute_type_id": "cbf46008-6d66-45f1-97e5-f6d3597334b5", "category_id": "a54a327a-b4c9-47f1-8e1e-a60b80a3b6b7", "name": "Overall Condition", "description": "New, Fine, Near Fine, Very Good, Good, Fair, Poor", "data_type": "text", "is_value_required": true, "affects_pricing": true },
      { "attribute_type_id": "94dfe6a2-6c87-4a25-ac15-6825ae9fe409", "category_id": "02417e7a-ddd5-4cf0-979d-369fe67d091a", "name": "Media Tie-In", "description": "Movie cover or media-related edition", "data_type": "boolean", "is_value_required": false, "affects_pricing": true },
      { "attribute_type_id": "28697e9b-5e25-4d1f-b7be-bb4e85273651", "category_id": "02417e7a-ddd5-4cf0-979d-369fe67d091a", "name": "Promotional Copy", "description": "Not for resale edition", "data_type": "boolean", "is_value_required": false, "affects_pricing": true },
      { "attribute_type_id": "933622f0-c66d-4017-9747-7d430fa052fa", "category_id": "02417e7a-ddd5-4cf0-979d-369fe67d091a", "name": "Country of Origin", "description": "Country where first published", "data_type": "text", "is_value_required": true, "affects_pricing": true },
      { "attribute_type_id": "7bb6c915-2466-4d2b-b606-802e210af762", "category_id": "02417e7a-ddd5-4cf0-979d-369fe67d091a", "name": "Print Run Size", "description": "Number of copies printed", "data_type": "numeric", "is_value_required": true, "affects_pricing": true },
      { "attribute_type_id": "cbe2599e-3e63-4b36-a01e-b9d4ceb7df5c", "category_id": "02417e7a-ddd5-4cf0-979d-369fe67d091a", "name": "Facsimile Edition", "description": "Reproduction of rare edition", "data_type": "boolean", "is_value_required": false, "affects_pricing": true },
      { "attribute_type_id": "d4ad5236-f4ad-45e5-a18d-341f4b973cc1", "category_id": "02417e7a-ddd5-4cf0-979d-369fe67d091a", "name": "Presentation Copy", "description": "Personally gifted by author/publisher", "data_type": "boolean", "is_value_required": false, "affects_pricing": true },
      { "attribute_type_id": "be6a04cc-22b3-4090-b44f-ef125d0d5cd2", "category_id": "02417e7a-ddd5-4cf0-979d-369fe67d091a", "name": "Handmade Book", "description": "Unique, handcrafted edition", "data_type": "boolean", "is_value_required": false, "affects_pricing": true },
      { "attribute_type_id": "b403e097-fbc7-4ea9-bdeb-4ab326f64034", "category_id": "02417e7a-ddd5-4cf0-979d-369fe67d091a", "name": "Private Press", "description": "Printed by small artisanal press", "data_type": "text", "is_value_required": true, "affects_pricing": true },
      { "attribute_type_id": "32b50398-e04d-4a5c-985f-3522a19122dd", "category_id": "02417e7a-ddd5-4cf0-979d-369fe67d091a", "name": "Suppressed Edition", "description": "Controversial or banned edition", "data_type": "boolean", "is_value_required": false, "affects_pricing": true },
      { "attribute_type_id": "a77de8ce-c38f-4e1a-b360-19f82ace5683", "category_id": "02417e7a-ddd5-4cf0-979d-369fe67d091a", "name": "Publisher Mistakes", "description": "Notable typos or printing errors", "data_type": "text", "is_value_required": true, "affects_pricing": true },
      { "attribute_type_id": "57f3720c-d01f-42a6-865d-0ae29bae2f21", "category_id": "02417e7a-ddd5-4cf0-979d-369fe67d091a", "name": "Errata Sheet Present", "description": "Includes correction sheet", "data_type": "boolean", "is_value_required": false, "affects_pricing": true },
      { "attribute_type_id": "a8a1fa7e-1fab-4f71-8132-8404db5c7ee5", "category_id": "96d4965b-7d6a-40c6-b569-9d2dcbdbff24", "name": "Historical Connection", "description": "Tied to notable event or person", "data_type": "text", "is_value_required": true, "affects_pricing": true },
      { "attribute_type_id": "d9f0a0c4-5e03-4e0f-9897-3a3c1ac18e05", "category_id": "96d4965b-7d6a-40c6-b569-9d2dcbdbff24", "name": "Notable Collection", "description": "From famous library or estate", "data_type": "text", "is_value_required": true, "affects_pricing": true },
      { "attribute_type_id": "b54046ec-bf53-40a0-a9d4-dbd970a92818", "category_id": "96d4965b-7d6a-40c6-b569-9d2dcbdbff24", "name": "Ex-Library Copy", "description": "Former library book", "data_type": "boolean", "is_value_required": false, "affects_pricing": true }
  ];