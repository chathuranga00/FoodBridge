# FoodBridge REST API Documentation & OpenAPI Specification

> **Base URL (Local):** `http://localhost:8080/api`  
> **Base URL (Production Render):** `https://foodbridge-backend.onrender.com/api`  
> **Interactive Swagger UI:** [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)  
> **OpenAPI JSON Spec:** [http://localhost:8080/v3/api-docs](http://localhost:8080/v3/api-docs)  
> **OpenAPI YAML Spec:** [http://localhost:8080/v3/api-docs.yaml](http://localhost:8080/v3/api-docs.yaml)  

---

## Table of Contents

1. [Authentication & Authorization](#1-authentication--authorization)
2. [Error Response Format](#2-error-response-format)
3. [API Endpoints by Module](#3-api-endpoints-by-module)
   - [3.1 Authentication & Profile (`/api/auth`)](#31-authentication--profile-apiauth)
   - [3.2 Profiles & Verification (`/api/profiles`)](#32-profiles--verification-apiprofiles)
   - [3.3 Food Rescue & Listings (`/api/food-rescue`)](#33-food-rescue--listings-apifood-rescue)
   - [3.4 Grocery Discounts & Coupons (`/api/grocery`)](#34-grocery-discounts--coupons-apigrocery)
   - [3.5 Community Campaigns (`/api/campaigns`)](#35-community-campaigns-apicampaigns)
   - [3.6 Contributions & Evidence (`/api/contributions`)](#36-contributions--evidence-apicontributions)
   - [3.7 Business-Charity Partnerships (`/api/partnerships`)](#37-business-charity-partnerships-apipartnerships)
   - [3.8 Explore Map & Pins (`/api/map`)](#38-explore-map--pins-apimap)
   - [3.9 Promotions & Business Public Profiles (`/api/promotions`, `/api/public`)](#39-promotions--business-public-profiles-apipromotions-apipublic)
   - [3.10 Impact Dashboard & Metrics (`/api/impact`)](#310-impact-dashboard--metrics-apiimpact)
   - [3.11 Volunteer Opportunities (`/api/volunteer`)](#311-volunteer-opportunities-apivolunteer)
   - [3.12 Animal Welfare Support (`/api/animal-welfare`)](#312-animal-welfare-support-apianimal-welfare)
   - [3.13 Business Subscriptions (`/api/subscriptions`)](#313-business-subscriptions-apisubscriptions)
   - [3.14 Admin Management (`/api/admin`)](#314-admin-management-apiadmin)
   - [3.15 Public Demo Seeding (`/api/public/demo-data`)](#315-public-demo-seeding-apipublicdemo-data)
   - [3.16 File & Image Uploads (`/api/upload`)](#316-file--image-uploads-apiupload)

---

## 1. Authentication & Authorization

All secured endpoints require an HTTP `Authorization` header containing a valid JSON Web Token (JWT):
```http
Authorization: Bearer <your_jwt_access_token>
```

### Supported Roles

- `ADMIN`: Platform superusers, system auditors, verifiers.
- `RESTAURANT`: Prepared food donors (cooked meals, buffet trays).
- `GROCERY`: Supermarkets & grocers (produce, dairy, pantry, discounted groceries).
- `CHARITY`: Registered non-profits distributing human food and managing campaigns.
- `ANIMAL_ORG`: Registered animal welfare shelters claiming animal feed.
- `USER`: Citizens, volunteers, donors.

---

## 2. Error Response Format

All API errors return a standard structured JSON object:

```json
{
  "timestamp": "2026-11-03T12:00:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "File exceeds maximum allowed size of 5MB.",
  "path": "/api/upload"
}
```

For validation failures (HTTP 400), a `fieldErrors` map is provided:

```json
{
  "timestamp": "2026-11-03T12:00:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed for request object",
  "fieldErrors": {
    "email": "Email must be a well-formed address",
    "password": "Password must be at least 8 characters long"
  },
  "path": "/api/auth/register"
}
```

---

## 3. API Endpoints by Module

### 3.1 Authentication & Profile (`/api/auth`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register a new user (`ADMIN`, `RESTAURANT`, `GROCERY`, `CHARITY`, `ANIMAL_ORG`, `USER`). Returns JWT pair. |
| `POST` | `/api/auth/login` | Public | Authenticate credentials. Rate-limited to 10 requests / min / IP. |
| `POST` | `/api/auth/refresh` | Public | Exchange refresh token for a new access token. |
| `GET` | `/api/auth/me` | Authenticated | Retrieve profile details of currently authenticated user. |

---

### 3.2 Profiles & Verification (`/api/profiles`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/profiles/my` | Authenticated | Retrieve current user's business/charity/animal organization profile. |
| `POST` | `/api/profiles/business` | `RESTAURANT`, `GROCERY` | Create business profile with BR number, address, and coordinates. |
| `PUT` | `/api/profiles/business` | `RESTAURANT`, `GROCERY` | Update business profile details. |
| `POST` | `/api/profiles/charity` | `CHARITY` | Create registered charity profile with NGO number, capacity, and service area. |
| `PUT` | `/api/profiles/charity` | `CHARITY` | Update charity profile details. |
| `POST` | `/api/profiles/animal-org` | `ANIMAL_ORG` | Create animal welfare organization profile. |

---

### 3.3 Food Rescue & Listings (`/api/food-rescue`)

*Enforces Rule 2 (Verified Publishers) and Rule 7 (Human vs Animal Suitability Separation).*

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/food-rescue/listings` | Verified `RESTAURANT`, `GROCERY` | Create surplus food listing (`suitabilityType: HUMAN_CONSUMPTION` or `ANIMAL_FEED`, `animalSuitable: true/false`). |
| `GET` | `/api/food-rescue/listings/my` | `RESTAURANT`, `GROCERY` | View business's own surplus listings and claims. |
| `GET` | `/api/food-rescue/listings/available` | Verified `CHARITY`, `ANIMAL_ORG` | Browse available surplus matching organization suitability (Rule 7). |
| `GET` | `/api/food-rescue/listings/{id}` | Authenticated | Get full details of a specific food listing. |
| `POST` | `/api/food-rescue/listings/{id}/request` | Verified `CHARITY`, `ANIMAL_ORG` | Submit claim/request for surplus food with estimated beneficiaries. |
| `PATCH` | `/api/food-rescue/requests/{id}/status` | Listing Owner | Approve (`APPROVED`) or reject (`REJECTED`) a food claim. |
| `POST` | `/api/food-rescue/requests/{id}/confirm-collection` | Listing Owner / Claimer | Confirm handoff. Generates verified `ActivityRecord` and `ImpactRecord` (Rule 4). |

---

### 3.4 Grocery Discounts & Coupons (`/api/grocery`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/grocery/offers` | Public | Browse active discounted grocery packages with filters (`category`, `maxPrice`, `search`). |
| `GET` | `/api/grocery/offers/{id}` | Public | View specific grocery offer details and stock availability. |
| `POST` | `/api/grocery/offers` | Verified `GROCERY` | Publish discounted grocery offer (`originalPrice`, `discountedPrice`, `quantityAvailable`, `validUntil`). |
| `GET` | `/api/grocery/offers/my` | Verified `GROCERY` | List grocer's active, expired, and redeemed offers. |
| `POST` | `/api/grocery/offers/{id}/reserve` | `USER` | Reserve coupon. Issues unique code (e.g. `GROC-3PXE6R54`) with 24h expiration. |
| `GET` | `/api/grocery/reservations/my` | `USER` | View active and redeemed customer coupon reservations. |
| `POST` | `/api/grocery/reservations/redeem` | Verified `GROCERY` | Verify and redeem customer coupon code at checkout counter. |
| `POST` | `/api/grocery/reservations/{id}/cancel` | `USER` | Cancel reserved coupon and restore stock quantity. |

---

### 3.5 Community Campaigns (`/api/campaigns`)

*Enforces Rule 3 (Admin Moderation Gate) and Rule 6 (Beneficiary Privacy).*

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/campaigns` | Public | List active approved campaigns with progress bars and search. |
| `GET` | `/api/campaigns/{id}` | Public | Retrieve campaign details, updates, and sponsor recognition. |
| `POST` | `/api/campaigns` | Verified `CHARITY`, `ANIMAL_ORG` | Submit campaign for review (`PENDING_APPROVAL`). Evidence required. |
| `GET` | `/api/campaigns/my` | `CHARITY`, `ANIMAL_ORG` | View campaigns managed by current organization. |
| `POST` | `/api/campaigns/{id}/updates` | Campaign Owner | Post milestone update with photo evidence and distribution date. |
| `GET` | `/api/campaigns/{id}/updates` | Public | View photo updates and delivery timeline. |

---

### 3.6 Contributions & Evidence (`/api/contributions`)

*Enforces Rule 5 (Zero-Fee Direct Banking) and Rule 8 (Financial Segregation).*

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/contributions/pledge` | `USER`, `RESTAURANT`, `GROCERY` | Record direct bank transfer or goods pledge (`status: PLEDGED`). |
| `GET` | `/api/contributions/my` | Authenticated | View current user's pledged and confirmed contributions. |
| `GET` | `/api/contributions/campaign/{id}` | Campaign Owner | List pledges received for charity campaign. |
| `PATCH` | `/api/contributions/{id}/confirm` | Campaign Owner | Confirm bank deposit received (`CONFIRMED`). Updates campaign progress. |
| `POST` | `/api/contributions/{id}/evidence` | Campaign Owner | Upload handover photo evidence and mark `DISTRIBUTED`. |

---

### 3.7 Business-Charity Partnerships (`/api/partnerships`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/partnerships/initiate` | Verified `RESTAURANT`, `GROCERY`, `CHARITY` | Initiate CSR partnership proposal. |
| `GET` | `/api/partnerships/my` | Business / Charity | View active, proposed, and completed CSR partnerships. |
| `PATCH` | `/api/partnerships/{id}/respond` | Counterpart | Accept or decline partnership terms. |
| `POST` | `/api/partnerships/{id}/messages` | Participants | Send coordination message within partnership thread. |
| `POST` | `/api/partnerships/{id}/complete` | Charity | Confirm receipt of supplies, upload delivery photo, and mark `COMPLETED`. |
| `GET` | `/api/partnerships/business/{id}/recognitions` | Public | Get public sponsor badges earned by business. |

---

### 3.8 Explore Map & Pins (`/api/map`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/map/pins` | Public | Retrieve aggregated map pins (surplus food, grocery deals, feeding points, campaigns). Filter by `type`, `district`, `city`. |
| `GET` | `/api/map/locations` | Public | Discover active feeding points and distribution hubs within geographical radius. |

---

### 3.9 Promotions & Business Public Profiles (`/api/promotions`, `/api/public`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/public/businesses` | Public | Search verified restaurants and grocers by city, district, rating. |
| `GET` | `/api/public/businesses/{id}` | Public | View business profile, badges, active deals, and sustainability achievements. |
| `GET` | `/api/public/promotions/featured` | Public | View premium featured promotional campaigns. |
| `POST` | `/api/public/promotions/{id}/view` | Public | Increment promotion impression counter. |
| `POST` | `/api/public/promotions/{id}/click` | Public | Increment promotion click-through counter. |

---

### 3.10 Impact Dashboard & Metrics (`/api/impact`)

*Enforces Rule 4: Only verified, completed activities contribute to statistics.*

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/impact/summary` | Public | Platform-wide totals: food rescued (kg), meals served, CO2e saved (kg), beneficiaries fed. |
| `GET` | `/api/impact/stats` | Public | Time-series metrics (daily/weekly/monthly breakdown). |
| `GET` | `/api/impact/organization/{id}` | Public | Individual organization's verified impact totals. |
| `GET` | `/api/impact/my` | Authenticated | Current user / business personal impact scorecard. |
| `GET` | `/api/impact/export` | Public | Export impact records to CSV spreadsheet. |

---

### 3.11 Volunteer Opportunities (`/api/volunteer`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/volunteer/opportunities` | Public | List volunteer drives by category (`FOOD_DISTRIBUTION`, `ANIMAL_WELFARE`, etc.). |
| `POST` | `/api/volunteer/opportunities` | Verified `CHARITY`, `ANIMAL_ORG` | Post new volunteer opportunity. |
| `POST` | `/api/volunteer/opportunities/{id}/signup` | `USER` | Register for volunteer shift. |
| `POST` | `/api/volunteer/opportunities/{id}/cancel` | `USER` | Cancel attendance registration. |
| `GET` | `/api/volunteer/my-participations` | `USER` | View volunteer service history and logged hours. |
| `POST` | `/api/volunteer/opportunities/{id}/attendees/{pId}/attendance` | Opportunity Organizer | Verify attendee presence and log hours contributed. |

---

### 3.12 Animal Welfare Support (`/api/animal-welfare`)

*Enforces Rule 7: Separation of animal feed vs. human consumption.*

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/animal-welfare/locations` | Public | View community feeding points and animal habitats on map. |
| `POST` | `/api/animal-welfare/locations` | Verified `ANIMAL_ORG` | Register new animal feeding location with feeding times. |
| `GET` | `/api/animal-welfare/requirements` | Public | Browse dietary feed requirement specifications. |
| `POST` | `/api/animal-welfare/requirements` | Verified `ANIMAL_ORG` | Publish feed requirements (safe items, prohibited items, urgency). |
| `GET` | `/api/animal-welfare/available-feed` | Verified `ANIMAL_ORG` | Browse surplus listings flagged as animal-suitable. |

---

### 3.13 Business Subscriptions (`/api/subscriptions`)

*Enforces Rule 8: Separation of SaaS revenue from charity contributions.*

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/subscriptions/packages` | Public | View available subscription plans (`FREE`, `PROMOTION`, `PREMIUM`). |
| `GET` | `/api/subscriptions/current` | Business | Get active subscription status and feature quotas. |
| `POST` | `/api/subscriptions/subscribe` | Business | Submit subscription plan selection request. |
| `GET` | `/api/subscriptions/history` | Business | View invoice and renewal history. |

---

### 3.14 Admin Management (`/api/admin`)

*Enforces Rule 1: Restricted to users with `Role.ADMIN`.*

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/overview` | `ADMIN` | Platform metrics overview (users, listings, revenue, impact). |
| `GET` | `/api/admin/users` | `ADMIN` | Search users, toggle active status, manage roles. |
| `GET` | `/api/admin/verifications` | `ADMIN` | Pending verification queue for businesses, charities, and animal orgs. |
| `POST` | `/api/admin/verifications/{id}/approve` | `ADMIN` | Approve profile verification (grants publishing authority). |
| `POST` | `/api/admin/verifications/{id}/reject` | `ADMIN` | Reject verification with reviewer reason. |
| `GET` | `/api/admin/campaigns` | `ADMIN` | Review submitted campaigns in `PENDING_APPROVAL` status. |
| `PATCH` | `/api/admin/campaigns/{id}/status` | `ADMIN` | Approve (`ACTIVE`), reject, or flag campaigns. |
| `GET` | `/api/admin/subscriptions` | `ADMIN` | View business subscriptions and payment verification queue. |
| `POST` | `/api/admin/subscriptions/{id}/activate` | `ADMIN` | Manually activate or renew business subscription. |
| `GET` | `/api/admin/audit-logs` | `ADMIN` | Audit log viewer for platform moderation actions. |

---

### 3.15 Public Demo Seeding (`/api/public/demo-data`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/public/demo-data/status` | Public | Inspect whether demo data is currently loaded. |
| `POST` | `/api/public/demo-data/seed` | Public | Seed or reload realistic Kandy demo dataset (`?force=true`). |

---

### 3.16 File & Image Uploads (`/api/upload`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/upload` | Authenticated | Secure file upload. Enforces magic bytes, MIME, 5MB limit, and uploads to Supabase Storage CDN. |

