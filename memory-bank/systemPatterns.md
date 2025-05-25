# Shelivery MVP - System Patterns

## Architecture Overview

### High-Level Architecture
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Client PWA    │    │   Supabase       │    │   External      │
│   (Next.js)     │◄──►│   Backend        │◄──►│   Services      │
│                 │    │                  │    │                 │
│ • App Router    │    │ • PostgreSQL     │    │ • Vercel        │
│ • React/TS      │    │ • Auth           │    │ • Analytics     │
│ • Tailwind      │    │ • Realtime       │    │ • Feedback      │
│ • Shadcn/ui     │    │ • Edge Functions │    │ • Monitoring    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Data Flow Patterns

#### Pool Progress Update Flow
```
User clicks "Ready" → Client optimistic update → Supabase RPC call → 
Database trigger → Pool.current_amount update → Realtime broadcast → 
All clients receive update → UI re-renders progress bar
```

#### Chatroom Creation Flow
```
Pool reaches threshold → Database trigger fires → Chatroom created → 
ChatMembership records created → Realtime notification → 
All pool members redirect to chatroom → Chat UI initializes
```

#### Real-time Message Flow
```
User types message → Client validates → Insert to Message table → 
Database trigger (if needed) → Realtime broadcast → 
All chatroom members receive → Message appears in UI
```

## Database Design Patterns

### Core Entity Relationships
```
Dormitory ──┐
            ├── Pool ──── PoolMembership ──── User
Shop ───────┘                                 │
                                              │
Pool ──── Chatroom ──── ChatMembership ───────┘
             │
             └── Message ──── User
```

### Row Level Security (RLS) Patterns

#### User Data Isolation
```sql
-- Users can only see their own profile data
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);
```

#### Dormitory-Based Access Control
```sql
-- Users can only see pools for their dormitory
CREATE POLICY "Users see dormitory pools" ON public.pools
    FOR SELECT USING (
        dormitory_id = (
            SELECT dormitory_id FROM public.users 
            WHERE id = auth.uid()
        )
    );
```

#### Chat Access Control
```sql
-- Users can only see messages in chatrooms they're members of
CREATE POLICY "Chat members see messages" ON public.messages
    FOR SELECT USING (
        chatroom_id IN (
            SELECT chatroom_id FROM public.chat_memberships 
            WHERE user_id = auth.uid()
        )
    );
```

### Database Trigger Patterns

#### Pool Progress Trigger
```sql
CREATE OR REPLACE FUNCTION update_pool_progress()
RETURNS TRIGGER AS $$
BEGIN
    -- Update pool current_amount based on ready baskets
    UPDATE pools SET current_amount = (
        SELECT COALESCE(SUM(b.amount), 0)
        FROM baskets b
        JOIN pool_memberships pm ON b.user_id = pm.user_id
        WHERE pm.pool_id = NEW.pool_id 
        AND b.status = 'ready'
        AND b.shop_id = pools.shop_id
    ) WHERE id = NEW.pool_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

#### Chatroom Creation Trigger
```sql
CREATE OR REPLACE FUNCTION check_pool_completion()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if pool has reached minimum amount
    IF NEW.current_amount >= NEW.min_amount THEN
        -- Create chatroom and memberships
        INSERT INTO chatrooms (pool_id, admin_id, state)
        VALUES (NEW.id, get_last_ready_user(NEW.id), 'active');
        
        -- Add all ready users to chatroom
        INSERT INTO chat_memberships (chatroom_id, user_id)
        SELECT currval('chatrooms_id_seq'), pm.user_id
        FROM pool_memberships pm
        JOIN baskets b ON pm.user_id = b.user_id
        WHERE pm.pool_id = NEW.id AND b.status = 'ready';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

## Real-time Subscription Patterns

