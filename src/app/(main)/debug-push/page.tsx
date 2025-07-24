"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { pushNotificationManager } from '@/lib/push-notifications';

export default function DebugPushPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<string[]>([]);
  const [tableExists, setTableExists] = useState<boolean | null>(null);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const supabase = createClientComponentClient();

  const addLog = (message: string) => {
    console.log(message);
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  // Check if push_subscriptions table exists
  const checkTable = async () => {
    try {
      addLog('Checking if push_subscriptions table exists...');
      const { data, error } = await supabase
        .from('push_subscriptions')
        .select('count', { count: 'exact', head: true });
      
      if (error) {
        addLog(`Table check error: ${error.message}`);
        setTableExists(false);
      } else {
        addLog('push_subscriptions table exists!');
        setTableExists(true);
      }
    } catch (error) {
      addLog(`Table check failed: ${error}`);
      setTableExists(false);
    }
  };

  // Fetch existing subscriptions
  const fetchSubscriptions = async () => {
    if (!user) return;
    console.log('Fetching existing subscriptions for user:', user.id);
    try {
      addLog('Fetching existing subscriptions...');
      const { data, error } = await supabase
        .from('push_subscriptions')
        .select('*');
      console.log('Fetched subscriptions:', data);
      if (error) {
        addLog(`Fetch error: ${error.message}`);
      } else {
        addLog(`Found ${data?.length || 0} subscriptions`);
        // Log detailed subscription data for debugging
        data?.forEach((sub, index) => {
          addLog(`Subscription ${index + 1}:`);
          addLog(`  ID: ${sub.id}`);
          addLog(`  Endpoint: ${sub.endpoint ? sub.endpoint.substring(0, 50) + '...' : 'EMPTY'}`);
          addLog(`  P256DH: ${sub.p256dh ? 'present' : 'missing'}`);
          addLog(`  Auth: ${sub.auth ? 'present' : 'missing'}`);
        });
        setSubscriptions(data || []);
      }
    } catch (error) {
      addLog(`Fetch failed: ${error}`);
    }
  };

  // Test subscription process with detailed debugging
  const testSubscribe = async () => {
    try {
      addLog('Starting subscription process...');
      
      // Check if push notifications are supported
      const isSupported = pushNotificationManager.isSupported();
      addLog(`Push notifications supported: ${isSupported}`);
      
      if (!isSupported) {
        addLog('Push notifications not supported in this browser');
        return;
      }
      
      // Check permission
      const permission = pushNotificationManager.getPermissionStatus();
      addLog(`Current permission: ${permission}`);
      
      if (permission !== 'granted') {
        addLog('Requesting permission...');
        const newPermission = await pushNotificationManager.requestPermission();
        addLog(`New permission: ${newPermission}`);
        
        if (newPermission !== 'granted') {
          addLog('Permission denied, cannot subscribe');
          return;
        }
      }
      
      // Check VAPID key
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      addLog(`VAPID key configured: ${vapidKey ? 'Yes' : 'No'}`);
      if (vapidKey) {
        addLog(`VAPID key length: ${vapidKey.length}`);
      }
      
      // Check service worker
      addLog('Checking service worker registration...');
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        addLog(`Service worker registered: ${registration ? 'Yes' : 'No'}`);
        
        if (!registration) {
          addLog('Registering service worker...');
          const newRegistration = await navigator.serviceWorker.register('/sw.js');
          addLog(`Service worker registration successful: ${!!newRegistration}`);
        }
      }
      
      // Try to subscribe
      addLog('Attempting to subscribe...');
      const subscription = await pushNotificationManager.subscribe();
      
      if (subscription) {
        addLog('Subscription successful!');
        addLog(`Endpoint: ${subscription.endpoint.substring(0, 50)}...`);
        addLog(`P256DH key length: ${subscription.keys.p256dh.length}`);
        addLog(`Auth key length: ${subscription.keys.auth.length}`);
        await fetchSubscriptions();
      } else {
        addLog('Subscription failed - returned null');
      }
    } catch (error) {
      addLog(`Subscribe error: ${error}`);
      console.error('Detailed subscription error:', error);
    }
  };

  // Test unsubscribe
  const testUnsubscribe = async () => {
    try {
      addLog('Starting unsubscribe process...');
      const success = await pushNotificationManager.unsubscribe();
      addLog(`Unsubscribe ${success ? 'successful' : 'failed'}`);
      await fetchSubscriptions();
    } catch (error) {
      addLog(`Unsubscribe error: ${error}`);
    }
  };

  // Test edge function directly
  const testEdgeFunction = async () => {
    if (!user) {
      alert('Please log in first');
      return;
    }

    try {
      addLog('Testing edge function directly...');
      
      const testPayload = {
        id: `test-${Date.now()}`,
        title: 'Direct Edge Function Test',
        message: 'This is a test notification sent directly to the edge function!',
        type: 'info',
        user_id: user.id
      };

      addLog(`Sending payload: ${JSON.stringify(testPayload, null, 2)}`);

      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-push-notification`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testPayload)
      });

      const result = await response.json();
      addLog(`Edge function response: ${JSON.stringify(result, null, 2)}`);

      if (response.ok) {
        addLog('Edge function test successful!');
      } else {
        addLog(`Edge function test failed: ${response.status}`);
      }
    } catch (error) {
      addLog(`Edge function test error: ${error}`);
    }
  };

  // Clean up invalid subscriptions
  const cleanupSubscriptions = async () => {
    if (!user) {
      alert('Please log in first');
      return;
    }

    try {
      addLog('Cleaning up invalid subscriptions...');
      
      // Delete subscriptions with empty endpoints
      const { error } = await supabase
        .from('push_subscriptions')
        .delete()
        .or('endpoint.is.null,endpoint.eq.,p256dh.is.null,p256dh.eq.,auth.is.null,auth.eq.');

      if (error) {
        addLog(`Cleanup error: ${error.message}`);
      } else {
        addLog('Invalid subscriptions cleaned up');
        await fetchSubscriptions();
      }
    } catch (error) {
      addLog(`Cleanup failed: ${error}`);
    }
  };

  // Clear logs
  const clearLogs = () => {
    setLogs([]);
  };

  useEffect(() => {
    if (user) {
      checkTable();
      fetchSubscriptions();
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-white w-full max-w-[375px] mx-auto p-4">
      <div className="space-y-4">
        <h1 className="text-xl font-bold">Push Notification Debug</h1>
        
        {/* User Info */}
        <div className="p-3 bg-gray-100 rounded">
          <h2 className="font-semibold">User Status</h2>
          <p>Logged in: {user ? 'Yes' : 'No'}</p>
          <p>User ID: {user?.id || 'N/A'}</p>
          <p>VAPID Key: {process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ? 'Configured' : 'Missing'}</p>
        </div>

        {/* Table Status */}
        <div className="p-3 bg-gray-100 rounded">
          <h2 className="font-semibold">Database Status</h2>
          <p>Table exists: {tableExists === null ? 'Checking...' : tableExists ? 'Yes' : 'No'}</p>
          <p>Subscriptions found: {subscriptions.length}</p>
        </div>

        {/* Existing Subscriptions */}
        {subscriptions.length > 0 && (
          <div className="p-3 bg-green-50 rounded">
            <h2 className="font-semibold">Existing Subscriptions</h2>
            {subscriptions.map((sub, index) => (
              <div key={sub.id} className="text-sm mt-2">
                <p>#{index + 1}: {sub.endpoint.substring(0, 50)}...</p>
                <p>Created: {new Date(sub.created_at).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          <Button onClick={checkTable} variant="secondary" className="w-full">
            Check Table
          </Button>
          <Button onClick={fetchSubscriptions} variant="secondary" className="w-full">
            Fetch Subscriptions
          </Button>
          <Button onClick={testSubscribe} variant="primary" className="w-full">
            Test Subscribe
          </Button>
          <Button onClick={testUnsubscribe} variant="error" className="w-full">
            Test Unsubscribe
          </Button>
          <Button onClick={testEdgeFunction} variant="primary" className="w-full">
            Test Edge Function
          </Button>
          <Button onClick={cleanupSubscriptions} variant="error" className="w-full">
            Cleanup Invalid Subscriptions
          </Button>
        </div>

        {/* Logs */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold">Debug Logs</h2>
            <Button onClick={clearLogs} variant="secondary" size="sm">
              Clear
            </Button>
          </div>
          <div className="p-3 bg-gray-50 rounded max-h-64 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-500">No logs yet...</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="text-xs font-mono mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
