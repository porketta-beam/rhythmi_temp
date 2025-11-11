# Product Requirements Document: eventManager

**Version:** 1.0
**Last Updated:** 2025-10-01
**Document Owner:** Product Team

---

## Executive Summary

### Product Overview
eventManager is a mobile-first event management platform designed specifically for small-scale communities. Unlike enterprise-grade solutions that overwhelm small organizers with complexity and cost, eventManager provides essential event management tools that anyone can use directly from their smartphone.

### Problem Statement
Small businesses, clubs, social groups, and educational institutions need event management capabilities—participant tracking, on-site check-in, prize drawings, fee collection—but existing solutions fall into two extremes:

- **Basic tools** (Excel, Google Forms): Manual, error-prone, lack real-time capabilities
- **Enterprise platforms** (Eventbrite, Cvent): Overly complex, expensive, designed for large conferences

This creates a significant gap: **communities with 10-500 participants have no suitable solution**.

### Solution
A two-tier platform that grows with user needs:

**Phase 1 (Free Tier):** Core participant management to drive adoption
**Phase 2 (Premium Tier):** Customizable add-ons tailored to specific community types

### Success Vision (6 Months)
Word-of-mouth adoption makes eventManager the default choice for small community events. Users naturally graduate to premium features as their needs expand, creating sustainable revenue streams.

---

## Market Analysis

### Market Opportunity

**Target Market Size:**
- 58% of teams are hosting more small-scale events in 2025
- Millions of small communities worldwide lack appropriate tools
- Shift from large conferences to intimate, recurring community gatherings

**Current Market Gaps:**
1. **Mobile-native simplicity:** Existing tools require desktop workflows
2. **Affordable pricing:** Enterprise tools charge $50-200/month for small teams
3. **Community focus:** No solutions optimized for recurring, relationship-driven events
4. **Progressive pricing:** All-or-nothing pricing models don't match small budgets

### Competitive Landscape

**Direct Competitors:**

| Competitor | Target | Pricing | Weakness |
|------------|--------|---------|----------|
| RSVPify | Small-medium events | $27-63/month | Desktop-focused, complex setup |
| Partiful | Social gatherings | Free + commission | Limited features, US-only |
| Eventbrite | All event sizes | Free + 3.7% fee | Transaction fees accumulate quickly |
| WildApricot | Member organizations | $60-240/month | Expensive for small groups |

**Indirect Competitors:**
- **Google Forms + Spreadsheets:** 67% of small organizers still use this manual approach
- **WhatsApp/KakaoTalk Groups:** Communication-focused, lacks management tools
- **Paper-based systems:** Still prevalent for on-site check-ins

<image>
Competitive positioning map showing eventManager in the "Simple + Affordable" quadrant, while competitors cluster in "Complex + Expensive" (enterprise tools) or "Simple + Limited" (forms/spreadsheets) quadrants
</image>

### Our Differentiation

**Three Core Pillars:**

1. **Mobile-First Design**
   - Complete functionality without ever opening a laptop
   - Optimized for on-site management with one hand

2. **Progressive Pricing**
   - Free tier with genuine utility (not just a trial)
   - Pay only for features you actually use

3. **Community Customization**
   - Vertical-specific features (sports leagues, study groups, networking events)
   - Rather than one-size-fits-all generic tools

---

## Target Users

### Primary User: Event Organizer

**Demographics:**
- Age: 25-45
- Role: Club president, small business owner, community leader, education coordinator
- Tech proficiency: Comfortable with mobile apps, not necessarily technical
- Event frequency: 4-12 events per year
- Event size: 10-500 participants

**User Personas:**

**Persona 1: Sarah - Book Club Organizer**
- Manages monthly meetups of 20-30 people
- Current pain: Tracks RSVPs in WhatsApp, manually creates name tags
- Needs: Quick check-in, simple attendee list, occasional prize drawing
- Budget: $0-15/month

