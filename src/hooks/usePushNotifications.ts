"use client";

import { useState, useEffect, useCallback } from 'react';
import { pushNotificationManager, PushSubscriptionData } from '@/lib/push-notifications';
import { useAuth } from '@/hooks/useAuth';

export interface PushNotificationState {
  isSupported: boolean;
  permission: NotificationPermission;
  isSubscribed: boolean;
  subscription: PushSubscriptionData | null;
  isLoading: boolean;
  error: string | null;
}

export function usePushNotifications() {
  const { user } = useAuth();
  const [state, setState] = useState<PushNotificationState>({
    isSupported: false,
    permission: 'default',
    isSubscribed: false,
    subscription: null,
    isLoading: true,
    error: null,
  });

  // Initialize push notification state
  const initializePushNotifications = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const isSupported = pushNotificationManager.isSupported();
      const permission = pushNotificationManager.getPermissionStatus();
      
      let isSubscribed = false;
      let subscription: PushSubscriptionData | null = null;

      if (isSupported && user) {
        const status = await pushNotificationManager.getSubscriptionStatus();
        isSubscribed = status.isSubscribed;
        subscription = status.subscription;
      }

      setState({
        isSupported,
        permission,
        isSubscribed,
        subscription,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error initializing push notifications:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to initialize push notifications',
      }));
    }
  }, [user]);

  // Subscribe to push notifications
  const subscribe = useCallback(async (): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const subscription = await pushNotificationManager.subscribe();
      
      if (subscription) {
        const permission = pushNotificationManager.getPermissionStatus();
        setState(prev => ({
          ...prev,
          permission,
          isSubscribed: true,
          subscription,
          isLoading: false,
          error: null,
        }));
        return true;
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to subscribe to push notifications',
        }));
        return false;
      }
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to subscribe to push notifications',
      }));
      return false;
    }
  }, []);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const success = await pushNotificationManager.unsubscribe();
      
      if (success) {
        setState(prev => ({
          ...prev,
          isSubscribed: false,
          subscription: null,
          isLoading: false,
          error: null,
        }));
        return true;
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to unsubscribe from push notifications',
        }));
        return false;
      }
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to unsubscribe from push notifications',
      }));
      return false;
    }
  }, []);

  // Request permission (without subscribing)
  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const permission = await pushNotificationManager.requestPermission();
      
      setState(prev => ({
        ...prev,
        permission,
        isLoading: false,
        error: null,
      }));

      return permission;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to request notification permission',
      }));
      return 'denied';
    }
  }, []);

  // Test push notification
  const testNotification = useCallback(async (): Promise<boolean> => {
    try {
      await pushNotificationManager.testNotification();
      return true;
    } catch (error) {
      console.error('Error testing push notification:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to test push notification',
      }));
      return false;
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Initialize on mount and when user changes
  useEffect(() => {
    initializePushNotifications();
  }, [initializePushNotifications]);

  // Auto-subscribe for authenticated users (optional)
  const autoSubscribe = useCallback(async () => {
    if (
      user &&
      state.isSupported &&
      state.permission === 'granted' &&
      !state.isSubscribed &&
      !state.isLoading
    ) {
      await subscribe();
    }
  }, [user, state.isSupported, state.permission, state.isSubscribed, state.isLoading, subscribe]);

  // Uncomment the following useEffect if you want to auto-subscribe users
  // useEffect(() => {
  //   autoSubscribe();
  // }, [autoSubscribe]);

  return {
    ...state,
    subscribe,
    unsubscribe,
    requestPermission,
    testNotification,
    clearError,
    refresh: initializePushNotifications,
  };
}
