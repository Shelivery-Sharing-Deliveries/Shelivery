# Dashboard Migration Plan

This document outlines the plan for migrating the `dashboard.tsx` component from the React web application (`src/app/(public)/dashboard/page.tsx`) to the React Native Expo application (`apps/mobile/app/(tabs)/dashboard.tsx`).

## 1. Overview of `dashboard.tsx` (Web)

The existing web dashboard component (`src/app/(public)/dashboard/page.tsx`) displays user information, active and resolved baskets, featured shops, and provides navigation to other parts of the application. It includes the following key features and components:

*   **Authentication Check:** Uses `useAuth` hook to determine user authentication status.
*   **Loading State:** Displays a `DashboardLoading` skeleton component during data fetching.
*   **Unauthenticated State:** Shows `SignInCard`, `SquareBanner`, `FeaturedShopCard`, and `AddBasket` for unauthenticated users.
*   **Authenticated State:**
    *   Displays a header with "Dashboard" title, "Invite Friends" button, and "Support" button.
    *   Shows `ProfileCard` with user's name and avatar.
    *   Includes `AddBasket` button.
    *   Displays `FeaturedShopCard`.
    *   Fetches and displays `activeBaskets` and `resolvedBaskets` using the `Baskets` component.
    *   Includes a `Banner` component.
    *   Features a collapsible "Archive" section for `resolvedBaskets`.
    *   Conditionally renders `DashboardTutorial` for new users.
*   **Data Fetching:** Uses Supabase client (`@/lib/supabase`) to fetch user profile and basket data.
*   **Navigation:** Uses `next/navigation`'s `useRouter` for client-side navigation.
*   **Styling:** Primarily uses Tailwind CSS classes.
*   **Persistent State:** Uses `localStorage` to track if the `DashboardTutorial` has been seen.

## 2. Migration Steps

### Step 1: Understand the existing `dashboard.tsx` (Web) - **[COMPLETED]**

### Step 2: Identify React Native Equivalents

This step involves mapping the existing web components and functionalities to their React Native and Tamagui counterparts.

*   **Layout Components:**
    *   `PageLayout`: Will be replaced with a combination of `ScrollView` and `View` from React Native, potentially wrapped in a Tamagui `YStack` or `XStack`.
*   **UI Components:**
    *   `Button`: `apps/mobile/components/ui/Button.tsx` already exists and can be used.
    *   `ProfileCard`: Needs to be migrated or a new React Native component created in `apps/mobile/components/dashboard/ProfileCard.tsx`.
    *   `SignInCard`: Needs to be migrated or a new React Native component created in `apps/mobile/components/dashboard/SignInCard.tsx`.
    *   `AddBasket`: `apps/mobile/components/dashboard/AddBasket.tsx` already exists and can be used.
    *   `Baskets`: Needs to be migrated or a new React Native component created in `apps/mobile/components/dashboard/Baskets.tsx`. This component likely uses `BasketCard` internally, which already exists in `apps/mobile/components/ui/BasketCard.tsx`.
    *   `Banner`: Needs to be migrated or a new React Native component created in `apps/mobile/components/dashboard/Banner.tsx`.
    *   `SquareBanner`: Needs to be migrated or a new React Native component created in `apps/mobile/components/dashboard/SquareBanner.tsx`.
    *   `FeaturedShopCard`: Needs to be migrated or a new React Native component created in `apps/mobile/components/dashboard/FeaturedShopCard.tsx`.
    *   `DashboardTutorial`: This component is explicitly excluded from the migration as per the task description ("without tutorial").
*   **Navigation:**
    *   `next/navigation`'s `useRouter`: Will be replaced with `expo-router`'s `useRouter`.
*   **Icons:**
    *   `@heroicons/react/24/solid` and `@heroicons/react/24/outline`: Will be replaced with icons from `@expo/vector-icons` or similar React Native icon libraries.
