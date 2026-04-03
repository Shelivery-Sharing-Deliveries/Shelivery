Expo Dev Client (RNMapbox) Guide for Shelivery MVP

Goal: Use a custom Expo development client (via EAS) to run Expo apps with native modules (e.g., RNMapbox) on iOS, instead of Expo Go.

Prerequisites:
- You should be in the repository root: /Users/soroosh/Dev_vs/Shelivery
- Mapbox RN module added to the mobile app (see steps below)
- EAS account and login if you plan to build a dev client with EAS

Step-by-step plan
- [ ] Create or verify dev client configuration (eas.json)
- [ ] Install expo-dev-client in apps/mobile (development dependency)
- [ ] Add RNMapbox package and ensure token is configured in app config
- [ ] Run prebuild to generate native projects (ios/ android)
- [ ] Install native dependencies for iOS (pod install) if using CocoaPods
- [ ] Build the development client with EAS for iOS
- [ ] Start Metro with dev client and run on iOS simulator or device
- [ ] Debug and verify RNMapbox rendering works in the dev client

Commands you can copy/paste (from repo root or within apps/mobile):
- Install Expo dev client (if not already):
  npx expo install expo-dev-client
- Install RNMapbox maps (legacy peer deps flag to workaround):
  cd apps/mobile && npm install @react-native-mapbox-gl/maps --legacy-peer-deps
- Prebuild native projects:
  cd apps/mobile && npx expo prebuild
- Install iOS pods (when ios folder exists):
  cd apps/mobile && npx pod-install ios
- Create or update eas.json for dev build (example shown in repo):
  (see eas.json at repo root)
- Build dev client for iOS (long-running, requires login):
  npx eas build -p ios --profile dev
- Start dev client locally:
  npx expo start --dev-client
- Open the custom dev client on iOS and run the app from the local server.

Notes and troubleshooting
- Expo Go cannot load RNMapbox; a development client must be used.
- Ensure environment variables for Mapbox token are accessible to the build (MAPBOX token in app.config.js/.env).
- If you see dependency conflicts, try --legacy-peer-deps during RN map installation or adjust RNMapbox version to align with React Native version.
- If you do not have an ios folder yet, run expo prebuild to generate it; then run pod-install.

This guide should help you get RNMapbox working in Expo Dev Client on iOS.
