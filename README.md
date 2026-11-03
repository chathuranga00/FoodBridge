# FoodBridge (ආහාර පාලම / உணவுப்பாலம்)

> **Community Sustainability, Food Rescue & Zero-Waste Relief Platform for Sri Lanka**  
> Developed with passion by **Team EcoConnect**  
> *Connecting Hospitality Donors, Supermarkets, Charities, Animal Welfare Shelters, Volunteers, and Citizens across Sri Lanka.*

---

## Architecture & Technology Stack

| Component | Technology | Target Deployment | Production Status |
| :--- | :--- | :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind/Modern CSS, Leaflet + OpenStreetMap | [Netlify](https://www.netlify.com/) (Global CDN, SPA) | Built & Verified |
| **Backend** | Java 21, Spring Boot 3.3.5 (Web, Security RBAC, JPA, Flyway, Validation) | [Render](https://render.com/) (Docker Web Service) | Built & Verified (110 Tests Pass) |
| **Database** | PostgreSQL 15+ (Relational schema, connection pooling, RLS) | [Supabase](https://supabase.com/) (Managed PostgreSQL) | Ready (Migrations V1–V12) |
| **Object Storage** | Supabase Storage (Public CDN bucket: `foodbridge-uploads`) | [Supabase Storage](https://supabase.com/storage) | Integrated & Tested |
| **API Docs** | OpenAPI 3.0 / Swagger UI | `/swagger-ui.html` | Enabled |

---

## Screenshots & Platform Interface

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ [Screenshot: Interactive Geolocation Map (/explore)]                                  │
│ Clustered OpenStreetMap pins with category filtering (Surplus Food, Grocery Deals,     │
│ Campaigns, and Animal Feeding Points) across Kandy, Peradeniya, and Central Province.  │
└────────────────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────────────────┐
│ [Screenshot: Verified Impact Dashboard (/impact)]                                      │
│ Real-time metrics showing 1,450 kg food rescued, 2,900 meals, 3,625 kg CO2e saved,    │
│ with verified NGO distribution records, time-series graphs, and CSV spreadsheet export. │
└────────────────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────────────────┐
│ [Screenshot: Business & Restaurant Dashboard (/dashboards/business)]                   │
│ Surplus food publisher with human vs. animal feed suitability toggle, pickup windows, │
│ active claims queue, grocery discount manager, and CSR partnership messenger.          │
└────────────────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────────────────┐
│ [Screenshot: Charity Relief Dashboard (/dashboards/charity)]                           │
│ Community food requests, rural school lunch campaigns, photo delivery updates, and     │
│ zero-fee direct bank contribution confirmation ledger.                                │
└────────────────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────────────────┐
│ [Screenshot: Administrator Dashboard (/dashboards/admin)]                              │
│ Platform overview KPIs, organization verification queue, campaign moderation,          │
│ business subscription activation, user management, and security audit log viewer.      │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Core Feature Modules

### 1. Surplus Food Rescue (Prepared Meals & Bakery)
- Verified restaurants, bakeries, and caterers list surplus batches with preparation timestamps, quantity (kg), safe temperature guidelines, and scheduled collection windows.
- Enforces **Rule 7 (Human vs. Animal Suitability Separation)**: Cooked human meals never route to animal shelters unless explicitly marked as animal-safe by the culinary donor.

### 2. Retail Grocery Discounts & Digital Coupons
- Supermarkets and grocers list near-expiry produce, dairy cartons, baked goods, and pantry bundles at 50%–75% discounts.
- Citizens reserve vouchers generating digital redemption codes (e.g. `GROC-3PXE6R54`) valid for 24 hours, redeemed by cashiers at store checkout.

### 3. Verified Community Relief Campaigns
- Registered non-profit foundations launch community fundraising and nutritional drives for disadvantaged rural schools and plantation villages.
- Enforces **Rule 3 (Admin Moderation Gate)** and **Rule 5 (Zero-Fee Direct Banking)**: Donors transfer directly to official charity accounts with 0% platform transaction cuts.

### 4. Animal Welfare & Sanctuary Feeding
- Verified animal organizations manage community feeding stations, document animal headcounts, and publish dietary feed requirements (safe items vs. toxic blacklist: strictly no onions, garlic, or spices).
- Claim animal-suitable surplus grains, clean vegetable trimmings, and day-end bread from local grocers.

### 5. Corporate CSR Partnerships & Recognition
- Businesses sponsor charity food drives (e.g. daily bakery rolls for rural primary schools).
- Complete in-app coordination threads, photo delivery sign-offs, and public verified sustainability recognition badges on business profiles.

### 6. Interactive Spatial Map (Leaflet + OpenStreetMap)
- Filterable map pins with dynamic icons and cluster groups for Kandy, Peradeniya, Katugastota, Digana, and Gampola.
- One-click route directions, contact numbers, and operating hours.

### 7. Real-Time Verified Impact Dashboard
- Enforces **Rule 4 (Verified Accounting)**: Only handoffs marked `COMPLETED` and `VERIFIED` count toward platform metrics.
- Computes food rescued (kg), meals served, greenhouse gas emissions prevented ($2.5\text{ kg } CO_2e / \text{kg}$), and animal meals provided.

### 8. Business Subscription Packages & SaaS Revenue
- Commercial subscription plans (`FREE`, `PROMOTION`, `PREMIUM`) with feature gating (featured directory placement, promotional deal limits, and conversion analytics).
- Enforces **Rule 8 (Financial Segregation)**: Platform SaaS revenue is recorded in dedicated tables completely isolated from philanthropic charity funds.

### 9. Full Administrator Oversight
- Verification queue for Business Registration Certificates (`BRC`) and NGO credentials.
- User management (search, role updates, account suspensions).
- Security audit log viewer tracking all privileged actions.

---

## Demo Accounts & Pre-Seeded Kandy Dataset

FoodBridge comes pre-loaded with a realistic demonstration dataset set in **Kandy and surrounding Central Province communities** (Peradeniya, Katugastota, Digana, Gampola, Nawalapitiya, Kundasale, Knuckles). All demo records are clearly labeled with `[DEMO DATA]` or `(Demo Data)`.

### Demo Login Credentials

| Role | Organization / Display Name | Email Address | Password | Typical Role Workflow |
| :--- | :--- | :--- | :--- | :--- |
| **`ADMIN`** | FoodBridge Platform Administration | `admin@foodbridge.lk` | `Admin@FoodBridge2026` | Platform overview, verifications, subscriptions, campaign moderation, audit logs |
| **`RESTAURANT`** | The Royal Kandyan Resto | `restaurant@foodbridge.lk` | `Demo@FoodBridge2026!` | List surplus cooked buffet meals, manage pickup windows |
| **`RESTAURANT`** | Devon Heritage Bakery & Tea Lounge | `devon.bakery@foodbridge.lk` | `Demo@FoodBridge2026!` | List day-end bakery goods (animal suitable), manage CSR partnerships |
| **`RESTAURANT`** | Peradeniya Riverside Curry Pot | `peradeniya.curry@foodbridge.lk` | `Demo@FoodBridge2026!` | Traditional lunch packet surplus, Free subscription package |
| **`RESTAURANT`** | Kandy Hillside Spice Kitchen | `hillside.spice@foodbridge.lk` | `Demo@FoodBridge2026!` | Eco-friendly kitchen food rescue, Hanthana community relief |
| **`GROCERY`** | Kandy Central Green Grocers | `grocery@foodbridge.lk` | `Demo@FoodBridge2026!` | Publish discounted produce offers, redeem customer coupons |
| **`GROCERY`** | Cargills Food City Katugastota | `cargills.katugastota@foodbridge.lk` | `Demo@FoodBridge2026!` | Discounted dairy & bakery bundles, sponsor community campaigns |
| **`GROCERY`** | Digana Valley Fresh Harvest Super | `digana.harvest@foodbridge.lk` | `Demo@FoodBridge2026!` | Discounted pantry staples & safe vegetable trimmings for animal feed |
| **`CHARITY`** | Kandy Community Relief Foundation | `charity@foodbridge.lk` | `Demo@FoodBridge2026!` | Claim human-edible food surplus, run Gampola school lunch campaigns |
| **`CHARITY`** | Central Hills Hope & Nutrition Trust | `centralhills.trust@foodbridge.lk` | `Demo@FoodBridge2026!` | Tea plantation nutrition campaigns, coordinate volunteer dispatch drives |
| **`ANIMAL_ORG`** | Kandy Street Animal Care & Welfare | `animalorg@foodbridge.lk` | `Demo@FoodBridge2026!` | Manage feeding points, publish animal feed specs, run stray dog care campaigns |
| **`USER`** | Kasun Senanayake (Volunteer) | `volunteer@foodbridge.lk` | `Demo@FoodBridge2026!` | Sign up for volunteer opportunities, log service hours, track volunteer badges |
| **`USER`** | Priyantha Dissanayake (Citizen) | `citizen@foodbridge.lk` | `Demo@FoodBridge2026!` | Reserve grocery discount coupons, browse explore map & impact stats |

### Pre-Seeded Dataset Metrics
- **Food Rescued:** 1,450 kg
- **Nutritious Meals Served:** 2,900 meals
- **CO2e Emissions Prevented:** 3,625 kg
- **Beneficiaries Nourished:** 1,050 individuals + 270 shelter/community animals

---

## Local Development Setup

### Prerequisites
- **Java Development Kit (JDK):** Version 17 or 21 (Temurin / OpenJDK)
- **Node.js:** Version 18 or 20+ (Node 20 recommended)
- **Git**

---

### 1. Backend Setup (Spring Boot 3)

1. Open a terminal and navigate to `backend`:
   ```bash
   cd backend
   ```

2. Copy the environment variables template:
   ```bash
   cp .env.example .env
   ```

3. Run the backend:
   - **Offline / Local Dev Mode (In-memory H2 without live Supabase):**
     ```bash
     # Unix / macOS
     ./mvnw spring-boot:run -Dspring-boot.run.profiles=local

     # Windows PowerShell / CMD
     .\mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=local
     ```
   - **With Supabase PostgreSQL (Production Profile):**
     Configure your Supabase JDBC connection string in `.env` and run:
     ```bash
     .\mvnw.cmd spring-boot:run
     ```

4. Verify backend endpoints:
   - Health check: [http://localhost:8080/api/health](http://localhost:8080/api/health)
   - Interactive Swagger UI: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
   - OpenAPI JSON: [http://localhost:8080/v3/api-docs](http://localhost:8080/v3/api-docs)

---

### 2. Frontend Setup (React 19 + Vite)

1. Open another terminal and navigate to `frontend`:
   ```bash
   cd frontend
   ```

2. Copy environment template and install dependencies:
   ```bash
   cp .env.example .env
   npm install
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) in your browser.

---

### 3. Seeding the Demo Data

You can seed or refresh the Kandy demo data set anytime:

```bash
# Check current demo status
curl http://localhost:8080/api/public/demo-data/status

# Seed or refresh Kandy dataset
curl -X POST "http://localhost:8080/api/public/demo-data/seed?force=true"
```

Or execute [`backend/src/main/resources/db/seed_demo_data_kandy.sql`](file:///q:/MY%20Projects/FoodBridge/backend/src/main/resources/db/seed_demo_data_kandy.sql) directly in Supabase SQL Editor or `psql`.

---

## Running Automated Tests

```bash
# Run all backend JUnit & MockMvc integration tests (110 tests)
cd backend
mvn test
# or with the wrapper:
.\mvnw.cmd test

# Run frontend critical flow unit tests (7 tests)
cd ../frontend
npm test

# Run production frontend build
npm run build
```

---

## Project Documentation Index

Comprehensive documentation is available in the [`/docs`](file:///q:/MY%20Projects/FoodBridge/docs) directory:

- [**System Architecture & Diagrams (`ARCHITECTURE.md`)**](file:///q:/MY%20Projects/FoodBridge/docs/ARCHITECTURE.md): System architecture, component topology, sequence diagrams, and suitability rules engine.
- [**API Documentation & Endpoints (`API_DOCUMENTATION.md`)**](file:///q:/MY%20Projects/FoodBridge/docs/API_DOCUMENTATION.md): Complete specifications for all 15 REST controllers with schemas and error codes.
- [**OpenAPI 3.0 Specification (`openapi.yaml`)**](file:///q:/MY%20Projects/FoodBridge/docs/openapi.yaml): Machine-readable YAML specification for Postman/Swagger imports.
- [**User Guide per Role (`USER_GUIDES.md`)**](file:///q:/MY%20Projects/FoodBridge/docs/USER_GUIDES.md): Step-by-step guides for Admin, Restaurant, Grocery, Charity, Animal Shelter, and Citizen roles.
- [**5-Minute Demo Script (`DEMO_SCRIPT.md`)**](file:///q:/MY%20Projects/FoodBridge/docs/DEMO_SCRIPT.md): Complete spoken voiceover script and screen walkthrough for investor / evaluator presentations.
- [**Kandy District Pilot Plan (`KANDY_PILOT_PLAN.md`)**](file:///q:/MY%20Projects/FoodBridge/docs/KANDY_PILOT_PLAN.md): 8-week pilot timeline, stakeholder cohort, food safety SOPs, and verified KPIs.
- [**Production Deployment Guide (`DEPLOYMENT.md`)**](file:///q:/MY%20Projects/FoodBridge/DEPLOYMENT.md): Detailed deployment instructions for Netlify, Render, and Supabase Storage.
- [**Security & IDOR Audit Checklist (`SECURITY_CHECKLIST.md`)**](file:///q:/MY%20Projects/FoodBridge/docs/SECURITY_CHECKLIST.md): Security audit report covering authentication, rate limiting, and input validation.

---

## License & Attribution

Developed by **Team EcoConnect — Sri Lanka** for community sustainability and food waste elimination.  
Licensed under the [Apache 2.0 License](LICENSE).