*   **Loading Skeletons:**
    *   `react-loading-skeleton`: Will need to be replaced with custom React Native loading components or a React Native-compatible skeleton library.
*   **Persistent Storage:**
    *   `localStorage`: Will be replaced with `@react-native-async-storage/async-storage` for persistent data storage.

### Step 3: Analyze Styling

*   The web version uses Tailwind CSS classes. The mobile app uses Tamagui.
*   All Tailwind classes will need to be translated into Tamagui components and styles or React Native inline styles. The user has indicated flexibility here, so exact pixel-perfect matching is not strictly required.

### Step 4: Data Fetching and State Management

*   **Supabase Client:** The `supabase` client (`apps/mobile/lib/supabase.ts`) is already set up for the mobile app and can be directly reused.
*   **`useAuth` Hook:** The `useAuth` hook (`apps/mobile/hooks/useAuth.ts`) is also available and can be used as is.
*   **React Hooks:** `useEffect` and `useState` will function identically in React Native.
*   **Interfaces:** The `ShopData`, `Basket`, and `DisplayBasket` interfaces will be reused or adapted slightly for TypeScript in the React Native environment.

### Step 5: Refactor and Rewrite for React Native Expo

*   Create a new file: `apps/mobile/app/(tabs)/dashboard.tsx`.
*   Import necessary React Native components (`View`, `Text`, `ScrollView`, `Image`, `TouchableOpacity`, `ActivityIndicator`, `Platform`, etc.) and Tamagui components.
*   Reimplement the `DashboardLoading` component using React Native primitives or a suitable skeleton library.
*   Rewrite the `DashboardPage` functional component:
    *   Replace `PageLayout` with `ScrollView` and `View` components.
    *   Replace web-specific `div` elements with `View`.
    *   Replace web-specific `h1`, `h2`, `p` elements with `Text`.
    *   Replace `img` tags with `Image` components, handling local assets and network images appropriately.
    *   Replace `a` tags with `TouchableOpacity` or `Link` from `expo-router`.
    *   Apply Tamagui styles or inline styles to all components.
    *   Adapt `localStorage` calls to `AsyncStorage`.
    *   Ensure all event handlers (`onClick`) are replaced with `onPress` for touch events.
    *   Remove the `DashboardTutorial` component and its related state/logic.

### Step 6: Integrate into the Mobile App

*   Ensure the new `dashboard.tsx` is correctly placed within the `apps/mobile/app/(tabs)/` directory to be picked up by `expo-router` for tab navigation.
*   Verify that all navigation links (`/alpha`, `/invite-friend`, `/feedback`, `/chatrooms/[id]`, `/pool/[id]`) correctly resolve and navigate within the Expo app.

## 3. Connected Pages and Components for Future Migration

The following pages and components are directly linked or used by the `dashboard.tsx` and will require migration in subsequent steps to ensure full functionality:

### Pages:

*   **`/alpha`**: This page is navigated to when the "Add Basket" button is clicked. It's likely a multi-step form for creating a new basket.
    *   Web path: `src/app/(public)/alpha/page.tsx`
    *   Mobile path: `apps/mobile/app/alpha.tsx` (already exists, needs content migration)
*   **`/invite-friend`**: This page is navigated to when the "Invite Friends" button is clicked.
    *   Web path: `src/app/(public)/invite-friend/page.tsx`
    *   Mobile path: (Needs to be created, e.g., `apps/mobile/app/invite-friend.tsx`)
*   **`/feedback`**: This page is navigated to when the "Support" button is clicked.
    *   Web path: `src/app/(public)/feedback/page.tsx`
    *   Mobile path: (Needs to be created, e.g., `apps/mobile/app/feedback.tsx`)
*   **`/chatrooms/[id]`**: This dynamic page is navigated to when a basket with status `in_chat` or `resolved` is clicked.
    *   Web path: `src/app/(auth-required)/chatrooms/[id]/page.tsx`
    *   Mobile path: `apps/mobile/app/(tabs)/chatrooms.tsx` (already exists, needs content migration)