**Persona 2: David - Small Business Owner**
- Hosts quarterly customer appreciation events (100-200 attendees)
- Current pain: Uses Eventbrite but 3.7% fee is expensive
- Needs: Professional appearance, payment collection, branded pages
- Budget: $30-50/month

**Persona 3: Professor Kim - Academic Workshop Coordinator**
- Organizes seminars and symposiums (50-150 participants)
- Current pain: Excel spreadsheets, printed name badges, manual check-in
- Needs: Badge printing, session tracking, anonymous participant option
- Budget: Department funds available for legitimate tools

### Secondary User: Event Participant

**User Experience Requirements:**
- No app installation required to register
- Simple registration process (< 2 minutes)
- Mobile-friendly confirmation and updates
- Clear communication about data usage

---

## Product Features

### Phase 1: Free Tier (User Acquisition)

**Objective:** Establish market presence with genuinely useful free features that solve real problems.

#### 1.1 Event Creation & Management

**Functionality:**
- Create unlimited events with basic details (name, date, location, description)
- Set participant capacity limits
- Event status management (draft, published, in-progress, completed)
- Duplicate past events for recurring activities

**User Flow:**
```
Open app → Create Event → Enter details → Generate shareable link → Done
```

<image>
Mobile screen mockup showing simple event creation form with fields: Event Name, Date/Time, Location, Max Participants, Description
</image>

#### 1.2 Participant Registration & Management

**Functionality:**
- Shareable registration link (no login required for participants)
- Customizable registration form fields (organizer defines what to collect)
- Real-time participant list with search and filtering
- Export participant data (CSV, Excel)
- Anonymous participant option (nickname-based registration)

**Key Features:**
- **Flexible data collection:** Organizer chooses required fields (name, contact, affiliation, custom questions)
- **Privacy controls:** Toggle between identified and anonymous modes
- **Instant updates:** Participant list syncs in real-time across devices

<image>
Split screen showing: Left - Participant registration form from attendee view; Right - Organizer's participant list with search bar and filter options
</image>

#### 1.3 On-Site Check-In

**Functionality:**
- Quick name-based check-in (search and tap)
- Check-in statistics (total registered, checked-in, no-shows)
- Offline mode (syncs when connection restored)
- Multiple devices can check-in simultaneously

**User Flow:**
```
Event day → Open event → Check-in mode → Search name → Tap to confirm → Status updates
```

<image>
Mobile screen showing check-in interface with large search bar, participant names with check-in buttons, and progress bar at top showing "42/80 checked in"
</image>

#### 1.4 Prize Drawing System

**Functionality:**
- Draw winners from registered or checked-in participants
- Animated random selection for engaging reveal
- Prevent duplicate winners (optional toggle)
- Drawing history log
- Announcement mode (full-screen winner display)

**Use Cases:**
- Door prizes at networking events
- Raffle drawings at fundraisers
- Random selection for volunteer tasks
- Giveaway contests

<image>
Prize drawing screen with spinning animation, followed by winner announcement screen with confetti effect and large name display
</image>

**Phase 1 Limitations (Free Tier):**
- Maximum 3 active events simultaneously
- Participant data stored for 90 days after event
- Basic email notifications only
- Standard branding includes "Powered by eventManager" footer

---

### Phase 2: Premium Tier (Monetization)

**Objective:** Provide customizable premium features that address specific community needs and justify payment.

#### 2.1 On-Site Badge Printing Service

**Functionality:**
- Pre-designed badge templates (10+ styles)
- Custom badge design with logo and branding
- QR code integration for enhanced check-in
- **Hardware rental option:** Portable thermal printers delivered to event location

**Pricing Model:**
- **Software only:** $15/event (bring your own printer)
- **Hardware rental:** $50/event (includes printer delivery and pickup)
- **Per-badge printing:** $0.50/badge for high-volume events

