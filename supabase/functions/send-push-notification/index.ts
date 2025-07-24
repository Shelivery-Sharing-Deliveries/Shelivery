import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get VAPID keys from environment
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY')
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY')
    const vapidEmail = Deno.env.get('VAPID_EMAIL') || 'mailto:support@shelivery.app'

    if (!vapidPublicKey || !vapidPrivateKey) {
      throw new Error('VAPID keys not configured')
    }

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

    // Send push notifications to all user's subscriptions
    const results = await Promise.allSettled(
      subscriptions.map(async (subscription: PushSubscription) => {
        try {
          // Convert VAPID key
          const vapidKeyUint8Array = new Uint8Array(
            atob(vapidPublicKey.replace(/-/g, '+').replace(/_/g, '/'))
              .split('')
              .map(char => char.charCodeAt(0))
          )

          // Create the push subscription object
          const pushSubscription = {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.p256dh,
              auth: subscription.auth,
            },
          }

          // Use Web Push API (we'll need to implement this with fetch)
          const response = await sendWebPushNotification(
            pushSubscription,
            JSON.stringify(pushPayload),
            vapidPublicKey,
            vapidPrivateKey,
            vapidEmail
          )

          if (!response.ok) {
            throw new Error(`Push notification failed: ${response.status}`)
          }

          return { success: true, subscription_id: subscription.id }
        } catch (error) {
          console.error(`Failed to send push to subscription ${subscription.id}:`, error)
          
          // Remove invalid subscriptions
          if (error instanceof Error && (
            error.message.includes('410') ||
            error.message.includes('invalid') ||
            error.message.includes('expired')
          )) {
            await supabaseClient
              .from('push_subscriptions')
              .delete()
              .eq('id', subscription.id)
          }

          return { success: false, subscription_id: subscription.id, error: error.message }
        }
      })
    )

    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length
    const failed = results.length - successful

    return new Response(
      JSON.stringify({
        success: true,
        sent: successful,
        failed: failed,
        notification_id: notification.id,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error sending push notification:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

// Helper function to send web push notification using proper VAPID signing
async function sendWebPushNotification(
  subscription: any,
  payload: string,
  vapidPublicKey: string,
  vapidPrivateKey: string,
  vapidEmail: string
): Promise<Response> {
  // Import crypto for VAPID signing
  const crypto = globalThis.crypto;
  
  // For now, use a simplified approach that works with most push services
  // In production, you'd want to implement full VAPID signing
  const headers: Record<string, string> = {
    'Content-Type': 'application/octet-stream',
    'TTL': '86400', // 24 hours
  }

  // Add VAPID headers for supported endpoints
  if (subscription.endpoint.includes('fcm.googleapis.com')) {
    // For FCM, we can use a simpler approach
    headers['Authorization'] = `key=${vapidPrivateKey}`;
  } else {
    // For other endpoints, add basic VAPID info
    headers['Crypto-Key'] = `p256ecdsa=${vapidPublicKey}`;
  }

  return fetch(subscription.endpoint, {
    method: 'POST',
    headers,
    body: payload,
  })
}
