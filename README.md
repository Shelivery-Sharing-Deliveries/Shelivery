# Shelivery MVP

> Group Shopping for Dormitories - Share delivery costs and coordinate group orders with your dormmates

## 🚀 Project Overview

Shelivery is a Progressive Web App (PWA) that enables university dormitory residents to group their online shopping orders to:

- **Share delivery fees** and reduce individual costs
- **Meet minimum order thresholds** for free delivery
- **Reduce environmental impact** through consolidated deliveries
- **Build community connections** with dormmates

## 🛠 Tech Stack

- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS
- **UI Components**: Shadcn/ui + Radix UI primitives
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **PWA**: next-pwa for service worker and manifest
- **Hosting**: Vercel + Supabase
- **Package Manager**: pnpm

## 🏗 Project Structure

```
shelivery-mvp/
├── .clinerules/              # Development governance files
├── .github/workflows/        # CI/CD pipelines
├── docs/                     # Project documentation
├── memory-bank/              # Project context and progress tracking
├── migrations/               # Database migrations
├── public/                   # Static assets and PWA files
├── scripts/                  # Database seeding and utilities
├── src/
│   ├── app/                 # Next.js App Router pages
│   ├── components/          # Reusable React components
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utility libraries (Supabase client)
│   ├── styles/              # Global CSS and Tailwind config
│   └── utils/               # Helper functions
├── tests/                   # Unit and E2E tests
└── package.json
```

## 🚦 Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm 8+
- Supabase CLI (for database operations)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd shelivery-mvp
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Supabase credentials
   ```

4. **Start development server**
   ```bash
   pnpm dev
   ```

5. **Open in browser**
   ```
   http://localhost:3000
   ```

## 🗄 Database Setup

### Using Supabase MCP (Recommended)

The project includes integration with Supabase MCP server for database operations:

```bash
# Apply migrations
pnpm db:migrate

# Seed development data
pnpm db:seed

# Generate TypeScript types
pnpm generate-types
```

### Manual Setup

1. Create a new Supabase project
2. Run migrations in `migrations/` folder
3. Configure RLS policies
4. Set up real-time subscriptions

## 🧪 Testing

### Unit Tests
```bash
pnpm test          # Run once
pnpm test:watch    # Watch mode
```

### E2E Tests
```bash
pnpm test:e2e      # Playwright tests
```

### Type Checking
```bash
pnpm type-check    # TypeScript validation
```

## 📱 PWA Features

- **Add to Home Screen**: Native app-like installation
- **Offline Support**: Basic navigation and caching
- **Service Worker**: Background sync and push notifications (future)
- **App Manifest**: Proper PWA metadata and icons

### Testing PWA Locally

1. Build the application: `pnpm build`
2. Start production server: `pnpm start`
3. Open Chrome DevTools → Application → Manifest
4. Test "Add to Home Screen" functionality

## 🔄 Real-time Features

### Pool Progress Updates
- Optimistic UI updates for immediate feedback
- Real-time synchronization across all pool participants
- Database triggers for automatic progress calculation

### Chat System
- Based on Supabase Slack clone patterns
- Real-time message delivery and typing indicators
- User presence tracking in chatrooms

## 🎨 Design System

### Colors (Tailwind Classes)
- **Primary**: `bg-primary` (Blue #2563eb)
- **Secondary**: `bg-secondary` (Gray #64748b)
- **Success**: `bg-green-500` (#10b981)
- **Warning**: `bg-yellow-500` (#f59e0b)
- **Danger**: `bg-red-500` (#ef4444)

### Components
- Built with Shadcn/ui for consistency
- Custom Shelivery-specific variants
- Mobile-first responsive design
- Dark mode support (future)

## 🚀 Deployment

### Vercel Deployment

1. **Connect GitHub repository** to Vercel
2. **Configure environment variables** in Vercel dashboard
3. **Deploy**: Automatic on push to main branch

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## 📊 Development Workflow

### Branching Strategy
- `main`: Production-ready code
- `develop`: Integration branch
- `feature/*`: Feature development
- `hotfix/*`: Critical fixes

### Code Quality
- **ESLint**: Code linting and style enforcement
- **Prettier**: Code formatting
- **TypeScript**: Strict type checking
- **Husky**: Pre-commit hooks

### Commit Conventions
```
feat: add pool progress real-time updates
fix: resolve chat message duplication
docs: update README deployment section
style: format chat component code
refactor: extract pool logic to custom hook
test: add pool creation E2E tests
```

## 🏆 MVP Success Criteria

### Technical
- [ ] PWA installation works on mobile devices
- [ ] Real-time updates <500ms latency
- [ ] Pool to chat transition <2s
- [ ] Zero critical security vulnerabilities
- [ ] 95%+ uptime during beta testing

### User Experience
- [ ] <5 clicks from landing to first basket creation
- [ ] <30s average pool joining time
- [ ] >80% chat completion rate
- [ ] >70% user satisfaction score
- [ ] <5% error rate in critical flows

### Business
- [ ] >50% invite acceptance rate
- [ ] >30% weekly active user retention
- [ ] >60% pool completion rate
- [ ] Average 20%+ delivery cost savings
- [ ] Positive user feedback sentiment

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** changes: `git commit -m 'feat: add amazing feature'`
4. **Push** to branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### Development Guidelines

- Follow the coding standards in `.clinerules/`
- Write tests for new features
- Update documentation as needed
- Ensure PWA functionality works correctly
- Test real-time features thoroughly

## 📝 License

This project is proprietary software developed for Shelivery MVP testing.

## 🆘 Support

For development questions and issues:

1. Check the `memory-bank/` documentation
2. Review `docs/` folder for detailed guides
3. Create an issue with detailed reproduction steps
4. Include relevant browser/device information for PWA issues

## 🗺 Roadmap

### Phase 1: MVP (Current)
- [x] Project foundation and setup
- [ ] Supabase backend integration
- [ ] Core user flows (auth, pools, chat)
- [ ] PWA functionality
- [ ] Invite-only testing

### Phase 2: Enhancement
- [ ] Shop API integrations
- [ ] Advanced analytics
- [ ] Payment processing
- [ ] Multi-university expansion

### Phase 3: Scale
- [ ] Native mobile apps
- [ ] AI-powered recommendations
- [ ] Logistics partnerships
- [ ] International expansion

---

**Built with ❤️ for the dormitory community**
