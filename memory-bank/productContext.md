# Shelivery MVP - Product Context

## User Personas

### Primary Persona: University Dormitory Student
**Demographics:**
- Age: 18-25 years old
- Living situation: University dormitory/student housing
- Income: Limited student budget with cost-consciousness
- Tech comfort: High mobile usage, app-native generation

**Behavioral Patterns:**
- Frequent online shopping for necessities and convenience
- Price-sensitive decision making
- Social coordination with dormmates for group activities
- Mobile-first digital interaction preferences
- Environmental awareness and sustainability concerns

**Pain Points:**
- High individual delivery fees eat into limited budgets
- Missing minimum order thresholds for free delivery
- Ordering timing misalignment with roommates
- Environmental guilt over individual small orders
- Lack of coordination tools for group purchases

**Goals & Motivations:**
- Maximize purchasing power through cost sharing
- Reduce environmental impact of consumption
- Build community connections with dormmates
- Maintain convenience of online shopping
- Save money for other student priorities

## Market Context

### Problem Statement
University students living in dormitories face significant friction in online shopping:
1. **Economic Friction**: Individual delivery fees and minimum order thresholds create financial barriers
2. **Coordination Challenges**: No efficient way to synchronize orders with dormmates
3. **Environmental Concerns**: Multiple individual deliveries create unnecessary carbon footprint
4. **Social Isolation**: Missed opportunities for community building through shared activities

### Value Proposition
**For dormitory students**, Shelivery is a **Progressive Web App** that **enables cost-effective group shopping** by **coordinating order consolidation and delivery fee sharing**, unlike **individual shopping or informal group coordination**, Shelivery provides **automated pool management, real-time progress tracking, and seamless chat coordination**.

### Market Opportunity
- **Primary Market**: University dormitory students (millions globally)
- **Immediate Addressable Market**: Individual university campuses (thousands per campus)
- **MVP Market**: 2-3 dormitory buildings (hundreds of students)

## User Journey & Experience

### Current State Journey (Without Shelivery)
1. Student needs items → checks multiple shops individually
2. Discovers delivery fees or minimum order issues
3. Attempts informal coordination via group chats/social media
4. Coordination fails due to timing/complexity
5. Either pays full fees individually or abandons purchase

### Future State Journey (With Shelivery)
1. Student opens Shelivery PWA → sees available shops
2. Creates basket with desired items and amount
3. Joins relevant dormitory pool → sees real-time progress
4. Marks ready when prepared to order
5. Automatically enters chatroom when threshold reached
6. Coordinates final details with dormmates in real-time
7. Admin completes group order → everyone saves money
8. Provides feedback for continuous improvement

### Key Experience Principles
- **Effortless Entry**: Minimal friction signup with invite codes
- **Transparent Progress**: Always know pool status and next steps
- **Social Coordination**: Natural chat flow for group decision making
- **Trust & Safety**: Clear admin roles and resolution processes
- **Mobile-First**: Optimized for smartphone usage patterns

## Competitive Landscape

### Direct Competitors
- **Group buying platforms** (Groupon-style): Different model, focused on deals not delivery consolidation
- **Social commerce apps**: Broader scope, not dormitory/delivery focused
- **University-specific apps**: Usually broader campus services, not shopping focused

### Indirect Competitors
- **Individual delivery services**: Status quo solution
- **Campus shuttle services**: Physical coordination alternative
- **Informal group chats**: Low-tech coordination method

### Competitive Advantages
1. **Hyper-focused**: Specifically designed for dormitory delivery coordination
2. **Real-time Coordination**: Live progress tracking and instant chat
3. **Automated Triggering**: No manual coordination needed for pool completion
4. **PWA Technology**: App-like experience without app store friction
5. **Community Building**: Creates social connections through shared activities

## Success Metrics & KPIs

### User Adoption Metrics
- **Registration Rate**: Percentage of invited users who complete signup
- **Activation Rate**: Users who create their first basket within 7 days
- **Retention Rate**: Users active after 1, 7, 30 days
- **Pool Participation**: Percentage of users joining pools after registration

### Engagement Metrics
- **Pool Completion Rate**: Pools that successfully reach threshold and create chatrooms
- **Chat Resolution Rate**: Chatrooms that successfully complete orders
- **Basket Edit Rate**: Users who modify baskets during chat coordination
- **Feedback Submission Rate**: Users providing post-resolution feedback

### Business Impact Metrics
- **Cost Savings Per User**: Average delivery fee savings per completed order
- **Order Value Increase**: Higher basket values due to group coordination
- **Environmental Impact**: Reduced deliveries per capita
- **Social Connection Index**: User-reported dormmate relationship improvements

### Technical Performance Metrics
- **Real-time Latency**: Pool progress and chat message update speeds
- **PWA Installation Rate**: Users adding to home screen
- **Offline Usage**: App usage during connectivity issues
- **Error Rate**: Technical failures in critical user flows

## Risk Factors & Mitigation

### User Experience Risks
- **Coordination Complexity**: Pool/chat flows too complicated for users
  - *Mitigation*: Simple, guided flows with clear next steps
- **Social Friction**: Conflicts in group decision making
  - *Mitigation*: Clear admin roles and escalation processes

### Technical Risks
- **Real-time Performance**: Lag in pool updates or chat messages
  - *Mitigation*: Leverage proven Supabase real-time patterns
- **Scalability**: Performance degradation with multiple concurrent pools
  - *Mitigation*: Performance testing and database optimization

### Business Risks
- **Low Adoption**: Students don't see value or find app too complex
  - *Mitigation*: Start with engaged early adopters, iterate based on feedback
- **Shop Integration**: Limited shop compatibility affects user value
  - *Mitigation*: Focus on most popular shops in target dormitories

## Future Vision

### Near-term Evolution (6-12 months)
- Expand to additional dormitories and universities
- Add shop API integrations for seamless checkout
- Implement advanced analytics and personalization
- Add social features like user ratings and achievements

### Long-term Vision (1-3 years)
- Platform expansion to other group buying contexts (offices, neighborhoods)
- Marketplace features connecting users with local suppliers
- AI-powered optimization for delivery route and timing
- Carbon footprint tracking and environmental impact gamification