*   **`/pool/[id]`**: This dynamic page is navigated to when a basket with status `in_pool` is clicked.
    *   Web path: `src/app/(public)/pool/[id]/page.tsx`
    *   Mobile path: (Needs to be created, e.g., `apps/mobile/app/pool/[id].tsx`)

### Components:

*   **`ProfileCard`**: Displays user's name and avatar.
    *   Web path: `src/components/dashboard/ProfileCard.tsx`
    *   Mobile path: `apps/mobile/components/dashboard/ProfileCard.tsx` (needs content migration)
*   **`SignInCard`**: Prompts unauthenticated users to sign in.
    *   Web path: `src/components/dashboard/SignInCard.tsx`
    *   Mobile path: `apps/mobile/components/dashboard/SignInCard.tsx` (needs content migration)
*   **`AddBasket`**: Button to initiate the basket creation process.
    *   Web path: `src/components/dashboard/AddBasket.tsx`
    *   Mobile path: `apps/mobile/components/dashboard/AddBasket.tsx` (already exists, needs content migration if not already migrated)
*   **`Baskets`**: Displays a list of active or resolved baskets.
    *   Web path: `src/components/dashboard/Baskets.tsx`
    *   Mobile path: `apps/mobile/components/dashboard/Baskets.tsx` (needs content migration)
    *   **`BasketCard`**: (Used by `Baskets`) Displays individual basket details.
        *   Web path: `src/components/ui/BasketCard.tsx`
        *   Mobile path: `apps/mobile/components/ui/BasketCard.tsx` (already exists, needs content migration if not already migrated)
*   **`Banner`**: Displays a promotional banner.
    *   Web path: `src/components/dashboard/Banner.tsx`
    *   Mobile path: `apps/mobile/components/dashboard/Banner.tsx` (needs content migration)
*   **`SquareBanner`**: Displays a square promotional banner.
    *   Web path: `src/components/dashboard/SquareBanner.tsx`
    *   Mobile path: `apps/mobile/components/dashboard/SquareBanner.tsx` (needs content migration)
*   **`FeaturedShopCard`**: Displays a card for a featured shop.
    *   Web path: `src/components/dashboard/FeaturedShopCard.tsx`
    *   Mobile path: `apps/mobile/components/dashboard/FeaturedShopCard.tsx` (needs content migration)
*   **`DashboardTutorial`**: (Excluded from migration as per task)
    *   Web path: `src/components/dashboard/DashboardTutorial.tsx`

## 4. Styling Considerations (Tamagui)

Given that the mobile app uses Tamagui, all styling will be converted from Tailwind CSS classes to Tamagui components and properties. This will involve:

*   Using `YStack`, `XStack`, `Text`, `Image`, `Button` from Tamagui.
*   Mapping Tailwind utility classes (e.g., `flex`, `justify-between`, `items-center`, `bg-white`, `rounded-2xl`, `p-6`, `shadow-sm`, `text-base`, `font-bold`, `text-gray-800`, `mt-4`, `mb-1`, `w-full`, `h-auto`) to Tamagui props (e.g., `flexDirection`, `justifyContent`, `alignItems`, `backgroundColor`, `borderRadius`, `padding`, `shadowColor`, `fontSize`, `fontWeight`, `color`, `marginTop`, `marginBottom`, `width`, `height`).
*   Leveraging Tamagui's theming system for consistent design.

## 5. Supabase and `useAuth`

The existing Supabase client and `useAuth` hook in the `apps/mobile` directory are compatible and will be reused directly. No changes are expected for these integrations.

## 6. Image Handling

*   Images referenced with absolute paths like `/avatars/default-avatar.png` will need to be updated to use `require()` for local assets or `uri` for network images in React Native `Image` components.
*   The `shop.logo_url` will be network images.

## 7. Next Steps

The next step is to begin the actual migration by creating the new `dashboard.tsx` file in the mobile app and progressively migrating each section and component.
