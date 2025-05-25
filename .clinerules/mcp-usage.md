# MCP Server Usage Guidelines for Shelivery MVP

## MCP Server Integration Strategy

### 1. Supabase MCP Server
**Purpose**: Database operations, schema management, real-time features
**Usage Patterns**:
- Use for database migrations and schema creation
- Execute SQL queries and RPC functions
- Test database triggers and functions in isolation
- Generate TypeScript types from database schema
- Manage authentication and user management

**Best Practices**:
- Batch related database operations
- Test complex queries in isolation before integration
- Use specific project IDs for all operations
- Leverage existing schema knowledge to avoid redundant exploration

### 2. Git MCP Server
**Purpose**: Reference the Supabase Slack clone repository
**Usage Patterns**:
- Clone and study the Slack clone implementation patterns
- Extract reusable components and patterns
- Reference authentication and real-time patterns
- Study database schema and trigger implementations

**Key Reference Areas**:
- Real-time subscription patterns
- Message component architecture
- Authentication flow with Supabase
- Database schema for chat functionality

**Adaptation Notes**:
- Convert Pages Router patterns to App Router
- Adapt channel concepts to our chatroom system
- Enhance with Shelivery-specific features (pools, baskets, timers)

### 3. Figma MCP Server
**Purpose**: Extract design assets and implement pixel-perfect UI
**Usage Patterns**:
- Extract layout information from design files
- Download icons, illustrations, and visual assets
- Extract design tokens (colors, typography, spacing)
- Reference component specifications and variants

**Asset Organization**:
- Store icons in `public/icons/`
- Organize component-specific assets
- Generate optimized SVG and PNG formats
- Document design tokens for Tailwind configuration

### 4. Puppeteer MCP Server
**Purpose**: PWA testing and user flow validation
**Usage Patterns**:
- Test PWA installation and functionality
- Validate user flows end-to-end
- Test real-time features across multiple browser sessions
- Capture screenshots for visual regression testing

**Testing Focus Areas**:
- Add to Home Screen functionality
- Offline capability validation
- Real-time chat synchronization
- Pool progress updates across sessions

### 5. Sequential Thinking MCP Server
**Purpose**: Complex logic planning and problem-solving
**Usage Patterns**:
- Plan complex database trigger implementations
- Design real-time subscription architecture
- Plan App Router conversion from Pages Router patterns
- Solve multi-step integration challenges

**Application Areas**:
- Pool-to-chat transition logic
- Real-time progress bar updates
- Chat room creation and management
- Complex user flow state transitions

### 6. Brave Search MCP Server
**Purpose**: Research external references and documentation
**Usage Patterns**:
- Research Next.js App Router best practices
- Find Supabase real-time implementation examples
- Research PWA optimization techniques
- Look up specific technical solutions

## Integration Workflow

### Phase-by-Phase MCP Usage:
1. **Foundation**: Git MCP for Slack clone analysis
2. **Design**: Figma MCP for asset extraction and design tokens
3. **Database**: Supabase MCP for schema and real-time setup
4. **Development**: Git MCP for pattern reference, Figma MCP for implementation
5. **Testing**: Puppeteer MCP for validation and user flow testing

### Coordination Between MCPs:
- Use Git MCP to understand Slack clone patterns before Supabase MCP implementation
- Extract Figma design tokens before implementing with Supabase data
- Reference Sequential Thinking for complex integration points
- Use Puppeteer MCP to validate implementations across all phases

## Error Handling and Fallbacks

### MCP Server Failures:
- **Figma MCP Issues**: Fallback to manually provided design assets
- **Git MCP Issues**: Direct repository cloning and manual pattern extraction
- **Supabase MCP Issues**: Use Supabase CLI directly with manual configuration
- **Puppeteer MCP Issues**: Manual testing with browser dev tools

### Performance Optimization:
- Cache extracted assets and patterns for reuse
- Batch similar MCP operations when possible
- Document successful patterns to avoid re-extraction
- Use targeted queries rather than broad explorations
