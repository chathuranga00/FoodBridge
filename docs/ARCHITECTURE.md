# FoodBridge System Architecture & Technical Specifications

> **Platform:** FoodBridge — Community Sustainability & Food Rescue Platform for Sri Lanka  
> **Engineering Organization:** Team EcoConnect  
> **Deployment Targets:** Netlify (Frontend), Render (Backend), Supabase (PostgreSQL + Storage)  

---

## 1. High-Level Architecture Diagram

```mermaid
graph TD
    subgraph ClientLayer["Client & User Tier (Netlify Global Edge CDN)"]
        UI["React 19 + Vite Single Page Application"]
        Router["React Router v7 (SPA Client Routing)"]
        State["Zustand / Context Auth State"]
        Leaflet["Leaflet + OpenStreetMap (Dynamic Pin Clustered Map)"]
        UI --> Router
        UI --> Leaflet
        UI --> State
    end

    subgraph SecurityLayer["Security & Gateway Tier (Render Container)"]
        CORS["CORS Policy Filter (Wildcard Origin Patterns)"]
        RateLimit["In-Memory Rate Limiting (10 req/min/IP on /auth)"]
        SecurityHeaders["Hardened HTTP Headers (HSTS, CSP, X-Frame-Options)"]
        JwtFilter["Stateless JWT Authentication Filter"]
        RBAC["Method-Level RBAC Gate (@PreAuthorize)"]
        CORS --> RateLimit --> SecurityHeaders --> JwtFilter --> RBAC
    end

    subgraph AppServiceLayer["Spring Boot 3 Core Services (Java 21)"]
        AuthSvc["Auth & Token Service"]
        RescueSvc["Food Rescue & Expiration Engine"]
        GrocerySvc["Grocery Discount & Coupon Service"]
        CampaignSvc["Community Relief Campaign Service"]
        PartnerSvc["Business-Charity CSR Partnership Engine"]
        ImpactSvc["Verified Impact Calculation Engine (Rule 4)"]
        AnimalSvc["Animal Welfare & Feed Suitability Engine (Rule 7)"]
        SubSvc["Business Subscriptions & SaaS Revenue (Rule 8)"]
        StorageSvc["Supabase Storage REST Service"]
        NotifSvc["In-App & Email Notification Dispatcher"]
    end

    subgraph PersistenceLayer["Supabase Managed Cloud Tier"]
        Postgres[("Supabase PostgreSQL 15+<br/>Connection Pooler :6543 / Direct :5432")]
        Storage[("Supabase Object Storage<br/>Bucket: foodbridge-uploads")]
    end

    UI -- "HTTPS REST (JWT Bearer Token)" --> CORS
    RBAC --> AuthSvc & RescueSvc & GrocerySvc & CampaignSvc & PartnerSvc & ImpactSvc & AnimalSvc & SubSvc
    RescueSvc & CampaignSvc & PartnerSvc --> StorageSvc
    StorageSvc -- "REST API (Bearer Key)" --> Storage
    AuthSvc & RescueSvc & GrocerySvc & CampaignSvc & PartnerSvc & ImpactSvc & AnimalSvc & SubSvc -- "Spring Data JPA / HikariCP (TLS)" --> Postgres
```

---

## 2. Core Architectural Principles & Enforced Platform Rules

### Rule 1: Role-Based Access Control (RBAC) on Every Endpoint
Every API route is guarded by Spring Security filter chains and `@PreAuthorize` method annotations:
- `ADMIN`: Platform moderation, verification queue, subscription billing, audit logs.
- `RESTAURANT`: Cooked surplus listings, collection approvals, CSR partnerships.
- `GROCERY`: Surplus grocery offers, coupon redemption, campaign sponsorships.
- `CHARITY`: Surplus food requests, community campaigns, contribution confirmations.
- `ANIMAL_ORG`: Animal feed requests, feeding location management, sanctuary nutrition drives.
- `USER`: Citizens and volunteers discovering deals, volunteering, and reserving coupons.

### Rule 2: Admin-Verified Publishers
Unverified businesses and non-profits cannot publish public food listings or launch campaigns. Publishers submit registration documentation (`BRC`, `NGO`, or `Animal Welfare Registry`) which enters an administrative approval queue.

