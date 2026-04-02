# Map Integration Options for LocationStep

The current `LocationStep.tsx` uses a placeholder for map integration. For the mobile app, we have several options to achieve parity with the Mapbox implementation in the web app.

## 1. React Native Maps (Recommended for Expo)

This is the most common library for maps in React Native.

- **Library**: `react-native-maps`
- **Pros**:
  - Deep integration with Expo.
  - Uses native Apple Maps on iOS and Google Maps on Android.
  - Highly performant.
- **Cons**:
  - Requires Google Maps API key for Android.
  - UI looks slightly different between platforms unless Google Maps is used for both.

## 2. Mapbox Maps SDK for React Native

Since the web app uses Mapbox, this provides the most consistency.

- **Library**: `@rnmapbox/maps`
- **Pros**:
  - Consistent look and feel with the web version.
  - Shared styling (Mapbox Studio styles).
  - Advanced features like offline maps.
- **Cons**:
  - Requires a Mapbox access token.
  - More complex setup than native maps.

## 3. Location Searching (Geocoding)

To replace the `MapboxLocationPicker` search functionality:

- **Option A: Mapbox Geocoding API**: Continue using Mapbox's search API via fetch calls.
- **Option B: Google Places Autocomplete**: Better data for businesses and addresses, but requires a separate API key.
- **Option C: Expo Location**: Can be used for reverse geocoding (converting coordinates to addresses) using native services.

## Implementation Steps for LocationStep:

1. Install chosen map library: `npx expo install react-native-maps`
2. Install location services: `npx expo install expo-location`
3. Replace the placeholder `YStack` in `LocationStep.tsx` with the `MapView` component.
4. Implement a search bar for address lookup using a geocoding API.
5. Update state when the user moves the map marker or selects a search result.