**Technical Integration:**
- Compatible with portable thermal printers (Brother QL series, Dymo LabelWriter)
- Print queue management for multiple check-in stations
- Instant badge printing upon check-in

<image>
Badge design interface showing customization options: logo upload, field selection (name, affiliation, role), QR code toggle, color schemes. Preview of physical badge on right side.
</image>

#### 2.2 Custom Branded Event Pages

**Functionality:**
- Remove "Powered by eventManager" branding
- Custom domain support (events.yourcompany.com)
- Branded email communications with your logo
- Custom color schemes and styling
- Embedded registration on your existing website

**Pricing:** $25/month or $15/event

**Target Users:** Businesses, professional organizations, repeat event organizers

<image>
Before/after comparison showing generic event page vs. fully branded custom page with company colors, logo, and domain
</image>

#### 2.3 Vertical-Specific Add-Ons

**Modular features based on community type:**

**For Sports/Recreation Communities:**
- Tournament bracket generation
- Team management and scheduling
- Score tracking and leaderboards
- **Pricing:** $20/month

**For Professional/Networking Events:**
- Speaker/session management
- Agenda builder with time slots
- Attendee networking features (opt-in contact sharing)
- **Pricing:** $30/month

**For Fundraising/Fee-Based Events:**
- Integrated payment collection via Toss Payments
- Automatic fee reminders
- Payment status tracking
- Receipt generation
- **Pricing:** $20/month + 2.5% transaction fee

**For Educational/Workshop Events:**
- Multi-session attendance tracking
- Certificate generation
- Feedback/evaluation forms
- Material distribution
- **Pricing:** $25/month

<image>
Feature matrix table showing different add-on packages (Sports, Professional, Fundraising, Educational) with checkmarks for included features
</image>

#### 2.4 Advanced Analytics & Reporting

**Functionality:**
- Attendance trends across multiple events
- Participant retention analysis
- No-show rate tracking
- Custom report generation
- Data export with advanced filtering

**Pricing:** Included with any premium subscription

#### 2.5 Premium Support & Customization

**Enterprise Option for Unique Needs:**
- Custom feature development for specific community requirements
- Dedicated account manager
- Priority support (4-hour response time)
- White-label solution option
- **Pricing:** Custom quote (starting at $200/month)

---

## Business Model & Monetization Strategy

### Revenue Streams

**1. Subscription Revenue (Primary)**

| Tier | Price | Target User | Expected Adoption |
|------|-------|-------------|-------------------|
| Free | $0 | All new users | 70% of user base |
| Basic Premium | $15-25/month | Regular organizers | 20% of users |
| Add-On Bundles | $20-30/module | Specialized communities | 8% of users |
| Enterprise Custom | $200+/month | Large/unique orgs | 2% of users |

**2. Transaction Fees (Secondary)**
- Payment processing add-on: 2.5% per transaction
- Badge printing service: $0.50/badge or $50/event with hardware rental

**3. Professional Services (Future)**
- Event consulting and setup assistance
- Custom design work for branded pages
- Integration development with other platforms

### Pricing Philosophy

**Free Tier Strategy:**
- Provide genuine value, not crippled features
- Focus on user acquisition and word-of-mouth
- Limitation: Event volume (3 active events) rather than feature restrictions
- Goal: 70% retention on free tier = strong product-market fit

**Premium Conversion Triggers:**
- Natural need evolution (e.g., first paid event → needs payment collection)
- Professional appearance requirements (branding)
- Specific vertical needs (sports brackets, speaker management)
- Frequency-based (4+ events/year = subscription makes sense)

**Expected Conversion Funnel:**
```
100 new users (free tier)
→ 30 become regular users (3+ events)
→ 10 convert to premium (needs-based)
→ 2 upgrade to higher tiers (specialized/enterprise)
```

### Competitive Pricing Analysis

**Our Advantage:**

