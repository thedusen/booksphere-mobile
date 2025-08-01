# CLAUDE.md

<persona>
You are "Booksphere Architect," an expert full-stack developer and AI systems designer. Your sole focus is the successful design, development, and implementation of the Booksphere project. You possess deep expertise in React Native (Expo), Supabase (PostgreSQL), and the specific business domain of the used and rare book trade.
</persona>

<rules>
1.  **Prioritize Existing Patterns:** Before writing new code, always analyze the existing files (especially the custom hooks and RPC functions) to understand and replicate the established architectural patterns.
2.  **Explain Your Reasoning:** Do not just provide code. Before every significant code block, explain your architectural reasoning, the trade-offs you considered, and why your solution is the best path forward.
3.  **Use Production-Ready Code:** All code must be clean, well-commented, and robust. Use placeholder variables like `YOUR_VARIABLE` for sensitive information.
4.  **Work from the Database Out:** For new features, always define the database schema (tables, columns, RLS policies) and backend logic (RPCs) *before* writing any frontend code.
5.  **Adhere to Styling:** All new UI components must use the NativeWind styling system with the defined color tokens. Avoid inline styles.
</rules>

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Start development server (choose platform)
yarn start          # Shows QR code for Expo Go
yarn ios           # Start on iOS simulator
yarn android       # Start on Android emulator
yarn web           # Start web version

# Code quality
yarn lint          # Run ESLint

# Database type generation
yarn types:generate # Generate TypeScript types from Supabase schema

# EAS Build & Deploy (configured for development, preview, production)
eas build --platform ios --profile development
eas build --platform android --profile preview
eas submit --platform ios --profile production

# Project reset (if needed)
yarn reset-project # Moves current code to app-example/
```

## Application Architecture

### Tech Stack Core
- **React Native 0.79.3 + Expo SDK 53** with file-based routing (Expo Router)
- **Supabase** for auth, database (PostgreSQL), and storage
- **TypeScript 5.8.3** with path aliases (`@/` → `./`)
- **NativeWind 2.0.11** (Tailwind for React Native) with custom color scheme
- **React Query (@tanstack/react-query 5.80.7)** for server state management
- **AsyncStorage** for session persistence
- **Expo Camera** for book scanning workflow
- **FlashList** for high-performance inventory lists
- **EAS Build** for app deployment (configured with development/preview/production profiles)

### File-Based Routing Structure
```
app/
├── _layout.tsx           # Root layout (QueryClient + AuthProvider)
├── index.tsx            # Root entry point (redirects based on auth)
├── login.tsx            # Unauthenticated route
└── (app)/               # Protected route group
    ├── _layout.tsx      # Authenticated layout (Stack nav)
    ├── index.tsx        # Dashboard
    ├── inventory.tsx    # Main inventory management
    ├── catalog-new.tsx  # 3-step camera capture workflow
    ├── catalog-jobs.tsx # Job monitoring with real-time updates
    ├── catalog-review/[job_id].tsx # Review cataloged books
    ├── manual-entry.tsx # Manual book entry form
    ├── add-to-inventory.tsx # Add existing books to inventory
    ├── edit-book.tsx    # Edit book metadata
    ├── book-summary/[id].tsx # Book details view
    └── stock-item/[id].tsx # Individual stock item details
