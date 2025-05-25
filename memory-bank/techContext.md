# Shelivery MVP - Technical Context

## Technology Stack Decisions

### Frontend Framework: Next.js 14+ with App Router
**Rationale:**
- **App Router**: Latest Next.js paradigm for better performance and developer experience
- **Server Components**: Improved initial load times and SEO for PWA
- **Streaming**: Better UX for real-time features with progressive loading
- **TypeScript**: Type safety for complex real-time state management
- **Vercel Integration**: Seamless deployment and performance optimization

**Key Features Used:**
- Server Components for initial data loading
- Client Components for real-time interactions
- Route handlers for API endpoints
- Middleware for authentication
- Streaming for progressive chat loading

### Backend: Supabase
**Rationale:**
- **PostgreSQL**: Robust relational database for complex queries and triggers
- **Real-time**: Built-in WebSocket subscriptions for live updates
- **Authentication**: Complete auth system with RLS integration
- **Edge Functions**: Serverless functions for complex business logic
- **Database Triggers**: Perfect for pool/chat flow automation

**Services Used:**
- **Database**: PostgreSQL with Row Level Security
- **Auth**: User management with social providers
- **Realtime**: WebSocket subscriptions for live features
- **Edge Functions**: Complex business logic processing
- **Storage**: Future file upload capabilities

### UI Framework: Tailwind CSS + Shadcn/ui
**Rationale:**
- **Tailwind CSS**: Utility-first approach for rapid mobile-first development
- **Shadcn/ui**: High-quality, accessible components with customization
- **Design System**: Consistent component library across all features
- **Mobile Optimization**: Responsive design patterns for PWA

**Component Strategy:**
- Base components from Shadcn/ui
- Custom variants for Shelivery-specific needs
- Mobile-first responsive design
- Dark/light mode support preparation

### PWA Technology: next-pwa
**Rationale:**
- **Service Worker**: Offline functionality for basic navigation
- **App Manifest**: Native-like installation experience
- **Caching Strategy**: Smart caching for performance
- **Background Sync**: Future offline message capabilities

## Development Environment

### Package Manager: pnpm
**Benefits:**
- Fast installation and efficient disk usage
- Strict dependency resolution
- Better monorepo support for future scaling
- Workspace management capabilities

### Development Tools
```json
{
  "typescript": "^5.0.0",
  "next": "^14.0.0",
  "@supabase/supabase-js": "^2.39.0",
  "tailwindcss": "^3.4.0",
  "@radix-ui/react-*": "^1.0.0",
  "next-pwa": "^5.6.0"
}
```

### Code Quality Tools
- **ESLint**: Code linting with Next.js and TypeScript rules
- **Prettier**: Code formatting with consistent style
- **TypeScript**: Strict mode for type safety
- **Husky**: Git hooks for pre-commit quality checks

## Architecture Decisions

### Real-time Architecture
**Pattern**: Optimistic Updates + Server Reconciliation
```typescript
// Client immediately updates UI
setIsReady(true);

// Server call reconciles state
try {
  await supabase.rpc('toggle_basket_ready');
} catch (error) {
  // Revert optimistic update
  setIsReady(false);
}
```

**Benefits:**
- Immediate user feedback
- Graceful error handling
- Consistent state across clients
- Reduced perceived latency

### Database Trigger Strategy
**Approach**: Database-driven automation for critical flows
- Pool progress triggers for real-time updates
- Chatroom creation triggers for seamless transitions
- User management triggers for auth synchronization

**Benefits:**
- Consistent business logic enforcement
- Reduced client-server round trips
- Automatic state management
- Reliable real-time notifications

### State Management Strategy
**Pattern**: Server State + Local UI State
- **Server State**: Supabase real-time subscriptions
- **Local State**: React hooks for UI interactions
- **Caching**: Next.js App Router caching + SWR patterns
- **Optimistic Updates**: Immediate UI feedback

### Authentication Architecture
**Flow**: Supabase Auth + RLS + Middleware
```typescript
// Middleware for route protection
export async function middleware(request: NextRequest) {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session && isProtectedRoute(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL('/auth', request.url));
  }
}

// RLS for data security
CREATE POLICY "Users access own data" ON users
  FOR ALL USING (auth.uid() = id);
```

## Performance Considerations

### Client-Side Performance
- **Component Memoization**: React.memo() for expensive components
- **Virtual Scrolling**: Large chat message lists
- **Image Optimization**: Next.js automatic image optimization
- **Bundle Splitting**: Route-based code splitting

### Server-Side Performance
- **Database Indexing**: Strategic indexes for common queries
- **Query Optimization**: Efficient joins and filters
- **Caching Strategy**: Edge caching for static content
- **Connection Pooling**: Supabase automatic connection management