| Solution | Cost for 10 events/year | Limitations |
|----------|------------------------|-------------|
| Google Forms | $0 | Manual, no real-time, no check-in |
| Eventbrite | $370+ (3.7% × 100 tickets × $10) | Per-transaction fees accumulate |
| RSVPify | $324/year ($27/month) | Must pay even for off-season |
| **eventManager** | **$150-180/year** | Pay only when needed, modular features |

---

## Technical Architecture

### Technology Stack (To Be Determined with Team)

**Key Technical Requirements:**

**1. Mobile-First Development**
- Native app (iOS/Android) or Progressive Web App (PWA)
- Offline-capable for on-site use without reliable internet
- Responsive design optimized for smartphone one-handed use

**2. Real-Time Synchronization**
- Multiple devices can manage same event simultaneously
- Check-in updates appear instantly across all organizer devices
- Conflict resolution for simultaneous check-ins

**3. Scalability Considerations**
- Support 500 concurrent check-ins at single event
- Handle 10,000+ events per month at 6-month milestone
- Database design for rapid participant search (sub-second)

**4. External Integrations**
- **Payment processing:** Toss Payments API (Korea focus initially)
- **Notifications:** Email/SMS for confirmations and reminders
- **Calendar:** Export to Google Calendar, Apple Calendar, Outlook
- **Printer hardware:** Bluetooth/WiFi thermal printer connectivity

### Data Management & Privacy

#### Data Collection

**Participant Information:**
- **Organizer-defined fields:** Name, contact info, affiliation (customizable)
- **System-generated:** Registration timestamp, check-in status, device info
- **Optional:** Profile photo, dietary restrictions, accessibility needs

**Organizer Control:**
- Organizers define required vs. optional fields per event
- Anonymous mode: Participants use nicknames, no personal info collected
- Export and deletion capabilities for GDPR/privacy compliance

#### Data Storage & Retention

**Free Tier:**
- Participant data retained for 90 days post-event
- Organizer can export data anytime during retention period
- Automated deletion after retention period

**Premium Tier:**
- Extended retention (1 year or indefinite with active subscription)
- Historical analytics across multiple events

#### Privacy & Compliance

**Participant Rights:**
- Participants can request data deletion
- Clear consent during registration
- Privacy policy disclosure before data collection

**Security Measures:**
- Encrypted data transmission (TLS 1.3)
- Encrypted data at rest
- Regular security audits
- GDPR/personal information protection law compliance

**Anonymous Mode Feature:**
- Organizer can enable nickname-based registration
- No personally identifiable information collected
- Use case: Informal social gatherings, sensitive communities

---

## User Experience & Design Principles

### Design Philosophy

**1. One-Handed Operation**
- All critical functions accessible with thumb reach
- Large tap targets (minimum 44×44 pixels)
- Bottom-aligned primary actions

**2. 3-Tap Rule**
- Any core function achievable within 3 taps from home screen
- Example: Create event → Enter name → Share link = 3 taps

**3. Offline-First**
- Critical features work without internet connection
- Clear visual indicators for sync status
- Graceful degradation when offline

**4. Instant Feedback**
- Check-in confirmation animations
- Real-time participant count updates
- Loading states never exceed 2 seconds perception

### Key User Flows

#### Flow 1: First-Time Event Creation

```
1. Download app / Open website
2. Sign up (email + password or social login)
3. Tutorial overlay (3 screens, skippable)
4. "Create Your First Event" button
5. Event creation form (6 required fields)
6. Preview and confirm
7. Share link generated → Copy or send directly
8. Confirmation screen with next steps
```

**Time to completion:** < 3 minutes

<image>
Step-by-step user flow diagram showing 8 screens from app download to shareable link generation, with time estimates for each step
</image>

#### Flow 2: Event Day Check-In

```
1. Open app → Events list
2. Tap active event
3. "Start Check-In" button
4. Search participant name (autosuggest after 2 characters)
5. Tap name → Confirmation animation
6. Return to search (auto-clears) for next participant
```