### Rule 3: Campaign Moderation Gate
Fundraising and relief campaigns submitted by verified charities remain in `PENDING_APPROVAL` status until reviewed by an administrator. Photos and administrative division verifications are mandatory.

### Rule 4: Verified Completed Impact Accounting
Platform impact counters (`food_weight_kg`, `meals_rescued`, `co2_savings_kg`, `people_fed`, `animals_fed`) never increment on initial listing or claim. They only increment upon explicit physical handoff confirmation (`status: COMPLETED` and `verification_status: VERIFIED`).

```mermaid
sequenceDiagram
    autonumber
    actor Restaurant as Restaurant Donor
    actor Charity as Verified Charity
    participant API as FoodBridge REST API
    participant DB as Supabase PostgreSQL
    participant Impact as Impact Calculation Engine

    Restaurant->>API: POST /api/food-rescue/listings (Cooked Meals, 25 kg)
    API->>DB: INSERT food_listings (status: AVAILABLE)
    Charity->>API: POST /api/food-rescue/listings/{id}/request
    API->>DB: INSERT food_requests (status: PENDING)
    Restaurant->>API: PATCH /api/food-rescue/requests/{id}/status (status: APPROVED)
    API->>DB: UPDATE food_listings (status: RESERVED)
    Note over Restaurant,Charity: Physical collection & handoff at pickup window
    Charity->>API: POST /api/food-rescue/requests/{id}/confirm-collection
    API->>DB: UPDATE food_listings (status: COLLECTED)
    API->>Impact: Trigger verified impact record generation
    Impact->>DB: INSERT activity_records (VERIFIED, COMPLETED)
    Impact->>DB: INSERT impact_records (25 kg, 50 meals, 62.5 kg CO2e)
    Note over API,DB: Public Impact Dashboard instantly reflects verified totals!
```

---

## 3. Food Suitability & Separation Rules Engine (Rule 7)

To eliminate food safety risks and respect cultural and dietary guidelines, FoodBridge implements a strict suitability engine:

```mermaid
flowchart TD
    Listing["Business Creates Surplus Listing"] --> CheckType{"Food Category & Suitability"}
    
    CheckType -- "Cooked Human Food" --> HumanCheck{"animalSuitable == true?"}
    CheckType -- "Raw Greens / Grain / Trimmings" --> BothFeed["Eligible for Both Human & Animal Orgs"]
    
    HumanCheck -- "No (Standard cooked buffet)" --> HumanOnly["Visible ONLY to Verified CHARITY"]
    HumanCheck -- "Yes (Clean rice, plain bread)" --> DualEligible["Visible to Both CHARITY & ANIMAL_ORG"]
    
    HumanOnly -.-> BlockAnimal["ANIMAL_ORG Claim Request BLOCKED (HTTP 400 Bad Request)"]
    DualEligible --> FeedReqMatch["Matches Feed Requirements (No onions, garlic, spices)"]
```

---

## 4. Financial Ledger Segregation Architecture (Rule 8)

FoodBridge maintains complete architectural separation between philanthropic community funds and platform software revenue:

```mermaid
graph LR
    subgraph PhilanthropicLedger["Zero-Fee Charity Direct Banking (Pledges & Relief)"]
        CitizenDonor["Citizen / Business Donor"] -->|Direct Bank Deposit / Cheque| CharityBank["Verified Charity Bank Account"]
        CitizenDonor -.->|Record Pledge| PledgesTable[("campaign_contributions table")]
        CharityBank -.->|Confirm Receipt| CharityAdmin["Charity Confirms Bank Credit"]
        CharityAdmin --> PledgesTable
    end

    subgraph SaaSPlatformRevenue["FoodBridge SaaS Operations Ledger"]
        SubscribingBiz["Subscribing Business"] -->|Monthly / Annual Subscription| AdminBillingQueue["Manual Subscription Review"]
        AdminBillingQueue --> SubscriptionsTable[("business_subscriptions table")]
    end
```