### Client-Side Subscription Management
```typescript
// Hook pattern for pool progress subscriptions
export const usePoolProgress = (poolId: string) => {
  const [pool, setPool] = useState<Pool | null>(null);
  
  useEffect(() => {
    const subscription = supabase
      .channel(`pool-${poolId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'pools',
        filter: `id=eq.${poolId}`
      }, (payload) => {
        setPool(payload.new as Pool);
      })
      .subscribe();
      
    return () => subscription.unsubscribe();
  }, [poolId]);
  
  return { pool };
};
```

### Chat Message Subscriptions
```typescript
// Real-time chat message pattern
export const useChatMessages = (chatroomId: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  
  useEffect(() => {
    const subscription = supabase
      .channel(`chatroom-${chatroomId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `chatroom_id=eq.${chatroomId}`
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as Message]);
      })
      .subscribe();
      
    return () => subscription.unsubscribe();
  }, [chatroomId]);
  
  return { messages };
};
```

## State Management Patterns

### App Router State Pattern
```typescript
// Server Component for initial data
export default async function PoolPage({ params }: { params: { poolId: string } }) {
  const { data: pool } = await supabase
    .from('pools')
    .select('*')
    .eq('id', params.poolId)
    .single();
    
  return <PoolClient initialPool={pool} />;
}

// Client Component for real-time updates
'use client';
export function PoolClient({ initialPool }: { initialPool: Pool }) {
  const { pool } = usePoolProgress(initialPool.id);
  const currentPool = pool || initialPool;
  
  return <PoolProgress pool={currentPool} />;
}
```

### Optimistic Updates Pattern
```typescript
export const useOptimisticBasketToggle = () => {
  const [isReady, setIsReady] = useState(false);
  
  const toggleReady = async (basketId: string) => {
    // Optimistic update
    setIsReady(prev => !prev);
    
    try {
      await supabase.rpc('toggle_basket_ready', { basket_id: basketId });
    } catch (error) {
      // Revert on error
      setIsReady(prev => !prev);
      throw error;
    }
  };
  
  return { isReady, toggleReady };
};
```

## Error Handling Patterns

### Database Error Recovery
```typescript
export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  throw new Error('Max retries exceeded');
};
```

### Real-time Connection Recovery
```typescript
export const useRealtimeWithReconnect = (subscription: () => RealtimeChannel) => {
  useEffect(() => {
    let channel: RealtimeChannel;
    let reconnectInterval: NodeJS.Timeout;
    
    const connect = () => {
      channel = subscription();
      
      channel.subscribe((status) => {
        if (status === 'CLOSED') {
          reconnectInterval = setTimeout(connect, 5000);
        }
      });
    };
    
    connect();
    
    return () => {
      channel?.unsubscribe();
      clearTimeout(reconnectInterval);
    };
  }, []);
};
```

## Performance Patterns

### Database Query Optimization
```sql
-- Indexes for common query patterns
CREATE INDEX idx_pools_dormitory_shop ON pools(dormitory_id, shop_id);
CREATE INDEX idx_baskets_user_status ON baskets(user_id, status);
CREATE INDEX idx_messages_chatroom_created ON messages(chatroom_id, created_at);
CREATE INDEX idx_pool_memberships_pool_user ON pool_memberships(pool_id, user_id);
```

### Component Optimization Patterns
```typescript
// Memoized components for expensive renders
export const PoolProgress = memo(({ pool }: { pool: Pool }) => {
  const progressPercentage = useMemo(
    () => (pool.current_amount / pool.min_amount) * 100,
    [pool.current_amount, pool.min_amount]
  );
  
  return <ProgressBar percentage={progressPercentage} />;
});

// Virtualization for large chat histories
export const ChatMessages = ({ messages }: { messages: Message[] }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  return (
    <VirtualList
      ref={containerRef}
      items={messages}
      itemHeight={60}
      renderItem={({ item }) => <MessageBubble message={item} />}
    />
  );
};
```

## Security Patterns

### Authentication Flow
```typescript
// Protected route pattern
export default async function ProtectedPage() {
  const supabase = createServerComponentClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    redirect('/auth');
  }
  
  return <PageContent user={session.user} />;
}
```

### Data Validation Patterns
```typescript
// Server-side validation for RPC functions
CREATE OR REPLACE FUNCTION toggle_basket_ready(basket_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    basket_owner UUID;
BEGIN
    -- Verify ownership
    SELECT user_id INTO basket_owner 
    FROM baskets WHERE id = basket_id;
    
    IF basket_owner != auth.uid() THEN
        RAISE EXCEPTION 'Unauthorized: Not basket owner';
    END IF;
    
    -- Perform update
    UPDATE baskets 
    SET status = CASE 
        WHEN status = 'ready' THEN 'in_pool'
        ELSE 'ready'
    END
    WHERE id = basket_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Testing Patterns

### Database Testing
```typescript
// Transaction-based test isolation
export const withTestTransaction = async (testFn: () => Promise<void>) => {
  const client = await supabase.auth.admin.createUser({
    email: `test-${Date.now()}@example.com`,
    password: 'test-password'
  });
  
  try {
    await testFn();
  } finally {
    await supabase.auth.admin.deleteUser(client.data.user!.id);
  }
};
```

### Real-time Testing
```typescript
// Mock real-time subscriptions for testing
export const mockSupabaseRealtime = () => {
  const mockChannel = {
    on: jest.fn().mockReturnThis(),
    subscribe: jest.fn(),
    unsubscribe: jest.fn()
  };
  
  jest.spyOn(supabase, 'channel').mockReturnValue(mockChannel);
  return mockChannel;
};
```

## Monitoring Patterns

### Performance Monitoring
```typescript
// Custom performance tracking
export const trackOperation = async <T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<T> => {
  const start = performance.now();
  
  try {
    const result = await operation();
    const duration = performance.now() - start;
    
    // Log to analytics service
    analytics.track('operation_completed', {
      operation: operationName,
      duration,
      success: true
    });
    
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    
    analytics.track('operation_failed', {
      operation: operationName,
      duration,
      error: error.message
    });
    
    throw error;
  }
};