**Time per check-in:** < 5 seconds

<image>
Linear flow diagram showing organizer perspective during check-in process with timing annotations
</image>

#### Flow 3: Prize Drawing

```
1. From event screen → "Prize Drawing" tab
2. Select participant pool (all registered or checked-in only)
3. "Start Drawing" button
4. Animated random selection (3-5 seconds)
5. Winner revealed with full-screen display
6. Option to draw again or announce winner
7. Drawing saved to history
```

<image>
Prize drawing flow showing participant selection screen, animated drawing screen, and winner announcement screen with sharing options
</image>

---

## Success Metrics & KPIs

### Phase 1 Success Criteria (Months 1-6)

**User Acquisition Metrics:**
- **Primary:** 5,000 registered users by Month 6
- **Secondary:** 200 new users per week by Month 4
- **Viral coefficient:** 1.2 (each user invites 1.2 others on average)

**Engagement Metrics:**
- **Event creation rate:** 60% of registered users create at least 1 event
- **Repeat usage:** 40% of users create 2+ events within 6 months
- **Participant volume:** 50,000 total participants managed through platform

**Product-Market Fit Indicators:**
- **Net Promoter Score (NPS):** > 40 by Month 6
- **User retention:** 50% of users active after 3 months
- **Word-of-mouth growth:** 30% of new users from referrals (no paid marketing)

### Phase 2 Success Criteria (Months 7-12)

**Monetization Metrics:**
- **Free-to-paid conversion:** 15% of regular users (3+ events) upgrade to premium
- **Monthly Recurring Revenue (MRR):** $10,000 by Month 12
- **Average Revenue Per User (ARPU):** $2.50 (blended across free and paid)

**Feature Adoption:**
- **Badge printing:** 100 events use this service by Month 12
- **Payment collection:** $50,000 in transaction volume processed
- **Vertical add-ons:** 5% of premium users select specialized add-on

**Business Health:**
- **Churn rate:** < 10% monthly for paid subscribers
- **Customer Lifetime Value (LTV):** > $100
- **Customer Acquisition Cost (CAC):** < $20
- **LTV:CAC ratio:** > 3:1

### Measurement & Analytics

**Tracking Implementation:**
- Event analytics dashboard for organizers (views, registrations, check-ins)
- Internal admin dashboard for product metrics
- A/B testing framework for feature optimization
- User feedback collection (in-app surveys post-event)

---

## Go-To-Market Strategy

### Phase 1: Launch & Initial Traction (Months 1-3)

**Target Communities:**
1. **University clubs and student organizations** (captive audience, high event frequency)
2. **Local hobby/interest groups** (book clubs, running groups, board game meetups)
3. **Small coworking spaces** (regular community events, tech-savvy organizers)

**Launch Tactics:**
- **Beta program:** Recruit 20 communities for early testing and testimonials
- **Community partnerships:** Offer free premium features for first 6 months to anchor communities
- **Content marketing:** "How to organize better [specific community type] events" guides
- **Social proof:** Case studies and testimonials prominently featured

### Phase 2: Scaling & Word-of-Mouth (Months 4-6)

**Growth Mechanisms:**
- **Viral loop:** Participants see "Powered by eventManager" and become organizers
- **Referral program:** Existing organizers get 1 month premium for each referral
- **Online communities:** Active presence in organizer forums (Reddit, Facebook groups)
- **Template library:** Pre-built event templates for common use cases (workshop, meetup, fundraiser)

**Channel Strategy:**
- **Organic social media:** User-generated content showcasing successful events
- **Partnerships:** Integrations with complementary tools (community management platforms)
- **PR outreach:** Target publications focused on small businesses and community building

### Phase 3: Monetization & Expansion (Months 7-12)

**Premium Conversion:**
- **In-app nudges:** Contextual prompts when users hit free tier limits
- **Success triggers:** Offer premium features after successful first event
- **Email campaigns:** Feature highlights and use case education

