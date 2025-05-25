# Slack Clone to Shelivery Chat Adaptation Analysis

## Overview
This document analyzes the Supabase Slack clone implementation and outlines the adaptation strategy for Shelivery's pool-based chat system, converting from Pages Router to App Router.

## Key Patterns from Slack Clone

### 1. Real-time Architecture
```javascript
// Real-time subscription pattern
const messageListener = supabase
  .channel('public:messages')
  .on('postgres_changes', { 
    event: 'INSERT', 
    schema: 'public', 
    table: 'messages' 
  }, (payload) => handleNewMessage(payload.new))
  .subscribe()
```

**Key Features:**
- Separate channels for messages, users, channels
- Postgres change events (INSERT, DELETE, UPDATE)
- State management with useEffect hooks
- Automatic cleanup on unmount

### 2. State Management Pattern
```javascript
// Custom useStore hook
const { messages, channels } = useStore({ channelId })
```

**State Structure:**
- `messages`: Array with mapped authors
- `channels`: Sorted array of available channels  
- `users`: Map for efficient user lookups
- Real-time updates via state setters

### 3. Component Architecture
- **Message**: Display + delete permissions
- **MessageInput**: Controlled input with Enter submission
- **Layout**: Sidebar navigation + main content area
- **UserContext**: Global user state and auth

### 4. Database Relationships
```sql
-- Slack Clone Schema (simplified)
messages {
  id, message, channel_id, user_id, inserted_at
}
channels {
  id, slug, created_by
}
users {
  id, username, email
}
```

## Shelivery Adaptation Strategy

### 1. Schema Mapping

| Slack Clone | Shelivery | Purpose |
|-------------|-----------|---------|
| `channels` | `pools` | Container for chat |
| `messages` | `messages` | Chat messages |
| `channel_id` | `pool_id` | Foreign key relationship |
| `channels.slug` | `pools.shop_name + dorm` | Display name |
| Navigation by channel | Navigation by pool | Routing structure |

### 2. Pages Router → App Router Conversion

#### File Structure Mapping:
```
Pages Router                    App Router
├── pages/_app.js              ├── src/app/layout.tsx ✅
├── pages/index.js             ├── src/app/page.tsx ✅
├── pages/channels/[id].js     ├── src/app/pool/[poolId]/chatroom/page.tsx
└── components/                └── src/components/
```

#### Key Differences:
- **Layout**: Global layout in `app/layout.tsx` instead of `_app.js`
- **Routing**: File-based routing changes from `pages/` to `app/`
- **Data Fetching**: Server Components vs client-side fetching
- **Context**: Next.js 13+ context patterns

### 3. Component Adaptations

#### useStore Hook → useChat Hook
```typescript
// Adapted for Shelivery
export const useChat = (poolId: string) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [users] = useState(new Map<string, User>())
  
  useEffect(() => {
    // Pool-specific message subscription
    const messageListener = supabase
      .channel(`pool:${poolId}:messages`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `pool_id=eq.${poolId}`
      }, (payload) => handleNewMessage(payload.new))
      .subscribe()
      
    return () => supabase.removeChannel(messageListener)
  }, [poolId])
  
  return { messages, users }
}
```

#### Message Component Adaptation
```typescript
// TypeScript + Shelivery design system
interface MessageProps {
  message: {
    id: string
    content: string
    user_id: string
    pool_id: string
    created_at: string
    author?: User
  }
}

const Message: React.FC<MessageProps> = ({ message }) => {
  const { user } = useAuth() // Adapted UserContext
  
  return (
    <div className="flex items-start space-x-3 p-3">
      <Avatar user={message.author} />
      <div className="flex-1">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-sm">{message.author?.username}</span>
          <span className="text-xs text-gray-500">
            {formatTime(message.created_at)}
          </span>
        </div>
        <p className="text-sm mt-1">{message.content}</p>
      </div>
      {canDeleteMessage(message, user) && (
        <DeleteMessageButton messageId={message.id} />
      )}
    </div>
  )
}
```

### 4. Authentication Adaptation

#### UserContext → useAuth Hook
```typescript
// App Router auth context
'use client'
import { createContext, useContext } from 'react'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
```

### 5. Real-time Subscriptions for Pools

#### Pool-Specific Channels
```typescript
// Pool chat subscriptions
const setupPoolSubscriptions = (poolId: string) => {
  // Messages in this pool
  const messagesSub = supabase
    .channel(`pool_${poolId}_messages`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public', 
      table: 'messages',
      filter: `pool_id=eq.${poolId}`
    }, handleMessageChange)
    .subscribe()
    
  // Pool progress updates
  const poolSub = supabase
    .channel(`pool_${poolId}_progress`)
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'pools', 
      filter: `id=eq.${poolId}`
    }, handlePoolUpdate)
    .subscribe()
    
  // Chat membership changes
  const membershipSub = supabase
    .channel(`pool_${poolId}_members`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'chat_memberships',
      filter: `pool_id=eq.${poolId}`
    }, handleMembershipChange)
    .subscribe()
}
```

### 6. Shelivery-Specific Features

#### Pool Progress Integration
- Real-time progress bar updates
- Pool completion notifications
- Automatic chat creation when pool is ready

#### Enhanced Permissions
```typescript
const canDeleteMessage = (message: Message, user: User) => {
  return (
    message.user_id === user.id ||
    user.role === 'admin' ||
    isPoolAdmin(user.id, message.pool_id)
  )
}

const isPoolAdmin = (userId: string, poolId: string) => {
  // Last user to join ready state becomes admin
  return checkLastReadyUser(userId, poolId)
}
```

#### Pool-to-Chat Transition
```typescript
// When pool reaches target amount
const onPoolReady = async (poolId: string) => {
  // Create chat room
  await createChatRoom(poolId)
  
  // Notify all pool members
  await notifyPoolMembers(poolId, 'Pool ready! Chat room created.')
  
  // Redirect to chat
  router.push(`/pool/${poolId}/chatroom`)
}
```

## Implementation Priority

### Phase 1: Core Chat Components ✅
1. Create `useAuth` hook
2. Build `Message` and `MessageInput` components
3. Set up basic real-time subscriptions

### Phase 2: Pool Integration
1. Adapt chat for pool context
2. Implement pool progress real-time updates
3. Add pool-specific permissions

### Phase 3: Enhanced Features
1. Typing indicators
2. Message timestamps and formatting
3. File/image sharing (future)
4. Push notifications (future)

## Key Adaptations Summary

| Feature | Slack Clone | Shelivery Adaptation |
|---------|-------------|---------------------|
| **Routing** | `/channels/[id]` | `/pool/[poolId]/chatroom` |
| **Context** | Channel-based | Pool-based |
| **Real-time** | Channel updates | Pool + message updates |
| **Permissions** | Channel admin | Pool admin (last ready user) |
| **Navigation** | Channel sidebar | Pool progress → chat transition |
| **State** | Channels + messages | Pools + messages + progress |
| **Auth** | Standard roles | Pool-specific roles |

## Technical Debt Considerations

1. **Migration from deprecated auth helpers**: Update to `@supabase/ssr`
2. **Type safety**: Full TypeScript implementation
3. **Error handling**: Robust error boundaries
4. **Performance**: Optimize subscriptions and re-renders
5. **Testing**: Unit tests for chat functionality

This analysis provides the foundation for implementing Shelivery's chat system based on proven Slack clone patterns while adapting for our pool-based use case and App Router architecture.
