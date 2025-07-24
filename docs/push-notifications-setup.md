# Push Notifications Setup Guide for Shelivery PWA

This guide covers the complete setup of push notifications for iOS and Android devices in your Shelivery PWA.

## Overview

The push notification system consists of:
1. **Client-side**: Service Worker, Push Manager, and React components
2. **Database**: Push subscriptions storage and notification triggers
3. **Server-side**: Supabase Edge Function for sending notifications
4. **VAPID Keys**: For secure push notification authentication

## Prerequisites

1. VAPID keys generated
2. Supabase project with Edge Functions enabled
3. Service Worker registered
4. PWA manifest configured

## Setup Steps

### 1. Generate VAPID Keys

```bash
# Install web-push globally
npm install -g web-push

# Generate VAPID keys
web-push generate-vapid-keys
```

Add the keys to your environment variables:
```env
# .env.local
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key_here
VAPID_PRIVATE_KEY=your_private_key_here
VAPID_EMAIL=mailto:your-email@domain.com
```

### 2. Database Setup

Run the migration to create the push subscriptions table:

```bash
supabase db push
```

This creates:
- `push_subscriptions` table for storing user subscriptions
- Database trigger that calls the Edge Function when notifications are inserted
- RLS policies for security

### 3. Deploy Edge Function

Deploy the push notification Edge Function to Supabase:

```bash
supabase functions deploy send-push-notification
```

Set the environment variables for the Edge Function:

```bash
supabase secrets set VAPID_PUBLIC_KEY=your_public_key_here
supabase secrets set VAPID_PRIVATE_KEY=your_private_key_here
supabase secrets set VAPID_EMAIL=mailto:your-email@domain.com
```

### 4. Service Worker Configuration

The service worker (`public/sw.js`) handles:
- Push event listening
- Notification display
- Click handling and navigation

### 5. Client Integration

The push notification system is integrated into your app through:

- **`pushNotificationManager`**: Core push notification logic
- **`usePushNotifications`**: React hook for managing state
- **`NotificationsContext`**: Auto-initialization for authenticated users
- **`PushNotificationSettings`**: UI component for user preferences

## Usage

### Automatic Integration

Push notifications are automatically initialized when users log in through the `NotificationsContext`. If permission is already granted, users are auto-subscribed.

### Manual Control

Users can manage their push notification preferences using the `PushNotificationSettings` component:

```tsx
import { PushNotificationSettings } from '@/components/ui/PushNotificationSettings';

function SettingsPage() {
  return (
    <div>
      <h1>Settings</h1>
      <PushNotificationSettings />
    </div>
  );
}
```

### Sending Notifications

Notifications are automatically sent when records are inserted into the `public.notifications` table:

```sql
INSERT INTO public.notifications (user_id, title, message, type, chatroom_id)
VALUES ('user-uuid', 'New Message', 'You have a new message in your basket chat', 'message', 'chatroom-uuid');
```

## Platform-Specific Considerations

### iOS (Safari/PWA)

- Requires iOS 16.4+ for push notifications in PWAs
- Users must add the PWA to their home screen first
- Push notifications only work when the PWA is installed
- Requires user gesture to request permission

### Android (Chrome/PWA)

- Works in both browser and installed PWA
- More flexible permission model
- Better background processing support
- Supports rich notifications with actions

## Testing

### 1. Test Local Notifications

Use the test function in the push notification manager:

```typescript
import { pushNotificationManager } from '@/lib/push-notifications';

// Test if notifications work
await pushNotificationManager.testNotification();
```

### 2. Test Push Notifications

1. Subscribe to push notifications
2. Insert a test notification into the database
3. Verify the notification appears on the device

### 3. Debug Issues

Check browser console for:
- Service worker registration errors
- Push subscription failures
- VAPID key issues
- Network errors

## Security Considerations

1. **VAPID Keys**: Keep private keys secure and never expose them client-side
2. **RLS Policies**: Ensure users can only manage their own subscriptions
3. **Authentication**: Verify user authentication before sending notifications
4. **Rate Limiting**: Consider implementing rate limiting for notification sending

## Troubleshooting

### Common Issues

1. **"Push notifications not supported"**
   - Check if running on HTTPS
   - Verify service worker is registered
   - Ensure browser supports push notifications

2. **"Permission denied"**
   - User must manually grant permission
   - On iOS, PWA must be installed first
   - Check if site is blocked in browser settings

3. **"Subscription failed"**
   - Verify VAPID keys are correct
   - Check network connectivity
   - Ensure service worker is active

4. **"Notifications not received"**
   - Check if Edge Function is deployed
   - Verify database trigger is working
   - Check Supabase logs for errors

### Debugging Commands

```bash
# Check Edge Function logs
supabase functions logs send-push-notification

# Test Edge Function directly
curl -X POST 'https://your-project.supabase.co/functions/v1/send-push-notification' \
  -H 'Authorization: Bearer your-anon-key' \
  -H 'Content-Type: application/json' \
  -d '{"id":"test","title":"Test","message":"Test message","type":"info","user_id":"user-uuid"}'
```

## Best Practices

1. **Progressive Enhancement**: Always provide fallback for unsupported devices
2. **User Control**: Let users easily enable/disable notifications
3. **Relevant Content**: Only send important, actionable notifications
4. **Timing**: Respect user time zones and quiet hours
5. **Cleanup**: Remove invalid subscriptions automatically

## Integration with Existing Features

The push notification system integrates with your existing notification system:

- **Chat Messages**: Notify users of new messages when app is not active
- **Basket Updates**: Alert users when baskets are updated or timers expire
- **Pool Status**: Notify when pools reach capacity or deadlines approach
- **System Alerts**: Send important app-wide notifications

## Performance Considerations

- Push subscriptions are cached and reused
- Invalid subscriptions are automatically cleaned up
- Edge Function handles multiple subscriptions efficiently
- Database triggers are optimized for performance

This implementation provides a robust, scalable push notification system that works across iOS and Android devices while maintaining security and user privacy.
