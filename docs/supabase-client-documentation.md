# Supabase Client Documentation

## Overview

The `src/lib/supabase.ts` file provides the complete TypeScript interface for interacting with our Supabase backend. This document covers all database operations, RPC functions, and type definitions available for the Shelivery MVP frontend.

## Configuration

### Environment Variables
```typescript
NEXT_PUBLIC_SUPABASE_URL=https://zsqagqzztvzogyktgjph.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Client Setup
```typescript
import { supabase } from '@/lib/supabase'

// Client is pre-configured with:
// - Auto refresh tokens
// - Session persistence
// - Session detection from URL
// - Real-time subscriptions (10 events/second)
```

## Database Schema

### Core Tables

#### 1. User Management
- **`user`**: User profiles linked to auth.users
- **`dormitory`**: Student dormitories for geographic grouping
- **`invitation`**: Invite-only access control

#### 2. Shopping System
- **`shop`**: Available stores with minimum order amounts
- **`basket`**: User shopping carts with amounts and links
- **`pool`**: Shared pools per shop×dormitory combination

#### 3. Chat System
- **`chatroom`**: Dynamic chat rooms created when pools fill
- **`message`**: Real-time messages within chat rooms
- **`chat_membership`**: User participation in chat rooms

#### 4. Analytics & Feedback
- **`analytics_event`**: User behavior tracking
- **`user_feedback`**: User experience feedback
- **`order`**: Completed order records

## RPC Functions Reference

### 1. Basket & Pool Management

#### `create_basket_and_join_pool`
Creates a user's basket and automatically joins the appropriate pool.

```typescript
const basketId = await supabase.rpc('create_basket_and_join_pool', {
  shop_id_param: 1,
  amount_param: 25.50,
  link_param: 'https://shop.com/cart/abc123' // optional
})
```

**Parameters:**
- `shop_id_param` (number): Target shop ID
- `amount_param` (number): Basket total amount
- `link_param` (string, optional): Shopping cart URL

**Returns:** UUID of created basket

**Business Logic:**
- Automatically finds or creates pool for shop×dormitory
- Adds user to pool membership
- Sets basket status to 'in_pool'

#### `toggle_basket_ready`
Toggles a basket's readiness state in the pool.

```typescript
const isReady = await supabase.rpc('toggle_basket_ready', {
  basket_id_param: 'basket-uuid-here'
})
```

**Parameters:**
- `basket_id_param` (string): Basket UUID

**Returns:** New readiness state (boolean)

**Business Logic:**
- Updates pool current_amount automatically via triggers
- When pool reaches threshold, triggers chat room creation
- Only basket owner can toggle their readiness

#### `get_pool_status`
Retrieves comprehensive pool information including user's basket.

```typescript
const poolData = await supabase.rpc('get_pool_status', {
  pool_id_param: 'pool-uuid-here'
})
```

**Returns:**
```typescript
{
  pool: {
    id: string
    current_amount: number
    min_amount: number
    progress_percentage: number
    shop_name: string
    dormitory_name: string
  }
  user_basket: {
    id: string | null
    amount: number | null
    is_ready: boolean | null
    status: 'in_pool' | 'in_chat' | 'resolved'
    link: string | null
  }
  ready_baskets_count: number
  total_baskets_count: number
}
```

### 2. Chat Management

#### `resolve_chatroom`
Completes a chat room (admin only) and marks all baskets as resolved.

```typescript
const success = await supabase.rpc('resolve_chatroom', {
  chatroom_id_param: 'chatroom-uuid-here'
})
```

**Parameters:**
- `chatroom_id_param` (string): Chat room UUID

**Returns:** Success boolean

**Business Logic:**
- Only chat room admin can resolve
- Sets chatroom state to 'resolved'
- Updates all baskets in chat to 'resolved' status
- Creates order record

#### `leave_chatroom`
Allows user to exit a chat room and return baskets to pool.

```typescript
const success = await supabase.rpc('leave_chatroom', {
  chatroom_id_param: 'chatroom-uuid-here'
})
```

**Parameters:**
- `chatroom_id_param` (string): Chat room UUID

**Returns:** Success boolean

**Business Logic:**
- Marks chat membership as left
- Returns user's baskets to 'in_pool' status
- Resets basket readiness to false

### 3. Invitation System

#### `create_invitation`
Generates a new invitation code (authenticated users only).

```typescript
const inviteCode = await supabase.rpc('create_invitation', {
  expires_in_days: 7 // optional, defaults to 7
})
```

**Parameters:**
- `expires_in_days` (number, optional): Expiration period (default: 7)

**Returns:** 8-character invitation code (string)

**Business Logic:**
- Generates unique uppercase code
- Links to creating user
- Sets expiration date

#### `validate_invitation`
Validates and consumes an invitation code.

```typescript
const isValid = await supabase.rpc('validate_invitation', {
  invitation_code_param: 'WELCOME1'
})
```

**Parameters:**
- `invitation_code_param` (string): Invitation code to validate

**Returns:** Validation success (boolean)

**Business Logic:**
- Checks code exists and hasn't expired
- Marks invitation as used by current user
- One-time use only

### 4. Dashboard & Analytics

#### `get_dashboard_data`
Retrieves complete user dashboard information.

```typescript
const dashboard = await supabase.rpc('get_dashboard_data')
```

**Returns:**
```typescript
{
  user: {
    id: string
    email: string
    profile: object
    dormitory_name: string
  }
  active_baskets: Array<{
    id: string
    amount: number
    status: 'in_pool' | 'in_chat' | 'resolved'
    is_ready: boolean
    shop_name: string
    created_at: string
  }>
  available_shops: Array<{
    id: number
    name: string
    min_amount: number
  }>
}
```

#### `track_event`
Records analytics events for user behavior tracking.

```typescript
const eventId = await supabase.rpc('track_event', {
  event_type_param: 'basket_created',
  metadata_param: { shop_id: 1, amount: 25.50 } // optional
})
```

**Parameters:**
- `event_type_param` (string): Event type identifier
- `metadata_param` (object, optional): Additional event data

**Returns:** Event UUID

## Real-time Subscriptions

### Pool Progress Updates
Monitor pool amount changes in real-time:

```typescript
const poolSubscription = supabase
  .channel('pool-progress')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'pool',
    filter: `id=eq.${poolId}`
  }, (payload) => {
    // Update pool progress UI
    const newAmount = payload.new.current_amount
    const percentage = (newAmount / payload.new.min_amount) * 100
    updatePoolProgress(percentage)
  })
  .subscribe()
