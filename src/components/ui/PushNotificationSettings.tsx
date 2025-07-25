"use client";
import { useState, useCallback } from 'react'; // Added useCallback
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { Button } from '@/components/ui/Button';




export function PushNotificationSettings() {
  const {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    error,
    subscribe,
    unsubscribe,
    requestPermission,
    testNotification,
    clearError,
  } = usePushNotifications();

  const [isTesting, setIsTesting] = useState(false);

  const handleSubscribe = async () => {
    const success = await subscribe();
    if (success) {
      console.log('Successfully subscribed to push notifications');
    }
  };

  const handleUnsubscribe = async () => {
    const success = await unsubscribe();
    if (success) {
      console.log('Successfully unsubscribed from push notifications');
    }
  };

  const handleRequestPermission = async () => {
    const newPermission = await requestPermission();
    console.log('Permission status:', newPermission);
  };

  const handleTestNotification = async () => {
    setIsTesting(true);
    try {
      const success = await testNotification();
      if (success) {
        console.log('Test notification sent');
      }
    } finally {
      setIsTesting(false);
    }
  };

  if (!isSupported) {
    return (
      <div className="p-4 bg-gray-100 rounded-lg">
        <h3 className="font-semibold text-gray-800 mb-2">Push Notifications</h3>
        <p className="text-gray-600 text-sm">
          Push notifications are not supported on this device or browser.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white border rounded-lg shadow-sm">
      <h3 className="font-semibold text-gray-800 mb-4">Push Notifications</h3>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700 text-sm">{error}</p>
          <button
            onClick={clearError}
            className="text-red-600 hover:text-red-800 text-sm underline mt-1"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-700">Permission Status</p>
            <p className="text-sm text-gray-500 capitalize">{permission}</p>
          </div>
          {permission === 'default' && (
            <Button
              onClick={handleRequestPermission}
              disabled={isLoading}
              variant="secondary"
              size="sm"
            >
              Request Permission
            </Button>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-700">Subscription Status</p>
            <p className="text-sm text-gray-500">
              {isSubscribed ? 'Subscribed' : 'Not subscribed'}
            </p>
          </div>
          {permission === 'granted' && (
            <Button
              onClick={isSubscribed ? handleUnsubscribe : handleSubscribe}
              disabled={isLoading}
              variant={isSubscribed ? "secondary" : "primary"}
              size="sm"
            >
              {isLoading ? 'Loading...' : isSubscribed ? 'Unsubscribe' : 'Subscribe'}
            </Button>
          )}
        </div>


        {/*
        {isSubscribed && (
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-700">Test Notifications</p>
              <p className="text-sm text-gray-500">Send a test push notification</p>
            </div>
            <Button
              onClick={handleTestNotification}
              disabled={isTesting}
              variant="secondary"
              size="sm"
            >
              {isTesting ? 'Sending...' : 'Test'}
            </Button>
          </div>


        )} */}
      </div> 

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-blue-700 text-sm">
          <strong>Note:</strong> Push notifications will be sent when you receive new messages, 
          basket updates, or other important notifications while the app is not active.
        </p>
      </div>
    </div>
  );
}
