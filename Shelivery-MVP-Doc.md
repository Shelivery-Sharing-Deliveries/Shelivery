# Shelivery MVP Documentation

## Overview
Shelivery is a Progressive Web App (PWA) that enables users to group their online shopping orders to:
- Share delivery fees
- Meet minimum order thresholds for free delivery  
- Reduce CO₂ emissions and energy consumption through consolidated deliveries  

In the MVP phase:
- Service is free and invite-only (dormitory users)
- Pools are pre-created for each shop × dormitory
- Core features: Basket creation, Pool progress tracking, Real‑time chat, Feedback

## Tech Stack
- **Frontend**: Next.js (TypeScript), Tailwind CSS, Shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **Hosting**: Vercel
- **PWA Tools**: `manifest.json`, service worker (using `next-pwa`)
- **Native Wrappers (future)**: Capacitor.js for App Store / Play Store

## Data Entities
- **Dormitory**  
  - `id`: INT (PK)  
  - `name`: TEXT  
- **Shop**  
  - `id`: INT (PK)  
  - `name`: TEXT  
  - `min_amount`: NUMERIC
- **User**  
  - `id`: UUID (PK)  
  - `email`: TEXT (unique)  
  - `password`: TEXT
  - `dormitory_id`: INT (FK → Dormitory)  
  - `profile`: JSONB  
  - `created_at`: TIMESTAMPTZ
- **Basket**  
  - `id`: UUID (PK)  
  - `user_id`: UUID (FK → User)  
  - `shop_id`: INT (FK → Shop)
  - `link`: TEXT  
  - `amount`: NUMERIC  
  - `status`: ENUM(`in_pool`, `in_chat`, `resolved`)
  - `created_at`: TIMESTAMPTZ
  - `updated_at`: TIMESTAMPTZ
- **Pool**  
  - `id`: UUID (PK)  
  - `shop_id`: INT (FK → Shop)  
  - `dormitory_id`: INT (FK → Dormitory)
  - `current_amount`: NUMERIC
  - `min_amount`: NUMERIC
- **PoolMembership**  
  - `pool_id`: UUID (FK → Pool)  
  - `user_id`: UUID (FK → User)  
  - `joined_at`: TIMESTAMPTZ  
- **Message**  
  - `id`: BIGSERIAL (PK)  
  - `chatroom_id`: UUID (FK → Chatroom)  
  - `user_id`: UUID (FK → User)  
  - `content`: TEXT  
  - `sent_at`: TIMESTAMPTZ
  - `read_at`: TIMESTAMPTZ
- **UserFeedback**  
  - `id`: BIGSERIAL (PK)  
  - `user_id`: UUID (FK → User)  
  - `event_type`: TEXT  
  - `description`: TEXT  
  - `created_at`: TIMESTAMPTZ
- **Chatroom**
  - `id`: UUID (PK)
  - `created_at`: TIMESTAMPTZ
  - `pool_id`: UUID (FK → Pool)
  - `state`: ENUM(`waiting`,`active`,`ordered`,`resolved`)
  - `admin_id`: UUID (FK → User)
- **ChatMemebership**
  - `chatroom_id`: UUID (FK → Chatroom)
  - `user_id`: UUID (FK → User)
  - `joined_at`: TIMESTAMPTZ
  - `left_at`: TIMESTAMPTZ
- **Order**
  - `id`: UUID (PK)
  - `chatroom_id`: UUID (FK → Chatroom)
- **Invitaion**
  - `id`: UUID (PK)
  - `code`: TEXT
  - `invited_by`: UUID (FK → User)
  - `expires_at`: TIMESTAMPTZ
  - `used_by`: UUID (FK → User)
  - `used_at`: TIMESTAMPTZ
- **AnalyticsEvent**
  - `id`: UUID (PK)
  - `user_id`: UUID (FK → User)
  - `event_type`: TEXT
  - `metadata`: JSONB
  - `occured_at`: TIMESTAMPTZ

## User Flow
```mermaid
flowchart TD
  Start[Start] -->|Clicks on Auth Button| Auth page
  Auth page -->|Signs Up/Signs In| Dashboard page
  Dashboard page -->|Select Shops/ Add basket| ChooseShop page
  ChooseShop page -->|Selects desired shop| CreateBasket page
  CreateBasket page --> PoolPage
  PoolPage -->|Ready| PoolPage[UpdateProgress]
  PoolPage [UpdateProgress] -->|Progress=100%| ChatRoom
  ChatRoom page -->|Order Resolved| Feedback page
  Feedback page --> Dashboard page
  ChatRoom page -->|Timed Out| PoolPage
```

### Steps:
1. **Start**: User lands on landing page; choose Sign Up (invite code) or Tutorial.  
2. **Authentication**: Sign up (email/OAuth + invite code) or sign in.  
3. **Dashboard**:  
   - Profile card  
   - Create Basket (choose shop, enter items & amount)  
   - Invite Friends (code/link)  
   - Existing Baskets list with statuses  
