# FoodBridge User Guide by Role

> **Platform:** FoodBridge — Community Sustainability & Food Rescue Platform for Sri Lanka  
> **Target Audience:** Administrators, Business Owners, Charity Directors, Animal Shelters, Volunteers, and Citizens  

---

## Table of Contents

1. [Administrator Guide (`ADMIN`)](#1-administrator-guide-admin)
2. [Restaurant Donor Guide (`RESTAURANT`)](#2-restaurant-donor-guide-restaurant)
3. [Supermarket & Grocer Guide (`GROCERY`)](#3-supermarket--grocer-guide-grocery)
4. [Charity & NGO Guide (`CHARITY`)](#4-charity--ngo-guide-charity)
5. [Animal Welfare Shelter Guide (`ANIMAL_ORG`)](#5-animal-welfare-shelter-guide-animal_org)
6. [Citizen, Volunteer & Donor Guide (`USER`)](#6-citizen-volunteer--donor-guide-user)

---

## 1. Administrator Guide (`ADMIN`)

### Overview & Access
Administrators manage platform compliance, verify organizations, moderate campaigns, monitor CSR partnerships, oversee commercial subscriptions, and audit security logs.

- **Login Credentials (Demo):** `admin@foodbridge.lk` / `Admin@FoodBridge2026`
- **Dashboard Route:** `/dashboards/admin`

### Key Workflows

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        ADMIN DASHBOARD TABS                            │
│  [Overview] [Users] [Verifications] [Listings] [Campaigns]             │
│  [Partnerships] [Subscriptions] [Impact Reports] [Audit Logs]         │
└────────────────────────────────────────────────────────────────────────┘
```

1. **Organization Verification Queue:**
   - Review pending Business Registration Certificates (`BRC`) and NGO registration documents.
   - Inspect business type, physical address, and contact person.
   - Click **Approve Verification** to unlock publishing rights, or **Reject** with a clear explanation for the applicant.
2. **Campaign Moderation Gate (Rule 3):**
   - Review campaigns submitted by charities before public listing.
   - Verify need type, target amount/quantity, rural district division, and uploaded beneficiary evidence.
   - Moderate status: `ACTIVE`, `REJECTED`, or `FLAGGED`.
3. **Business Subscription Management (Rule 8):**
   - Review business upgrade requests (`PROMOTION` or `PREMIUM`).
   - Verify manual bank transfer / corporate payment reference.
   - Click **Activate Subscription** to enable premium features (featured badge, extra promotional offers, advanced analytics).
4. **Audit Logs & Security Monitoring:**
   - Filter by actor, target entity, timestamp, or event type.
   - Monitor role changes, user suspensions, and privileged actions.

---

## 2. Restaurant Donor Guide (`RESTAURANT`)

### Overview & Access
Restaurants, caterers, and bakeries safely list surplus cooked meals, buffet trays, and day-end baked goods for collection by verified charities or animal shelters.

- **Login Credentials (Demo):** `restaurant@foodbridge.lk` / `Demo@FoodBridge2026!`
- **Dashboard Route:** `/dashboards/business`

### Key Workflows

1. **Profile Setup & Verification Request:**
   - Navigate to **Business Profile** and enter Business Registration Number, address, and coordinates.
   - Submit for admin approval. Once verified, the **Post Surplus Food** action unlocks.
2. **Publishing a Surplus Food Listing:**
   - Click **Create Food Listing**.
   - Specify:
     - **Title & Description:** e.g., *"Surplus Rice & Curry Buffet Trays"*
     - **Category:** Cooked Meals, Bakery, or Fresh Produce.
     - **Suitability Separation (Rule 7):** Select `HUMAN_CONSUMPTION`. If suitable for animals (e.g. day-end unspiced bread or rice), check **"Also suitable for animal feed"**.
     - **Food Safety:** Quantity in kg, preparation timestamp, safe storage instructions, and pickup window (e.g. 2:00 PM – 5:00 PM).
3. **Managing Incoming Food Claims:**
   - When a verified charity or animal shelter requests the food, view claim notes and recipient organization.
   - Click **Approve Request** to reserve the batch.
4. **Handoff & Completed Impact:**
   - When the charity arrives during the pickup window, verify collection and click **Confirm Handover**.
   - This records verified rescued food weight and increments national impact metrics.
5. **CSR Partnerships & Sponsorships:**
   - Partner with local charities to sponsor school meal programs or tea estate relief campaigns.

---

## 3. Supermarket & Grocer Guide (`GROCERY`)

### Overview & Access
Grocers, supermarkets, and agricultural distributors list discounted grocery bundles approaching best-before dates and offer surplus greens to animal welfare shelters.

- **Login Credentials (Demo):** `grocery@foodbridge.lk` / `Demo@FoodBridge2026!`
- **Dashboard Route:** `/dashboards/business`

### Key Workflows

1. **Publishing Discounted Grocery Offers:**
   - Click **Add Grocery Offer**.
   - Enter category (Fresh Produce, Dairy, Bakery, Pantry Staples, Animal Feed).
   - Enter **Original Price (Rs.)**, **Discounted Price (Rs.)** (e.g. 50% discount), available package quantity, and expiration date.
   - Upload clear photo of produce crates or packaged bundles.
2. **Redeeming Customer Coupon Codes:**
   - When a citizen presents a coupon code (e.g. `GROC-3PXE6R54`):
   - Navigate to the **Coupon Redemption** tab.
   - Enter or scan the 13-character code and click **Verify & Redeem**.
   - The platform verifies code validity, checks expiration, releases reservation, and marks the deal completed.
3. **Listing Clean Produce Trimmings for Animal Sanctuaries:**
   - List clean vegetable outer leaves, carrot tops, and bruised fruit as `ANIMAL_FEED`.
   - Local animal welfare organizations receive alerts and arrange bulk collection.

---

## 4. Charity & NGO Guide (`CHARITY`)

### Overview & Access
Registered non-profit foundations, soup kitchens, and community trusts claim human-edible food surplus, coordinate volunteers, and run verified relief campaigns.

- **Login Credentials (Demo):** `charity@foodbridge.lk` / `Demo@FoodBridge2026!`
- **Dashboard Route:** `/dashboards/charity`

### Key Workflows

1. **Claiming Surplus Food Listings:**
   - Browse **Available Food Surplus** matching human consumption criteria.
   - Click **Request Food**, specify required quantity and estimated beneficiaries (e.g. 150 school children).
   - Once approved, collect supplies during the scheduled window and click **Confirm Collection**.
2. **Creating Community Relief Campaigns:**
   - Click **Create Campaign**.
   - Specify title, target quantity, target monetary needs, and rural district.
   - Upload administrative division evidence.
   - Once approved by Admin, the campaign appears publicly on the **Campaigns Directory** and **Interactive Map**.
3. **Managing Pledges & Direct Bank Deposits (Rule 5 & Rule 8):**
   - Donors pledge funds or dry rations directly to your verified bank account.
   - When payment reflects on your bank statement, click **Confirm Receipt**. This updates the campaign progress bar.
   - After field distribution, upload photo receipts under **Add Campaign Update**.
4. **Organizing Volunteer Drives:**
   - Create volunteer events (food sorting, van packing, field distribution).
   - Review registrations and mark volunteer hours post-event.

---

## 5. Animal Welfare Shelter Guide (`ANIMAL_ORG`)

### Overview & Access
Animal rescue shelters and welfare trusts claim suitable animal feed, manage community feeding spots, and run animal nutrition campaigns.

- **Login Credentials (Demo):** `animalorg@foodbridge.lk` / `Demo@FoodBridge2026!`
- **Dashboard Route:** `/dashboards/animal-welfare`

### Key Workflows

1. **Managing Feeding Locations:**
   - Click **Register Feeding Location**.
   - Provide location name, target animals (e.g. dogs, cats, mixed), animal headcount, feeding schedule, and map coordinates.
   - Locations appear dynamically on the **Explore Map** with animal welfare markers.
2. **Publishing Dietary Feed Requirements (Rule 7):**
   - Click **Publish Feed Requirement**.
   - Specify:
     - **Suitable Feed Types:** e.g., *"Cooked plain rice, fish scrap broth, unseasoned chicken necks"*.
     - **Prohibited Items:** e.g., *"Strictly no onions, garlic, spices, or chocolate"*.
     - **Daily Quantity Needed:** e.g., 50 kg.
     - **Urgency Level:** `LOW`, `MEDIUM`, `HIGH`, or `CRITICAL`.
3. **Claiming Animal-Suitable Surplus Feed:**
   - Browse surplus listings specifically flagged as `animalSuitable: true`.
   - Human food listings without the animal-suitable tag are automatically restricted to prevent safety hazards.

---

## 6. Citizen, Volunteer & Donor Guide (`USER`)

### Overview & Access
Citizens discover community distribution points, purchase discounted grocery packages, sign up for volunteer drives, and pledge direct support.

- **Login Credentials (Demo):** `volunteer@foodbridge.lk` (Volunteer) or `citizen@foodbridge.lk` (Citizen)
- **Password:** `Demo@FoodBridge2026!`

### Key Workflows

1. **Interactive Map Exploration:**
   - Open `/explore` to view real-time pins across Sri Lanka.
   - Filter by: Surplus Food, Grocery Discounts, Community Campaigns, or Animal Feeding Locations.
2. **Reserving Grocery Discount Coupons:**
   - Browse `/grocery-deals` to find affordable surplus produce, dairy, bakery, and grocery bundles.
   - Click **Reserve Coupon** to secure items at discounted prices.
   - Take the generated coupon code to the cashier at checkout.
3. **Volunteering in Your District:**
   - Browse `/volunteer` for upcoming community service opportunities.
   - Click **Sign Up** for packing or distribution shifts.
   - Attend the event, earn volunteer badges, and view your service record in **My Volunteering**.
4. **Pledging Direct Support to Campaigns:**
   - Select a verified rural campaign on `/charity-campaigns`.
   - Choose direct bank transfer or in-kind donation.
   - Deposit funds directly to the charity's official account with zero platform fees.

