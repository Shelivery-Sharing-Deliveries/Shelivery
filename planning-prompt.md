[PROJECT: Shelivery MVP]

You are Cline, our autonomous coding agent. This prompt will run in **Plan Mode**. Do not start coding, only produce a detailed, step-by-step plan, referencing the tools and conventions below.

---

## 1. Project Description

The root directory already contains our MVP documentation, including:

1. **Overview:** Purpose, invite-only PWA, dormitory tests  
2. **Tech Stack:** Next.js, Tailwind, Shadcn/ui, Supabase (Postgres/Auth/Realtime), Vercel  
3. **Data Entities:** Dormitory, Shop, User, Invitation, Pool, Basket, PoolMembership, ChatMembership, Message, UserFeedback, AnalyticsEvent  
4. **User Flow:** Mermaid flowchart in docs  
5. **User Flow Details:** Landing → Auth → Dashboard → Choose Shop → Create Basket → Pool page → Chatroom → Feedback → Rejoin/Resolve  
6. **Pool Logic:** Pre-seeded pools by shop×dorm, “Ready” toggles, progress tracked in Pool.current_amount via DB trigger  
7. **Chat Logic:** Dynamic `/pool/[poolId]/chatroom`, last-ready user is admin, resolve_room RPC  
8. **Invite-Only & Testing:** Invitation codes/links, QA plan, unit & E2E tests  
9. **Directory Structure:** As defined in `Shelivery-MVP-Doc.md`  
10. **Suggested Triggers:** Defined in `Shelivery-MVP-Doc.md`

---

## 2. Initial Setup Tasks

### 2.1 ClineRules  
Create a `.clinerules` folder in the repo root with these files:
- **general.md** — Coding coherency, modularity, naming conventions, one responsibility per file, DRY principles  
- **tokens.md** — Token-use guidelines: break tasks into small steps, reuse context, ask for “split into parts” for large tasks  
- *(Optional)* **mcp-usage.md** — High-level guidance on when to invoke each MCP

### 2.2 Memory Bank  
Initialize `memory-bank/` with these markdown files, each seeded from the project docs:
- projectbrief.md  
- productContext.md  
- systemPatterns.md  
- techContext.md  
- activeContext.md  
- progress.md  

Follow Cline’s [Memory Bank spec](https://docs.cline.bot/prompting/cline-memory-bank) exactly.

---

## 3. Build Plan Outline

1. **Supabase Setup**  
   - Design ERD in SQL migrations  
   - Apply schema via Supabase CLI (MCP:Supabase), including RLS policies  
   - Create RPC functions and Triggers  
   - Deploy Edge Functions & Webhooks  

2. **Directory & PWA Scaffold**  
   - Create folders/files per `DirectoryStructure.md`  
   - Configure `manifest.json`, `next.config.js` with `next-pwa`  
   - Validate A2HS and service-worker stub  

3. **Client-Side Foundations**  
   - Scaffold `/lib/supabase.ts` client  
   - Build core Layouts and components: Navbar, PoolProgress, ChatWindow, InviteFriend, Profile pages  
   - Implement Hooks: `useAuth`, `usePool`, `useRealtime` and any other necessary hooks

4. **Tests & CI/CD**  
   - Add Jest unit tests for RPC logic and hooks  
   - Add E2E tests (Playwright/Cypress) for full user flows  
   - Configure GitHub Actions CI (`ci.yml`) to lint, test, build, migrate  

5. **Feedback & Analytics**  
   - Integrate third-party feedback widget for error capture  
   - Track key events to AnalyticsEvent table and external service  

6. **Final Deployment**  
   - Deploy to Vercel  
   - Test PWA install on Android (install banner) and iOS (manual A2HS)  
   - Generate QR code for MVP testers  

---

## 4. Available MCPs

- **Puppeteer** — Browser automation  
- **Git tools** — Repo operations & checkout sample chat template  
- **Sequential Thinking** — Plan & Act stepwise  
- **Supabase** — Schema, Auth, Realtime via CLI & API  
- **Filesystem** — File creation & edits  
- **Brave Search** — Research external references  
- **Figma** — Read UI/UX designs (ask for access token)   

Whenever you propose changes, ask for my confirmation before implementing. Once I confirm your plan, switch to **Act Mode** to execute tasks in order. Remember to reference this prompt and the Memory Bank for context.  
