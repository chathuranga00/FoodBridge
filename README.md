# FoodBridge

> **Community Sustainability & Food Rescue Platform for Sri Lanka**  
> Developed by **Team EcoConnect**

FoodBridge connects restaurants, grocery shops, charities, animal welfare organizations, volunteers, and citizens across Sri Lanka to eliminate food waste, redistribute surplus food safely, and support local communities.

---

## Architecture & Technology Stack

| Component | Technology | Target Deployment |
| :--- | :--- | :--- |
| **Frontend** | React 19 + Vite, Leaflet + OpenStreetMap | [Netlify](https://www.netlify.com/) |
| **Backend** | Java 17 / 21, Spring Boot 3 (Web, Security, JPA, Validation, Lombok) | [Render](https://render.com/) |
| **Database** | PostgreSQL (Relational schema, RLS, connection pooling) | [Supabase](https://supabase.com/) |
| **Documentation** | Markdown specs, schemas, and RBAC matrices | `/docs` |

---

## Repository Structure

```text
FoodBridge/
├── backend/                             # Java Spring Boot 3 REST API
│   ├── .mvn/wrapper/                    # Maven wrapper files
│   ├── src/main/java/com/ecoconnect/foodbridge/
│   │   ├── config/                      # Security (RBAC) and CORS configuration
│   │   ├── controller/                  # REST controllers (including /api/health)
│   │   └── FoodBridgeApplication.java   # Spring Boot entry point
│   ├── src/main/resources/
│   │   ├── application.yml              # Supabase PostgreSQL & app config
│   │   └── application-local.yml        # Offline H2 in-memory profile
│   ├── src/test/                        # Automated unit & integration tests
│   ├── pom.xml                          # Maven build dependencies
│   ├── mvnw / mvnw.cmd                  # Maven wrappers (Unix / Windows)
│   └── .env.example                     # Backend environment variables template
├── frontend/                            # React + Vite application
│   ├── src/
│   │   ├── App.jsx                      # Main UI & backend connectivity tester
│   │   ├── App.css / index.css          # Modern responsive styling
│   │   └── main.jsx                     # React entry point
│   ├── package.json                     # Vite & React dependencies
│   ├── vite.config.js                   # Vite config with dev proxy to :8080
│   └── .env.example                     # Frontend environment variables template
├── docs/                                # Project documentation
│   ├── ARCHITECTURE.md                  # High-level architecture and data flows
│   └── ROLES_AND_PERMISSIONS.md         # Complete RBAC permissions matrix
├── .gitignore                           # Multi-tier ignore rules
└── README.md                            # Monorepo documentation
```

---

## User Roles

1. **`ADMIN`**: EcoConnect administrators managing verifications, approving campaigns, and reviewing impact metrics.
2. **`RESTAURANT`**: Prepared food donors listing surplus cooked meals for human consumption.
3. **`GROCERY`**: Supermarkets and grocers listing surplus produce, shelf-stable goods, or eligible animal feed.
4. **`CHARITY`**: Registered charities claiming human-edible surplus and organizing verified distribution campaigns.
5. **`ANIMAL_ORG`**: Registered animal welfare shelters claiming surplus animal feed.
6. **`USER`**: Citizens and volunteers discovering community distribution points, volunteering, and pledging support.

---

## Demo Accounts & Pre-Seeded Kandy Dataset

FoodBridge comes equipped with a realistic demonstration dataset set in **Kandy and surrounding Central Province communities** (Peradeniya, Katugastota, Digana, Gampola, Nawalapitiya, Kundasale, Knuckles). All demo entities are clearly labeled with `[DEMO DATA]` or `(Demo Data)`.

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

### Pre-Seeded Dataset Summary

- **4 Verified Restaurants:** The Royal Kandyan Resto, Devon Heritage Bakery & Tea Lounge, Peradeniya Riverside Curry Pot, Kandy Hillside Spice Kitchen.
- **3 Verified Grocery Shops:** Kandy Central Green Grocers, Cargills Food City Katugastota, Digana Valley Fresh Harvest Super.
- **2 Verified Charities:** Kandy Community Relief Foundation (Kandy town, 450 capacity), Central Hills Hope & Nutrition Trust (Gampola/Nawalapitiya, 300 capacity).
- **1 Verified Animal Organization:** Kandy Street Animal Care & Welfare Society (Kundasale Sanctuary, 180 animals) with 3 registered feeding locations (Kundasale Sanctuary, Katugastota Riverbank, Digana Victoria Reservoir) and 2 dietary feed requirements.
- **5 Community Campaigns (Varied Progress):**
  1. *Midday Meals for Rural School Children in Gampola* (85% progress, sponsored by Devon Heritage Bakery)
  2. *Clean Water & Nutrition Rations for Tea Estate Families - Nawalapitiya* (50% progress)
  3. *Emergency Food Relief for Vulnerable Elders in Teldeniya* (25% progress)
  4. *Community Stray Dog & Cat Nutrition Drive - Kundasale* (60% progress, sponsored by Cargills Food City)
  5. *Dry Ration Supply Drive for Knuckles Foothill Villages* (100% completed)
- **Completed CSR Partnership:** Devon Heritage Bakery sponsoring Kandy Community Relief Foundation with message history and verified delivery proof.
- **Volunteer Opportunities & Participation:** 3 events (lunch packing, animal care, relief dispatch) with registered and attended hours.
- **Verified Impact Dashboard Baseline:** 1,450 kg food rescued, 2,900 meals distributed, 3,625 kg CO2e emissions prevented, nourishing 1,050 individuals and 270 shelter/community animals.
- **Business Subscriptions:** Active Premium and Promotion packages with manual renewal tracking (Rule 8 financial segregation).

### How to Seed the Demo Data

You can seed or inspect the demo dataset using any of the following methods:

1. **One-Click HTTP Trigger (REST API):**
   ```bash
   # Check seeding status
   curl http://localhost:8080/api/public/demo-data/status

   # Seed or refresh Kandy demo data
   curl -X POST "http://localhost:8080/api/public/demo-data/seed?force=true"
   ```

2. **Automatic Seeding on Startup:**
   Set `foodbridge.seed-demo-data: true` in `application.yml` or launch with:
   ```bash
   ./mvnw spring-boot:run -Dspring-boot.run.arguments="--foodbridge.seed-demo-data=true"
   ```

3. **Direct SQL Script Execution (Supabase / PostgreSQL / psql):**
   Execute [`backend/src/main/resources/db/seed_demo_data_kandy.sql`](file:///q:/MY%20Projects/FoodBridge/backend/src/main/resources/db/seed_demo_data_kandy.sql) directly in your PostgreSQL client:
   ```bash
   psql -U postgres -d postgres -f backend/src/main/resources/db/seed_demo_data_kandy.sql
   ```

---

## Non-Negotiable Platform Rules

1. **Role-based access control (RBAC):** Enforced on every backend endpoint.
2. **Admin-verified publishers:** Businesses (`RESTAURANT`, `GROCERY`) and non-profits (`CHARITY`, `ANIMAL_ORG`) must be approved by an `ADMIN` before publishing.
3. **Campaign approval gate:** All fundraising and relief campaigns require `ADMIN` approval before going public.
4. **Verified impact statistics:** Only activities marked `VERIFIED` and `COMPLETED` count toward platform impact metrics.
5. **No direct payment processing:** Financial contributions are recorded as pledges and confirmed out-of-band by the receiving charity.
6. **Privacy protection:** Private residential addresses and sensitive beneficiary details are never exposed publicly.
7. **Human vs. Animal food separation:** Strict suitability rules and safety criteria separate human food from animal feed.
8. **Financial segregation:** Charity contributions are recorded in dedicated tables completely separate from FoodBridge platform operational revenue.
9. **Code quality:** Strict Bean Validation, global error handling, and clean, modular code.

---

## Local Development Setup

### Prerequisites

- **Java Development Kit (JDK):** Version 17 or higher (Java 21 supported)
- **Node.js:** Version 18 or higher (Node 20+ recommended)
- **Git**

---

### 1. Backend Setup (Spring Boot)

1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Configure environment variables:
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Provide your **Supabase PostgreSQL** credentials:
     ```ini
     DB_URL=jdbc:postgresql://db.YOUR_PROJECT_REF.supabase.co:5432/postgres?sslmode=require
     DB_USERNAME=postgres
     DB_PASSWORD=your_supabase_password
     JWT_SECRET=your_secure_256_bit_jwt_secret_key
     CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
     ```

3. Run the backend:
   - **With Supabase PostgreSQL (Default):**
     ```bash
     # Unix / macOS
     ./mvnw spring-boot:run

     # Windows PowerShell / CMD
     .\mvnw.cmd spring-boot:run
     ```
   - **Offline / Local Dev Mode (In-memory H2 without live Supabase):**
     ```bash
     .\mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=local
     ```

4. Verify the backend health endpoint:
   Open [http://localhost:8080/api/health](http://localhost:8080/api/health) in your browser or test with curl:
   ```bash
   curl http://localhost:8080/api/health
   ```

---

### 2. Frontend Setup (React + Vite)

1. Open another terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Copy the environment variables template:
   ```bash
   cp .env.example .env
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the Vite development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:5173](http://localhost:5173) in your browser.  
   The FoodBridge landing page will display and test the live connection to the Spring Boot REST API (`/api/health`).

---

## Running Automated Tests

```bash
# Run backend JUnit & MockMvc integration tests
cd backend
mvn test
# or with the wrapper:
.\mvnw.cmd test

# Run frontend build check
cd ../frontend
npm run build
```

---

## Deployment Information

- **Frontend (Netlify):** Configured for single-page React apps. Build command: `npm run build`, publish directory: `dist`.
- **Backend (Render):** Deployable as a Java / Maven service or Docker container. Health check path: `/api/health`.
