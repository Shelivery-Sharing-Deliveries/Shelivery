import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import webpush from 'web-push'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PushSubscription {
  id: string
  user_id: string
  endpoint: string
  p256dh: string
  auth: string
}

interface NotificationPayload {
  id: string
  title: string
  message: string
  type: string
  chatroom_id?: string
  user_id: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Configure VAPID details
    const vapidPublicKey = Deno.env.get('NEXT_PUBLIC_VAPID_PUBLIC_KEY') || Deno.env.get('VAPID_PUBLIC_KEY');
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY');
    const vapidEmail = Deno.env.get('VAPID_EMAIL');

    console.log('VAPID configuration:', {
      public: !!vapidPublicKey,
      private: !!vapidPrivateKey,
      email: !!vapidEmail
    });

    if (!vapidPublicKey || !vapidPrivateKey || !vapidEmail) {
      throw new Error('VAPID keys not configured properly');
    }

    webpush.setVapidDetails(
      `mailto:${vapidEmail}`,
      vapidPublicKey,
      vapidPrivateKey
    );

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Parse the notification payload from the request
    const notification: NotificationPayload = await req.json()

    // Get push subscriptions for the user
    const { data: subscriptions, error: subscriptionsError } = await supabaseClient
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', notification.user_id)

    if (subscriptionsError) {
      throw subscriptionsError
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log(`No push subscriptions found for user ${notification.user_id}`)
      return new Response(
        JSON.stringify({ message: 'No push subscriptions found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Prepare the push notification payload
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
        type: notification.type,
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
      vibrate: [200, 100, 200],
    }

    console.log('Sending push notifications to', subscriptions.length, 'subscriptions')
    console.log('Push payload:', pushPayload)

    // Send push notifications to all user's subscriptions
    const results = await Promise.allSettled(
      subscriptions.map(async (subscription) => {
        try {
          console.log('Processing subscription:', subscription.id)
          console.log('Subscription data:', {
            endpoint: subscription.endpoint ? subscription.endpoint.substring(0, 50) + '...' : 'EMPTY',
            p256dh: subscription.p256dh ? 'present' : 'missing',
            auth: subscription.auth ? 'present' : 'missing'
          })
          
          // Validate subscription data
          if (!subscription.endpoint || !subscription.p256dh || !subscription.auth) {
            throw new Error(`Invalid subscription data: endpoint=${!!subscription.endpoint}, p256dh=${!!subscription.p256dh}, auth=${!!subscription.auth}`)
          }

          // Create the push subscription object for web push
          const pushSubscription = {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.p256dh,
              auth: subscription.auth,
            },
          }

          // Send the actual push notification using web-push library
          await webpush.sendNotification(
            pushSubscription,
            JSON.stringify(pushPayload)
          );

          console.log('Push notification sent successfully to subscription:', subscription.id)
          return { success: true, subscription_id: subscription.id }
        } catch (error: any) {
          console.error(`Failed to send push to subscription ${subscription.id}:`, error)
          
          // Remove invalid subscriptions
          if (error && (
            error.statusCode === 410 ||
            error.message?.includes('invalid') ||
            error.message?.includes('expired') ||
            error.message?.includes('Invalid subscription data')
          )) {
            console.log('Removing invalid subscription:', subscription.id)
            await supabaseClient
              .from('push_subscriptions')
              .delete()
              .eq('id', subscription.id)
          }

          return { success: false, subscription_id: subscription.id, error: error.message || String(error) }
        }
      })
    )

    const successful = results.filter((r: any) => r.status === 'fulfilled' && r.value.success).length
    const failed = results.length - successful

    console.log(`Push notification results: ${successful} successful, ${failed} failed`)

    return new Response(
      JSON.stringify({
        success: true,
        sent: successful,
        failed: failed,
        notification_id: notification.id,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error('Error in push notification function:', error)
    return new Response(
      JSON.stringify({ error: error.message || String(error) }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