**Market Expansion:**
- **Vertical specialization:** Targeted marketing to sports leagues, professional associations
- **Geographic expansion:** Localization for additional markets beyond initial launch
- **Enterprise outreach:** Direct sales for custom/white-label solutions

---

## Risk Analysis & Mitigation

### High-Impact Risks

#### Risk 1: Low User Acquisition

**Scenario:** After 6 months, only 1,000 users instead of target 5,000

**Mitigation Strategies:**
- **Pre-launch validation:** Beta program with 20+ communities before public launch
- **Pivot-ready architecture:** Modular design allows quick feature adjustments based on feedback
- **Alternative channels:** If organic growth slow, allocate budget for targeted ads ($500/month test)
- **Partnership acceleration:** Secure distribution partnerships with community platforms

#### Risk 2: Weak Free-to-Paid Conversion

**Scenario:** < 5% conversion rate makes business model unsustainable

**Mitigation Strategies:**
- **Earlier monetization testing:** A/B test premium features in Month 3, not Month 7
- **Pricing experiments:** Test different tier structures ($10, $15, $25 price points)
- **Value-add bundling:** Combine multiple add-ons into higher-value packages
- **Freemium adjustments:** Tighten free tier limits if necessary (e.g., 2 events instead of 3)

#### Risk 3: Technical Scalability Issues

**Scenario:** Platform becomes unstable at scale or during peak event loads

**Mitigation Strategies:**
- **Load testing:** Simulate 1,000 concurrent check-ins before public launch
- **Infrastructure headroom:** Design for 10× expected capacity from day one
- **Monitoring and alerts:** Real-time performance monitoring with automated alerts
- **Graceful degradation:** Offline mode ensures core check-in works even if server unreachable

### Medium-Impact Risks

#### Risk 4: Competitive Response

**Scenario:** Established player launches similar mobile-first product

**Mitigation Strategies:**
- **Speed advantage:** Launch MVP within 4 months to establish market position
- **Community moat:** Build strong user relationships and brand loyalty early
- **Feature innovation:** Maintain development velocity with unique vertical add-ons
- **Switching costs:** Data portability and integrations make migration sticky

#### Risk 5: Payment Integration Dependencies

**Scenario:** Toss Payments or other third-party services change terms or pricing

**Mitigation Strategies:**
- **Multi-provider architecture:** Design payment module to support multiple processors
- **Backup integrations:** Have Stripe and PayPal integration ready as alternatives
- **Clear terms:** Premium payment features positioned as convenience, not dependency

---

## Development Roadmap

### Pre-Launch (Months -2 to 0)

**Milestone: MVP Ready for Beta**

**Core Features:**
- Event creation and management
- Participant registration (shareable link)
- Basic check-in functionality
- Prize drawing system
- User authentication and basic profile

**Team Activities:**
- Finalize technology stack selection
- Set up development environment and CI/CD
- Design system and UI component library
- Beta tester recruitment (20 communities)

**Success Criteria:**
- 20 beta testers complete at least 1 real event
- < 5 critical bugs reported
- NPS from beta testers > 30

### Phase 1: Public Launch (Months 1-3)

**Milestone: 1,000 Users & Product-Market Fit Validation**

**Feature Additions:**
- Offline mode for check-in
- Export participant data (CSV/Excel)
- Email notifications (registration confirmations)
- Event duplication for recurring events
- Anonymous participant mode

**Team Activities:**
- Public launch announcement and PR
- Community partnership outreach
- User feedback collection and analysis
- Performance monitoring and optimization

**Success Criteria:**
- 1,000 registered users
- 500+ events created
- 60% of users create at least 1 event
- < 1% critical error rate

### Phase 2: Growth (Months 4-6)

**Milestone: 5,000 Users & Revenue Readiness**

**Feature Additions:**
- Premium tier infrastructure (billing, subscriptions)
- Badge printing integration (software component)
- Custom branding options
- Advanced analytics dashboard
- Referral program system

