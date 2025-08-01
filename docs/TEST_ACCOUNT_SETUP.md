# Test Account Setup Guide

This guide explains how to create test accounts in Supabase for internal testing of the Booksphere mobile app.

## Prerequisites

- Access to the Supabase project dashboard
- Admin or appropriate permissions in Supabase

## Creating Test Accounts

### Step 1: Access Supabase Authentication

1. Log into [Supabase Dashboard](https://app.supabase.com)
2. Select the Booksphere project
3. Navigate to **Authentication** → **Users** in the left sidebar

### Step 2: Create Test Users

Click **Add user** → **Create new user** and create the following accounts:

#### Test User 1 - Book Dealer
```
Email: test1@booksphere.com
Password: TestUser123!
```

#### Test User 2 - Manager
```
Email: test2@booksphere.com
Password: TestUser123!
```

#### Test User 3 - Cataloger
```
Email: test3@booksphere.com
Password: TestUser123!
```

### Step 3: Link Users to Organization

Since the app uses organization-based access, you need to add these users to the test organization:

1. Go to **Table Editor** → **user_organizations** table
2. Add a new row for each test user:

```sql
-- Run this in the SQL Editor for each test user
INSERT INTO user_organizations (user_id, organization_id, role)
VALUES 
  ('USER_ID_HERE', '4d65db82-064c-4949-bac9-ea308f8c40b3', 'member');
```

Replace `USER_ID_HERE` with the actual user ID from the authentication panel.

### Step 4: Add Sample Inventory Data

To provide realistic test data, run this SQL in the SQL Editor:

```sql
-- Create sample books and inventory for testing
-- This creates 10 sample books with various conditions and prices

-- First, create some sample books if they don't exist
INSERT INTO books (title, subtitle, description)
VALUES 
  ('To Kill a Mockingbird', 'A Novel', 'Classic American literature'),
  ('1984', NULL, 'Dystopian masterpiece by George Orwell'),
  ('The Great Gatsby', NULL, 'F. Scott Fitzgerald classic'),
  ('Pride and Prejudice', 'A Romance Novel', 'Jane Austen masterwork'),
  ('The Catcher in the Rye', NULL, 'Coming-of-age novel')
ON CONFLICT DO NOTHING;

-- Create editions for these books
INSERT INTO editions (book_id, isbn, publisher_id, publication_date, page_count)
SELECT 
  b.id,
  '978' || LPAD(FLOOR(RANDOM() * 1000000000)::TEXT, 9, '0'),
  NULL,
  DATE '1950-01-01' + (RANDOM() * 365 * 70)::INT,
  200 + FLOOR(RANDOM() * 300)::INT
FROM books b
WHERE b.title IN ('To Kill a Mockingbird', '1984', 'The Great Gatsby', 'Pride and Prejudice', 'The Catcher in the Rye')
ON CONFLICT DO NOTHING;

-- Add stock items for the test organization
INSERT INTO stock_items (edition_id, organization_id, sku, condition, price, quantity, location, notes)
SELECT 
  e.id,
  '4d65db82-064c-4949-bac9-ea308f8c40b3',
  'SKU-' || LPAD(FLOOR(RANDOM() * 100000)::TEXT, 6, '0'),
  (ARRAY['Fine', 'Very Good', 'Good', 'Fair'])[FLOOR(RANDOM() * 4 + 1)],
  9.99 + FLOOR(RANDOM() * 90)::NUMERIC(10,2),
  1,
  (ARRAY['Shelf A1', 'Shelf A2', 'Shelf B1', 'Shelf B2', 'Storage'])[FLOOR(RANDOM() * 5 + 1)],
  CASE 
    WHEN RANDOM() > 0.5 THEN 'First edition'
    WHEN RANDOM() > 0.5 THEN 'Signed by author'
    ELSE NULL
  END
FROM editions e
JOIN books b ON e.book_id = b.id
WHERE b.title IN ('To Kill a Mockingbird', '1984', 'The Great Gatsby', 'Pride and Prejudice', 'The Catcher in the Rye')
ON CONFLICT DO NOTHING;
```

## Verifying Test Accounts

1. Open the Booksphere app
2. Try logging in with each test account
3. Verify that inventory items appear
4. Test all major features:
   - Book cataloging (camera capture)
   - Inventory search and filtering
   - Manual book entry
   - Book detail views

## Security Notes

- These test accounts should ONLY be used for internal testing
- Never use these credentials in production
- Rotate passwords regularly
- Delete test accounts before public release

## Troubleshooting

### User Can't See Inventory
- Check that user is properly linked to organization in `user_organizations` table
- Verify organization_id matches: `4d65db82-064c-4949-bac9-ea308f8c40b3`

### Login Fails
- Verify email is confirmed in Supabase Authentication panel
- Check that password meets requirements
- Ensure no typos in email or password

### No Sample Data
- Run the sample data SQL script again
- Check for any SQL errors in the execution
- Verify organization_id in stock_items matches the hardcoded value

## Additional Testing Scenarios

Consider creating specialized test accounts for:
- User with empty inventory (new dealer)
- User with large inventory (1000+ items)
- User with specific permission restrictions
- User in different timezone/locale