### Real-time Performance
- **Subscription Optimization**: Targeted channel subscriptions
- **Message Batching**: Reduce real-time message frequency
- **Connection Recovery**: Automatic reconnection on failure
- **Presence Management**: Efficient user presence tracking

## Security Implementation

### Authentication Security
- **JWT Tokens**: Secure session management
- **Social OAuth**: Trusted provider authentication
- **Invitation Validation**: Secure invite-only registration
- **Session Management**: Automatic token refresh

### Data Security
- **Row Level Security**: Database-level access control
- **API Validation**: Server-side input validation
- **CORS Configuration**: Strict origin policies
- **Rate Limiting**: API abuse prevention

### Client Security
- **CSP Headers**: Content Security Policy
- **HTTPS Only**: Secure transport layer
- **Secure Cookies**: HttpOnly and Secure flags
- **Input Sanitization**: XSS prevention

## Testing Strategy

### Unit Testing: Jest + React Testing Library
```typescript
// Hook testing pattern
import { renderHook } from '@testing-library/react';
import { usePoolProgress } from '@/hooks/usePoolProgress';

test('usePoolProgress updates on real-time changes', async () => {
  const { result } = renderHook(() => usePoolProgress('pool-123'));
  
  // Mock real-time update
  await act(async () => {
    mockSupabaseUpdate({ current_amount: 150 });
  });
  
  expect(result.current.pool?.current_amount).toBe(150);
});
```

### Integration Testing: Playwright
```typescript
// E2E user flow testing
test('complete pool to chat flow', async ({ page }) => {
  await page.goto('/dashboard');
  await page.click('[data-testid="create-basket"]');
  await page.fill('[data-testid="amount-input"]', '50');
  await page.click('[data-testid="ready-toggle"]');
  
  // Wait for chatroom creation
  await page.waitForURL('**/chatroom/**');
  await expect(page.locator('[data-testid="chat-window"]')).toBeVisible();
});
```

### Database Testing
```sql
-- Test database triggers
BEGIN;
  -- Create test data
  INSERT INTO pools (shop_id, dormitory_id, min_amount) VALUES (1, 1, 100);
  INSERT INTO baskets (user_id, shop_id, amount, status) VALUES 
    (gen_random_uuid(), 1, 60, 'ready'),
    (gen_random_uuid(), 1, 50, 'ready');
  
  -- Verify trigger behavior
  SELECT current_amount FROM pools WHERE id = <pool_id>;
  -- Should equal 110 (60 + 50)
ROLLBACK;
```

## Monitoring & Analytics

### Application Monitoring
- **Vercel Analytics**: Performance and Core Web Vitals
- **Supabase Metrics**: Database performance and real-time connections
- **Error Tracking**: Custom error boundary with external service
- **User Analytics**: Custom event tracking for key user actions

### Performance Metrics
```typescript
// Custom performance tracking
export const trackUserAction = (action: string, metadata?: object) => {
  // Track to external analytics service
  analytics.track(action, {
    ...metadata,
    timestamp: new Date().toISOString(),
    session_id: getCurrentSessionId()
  });
  
  // Store in Supabase for internal analysis
  supabase.from('analytics_events').insert({
    user_id: getCurrentUserId(),
    event_type: action,
    metadata,
    occurred_at: new Date().toISOString()
  });
};
```

## Deployment Architecture

### Hosting: Vercel + Supabase
```json
{
  "vercel": {
    "build": "next build",
    "framework": "nextjs",
    "regions": ["fra1"],
    "environment": {
      "NEXT_PUBLIC_SUPABASE_URL": "@supabase-url",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase-anon-key"
    }
  }
}
```

### Environment Management
- **Development**: Local Supabase + Next.js dev server
- **Staging**: Supabase staging + Vercel preview deployments
- **Production**: Supabase production + Vercel production

### CI/CD Pipeline
```yaml
# .github/workflows/ci.yml
name: CI/CD
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: pnpm install
      - run: pnpm run lint
      - run: pnpm run type-check
      - run: pnpm run test
      - run: pnpm run build
```

## Future Technical Considerations

### Scalability Preparation
- **Database Sharding**: Prepare for multi-tenant architecture
- **CDN Strategy**: Global content delivery for international expansion
- **Microservices**: Extract business logic to independent services
- **Queue System**: Background job processing for heavy operations

### Mobile App Migration
- **Capacitor.js**: Native wrapper for existing PWA
- **Shared Codebase**: Maintain single codebase for web and mobile
- **Native Features**: Camera, push notifications, native sharing
- **App Store Optimization**: Prepare for store submission

### Advanced Features
- **AI Integration**: Smart pool recommendations and optimization
- **Payment Processing**: Direct payment integration with shops
- **Logistics API**: Real delivery tracking and coordination
- **Machine Learning**: User behavior analysis and personalization