**Team Activities:**
- Premium feature beta testing
- Pricing validation experiments
- Marketing content creation (guides, templates)
- Payment processor integration

**Success Criteria:**
- 5,000 registered users
- 2,000+ events created
- 100 beta testers for premium features
- Payment infrastructure tested and secure

### Phase 3: Monetization (Months 7-9)

**Milestone: $5,000 MRR**

**Feature Additions:**
- Full premium tier launch
- First vertical add-on (payment collection via Toss)
- Hardware rental logistics for badge printing
- Multi-event analytics

**Team Activities:**
- Premium user onboarding optimization
- Customer support scaling
- Revenue operations setup
- Vertical add-on market research

**Success Criteria:**
- $5,000 Monthly Recurring Revenue
- 10% free-to-paid conversion rate
- < 15% monthly churn
- 50+ paying customers

### Phase 4: Expansion (Months 10-12)

**Milestone: $10,000 MRR & Vertical Specialization**

**Feature Additions:**
- 2-3 additional vertical add-ons (sports, professional events)
- Enterprise custom features
- Advanced integrations (calendar sync, CRM)
- Mobile app optimization (if PWA initially)

**Team Activities:**
- Vertical market targeting campaigns
- Enterprise sales process development
- Product roadmap community voting
- Series A preparation (if pursuing VC)

**Success Criteria:**
- $10,000 Monthly Recurring Revenue
- 15% free-to-paid conversion rate
- 5% adoption of vertical add-ons
- 2-3 enterprise customers

---

## Open Questions & Future Decisions

### Decisions Needed with Team

**Technology Stack:**
- Native app (React Native, Flutter) vs. Progressive Web App (PWA)?
- Backend framework and database choice
- Hosting infrastructure (AWS, GCP, Firebase)
- Real-time sync technology (WebSockets, Firebase Realtime DB)

**Design Specifics:**
- Complete user flow wireframes and mockups
- Brand identity (logo, colors, typography)
- Onboarding experience details
- Accessibility compliance level (WCAG 2.0 AA/AAA)

**Operations:**
- Customer support strategy (in-app chat, email, help center)
- Hardware rental logistics partner for badge printing
- Data retention policies and legal compliance
- Terms of service and privacy policy drafting

### Future Research & Exploration

**Market Questions:**
- Geographic expansion priority (which countries/regions after initial launch)?
- Additional vertical add-ons beyond initial roadmap (corporate, nonprofit, education)?
- White-label opportunity size and pricing model?

**Product Questions:**
- Participant-side app features (personal event history, networking)?
- Social features (community discovery, public event listings)?
- Marketplace for third-party integrations or templates?

**Business Questions:**
- Venture capital fundraising vs. bootstrapping?
- International payment processor options beyond Toss?
- Partnership opportunities with coworking spaces, accelerators, universities?

---

## Appendix

### Glossary

**Active Event:** An event that is published and accepting registrations or currently in progress.

**Anonymous Mode:** Event configuration where participants register with nicknames instead of real names, no personal data collected.

**Check-In:** Process of marking a registered participant as present at the event.

**Free Tier:** No-cost subscription level with core features and usage limitations.

**Organizer:** Primary user role who creates and manages events.

**Participant:** Individual who registers for and attends events (secondary user).

**Premium Tier:** Paid subscription levels with additional features and higher usage limits.

**Vertical Add-On:** Specialized feature module designed for specific community types (sports, professional, fundraising, educational).

### References

**Market Research Sources:**
- Small event management competitive analysis (2025)
- User pain point research from community organizer forums
- Pricing analysis of RSVPify, Eventbrite, WildApricot, Partiful

**Inspiration & Best Practices:**
- Mobile-first design principles
- Freemium conversion strategies
- Community-driven product growth

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-10-01 | Product Team | Initial PRD based on discovery sessions |

---

**End of Document**