# React Web to React Native Expo Migration Status

This document outlines the current migration progress from the `src/app/` (React Web) directory to the `apps/mobile/app/` (React Native Expo) directory.

## Overview

The migration involves porting existing React Web pages and components to their React Native Expo equivalents. The goal is to achieve feature parity between the web and mobile applications.

## Migration Status by Page/Feature

### Migrated Pages

*   [x] **Home Page:** `src/app/page.tsx` -> `apps/mobile/app/index.tsx`
*   [x] **Alpha Page:** `src/app/(public)/alpha/page.tsx` -> `apps/mobile/app/alpha.tsx`
*   [x] **Invite Friend Page:** `src/app/(public)/invite-friend/page.tsx` -> `apps/mobile/app/invite-friend.tsx`
*   [x] **Chatrooms:** `src/app/(auth-required)/chatrooms/page.tsx`, `src/app/(auth-required)/chatrooms/[chatroomId]/page.tsx` -> `apps/mobile/app/chatrooms/` (Partial migration)
*   [x] **Authentication Flow:** `src/app/(auth)/auth/page.tsx`, `src/app/(auth)/auth/update-password/page.tsx` -> `apps/mobile/app/auth/` (Partial migration, `apps/mobile/app/auth/index.tsx` exists)



### In Progress Pages



*   [ ] **User Profile:** `src/app/(auth-required)/profile/[userId]/page.tsx` and related components -> `apps/mobile/app/profile/` (Partial migration)

### Remaining Pages (Not yet migrated)

*   [ ] **Dashboard Page:** `src/app/(public)/dashboard/page.tsx`
*   [ ] **About Page:** `src/app/(public)/about/page.tsx`
*   [ ] **Feedback Page:** `src/app/(public)/feedback/page.tsx`
*   [ ] **Pool Page:** `src/app/(public)/pool/[basketId]/page.tsx`
*   [ ] **Shops Blog access page:** `src/app/(public)/shops/[shopId]/basket/page.tsx`, `src/app/(public)/shops/[shopId]/blog/page.tsx`
*   [ ] **Submit Basket Pages:** `src/app/(public)/submit-basket/page.tsx`, `src/app/(public)/submit-basket/SubmitBasketContent.tsx`
*   [ ] **Profile Set Page:** `src/app/(auth-required)/profile-set/[userId]/page.tsx`

### Layouts and Navigation

*   **Web Layouts:** `src/app/layout.tsx`, `src/app/(auth-required)/layout.tsx`, `src/app/(public)/layout.tsx` are adapted to `apps/mobile/app/_layout.tsx` and `apps/mobile/app/(tabs)/` for Expo's navigation system.
*   **Not Found Page:** `src/app/not-found.tsx` is handled by Expo's routing system and does not require a direct migration.

## Migration Plan

1.  **Prioritize Core Features:** Focus on migrating essential user flows first (e.g., Dashboard, Shops, Pool).
2.  **Component Reusability:** Identify and extract reusable UI components from `src/components/` to `apps/mobile/components/` to accelerate development.
3.  **API Integration:** Ensure all API calls and data fetching logic are correctly adapted for the React Native environment, utilizing `apps/mobile/api/` and `apps/mobile/lib/supabase.ts`.
4.  **State Management:** Review and adapt state management solutions (if any) to be compatible with React Native Expo.
5.  **Styling:** Translate web styling (Tailwind CSS) to React Native styling (e.g., StyleSheet, Tailwind for React Native).
6.  **Testing:** Implement unit and integration tests for migrated components and pages.
7.  **Documentation:** Keep this `MIGRATION_STATUS.md` file updated with the latest progress.

## Next Steps

*   Begin migration of the **Dashboard Page** (`src/app/(public)/dashboard/page.tsx`) to `apps/mobile/app/dashboard/index.tsx` (or similar structure).
*   Continue refining the **Authentication Flow** and **Chatrooms** migration.
*   Start migrating shared components from `src/components/` to `apps/mobile/components/`.
