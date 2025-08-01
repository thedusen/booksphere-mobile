# Booksphere Mobile App

A React Native (Expo) application for managing used and rare book inventory with ML-powered cataloging.

## Overview

Booksphere is a mobile inventory management system designed specifically for used and rare book dealers. The app features:

- 📸 **Smart Cataloging**: Capture book cover, title page, and copyright page images for automatic ML-powered cataloging
- 📚 **Inventory Management**: Search, filter, and manage your book inventory with ease
- 🔄 **Real-time Sync**: All data syncs instantly across devices via Supabase
- 📱 **Native Performance**: Built with React Native and optimized for iOS and Android

## Tech Stack

- **React Native 0.79.3** with **Expo SDK 53**
- **TypeScript 5.8.3** for type safety
- **Supabase** for backend (auth, database, storage)
- **NativeWind 2.0.11** for styling (Tailwind for React Native)
- **React Query** for server state management
- **Expo Router** for file-based navigation

## Getting Started

### Prerequisites

- Node.js 18+ and Yarn
- Expo CLI: `npm install -g expo-cli`
- EAS CLI: `npm install -g eas-cli`
- iOS Simulator (Mac) or Android Emulator

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd booksphere-mobile

# Install dependencies
yarn install

# Start development server
yarn start

# Or platform-specific
yarn ios     # iOS Simulator
yarn android # Android Emulator
```

### Environment Setup

Create a `.env` file in the root directory:

```env
EXPO_PUBLIC_SUPABASE_URL=https://oteqbwupxzjjvqbkumlt.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
EXPO_PUBLIC_API_BASE_URL=https://qdpvud.buildship.run
```

## Test Accounts

For internal testing, use these credentials:

```
Email: test1@booksphere.com
Password: TestUser123!

Email: test2@booksphere.com  
Password: TestUser123!

Email: test3@booksphere.com
Password: TestUser123!
```

**Note**: These accounts have pre-populated inventory data for testing various features.

## Features Guide

### 1. Book Cataloging

The app's signature feature is the 3-step camera capture workflow:

1. Navigate to "Catalog New Book" from the dashboard
2. Capture three photos in sequence:
   - **Book Cover**: Front cover of the book
   - **Title Page**: Interior title page with full title and author
   - **Copyright Page**: Page with ISBN, publisher, and publication date
3. Review captured images and submit for processing
4. Monitor processing status in "Catalog Jobs"
5. Review and edit extracted information before adding to inventory

### 2. Inventory Management

- **Search**: Type in the search bar to find books by title, author, or ISBN
- **Filters**: Use the filter chips to show all books, in-stock only, or out-of-stock
- **Book Details**: Tap any book to view full details including:
  - Multiple editions
  - Stock locations
  - Pricing information
  - Condition notes

### 3. Manual Entry

For books that can't be scanned or need quick entry:
1. Use "Manual Entry" from the dashboard
2. Fill in book details manually
3. Add to inventory with custom pricing and condition

## Build & Deployment

### Development Build

```bash
# For internal testing with development features
eas build --platform ios --profile development
```

### Production Build (TestFlight)

```bash
# Build and submit to TestFlight
eas build --platform ios --profile production --auto-submit
```

### Build Profiles

- **development**: Includes dev client, internal distribution
- **preview**: Testing build, internal distribution
- **production**: App Store ready, auto-increments version

## Project Structure

```
app/
├── _layout.tsx              # Root layout with providers
├── (app)/                   # Protected routes
│   ├── index.tsx           # Dashboard
│   ├── inventory.tsx       # Main inventory screen
│   ├── catalog-new.tsx     # Camera capture workflow
│   ├── catalog-jobs.tsx    # Job monitoring
│   └── book-summary/[id].tsx # Book details
├── components/             # Reusable components
├── context/               # Auth and app context
├── hooks/                 # Custom React hooks
└── lib/                   # Utilities and Supabase client
```

## Development Commands

```bash
yarn start          # Start Expo development server
yarn ios           # Run on iOS simulator
yarn android       # Run on Android emulator
yarn lint          # Run ESLint
yarn types:generate # Generate TypeScript types from Supabase
```

## Troubleshooting

### Camera Not Working
- Ensure you've granted camera permissions
- On iOS Simulator, camera is not available - use a real device

### Login Issues
- Check internet connection
- Verify Supabase URL and anon key in .env
- Try logging out and back in

### Build Failures
- Run `eas build --clear-cache` to clear build cache
- Ensure all environment variables are set
- Check that you're logged into EAS: `eas whoami`

## Support

For issues or questions:
- Create an issue in the repository
- Contact the development team
- Check Expo and Supabase documentation

## License

Proprietary - All rights reserved