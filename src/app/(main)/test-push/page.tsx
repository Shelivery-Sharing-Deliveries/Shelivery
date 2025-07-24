"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { PushNotificationSettings } from '@/components/ui/PushNotificationSettings';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useAuth } from '@/hooks/useAuth';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function TestPushPage() {
  const { user } = useAuth();
  const { isSubscribed, testNotification } = usePushNotifications();
  const [isTestingDB, setIsTestingDB] = useState(false);
  const supabase = createClientComponentClient();

  const handleTestLocalNotification = async () => {
    try {
      const success = await testNotification();
      if (success) {
        alert('Local test notification sent!');
      } else {
        alert('Failed to send local test notification');
      }
    } catch (error) {
      console.error('Error testing local notification:', error);
      alert('Error testing local notification');
    }
  };

  const handleTestDatabaseNotification = async () => {
    if (!user) {
      alert('Please log in first');
      return;
    }

    setIsTestingDB(true);
    try {
      // Insert a test notification into the database
      // This should trigger the database trigger and send a push notification
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          title: 'Database Test',
          message: 'This is a test notification from the database trigger!',
          type: 'info',
        });

      if (error) {
        console.error('Error inserting test notification:', error);
        alert('Failed to insert test notification');
      } else {
        alert('Test notification inserted into database! Check your device for push notification.');
      }
    } catch (error) {
      console.error('Error testing database notification:', error);
      alert('Error testing database notification');
    } finally {
      setIsTestingDB(false);
    }
  };

  return (
    <div className="min-h-screen bg-white w-full max-w-[375px] mx-auto p-4">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-center">Push Notification Test</h1>
        
        {/* User Info */}
        <div className="p-4 bg-gray-100 rounded-lg">
          <h2 className="font-semibold mb-2">User Status</h2>
          <p>Logged in: {user ? 'Yes' : 'No'}</p>
          <p>User ID: {user?.id || 'N/A'}</p>
          <p>Push subscribed: {isSubscribed ? 'Yes' : 'No'}</p>
        </div>

        {/* Push Notification Settings */}
        <PushNotificationSettings />

        {/* Test Buttons */}
        <div className="space-y-4">
          <h2 className="font-semibold">Test Notifications</h2>
          
          <Button
            onClick={handleTestLocalNotification}
            disabled={!isSubscribed}
            variant="primary"
            className="w-full"
          >
            Test Local Notification
          </Button>

          <Button
            onClick={handleTestDatabaseNotification}
            disabled={!user || !isSubscribed || isTestingDB}
            variant="secondary"
            className="w-full"
          >
            {isTestingDB ? 'Testing...' : 'Test Database Notification'}
          </Button>

          <div className="text-sm text-gray-600 space-y-2">
            <p><strong>Local Test:</strong> Shows a notification directly from the browser</p>
            <p><strong>Database Test:</strong> Inserts a notification into the database, which should trigger a push notification via the edge function</p>
          </div>
        </div>

        {/* Instructions */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">Testing Instructions</h3>
          <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
            <li>First, subscribe to push notifications above</li>
            <li>Test the local notification to verify browser support</li>
            <li>Test the database notification to verify the full system</li>
            <li>For iOS: Make sure the PWA is installed on your home screen</li>
            <li>For best results, minimize the browser/app after testing</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