4. **Create Basket**: User selects shop, provides cart link or item list and total amount.  
5. **Pool Page**: Shows pool progress bar and basket details.  
   - “Ready” toggles readiness; updates pool progress.  
   - Timer resets readiness if pool not filled in time.  
6. **Chat Room**: When progress reaches threshold:  
   - Users enter chat room; last “Ready” user is room admin.  
   - Admin can `resolve_room`; users can edit baskets.  
   - Timer for chat duration; admin can extend once.  
7. **Feedback**: On successful resolution or timeout, prompt user for feedback via third-party widget.  
8. **Rejoin Pool**: If chat dissolves, ready users return to pool or new pool selection.  

## Details on Pool Logic
- After the user has selected the Shop and entered the amount and the list of goods, they would enter the pool page.
- They can Ready/Unready their basket in the pool.
- In the pool page there is a progress bar which has an amount, this amount is the minimum amount of the pool's shop 
to get the free delivery.
- When the users clicks on ready the progress bar would increase, as much as the amount of user's basket and if they
unready the amount would be reduced from the progress bar. Whenever any of these happen a trigger in the database
would be called which would make some other components to update their status' correspondingly.
- When the progress bar fills or over fills another trigger would be called which would make the chatroom 
and redirects all the users who has contributed to filling the progress bar into a chatroom and the progress bar
would get empty to get filled by the next users.

## Details on Chat Logic
-The chatroom would be quite simple and similar to slack.

-Supabase has a template for this in this github repository link :
"https://github.com/supabase/supabase/tree/master/examples/slack-clone/nextjs-slack-clone"

-Admin and other roles would be added subsequently



## Invite-Only & Testing
- Only invited users (invite code or link) can sign up.  
- MVP testing restricted to defined dormitories.  

## Testing & QA
- Unit tests for RPC logic and UI components.  
- End-to-end tests for core flows (signup → basket → pool → chat → feedback).  


# Shelivery Directory Structure

```
.
├── .github/
│   └── workflows/
│       └── ci.yml
├── .clineignore
├── .clinerules
├── README.md
├── next.config.js
├── package.json
├── pnpm-lock.yaml
├── postcss.config.js
├── tailwind.config.js
├── public/
│   ├── icons/
│   │   ├── icon-192x192.png
│   │   └── icon-512x512.png
│   ├── manifest.json
│   ├── robots.txt
│   └── _service-worker.js
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── auth/
│   │   │   ├── page.tsx
│   │   │   └── callback.tsx
│   │   ├── dashboard/
│   │   │   ├── page.tsx
│   │   │   └── loading.tsx
│   │   ├── choose-shop/
│   │   │   └── page.tsx
│   │   ├── create-basket/
│   │   │   └── page.tsx
│   │   ├── invite-friend/
│   │   │   └── page.tsx
│   │   ├── profile/
│   │   │   ├── page.tsx        # Current user profile
│   │   │   └── [userId]/
│   │   │       └── page.tsx    # Other user profiles
│   │   ├── pool/
│   │   │   └── [poolId]/
│   │   │       ├── page.tsx
│   │   │       └── chatroom/
│   │   │           └── page.tsx
│   │   ├── basket/
│   │   │   └── [basketId]/
│   │   │       └── page.tsx
│   │   └── feedback/
│   │       └── [roomId]/
│   │           └── page.tsx
│   ├── components/
│   │   ├── ChatWindow.tsx
│   │   ├── PoolProgress.tsx
│   │   ├── Navbar.tsx
│   │   └── index.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── usePool.ts
│   │   └── useRealtime.ts
│   ├── lib/
│   │   └── supabase.ts
│   ├── styles/
│   │   └── globals.css
│   └── utils/
│       └── date.ts
├── migrations/
│   └──001_init.sql
├── scripts/
│   └── seed.ts
├── docs/
│   └── design-links.md
├── memory-bank/
│   ├── projectbrief.md
│   ├── productContext.md
│   ├── systemPatterns.md
│   ├── techContext.md
│   ├── activeContext.md
│   └── progress.md
├── tests/
│   ├── unit/
│   └── e2e/
├── tsconfig.json
└── vercel.json
```


## Suggested Triggers
- Pool’s Current Amount realtime : Whenever a user clicks on ready in the pool page the progress bar would be updated in real time for every client in the pool.
- Auth.User → Public.User : Whenever a users registers and is added to Auth.user table a trigger would add them to the Public.user table
- Pool’s Current Amount done → Chatroom initiate : Whenever the current amount of the pool gets equal to or goes over the pool's minimum amount, a chatroom will be created and the users who has contributed to the progress bar will be all joined to that chatroom.
- Invitation depletion : Whenever a user gets invited and registers their code would be marked as used
---

_End of Documentation_