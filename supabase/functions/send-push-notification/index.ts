shoulsimport { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import webpush from 'npm:web-push';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS OPTIONS request.');
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Initialize Supabase Client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 2. Get VAPID keys from environment variables
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY');
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY');
    const vapidEmail = `mailto:${Deno.env.get('VAPID_EMAIL') || 'support@shelivery.app'}`;

    if (!vapidPublicKey || !vapidPrivateKey) {
      console.error('VAPID_PUBLIC_KEY or VAPID_PRIVATE_KEY is not configured.');
      throw new Error('VAPID keys are not configured. Please set VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY environment variables.');
    }

    // 3. Set VAPID details for web-push
    webpush.setVapidDetails(vapidEmail, vapidPublicKey, vapidPrivateKey);
    console.log('web-push library initialized with VAPID keys.');

    // 4. Parse the notification payload from the request body
    console.log('Attempting to parse request body...');
    const notification = await req.json();
    console.log('Parsed incoming notification payload:', notification);

    // Basic validation for required fields in the incoming notification
    if (!notification.user_id || !notification.title || !notification.message) {
      console.error('Invalid incoming payload: Missing user_id, title, or message.');
      return new Response(JSON.stringify({
        error: 'Invalid payload: user_id, title, and message are required.'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 5. Get push subscriptions for the user from Supabase
    console.log(`Fetching push subscriptions for user_id: ${notification.user_id}`);
    const { data: subscriptions, error: subscriptionsError } = await supabaseClient
      .from('push_subscriptions')
      .select('id, endpoint, p256dh, auth, user_id, token_type')
      .eq('user_id', notification.user_id);

    if (subscriptionsError) {
      console.error('Supabase query error for push subscriptions:', subscriptionsError.message, subscriptionsError.details);
      throw new Error(`Failed to fetch subscriptions: ${subscriptionsError.message}`);
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log(`No active push subscriptions found for user ${notification.user_id}.`);
      return new Response(JSON.stringify({
        message: 'No push subscriptions found for this user.'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`Found ${subscriptions.length} subscriptions for user ${notification.user_id}.`);

    // 6. Split into web and expo subscriptions
    const webSubs = subscriptions.filter(s => !s.token_type || s.token_type === 'web');
    const expoSubs = subscriptions.filter(s => s.token_type === 'expo');

    console.log(`Split: ${webSubs.length} web subscriptions, ${expoSubs.length} expo subscriptions.`);

    // 7. Prepare the web push notification payload for the browser
    const pushPayload = {
      title: notification.title,
      body: notification.message,
      icon: '/icons/shelivery-logo2.png',
      badge: '/icons/shelivery-logo2.png',
      data: {
        id: notification.id,
        url: notification.chatroom_id ? `/chatrooms/${notification.chatroom_id}` : '/dashboard',
        chatroom_id: notification.chatroom_id,
        notification_id: notification.id,
        type: notification.type
      },
      actions: [
        {
          action: 'open',
          title: 'Open App',
          icon: '/icons/shelivery-logo2.png'
        }
      ],
      tag: `shelivery-${notification.type}`,
      requireInteraction: notification.type === 'timer',
      vibrate: [200, 100, 200]
    };

    // ── 8. Send to Expo subscribers ──────────────────────────────────────────
    let expoResult: Record<string, unknown> = {};
    let expoSentCount = 0;

    if (expoSubs.length > 0) {
      const expoMessages = expoSubs.map(sub => ({
        to: sub.endpoint, // ExponentPushToken[…]
        sound: 'default',
        title: notification.title,
        body: notification.message,
        data: {
          id: notification.id,
          url: notification.chatroom_id ? `/chatrooms/${notification.chatroom_id}` : '/dashboard',
          chatroom_id: notification.chatroom_id,
          notification_id: notification.id,
          type: notification.type
        }
      }));

      console.log(`Sending ${expoMessages.length} Expo push notifications...`);

      const expoResponse = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip, deflate',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(expoMessages)
      });

      expoResult = await expoResponse.json();
      console.log('Expo push response:', JSON.stringify(expoResult).substring(0, 300));

      // Process tickets and remove DeviceNotRegistered tokens
      const tickets = (expoResult as { data?: Array<{ status: string; details?: { error?: string } }> }).data ?? [];
      const expiredEndpoints: string[] = [];

      tickets.forEach((ticket, index) => {
        if (
          ticket.status === 'error' &&
          ticket.details?.error === 'DeviceNotRegistered'
        ) {
          expiredEndpoints.push(expoSubs[index].endpoint);
        }
      });

      if (expiredEndpoints.length > 0) {
        console.log(`Removing ${expiredEndpoints.length} DeviceNotRegistered Expo tokens...`);
        for (const endpoint of expiredEndpoints) {
          await supabaseClient
            .from('push_subscriptions')
            .delete()
            .eq('endpoint', endpoint);
        }
      }

      expoSentCount = tickets.filter(t => t.status !== 'error').length;
      console.log(`Expo: ${expoSentCount} sent, ${tickets.length - expoSentCount} failed.`);
    }

    // ── 9. Send to web (VAPID) subscribers ──────────────────────────────────
    let webSentCount = 0;
    let webFailedCount = 0;

    if (webSubs.length > 0) {
      console.log('Attempting to send web push notifications to all subscriptions...');
      const webResults = await Promise.allSettled(
        webSubs.map(async (subscription) => {
          try {
            console.log(`Processing subscription ID: ${subscription.id}`);

            if (!subscription.endpoint || !subscription.p256dh || !subscription.auth) {
              throw new Error(`Incomplete subscription data for ID ${subscription.id}. Missing endpoint or keys.`);
            }

            const pushSubscription = {
              endpoint: subscription.endpoint,
              keys: {
                p256dh: subscription.p256dh,
                auth: subscription.auth
              }
            };

            const response = await webpush.sendNotification(
              pushSubscription,
              JSON.stringify(pushPayload),
              { TTL: 86400 }
            );

            console.log(`Push service response for subscription ${subscription.id}: Status ${response.statusCode}`);

            if (response.statusCode >= 400) {
              throw new Error(`Push notification failed for subscription ${subscription.id}: ${response.statusCode} - ${response.body}`);
            }

            console.log(`Successfully sent push to subscription: ${subscription.id}`);
            return { success: true, subscription_id: subscription.id };
          } catch (error) {
            console.error(`Error sending push to subscription ${subscription.id}: ${error.message}`);

            const errorMessage = error.message;
            if (
              errorMessage.includes('410') ||
              errorMessage.includes('404') ||
              errorMessage.includes('invalid') ||
              errorMessage.includes('expired') ||
              errorMessage.includes('Incomplete subscription data')
            ) {
              console.log(`Deleting invalid/expired/incomplete subscription: ${subscription.id}`);
              await supabaseClient.from('push_subscriptions').delete().eq('id', subscription.id);
            }

            return { success: false, subscription_id: subscription.id, error: error.message };
          }
        })
      );

      webSentCount = webResults.filter(r => r.status === 'fulfilled' && r.value.success).length;
      webFailedCount = webResults.length - webSentCount;
      console.log(`Web push summary: ${webSentCount} successful, ${webFailedCount} failed.`);
    }

    // 10. Return combined response
    return new Response(JSON.stringify({
      success: true,
      expo: {
        sent: expoSentCount,
        result: expoResult
      },
      web: {
        sent: webSentCount,
        failed: webFailedCount
      },
      notification_id: notification.id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Unhandled error in Edge Function:', error.message, error.stack);
    return new Response(JSON.stringify({
      error: error.message,
      stack: error.stack
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
