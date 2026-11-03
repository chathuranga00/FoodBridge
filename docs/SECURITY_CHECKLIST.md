# FoodBridge Security Checklist & Verification

**Project:** FoodBridge (Sri Lanka Community Sustainability Platform)  
**Team:** EcoConnect  
**Date of Audit:** November 2026  
**Status:** Verified & Passing (100 Backend Integration Tests, 7 Frontend Flow Tests)  

---

## 1. Authentication & Rate Limiting

| Check | Status | Implementation Details |
| :--- | :---: | :--- |
| **Password Hashing** | PASS | Standard BCrypt hashing via `BCryptPasswordEncoder` with default salt rounds. Plaintext passwords are never stored. |
| **Stateless JWT Tokens** | PASS | Short-lived Access Tokens (1 hour) and secure Refresh Tokens (7 days) signed with HMAC-SHA-512 (`io.jsonwebtoken.security.Keys`). |
| **Auth Endpoint Rate Limiting** | PASS | `RateLimitingFilter` enforces sliding-window rate limiting on `/api/auth/login`, `/api/auth/register`, and `/api/auth/refresh`. Exceeding limits triggers HTTP `429 Too Many Requests` with a `Retry-After: 60` response header and standard JSON `ErrorResponse`. |
| **Reverse Proxy IP Resolution** | PASS | Safely extracts client IP from `X-Forwarded-For` header (taking the first trusted IP) with fallback to `getRemoteAddr()`. |

---

## 2. Authorization & IDOR (Insecure Direct Object Reference) Protection

| Resource / Endpoint | Tenant Check | IDOR Prevention Status |
| :--- | :--- | :---: |
| **Food Rescue Requests** (`/api/food-rescue/requests/{id}/decide`, `/collect`) | Verifies `listing.getBusiness().getUser().getId().equals(user.getId())`. | PASS — Verified with `testIdor_RestaurantCannotDecideOrCollectOtherRestaurantFoodRequest` (Returns `400 Bad Request`). |
| **Grocery Discount Reservations** (`/api/grocery/reservations/{id}/cancel`) | Verifies user ownership (`reservation.getUser().getId().equals(user.getId())`) or shop ownership. | PASS — Verified with `testIdor_CustomerCannotCancelOtherCustomerReservation` (Returns `403 Forbidden`). |
| **Grocery Coupon Redemptions** (`/api/grocery/redemptions/verify`, `/confirm`) | Verifies `reservation.getOffer().getBusiness().getId().equals(business.getId())`. | PASS — Verified with `testIdor_StoreCannotRedeemOtherStoreCoupon` (Returns `403 Forbidden`). |
| **Business-Charity Partnerships** (`/api/partnerships/{id}/complete`, `/deliver`) | Enforces counterparty authorization: only the recipient charity can complete; only partnering business can deliver. | PASS — Enforced in `PartnershipService` with explicit user ID equality checks. |
| **User & Profile Management** (`/api/profiles/*`) | Bound to the authenticated principal (`authentication.getName()`); users cannot modify other tenants' profiles. | PASS — Fully isolated by JWT subject. |
| **Admin Endpoints** (`/api/admin/**`) | Protected with `@PreAuthorize("hasRole('ADMIN')")`. | PASS — Verified by `RoleAccessSecurityTests` and `AdminDashboardCompleteTests`. |

---

## 3. Input Validation & Data Sanitization

| Check | Status | Implementation Details |
| :--- | :---: | :--- |
| **Jakarta Bean Validation** | PASS | All incoming DTOs use `@NotNull`, `@NotBlank`, `@Size`, `@Email`, `@Positive`, `@DecimalMin`, and `@AssertTrue`. Controllers use `@Valid`. |
| **Malformed Payload Handling** | PASS | `GlobalExceptionHandler` intercepts `MethodArgumentNotValidException` and returns a structured `400 Bad Request` with a field-by-field validation error map. |
| **Food Safety Declarations (Rule 7)** | PASS | `FoodListingCreateRequest` and `GroceryOfferCreateRequest` require `@AssertTrue` food-safety compliance checkboxes; requests without explicit confirmation are rejected. |
| **Numeric & Coordinate Bounds** | PASS | Quantities, prices, latitudes (`[-90, 90]`), and longitudes (`[-180, 180]`) are validated before persistence. |

---

## 4. File Upload Security & DoS Mitigation

