# FoodBridge System Architecture

**Team:** EcoConnect  
**Region:** Sri Lanka  
**Platform:** FoodBridge — Community Sustainability Platform  

---

## 1. High-Level Architecture Overview

FoodBridge connects restaurants, grocery shops, registered charities, animal welfare organizations, volunteers, and citizens across Sri Lanka to eliminate food waste and distribute surplus food safely and effectively.

```
       +-------------------------------------------------------------+
       |                     Users & Clients                         |
       |  (Admin, Restaurant, Grocery, Charity, Animal Org, General) |
       +------------------------------+------------------------------+
                                      |
                                      v
       +-------------------------------------------------------------+
       |               Frontend Layer (React + Vite)                 |
       |  - Leaflet + OpenStreetMap for spatial discovery            |
       |  - Role-specific dashboards & workflows                     |
       |  - Hosted on Netlify                                        |
       +------------------------------+------------------------------+
                                      | HTTPS / REST (CORS)
                                      v
       +-------------------------------------------------------------+
       |            Backend Layer (Spring Boot 3 + Java 17)          |
       |  - Stateless RESTful API with Spring Security (RBAC)        |
       |  - Validation & Suitability Rules Engine                    |
       |  - Verification & Moderation Workflows                      |
       |  - Hosted on Render                                         |
       +------------------------------+------------------------------+
                                      | JDBC + SSL
                                      v
       +-------------------------------------------------------------+
       |             Database Layer (Supabase PostgreSQL)            |
       |  - Relational schema with foreign keys and audit logs       |
       |  - Row Level Security (RLS) support                         |
       +-------------------------------------------------------------+
```

---

## 2. Core Non-Negotiable Rules Architecture

1. **Role-Based Access Control (RBAC):**
   - Every backend endpoint enforces explicit permission checks using Spring Security `@PreAuthorize` or `SecurityFilterChain` patterns.
   - Roles: `ADMIN`, `RESTAURANT`, `GROCERY`, `CHARITY`, `ANIMAL_ORG`, `USER`.

2. **Admin Verification Gate for Publishers:**
   - Businesses (`RESTAURANT`, `GROCERY`) and charities (`CHARITY`, `ANIMAL_ORG`) must be explicitly `VERIFIED` by an `ADMIN` before publishing food listings or creating campaigns.

3. **Campaign Moderation Gate:**
   - All fundraising and donation campaigns must be submitted for review and approved by an `ADMIN` prior to public exposure.

4. **Verified Completed Impact Accounting:**
   - Only transactions and donations with statuses `VERIFIED` and `COMPLETED` are aggregated into public impact metrics (meals rescued, kg redistributed, CO2 saved).

5. **No Direct Payment Processing:**
   - FoodBridge records pledges and donor intents. Receipts and contributions are confirmed out-of-band directly by the receiving charity.

6. **Privacy Protection & Anonymization:**
   - Beneficiary personal identifiable information (PII) and vulnerable beneficiary residential addresses are never exposed in public feeds or API payloads.

7. **Food Suitability & Safety Separation:**
   - Strict separation between human consumable food and animal feed.
   - Human food requires safety checklists, temperature logging, and expiration constraints.

8. **Separate Financial & Contribution Ledgers:**
   - Charity contributions and donor pledges are isolated in distinct schemas/tables from FoodBridge platform operational revenue.

9. **Code Quality & Validation:**
   - Jakarta Bean Validation on all DTOs, global exception handling (`@ControllerAdvice`), typed responses, and clean documentation.

---

## 3. Directory Layout

```
FoodBridge/
├── backend/            # Spring Boot 3 REST API (Java 17, Maven)
│   ├── src/main/java/  # Application sources, config, controllers, models
│   ├── src/main/resources/ # application.yml, database settings
│   ├── pom.xml         # Maven project configuration
│   └── .env.example    # Backend environment variables template
├── frontend/           # React + Vite Single Page Application
│   ├── src/            # Components, views, map integrations, API client
│   ├── package.json    # Frontend dependencies
│   └── .env.example    # Frontend environment variables template
├── docs/               # System documentation, schemas, and architecture
└── README.md           # Root repository overview and setup guide
```

