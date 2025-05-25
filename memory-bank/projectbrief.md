# Shelivery MVP - Project Brief

## Project Overview
Shelivery is a Progressive Web App (PWA) that enables dormitory users to group their online shopping orders to share delivery fees, meet minimum order thresholds, and reduce environmental impact through consolidated deliveries.

## MVP Scope
- **Target Users**: Dormitory residents (invite-only during MVP)
- **Core Value**: Cost-sharing and environmental benefits through order consolidation
- **Service Model**: Free service during MVP testing phase
- **Geographic Focus**: Defined dormitories for controlled testing

## Key Features
### Primary Features
1. **Basket Creation**: Users enter shopping cart details (link, items, amount)
2. **Pool System**: Pre-created pools per shop × dormitory combination
3. **Progress Tracking**: Real-time progress bar showing pool completion status
4. **Ready Toggle**: Users can mark themselves ready to trigger pool progression
5. **Real-time Chat**: Automatic chatroom creation when pool reaches threshold
6. **Admin Controls**: Last-ready user becomes chat admin with resolution powers
7. **Feedback System**: Post-resolution feedback collection

### Supporting Features
- **Invitation System**: Invite-only registration with codes/links
- **User Profiles**: Basic profile management with dormitory association
- **Timer Management**: Pool and chat timeouts for flow management
- **PWA Functionality**: Add to Home Screen, offline capabilities

## Business Logic
### Pool Flow
1. Users select shop and create basket with amount
2. Join pre-existing pool for their dormitory × shop combination
3. Toggle "Ready" status to contribute to pool progress
4. Pool progress bar fills based on ready basket amounts
5. When progress reaches shop minimum threshold → trigger chatroom

### Chat Flow
1. All ready users automatically join chatroom
2. Last user to click "Ready" becomes admin
3. Users can edit baskets, coordinate order details
4. Admin resolves room when ready to place orders
5. Failed resolution returns users to pool system

### Timer System
- Pool readiness timeout (resets if not filled in time)
- Chat duration limits with admin extension capability
- Automatic flow progression on timeouts

## Technical Architecture
- **Frontend**: Next.js 14+ with App Router, TypeScript, Tailwind CSS
- **UI Components**: Shadcn/ui component library
- **Backend**: Supabase (PostgreSQL, Auth, Realtime subscriptions)
- **Hosting**: Vercel for frontend, Supabase for backend services
- **PWA**: next-pwa for service worker and manifest configuration

## Success Metrics
### User Engagement
- User registration and retention rates
- Pool participation frequency
- Chat completion rates
- Feedback submission rates

### Technical Performance
- Real-time update latency (pool progress, chat messages)
- PWA installation rates
- Page load performance
- Offline functionality usage

### Business Validation
- Cost savings achieved through order consolidation
- Environmental impact measurement
- User satisfaction scores
- Referral and organic growth rates

## MVP Constraints
- **Invite-Only Access**: Controlled user base during testing
- **Pre-seeded Pools**: No dynamic pool creation in MVP
- **Limited Shop Integration**: Basic cart link/manual entry (no API integration)
- **Basic Analytics**: Core tracking without advanced segmentation
- **Single Language**: English-only interface for MVP

## Timeline
- **Development Phase**: 4 weeks
- **Internal Testing**: 1 week
- **Dormitory Beta**: 2-4 weeks
- **Feedback Integration**: 1-2 weeks

## Risk Mitigation
- **Technical Risks**: Leverage proven Supabase Slack clone patterns
- **User Adoption**: Start with engaged dormitory communities
- **Real-time Performance**: Test with multiple concurrent users early
- **Data Security**: Implement proper RLS policies from day one