| Check | Status | Implementation Details |
| :--- | :---: | :--- |
| **Multipart Size Constraints** | PASS | Configured in `application.yml`: `spring.servlet.multipart.max-file-size: 5MB` and `max-request-size: 10MB` to prevent Denial of Service. |
| **MIME Allowlist** | PASS | Restricts uploads to `image/jpeg`, `image/png`, `image/webp`, and `application/pdf`. Other MIME types rejected with `400 Bad Request`. |
| **File Extension Allowlist** | PASS | Restricts extensions to `.jpg`, `.jpeg`, `.png`, `.webp`, `.pdf`. Executables (`.exe`, `.sh`, `.bat`) and scripts are blocked. |
| **Magic Bytes Inspection** | PASS | `FileUploadSecurityService.validateMagicBytes` reads file headers (e.g. JPEG `FF D8 FF`, PNG `89 50 4E 47`, PDF `%PDF-`, WebP `RIFF...WEBP`) to prevent polyglot file masquerading. |
| **Path Traversal Defense** | PASS | Rejects filenames with `..`, `/`, `\`. Uploaded assets are saved under randomly generated UUID filenames. |
| **Safe URL Validation** | PASS | External document/proof URLs are validated to only permit `http` and `https` schemes; dangerous schemes (`javascript:`, `file:`, `data:`) are blocked. |

---

## 5. HTTP Security Headers

Configured in `SecurityConfig.java`:

| Header | Configured Value | Protection |
| :--- | :--- | :--- |
| `X-Content-Type-Options` | `nosniff` | Prevents MIME-sniffing attacks. |
| `X-Frame-Options` | `SAMEORIGIN` | Defends against Clickjacking while allowing same-origin frames. |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Prevents leaking sensitive URL paths in referrer headers. |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` | Enforces HTTPS communication in production. |
| `X-XSS-Protection` | `0` (or modern sanitized mode) | Prevents legacy XSS auditor vulnerabilities. |

---

## 6. Secrets Management & Code Hygiene

| Check | Status | Implementation Details |
| :--- | :---: | :--- |
| **No Hardcoded Secrets** | PASS | All sensitive secrets (`DB_PASSWORD`, `ADMIN_PASSWORD`, `JWT_SECRET`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) use environment variable overrides with defaults for local dev. |
| **Git Exclusions** | PASS | `.gitignore` explicitly blocks `.env`, `.env.local`, `.env.*.local`, and `*.env`, while committing only sanitised `.env.example`. |
| **Repository Auditing** | PASS | Verified clean working tree with zero committed production credentials or API private keys. |

---

## 7. Sensitive Data Privacy

| Check | Status | Implementation Details |
| :--- | :---: | :--- |
| **Password Hash Exclusion** | PASS | `User.passwordHash` is marked with `@JsonIgnore`. |
| **Response DTO Isolation** | PASS | User profiles (`UserResponse`, `AdminUserDto`) omit password hashes and cryptographic salts. Verified in `testSensitiveDataPrivacy_NoPasswordHashLeaked`. |
| **Financial Segregation (Rule 8)** | PASS | Platform subscription revenue and sponsored campaigns are strictly segregated from charity donations and pledges. Verified in `ContributionTrackingWorkflowTests`. |

---

## 8. Automated Test Coverage Summary

### Backend Integration Tests (`mvn test`)
- **Total Test Suites:** 17 suites
- **Total Integration Tests:** 100 tests
- **Failures / Errors:** 0
- **Build Status:** `BUILD SUCCESS`
- **Key Suites:**
  - `SecurityAndIdorTests.java` (8 tests: headers, rate limiting, IDOR on food rescue, IDOR on grocery reservations, IDOR on store redemptions, file upload security, bean validation, password hash privacy)
  - `RoleAccessSecurityTests.java` (Role-based authorization checks across all roles)
  - `AnimalWelfareSeparationTests.java` (Rule 7 animal feed separation checks)
  - `BusinessSubscriptionTests.java` (Subscription feature gating & manual admin activation)
  - `AdminDashboardCompleteTests.java` (Full administrative governance & audit logs)

### Frontend Flow Tests (`npm test` via Vitest)
- **Test File:** `frontend/src/__tests__/criticalFlows.test.js`
- **Tests Passed:** 7 / 7
- **Critical Flows Verified:**
  1. `Authentication Flow`: User login and JWT credential storage.
  2. `Food Rescue Flow`: Submitting requests to `/food-rescue/requests` and restaurant approval via `/decide`.
  3. `Coupon Reservation & Redemption Flow`: Reserving offers and confirming in-store coupon redemption.
  4. `CSR Partnership Flow`: Proposing CSR terms and completing receipt confirmation with promotional recognition activation.
