import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { supabase } from '@/lib/supabase';

// Configure how notifications are presented when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Registers the device for Expo push notifications and upserts the token
 * into the `push_subscriptions` table with token_type = 'expo'.
 *
 * Only runs on physical devices (iOS/Android) — skips silently on web/simulator.
 * Safe to call multiple times; uses upsert so no duplicate rows are created.
 *
 * @param userId - The authenticated Supabase user's UUID. Pass null to skip registration.
 */
export async function registerExpoPushToken(userId: string | null): Promise<void> {
  // Only register on native iOS/Android, not web
  if (Platform.OS === 'web') return;

  // Skip if no user is authenticated
  if (!userId) return;

  try {
    // 1. Request notification permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('[PushNotifications] Permission not granted, skipping token registration.');
      return;
    }

    // 2. Get the Expo push token
    // projectId is required for managed workflow (EAS Build)
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId;

    if (!projectId) {
      console.warn('[PushNotifications] No EAS project ID found — push token cannot be obtained.');
      return;
    }

    const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
    const expoPushToken = tokenData.data; // e.g. ExponentPushToken[xxxx]

    console.log('[PushNotifications] Expo push token:', expoPushToken);

    // 3. Upsert the token into push_subscriptions
    const { error } = await supabase
      .from('push_subscriptions')
      .upsert(
        {
          user_id: userId,
          endpoint: expoPushToken,
          token_type: 'expo',
          p256dh: null,
          auth: null,
          user_agent: `${Platform.OS}/${Platform.Version}`,
        },
        { onConflict: 'user_id,endpoint' }
      );

    if (error) {
      console.error('[PushNotifications] Failed to save Expo push token:', error.message);
    } else {
      console.log('[PushNotifications] Expo push token saved successfully.');
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[PushNotifications] Error registering Expo push token:', message);
  }
}

/**
 * Hook that registers the device for Expo push notifications whenever
 * a user is authenticated. Place this in the root layout.
 *
 * @param userId - Current authenticated user's UUID (or null if not logged in).
 */
export function useExpoPushNotifications(userId: string | null): void {
  const lastRegisteredUserId = useRef<string | null>(null);

  useEffect(() => {
    // Avoid re-registering for the same user on re-renders
    if (userId && userId !== lastRegisteredUserId.current) {
      lastRegisteredUserId.current = userId;
      registerExpoPushToken(userId);
    }
  }, [userId]);
}