- **Philanthropic Ledger (`campaign_contributions`):** Zero platform transaction fees, zero intermediary holding accounts. Pledges are verified directly against bank statements by receiving charities.
- **SaaS Platform Revenue (`business_subscriptions`):** Tracks commercial business tiers (`FREE`, `PROMOTION`, `PREMIUM`) with feature gating and manual admin activation.

---

## 5. Network Topology & Production Deployment Infrastructure

```mermaid
flowchart TD
    Internet((End Users & Mobile Browsers)) -->|HTTPS| NetlifyEdge["Netlify Global Edge CDN<br/>- React 19 SPA<br/>- Asset Caching & Minification<br/>- _redirects SPA Fallback"]
    
    NetlifyEdge -->|HTTPS API Requests / Bearer JWT| RenderLB["Render Cloud Load Balancer<br/>- SSL Termination<br/>- DDoS Protection"]
    
    RenderLB --> SpringBoot["Spring Boot 3 Container (Java 21)<br/>- Port 8080<br/>- MaxRAMPercentage: 75%<br/>- HealthCheck: /api/health"]
    
    SpringBoot -->|HikariCP TLS / Port 6543| SupabasePooler["Supabase Transaction Pooler"]
    SupabasePooler --> SupabaseDB[("PostgreSQL 15+ Database")]
    
    SpringBoot -->|HTTPS Multipart REST| SupabaseStorage[("Supabase Object Storage CDN<br/>Bucket: foodbridge-uploads")]
```

---

## 6. Monorepo Directory Organization

```text
FoodBridge/
├── backend/                             # Java Spring Boot 3 REST API
│   ├── src/main/java/com/ecoconnect/foodbridge/
│   │   ├── config/                      # Security (RBAC), CORS, OpenAPI, AdminSeeder
│   │   ├── controller/                  # 15 REST Controllers
│   │   ├── dto/                         # Typed request/response records & validation
│   │   ├── exception/                   # Global exception handler (@ControllerAdvice)
│   │   ├── model/                       # JPA entities & enumerations
│   │   ├── repository/                  # Spring Data JPA repositories (27 interfaces)
│   │   ├── security/                    # JWT filter, Rate limiting, Upload security
│   │   └── service/                     # Business logic & relational seeders
│   ├── src/main/resources/
│   │   ├── application.yml              # Supabase PostgreSQL production config
│   │   ├── application-local.yml        # Offline H2 in-memory profile
│   │   └── db/
│   │       ├── migration/               # Flyway SQL migrations (V1 to V12)
│   │       └── seed_demo_data_kandy.sql # Standalone Kandy SQL demo script
│   ├── Dockerfile                       # Multi-stage production container build
│   └── pom.xml                          # Maven build dependencies & plugins
├── frontend/                            # React 19 + Vite SPA
│   ├── public/
│   │   └── _redirects                   # Netlify SPA routing fallback
│   ├── src/
│   │   ├── api/client.js                # Centralized Axios API client & interceptors
│   │   ├── components/                  # Navigation, Modals, Feed cards, Notifications
│   │   ├── context/                     # AuthContext, NotificationContext
│   │   └── pages/                       # Public views & 6 Role-specific dashboards
│   ├── netlify.toml                     # Standalone Netlify configuration
│   └── package.json                     # Dependencies & scripts
├── docs/                                # Technical specifications
│   ├── API_DOCUMENTATION.md             # REST API specifications
│   ├── openapi.yaml                     # OpenAPI 3.0 specification
│   ├── ARCHITECTURE.md                  # System architecture & diagrams
│   ├── ROLES_AND_PERMISSIONS.md         # RBAC matrix
│   ├── SECURITY_CHECKLIST.md            # Security audit report
│   ├── USER_GUIDES.md                   # User guide per role
│   ├── DEMO_SCRIPT.md                   # 5-minute continuous walkthrough script
│   └── KANDY_PILOT_PLAN.md              # Regional rollout plan & metrics
├── DEPLOYMENT.md                        # Netlify, Render & Supabase setup guide
├── netlify.toml                         # Root monorepo Netlify configuration
├── render.yaml                          # Render Blueprint Infrastructure-as-Code
└── README.md                            # Comprehensive platform overview
```
