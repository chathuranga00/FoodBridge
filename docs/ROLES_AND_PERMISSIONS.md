# FoodBridge Roles & Permissions Matrix

This document defines the Role-Based Access Control (RBAC) architecture for the FoodBridge platform.

---

## 1. Role Definitions

| Role | Description | Verification Required to Publish? | Primary Capabilities |
| :--- | :--- | :---: | :--- |
| **`ADMIN`** | EcoConnect platform administrators | Auto-verified | Approves organizations, reviews campaigns, oversees platform analytics, manages users. |
| **`RESTAURANT`** | Prepared food and surplus catering businesses | **Yes (Admin)** | Lists surplus prepared meals (human consumption), monitors pickup reservations, tracks food waste reduction. |
| **`GROCERY`** | Supermarkets, grocery stores, produce markets | **Yes (Admin)** | Lists surplus packaged food, dry goods, produce, and eligible animal feed. |
| **`CHARITY`** | Registered non-profit charity organizations | **Yes (Admin)** | Claims surplus food for human consumption, publishes campaigns (subject to admin approval), confirms donor contributions. |
| **`ANIMAL_ORG`** | Animal shelters and welfare organizations | **Yes (Admin)** | Claims surplus food categorized for animal feed, creates feeding campaigns (subject to approval), confirms contributions. |
| **`USER`** | General community members and volunteers | No (standard signup) | Browses public listings and approved campaigns, volunteers for delivery/distribution, pledges contributions. |

---

## 2. Permissions Matrix

| Feature / Action | `ADMIN` | `RESTAURANT` | `GROCERY` | `CHARITY` | `ANIMAL_ORG` | `USER` |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| View Public Listings / Map | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: |
| View Public Approved Campaigns | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: |
| Submit Business Verification Request | - | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | - |
| Approve / Reject Business Verification | :white_check_mark: | :x: | :x: | :x: | :x: | :x: |
| Publish Food Listing (Human Food) | :white_check_mark: | :white_check_mark: (Verified only) | :white_check_mark: (Verified only) | :x: | :x: | :x: |
| Publish Surplus (Animal Feed) | :white_check_mark: | :x: | :white_check_mark: (Verified only) | :x: | :x: | :x: |
| Claim Surplus Human Food | :white_check_mark: | :x: | :x: | :white_check_mark: (Verified only) | :x: | :x: |
| Claim Surplus Animal Feed | :white_check_mark: | :x: | :x: | :x: | :white_check_mark: (Verified only) | :x: |
| Create Fundraising / Relief Campaign | :white_check_mark: | :x: | :x: | :white_check_mark: (Verified only) | :white_check_mark: (Verified only) | :x: |
| Approve Campaign for Public View | :white_check_mark: | :x: | :x: | :x: | :x: | :x: |
| Record Contribution / Pledge | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: |
| Confirm Received Contribution | :white_check_mark: | :x: | :x: | :white_check_mark: | :white_check_mark: | :x: |
| View Vulnerable PII / Addresses | :x: *(Masked)* | :x: *(Masked)* | :x: *(Masked)* | Authorized assigned cases only | Authorized assigned cases only | :x: |

---

## 3. Enforcement in Spring Boot

Endpoint RBAC is enforced via Spring Security method annotations:

```java
// Example: Only verified businesses can publish food
@PreAuthorize("hasAnyRole('RESTAURANT', 'GROCERY') and @verificationService.isVerified(principal)")
@PostMapping("/api/listings")
public ResponseEntity<?> createListing(...) { ... }

// Example: Only admin can approve campaigns
@PreAuthorize("hasRole('ADMIN')")
@PatchMapping("/api/campaigns/{id}/approve")
public ResponseEntity<?> approveCampaign(...) { ... }
```