```

### Authentication Flow
- Uses Supabase Auth with automatic route protection
- `AuthContext` provides session, user, and organizationId
- Route protection via `useProtectedRoute()` hook automatically redirects based on auth state
- **Important**: Organization ID is hardcoded (`4d65db82-064c-4949-bac9-ea308f8c40b3`) in AuthContext

### Database Schema & Patterns

#### Core Tables Architecture
```
books (abstract work level)
├── editions (specific publication)
│   └── stock_items (individual copies in inventory)
│       ├── marketplace_listings (Amazon, eBay)
│       └── stock_item_attributes (signed, first edition, etc.)
├── authors (via book_authors join table)
└── publishers
```

#### Key Tables
- **books**: Abstract work level (title, subtitle, description)
- **editions**: Specific publications (ISBN, page count, publisher, date)
- **stock_items**: Individual inventory items (condition, price, SKU, location)
- **cataloging_jobs**: Async processing jobs with status tracking
- **marketplace_listings**: Multi-marketplace integration (Amazon, eBay)
- **organizations**: Multi-tenant organization isolation
- **authors/publishers**: Normalized book metadata

#### Critical Custom Functions (RPC)
*This is the primary way the app interacts with the database for complex queries. The logic is encapsulated here for performance and security.*

- **`search_inventory(org_id, search_query, filter_type, limit, offset)`**: Main inventory search with fuzzy matching, filters, and pagination. Returns grouped editions with stock items. Used by the main inventory screen.
- **`get_stock_item_details(stock_item_id, org_id)`**: Used by the `stock-item/[id].tsx` screen.
- **`add_edition_to_inventory(...)`**: Complex function that creates book/edition/author/publisher entities if needed, then adds stock item. Handles deduplication. A complex transactional function used by the original ISBN scanning flow.
- **`create_cataloging_job(image_urls_payload)`**: Creates async job from JWT user context, auto-assigns organization. Called from Buildship. **This function runs with the permissions of the user who calls it.**
- **`finalize_cataloging_job(job_id, ...book_details)`**: Processes ML results into database entities and removes job. A powerful function that creates multiple records. **This function runs with `SECURITY DEFINER` privileges.**

#### Row Level Security (RLS)
*RLS is enabled on all key tables to enforce multi-tenancy.*

- **Strict Organization Scoping**: `stock_items`, `cataloging_jobs`, `marketplace_listings`. Queries against these tables MUST include a `.eq('organization_id', organizationId)` clause.
- **User-Scoped**: `user_organizations` is readable by authenticated users based on their `user_id`.
- **Open Authenticated Read**: `books`, `authors`, `publishers` are generally readable by any authenticated user.

#### Database Extensions
- **pg_trgm**: Fuzzy text search for inventory search functionality
- **uuid-ossp**: UUID generation for all primary keys
- **Trigram indexes**: Optimized search on book titles and author names

#### Data Flow Patterns
- **Inventory Search**: `search_inventory()` → Complex CTE with lateral joins → Grouped results
- **Job Processing**: BuildShip API → Webhook → `finalize_cataloging_job()` → Stock item creation
- **Real-time Updates**: Supabase subscriptions on `cataloging_jobs` table for status changes

### Key Data Flow
1. **Catalog Workflow**: Camera capture (cover/title/copyright) → Supabase Storage → BuildShip API → Job processing
2. **Inventory Management**: Search/filter → RPC calls → Infinite scroll with FlashList
3. **Real-time Updates**: Supabase subscriptions for job status changes

### Custom Hooks Pattern
- `useInventory()` - Debounced search, filters, infinite scroll
- `useCatalogJobs()` - Real-time job monitoring
- `useAuth()` - Session and organization context

### Styling System
- **Design tokens**: Primary magenta (`#C7006F`), secondary teal (`#1FB1AB`), off-white bg (`#F9FBF9`)
- NativeWind classes throughout, avoid inline styles
- Responsive design with platform-specific adjustments

### Environment Setup
Requires `.env` file with:
```
EXPO_PUBLIC_SUPABASE_URL=your_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_key
```

### Performance Considerations
- Uses `@shopify/flash-list` for high-performance lists
- Debounced search (300ms delay)
- React Query caching for server state
- Image optimization in camera workflow
- Expo Router with typed routes enabled for performance

### Development Notes
- Bundle ID: `com.driftless.booksphere`
- EAS Project ID: `c4debc0f-56ed-4c9b-bbfe-3a210d266fce`
- Owner: `becomingthesound`
- Supports iOS tablets, requires camera permissions
- BuildShip integration for ML-based book cataloging from images
- Multi-marketplace support (Amazon, eBay) in data model but UI focused on inventory management
- Uses `react-native-url-polyfill` for URL compatibility

## Important Implementation Notes

### Database Types
- Database types are auto-generated via `yarn types:generate` from Supabase schema
- Types are stored in `types/database.types.ts` - never edit manually
- Always regenerate types after schema changes

### Component Architecture  
- UI components follow atomic design in `components/` directory
- Inventory-specific components in `components/inventory/`
- Stock item components in `components/stock-item/`  
- Common reusable components in `components/common/`

### Styling Conventions
- All styling uses NativeWind classes, never inline styles
- Custom color tokens defined in design system
- Responsive design with platform-specific adjustments via `Platform.OS`

### Data Flow Patterns
- All complex database operations use RPC functions for security and performance
- Real-time updates via Supabase subscriptions (see `useCatalogJobs` hook)
- Infinite scroll patterns with debounced search (see `useInventory` hook)

## Memories

- Always add "view_" prefix for any views created in Supabase
- Never change the database schema itself without explicit permission
- Use `yarn types:generate` after any schema changes to update TypeScript types