```

### Chat Messages
Real-time message subscription:

```typescript
const messageSubscription = supabase
  .channel('chat-messages')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'message',
    filter: `chatroom_id=eq.${chatroomId}`
  }, (payload) => {
    // Add new message to chat UI
    addMessageToChat(payload.new)
  })
  .subscribe()
```

### Basket Status Changes
Monitor basket status updates:

```typescript
const basketSubscription = supabase
  .channel('basket-updates')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'basket',
    filter: `user_id=eq.${userId}`
  }, (payload) => {
    // Update basket status in UI
    updateBasketStatus(payload.new)
  })
  .subscribe()
```

## Type Definitions

### Table Types
Use the exported types for type-safe database operations:

```typescript
import { Tables, Database } from '@/lib/supabase'

// Row types
type User = Tables<'user'>
type Basket = Tables<'basket'>
type Pool = Tables<'pool'>
type Message = Tables<'message'>

// Enum types
type BasketStatus = Database['public']['Enums']['basket_status']
type ChatroomState = Database['public']['Enums']['chatroom_state']
```

### Insert Types
For creating new records:

```typescript
type NewBasket = Database['public']['Tables']['basket']['Insert']
type NewMessage = Database['public']['Tables']['message']['Insert']
```

### Update Types
For updating existing records:

```typescript
type BasketUpdate = Database['public']['Tables']['basket']['Update']
type UserUpdate = Database['public']['Tables']['user']['Update']
```

## Error Handling

### RPC Function Errors
```typescript
try {
  const result = await supabase.rpc('create_basket_and_join_pool', params)
  if (result.error) {
    console.error('RPC Error:', result.error.message)
    return
  }
  // Handle success
} catch (error) {
  console.error('Network Error:', error)
}
```

### Row Level Security Errors
```typescript
const { data, error } = await supabase
  .from('basket')
  .select('*')
  .eq('user_id', userId)

if (error && error.code === '42501') {
  // RLS policy violation - user not authorized
  console.error('Access denied:', error.message)
}
```

## Security Notes

### Row Level Security (RLS)
All tables have RLS enabled with policies that ensure:
- Users can only access their own data
- Users can view data from their dormitory where appropriate
- Public data (shops, dormitories) is readable by authenticated users
- Admin functions require proper authorization

### Data Access Patterns
- **User Data**: Users can only read/write their own profiles and baskets
- **Pool Data**: Users can view pools for their dormitory
- **Chat Data**: Users can only access chats they're members of
- **Invitation Data**: Users can create invitations and view ones they created

## Testing Functions

### Available Test Invitation Codes
Pre-seeded invitation codes for development:
- `WELCOME1`
- `TESTALPH`
- `BETAUSER`
- `STUDENT1`
- `DEMO2025`

### Test Data
Pre-seeded dormitories and shops are available for testing pool creation and basket management.

## Migration Notes

### Database Triggers
The following triggers handle automatic business logic:
- **Pool Amount Updates**: Automatically update pool totals when baskets change readiness
- **Chat Room Creation**: Create chat rooms when pools reach threshold
- **User Profile Creation**: Create user profiles when auth users are created

### Future Considerations
- Real-time performance optimization for high-traffic pools
- Horizontal scaling for large numbers of concurrent chat rooms
- Advanced analytics aggregation for usage insights

---

For additional support or questions about the Supabase integration, refer to the main project documentation or the Supabase official documentation.
