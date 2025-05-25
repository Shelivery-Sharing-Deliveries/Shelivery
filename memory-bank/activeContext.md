# Shelivery MVP - Active Context

## Current Development Focus

### Phase 1: Foundation Setup ✅ (In Progress)
**Status**: Currently establishing project structure and governance
**Current Tasks**:
- [✅] Create .clinerules governance files
- [✅] Initialize memory-bank documentation
- [🔄] Complete directory scaffolding
- [⏳] Set up Next.js project with dependencies

**Next Steps**:
- Initialize Next.js project structure
- Configure package.json with all required dependencies
- Set up basic PWA configuration files

### Immediate Priorities (Next 2-3 Steps)

1. **Project Initialization**
   - Create Next.js project with TypeScript
   - Install and configure Tailwind CSS + Shadcn/ui
   - Set up next-pwa for PWA functionality

2. **Reference Analysis** 
   - Use Git MCP to analyze Supabase Slack clone repository
   - Extract key patterns for chat implementation
   - Document Pages Router → App Router conversion strategies

3. **Design Asset Extraction**
   - Use Figma MCP to access design files (pending URLs from user)
   - Extract design tokens and asset files
   - Create design system documentation

## Active Technical Decisions

### Currently Being Implemented
- **Project Structure**: Following documentation-defined directory structure
- **Package Manager**: Using pnpm for dependency management
- **TypeScript Configuration**: Strict mode with Next.js optimizations
- **Code Quality**: ESLint + Prettier with pre-commit hooks

### Pending Decisions
- **Specific Figma File Access**: Need URLs and node IDs from user
- **Supabase Project Setup**: Will use Supabase MCP for schema creation
- **Testing Framework Selection**: Jest vs Vitest for unit testing
- **Analytics Service**: Choice of external analytics provider

## Key Integration Points

### Supabase Slack Clone Reference
**Repository**: `https://github.com/supabase/supabase/tree/master/examples/slack-clone/nextjs-slack-clone`

**Key Components to Analyze**:
- Real-time message subscriptions
- User authentication flow
- Database schema for messages and channels
- Component architecture for chat UI

**Adaptation Requirements**:
- Convert from Pages Router to App Router
- Adapt "channels" concept to "chatrooms"
- Add pool integration layer
- Enhance with admin controls and timers

### Figma Design Integration
**Pending Information**:
- Figma file URL(s)
- Specific node IDs for targeted extraction
- Design system organization

**Planned Extraction**:
- Color palette and typography tokens
- Component specifications and variants
- Icon and asset files
- Responsive breakpoint definitions

## Current Blockers & Dependencies

### Information Dependencies
1. **Figma Access**: Need design file URLs from user
2. **Supabase Project**: Need to create/configure project via MCP
3. **Environment Variables**: Will need Supabase credentials

### Technical Dependencies
- Next.js project setup before component development
- Supabase schema before real-time hooks
- Design tokens before UI component implementation
- Package installation before development server

## Development Environment Status

### Completed Setup
- [✅] .clinerules governance established
- [✅] Memory bank documentation structure
- [✅] Project planning and architecture documentation

### In Progress
- [🔄] Directory structure creation
- [🔄] Next.js project initialization

### Planned Setup
- [⏳] Package dependencies installation
- [⏳] Supabase project configuration
- [⏳] Development environment configuration
- [⏳] Git repository initialization

## Key Reference Materials

### Internal Documentation
- `Shelivery-MVP-Doc.md` - Complete project specification
- `memory-bank/projectbrief.md` - Project overview and constraints
- `memory-bank/productContext.md` - User personas and market context
- `memory-bank/systemPatterns.md` - Technical patterns and architecture
- `memory-bank/techContext.md` - Technology stack decisions

### External References
- Supabase Slack clone for chat implementation patterns
- Next.js App Router documentation for migration patterns
- Shadcn/ui documentation for component implementation
- Figma design files (pending access)

## Coding Standards Currently Applied

### File Naming Conventions
- Components: PascalCase (e.g., `ChatWindow.tsx`)
- Pages: kebab-case (e.g., `choose-shop/page.tsx`)
- Utilities: camelCase (e.g., `formatDate.ts`)
- Constants: UPPER_SNAKE_CASE

### Code Organization Principles
- Single responsibility per component/function
- Composition over inheritance
- DRY principle application
- Clear separation of concerns (data/UI/logic)

### Quality Assurance
- TypeScript strict mode enforcement
- Consistent code formatting with Prettier
- ESLint rules for Next.js and React best practices
- Git commit hooks for quality checks

## Real-time Feature Implementation Strategy

### Pool Progress Updates
**Approach**: Optimistic updates with server reconciliation
- Immediate UI feedback on user actions
- Background sync with database triggers
- Real-time broadcast to all pool participants
- Error handling with state reversion

### Chat Message Flow
**Pattern**: Direct database insertion with real-time subscriptions
- Message validation on client
- Direct Supabase insertion
- Real-time broadcast to chatroom members
- Message persistence and pagination

### State Management
**Strategy**: Server state + Local UI state
- Supabase for server state synchronization
- React hooks for local interaction state
- Next.js App Router for initial data loading
- SWR patterns for optimistic updates

## Testing Strategy Implementation

### Unit Testing Approach
- Component testing with React Testing Library
- Hook testing with renderHook utility
- Database function testing with mock Supabase client
- Utility function testing with Jest

### Integration Testing Plan
- End-to-end user flows with Playwright
- Real-time feature testing across multiple browser sessions
- PWA functionality testing (installation, offline)
- Cross-device responsive testing

### Performance Testing
- Real-time latency measurement
- Database query performance testing
- Bundle size optimization validation
- Core Web Vitals monitoring
