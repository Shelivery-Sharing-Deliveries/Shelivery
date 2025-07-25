import { supabase } from '@/lib/supabase';

// VAPID key conversion utility
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Helper function to convert ArrayBuffer to base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i] || 0);
  }
  return btoa(binary);
}

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export class PushNotificationManager {
  private vapidPublicKey: string;

  constructor() {
    this.vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
    if (!this.vapidPublicKey) {
      console.warn('VAPID public key not found. Push notifications will not work.');
    }
  }

  // Check if push notifications are supported
  isSupported(): boolean {
    return (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window
    );
  }

  // Check current permission status
  getPermissionStatus(): NotificationPermission {
    if (!this.isSupported()) return 'denied';
    return Notification.permission;
  }

  // Request notification permission
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) {
      throw new Error('Push notifications are not supported');
    }

    const permission = await Notification.requestPermission();
    return permission;
  }

  // Get service worker registration
  private async getServiceWorkerRegistration(): Promise<ServiceWorkerRegistration> {
    if (!('serviceWorker' in navigator)) {
      throw new Error('Service Worker not supported');
    }

    let registration = await navigator.serviceWorker.getRegistration();
    
    if (!registration) {
      // Register service worker if not already registered
      registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;
    }

    return registration;
  }

  // Subscribe to push notifications
  async subscribe(): Promise<PushSubscriptionData | null> {
    try {
      console.log('Starting subscription process...');
      
      // Check permission first
      const permission = await this.requestPermission();
      console.log('Permission status:', permission);
      if (permission !== 'granted') {
        throw new Error('Push notification permission denied');
      }

      // Get service worker registration
      console.log('Getting service worker registration...');
      const registration = await this.getServiceWorkerRegistration();
      console.log('Service worker registration:', registration);

      // Check if already subscribed
      console.log('Checking existing subscription...');
      let subscription = await registration.pushManager.getSubscription();
      console.log('Existing subscription:', subscription);

      if (!subscription) {
        console.log('Creating new subscription with VAPID key...');
        console.log('VAPID key:', this.vapidPublicKey);
        
        try {
          const applicationServerKey = urlBase64ToUint8Array(this.vapidPublicKey);
          console.log('Converted VAPID key:', applicationServerKey);
          
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: applicationServerKey,
          });
          console.log('New subscription created:', subscription);
        } catch (subscribeError) {
          console.error('Failed to create subscription:', subscribeError);
          throw new Error(`Subscription creation failed: ${subscribeError instanceof Error ? subscribeError.message : String(subscribeError)}`);
        }
      }

      if (!subscription) {
        throw new Error('Failed to create push subscription - subscription is null');
      }

      console.log('Processing subscription keys...');
      // Convert subscription to our format using the helper function
      const p256dhKey = subscription.getKey('p256dh');
      const authKey = subscription.getKey('auth');
      console.log('Keys extracted:', { p256dh: !!p256dhKey, auth: !!authKey });

      if (!p256dhKey || !authKey) {
        throw new Error('Missing subscription keys');
      }

      const subscriptionData: PushSubscriptionData = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: arrayBufferToBase64(p256dhKey),
          auth: arrayBufferToBase64(authKey),
        },
      };

      console.log('Subscription data created:', {
        endpoint: subscriptionData.endpoint.substring(0, 50) + '...',
        p256dhLength: subscriptionData.keys.p256dh.length,
        authLength: subscriptionData.keys.auth.length
      });

      // Save subscription to database
      console.log('Saving subscription to database...');
      await this.saveSubscription(subscriptionData);
      console.log('Subscription saved successfully');

      return subscriptionData;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      throw error; // Re-throw the error instead of returning null
    }
  }

  // Save subscription to database
  private async saveSubscription(subscription: PushSubscriptionData): Promise<void> {
    try {
      // Validate subscription data before saving
      if (!subscription.endpoint || !subscription.keys.p256dh || !subscription.keys.auth) {
        throw new Error(`Invalid subscription data: endpoint=${!!subscription.endpoint}, p256dh=${!!subscription.keys.p256dh}, auth=${!!subscription.keys.auth}`);
      }

      // Use the same pattern as your profile page
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error('Auth error:', authError);
        throw authError;
      }
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      console.log('Saving subscription for user:', user.id);

      const subscriptionRecord = {
        user_id: user.id,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        user_agent: navigator.userAgent,
      };

      console.log('Subscription record:', subscriptionRecord);

      // Double-check the record before saving
      if (!subscriptionRecord.endpoint || !subscriptionRecord.p256dh || !subscriptionRecord.auth) {
        throw new Error('Subscription record contains empty values - not saving to database');
      }

      const { error } = await supabase
        .from('push_subscriptions')
        .upsert(subscriptionRecord, {
          onConflict: 'user_id,endpoint'
        });

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      console.log('Push subscription saved successfully');
    } catch (error) {
      console.error('Error saving push subscription:', error);
      throw error;
    }
  }

  // Unsubscribe from push notifications
  async unsubscribe(): Promise<boolean> {
    try {
      const registration = await this.getServiceWorkerRegistration();
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        // Unsubscribe from browser
        const success = await subscription.unsubscribe();
        
        if (success) {
          // Remove from database
          await this.removeSubscription(subscription.endpoint);
        }
        
        return success;
      }

      return true;
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      return false;
    }
  }

  // Remove subscription from database
  private async removeSubscription(endpoint: string): Promise<void> {
    try {
      // Use the same pattern as your profile page
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error('Auth error:', authError);
        throw authError;
      }
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('push_subscriptions')
        .delete()
        .eq('user_id', user.id)
        .eq('endpoint', endpoint);

      if (error) {
        throw error;
      }

      console.log('Push subscription removed successfully');
    } catch (error) {
      console.error('Error removing push subscription:', error);
      throw error;
    }
  }

  // Get current subscription status
  async getSubscriptionStatus(): Promise<{
    isSubscribed: boolean;
    subscription: PushSubscriptionData | null;
  }> {
    try {
      if (!this.isSupported()) {
        return { isSubscribed: false, subscription: null };
      }

      const registration = await this.getServiceWorkerRegistration();
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        const p256dhKey = subscription.getKey('p256dh');
        const authKey = subscription.getKey('auth');

        if (!p256dhKey || !authKey) {
          return { isSubscribed: false, subscription: null };
        }

        const subscriptionData: PushSubscriptionData = {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: arrayBufferToBase64(p256dhKey),
            auth: arrayBufferToBase64(authKey),
          },
        };

        return { isSubscribed: true, subscription: subscriptionData };
      }

      return { isSubscribed: false, subscription: null };
    } catch (error) {
      console.error('Error getting subscription status:', error);
      return { isSubscribed: false, subscription: null };
    }
  }

  // Test push notification (for development)
  async testNotification(): Promise<void> {
    if (!this.isSupported()) {
      throw new Error('Push notifications are not supported');
    }

    const permission = this.getPermissionStatus();
    if (permission !== 'granted') {
      throw new Error('Push notification permission not granted');
    }

    // Show a local notification for testing
    const registration = await this.getServiceWorkerRegistration();
    await registration.showNotification('Shelivery Test', {
      body: 'Push notifications are working!',
      icon: '/icons/shelivery-logo2.png',
      badge: '/icons/shelivery-logo2.png',
      tag: 'test-notification',
      data: {
        url: '/',
      },
    });
  }
}

// Export singleton instance
export const pushNotificationManager = new PushNotificationManager();
