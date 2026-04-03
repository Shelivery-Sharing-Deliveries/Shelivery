/* eslint-env node */
/* global __dirname */

const path = require('path');

// Ensure apps/mobile/.env is loaded when Expo evaluates app.config.*
try {
  const dotenv = require('dotenv');
  dotenv.config({ path: path.resolve(__dirname, '.env') });
} catch {
  // If dotenv isn't available for some reason, fall back to process.env.
}

// In this repo the value is defined as EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN in apps/mobile/.env
const MAPBOX_ACCESS_TOKEN =
  process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || process.env.MAPBOX_ACCESS_TOKEN || '';

module.exports = {
  expo: {
    name: 'mobile',
    owner: 'ims9898s-organization',
    slug: 'shelivery',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'mobile',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    ios: {
      bundleIdentifier: "com.smehdi.shelivery",
      supportsTablet: true,
      infoPlist: {
        NSLocationWhenInUseUsageDescription:
          'This app needs access to your location to help you find nearby pools and set your delivery address.'
      }
    },
    android: {
      package: 'com.anonymous.mobile',
      adaptiveIcon: {
        backgroundColor: '#E6F4FE',
        foregroundImage: './assets/images/android-icon-foreground.png',
        backgroundImage: './assets/images/android-icon-background.png',
        monochromeImage: './assets/images/android-icon-monochrome.png'
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      permissions: ['android.permission.ACCESS_COARSE_LOCATION', 'android.permission.ACCESS_FINE_LOCATION']
    },
    web: {
      output: 'static',
      favicon: './assets/images/favicon.png'
    },
    plugins: [
      'expo-router',
      [
        'expo-splash-screen',
        {
          image: './assets/images/splash-icon.png',
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#ffffff',
          dark: {
            backgroundColor: '#000000'
          }
        }
      ],
      [
        '@rnmapbox/maps',
        {
          RNMapboxMapsDownloadToken: MAPBOX_ACCESS_TOKEN
        }
      ]
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true
    },
    extra: {
      eas: {
        // Use an environment variable for safety; fallback to placeholder if not set
        projectId: '2b45d04f-4161-4177-be9f-51aa4552d435'
      }
    }
  }
};
