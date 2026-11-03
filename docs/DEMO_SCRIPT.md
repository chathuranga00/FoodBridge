# FoodBridge 5-Minute Demonstration Script

> **Walkthrough Story:**  
> Restaurant Lists Surplus Food $\rightarrow$ Charity Claims & Collects $\rightarrow$ Citizen Grocery Coupon $\rightarrow$ Rural School Campaign $\rightarrow$ Business CSR Partnership $\rightarrow$ Spatial Map $\rightarrow$ Verified Impact Dashboard  
> **Target Duration:** 5 Minutes (0:00 – 5:00)  
> **Location Setting:** Kandy & Central Province, Sri Lanka  

---

## Demo Accounts Cheat Sheet

| Step | Persona | Role | Email | Password |
| :---: | :--- | :--- | :--- | :--- |
| **1** | Chef Sunimal (*The Royal Kandyan Resto*) | `RESTAURANT` | `restaurant@foodbridge.lk` | `Demo@FoodBridge2026!` |
| **2** | Dr. Rohana (*Kandy Community Relief*) | `CHARITY` | `charity@foodbridge.lk` | `Demo@FoodBridge2026!` |
| **3** | Priyantha Dissanayake (Citizen) | `USER` | `citizen@foodbridge.lk` | `Demo@FoodBridge2026!` |
| **4** | Gamini Jayasuriya (*Devon Heritage Bakery*) | `RESTAURANT` | `devon.bakery@foodbridge.lk` | `Demo@FoodBridge2026!` |
| **5** | Platform Administrator / Evaluator | `ADMIN` | `admin@foodbridge.lk` | `Admin@FoodBridge2026` |

---

## Detailed Minute-by-Minute Demo Flow

### Act 1: The Problem & The Solution (0:00 – 0:40)

- **Screen:** Home Landing Page (`http://localhost:5173/`)
- **Action:** Scroll smoothly past the hero section, highlighting live counters: **1,450 kg food rescued**, **2,900 meals served**, **3,625 kg $CO_2e$ prevented**.
- **Spoken Narration (Voiceover):**  
  > *"Every evening across Sri Lanka, hotels and restaurants discard hundreds of kilograms of fresh, edible food, while just miles away in rural schools and plantation villages, children go without nutritious meals.  
  > Meet **FoodBridge**, developed by Team EcoConnect. FoodBridge is a community sustainability platform that bridges this gap—connecting restaurants, supermarkets, registered charities, animal shelters, and citizens across Sri Lanka with zero platform transaction fees and strict food safety rules."*

---

### Act 2: Restaurant Lists Surplus Cooked Food (0:40 – 1:30)

- **Screen:** Login as Restaurant (`restaurant@foodbridge.lk`) $\rightarrow$ `/dashboards/business`
- **Action:**
  1. Click **Create Food Listing**.
  2. Enter Title: `"Surplus Traditional Rice & Curry Trays [DEMO DATA]"`.
  3. Category: **Cooked Meals**. Suitability: **Human Consumption**.
  4. Quantity: `25 kg`. Pickup window: `Today 2:00 PM – 5:00 PM`.
  5. Note the safety checklist (temperature, food-grade storage). Click **Publish Listing**.
- **Spoken Narration (Voiceover):**  
  > *"It's 2:00 PM at The Royal Kandyan Resto on Dalada Veediya. Lunch buffet service has concluded with 25 kilograms of wholesome red rice, dhal, and vegetable curries remaining.  
  > Instead of discarding it, Chef Sunimal publishes a verified surplus listing in less than 30 seconds. Under FoodBridge Rule 7, this food is strictly flagged for Human Consumption and made available only to verified charities."*

---

### Act 3: Charity Claims & Completes Collection (1:30 – 2:15)

- **Screen:** Switch to Charity Dashboard (`charity@foodbridge.lk`) $\rightarrow$ `/dashboards/charity`
- **Action:**
  1. View the newly listed Royal Kandyan buffet batch under **Available Food Surplus**.
  2. Click **Request Food**, entering `"50 primary school children lunch packs"`.
  3. Switch back to restaurant view to click **Approve Claim**. The listing transitions to `RESERVED`.
  4. At pickup, click **Confirm Collection**.
- **Spoken Narration (Voiceover):**  
  > *"Instantly, Dr. Rohana from Kandy Community Relief Foundation receives an alert. He requests the batch for their afternoon school meal run.  
  > The restaurant approves the request, reserving the batch. Once the charity driver collects the food containers, both parties confirm the handoff. Under Rule 4, only completed, verified handoffs increment the national impact ledger—recording 25 kg rescued and 50 nutritious meals delivered!"*

---

### Act 4: Citizen Discount Grocery Deals & Coupons (2:15 – 2:55)

- **Screen:** Log in as Citizen (`citizen@foodbridge.lk`) $\rightarrow$ `/grocery-deals`
- **Action:**
  1. Browse discounted grocery offers from Kandy grocers.
  2. Select **Fresh Upcountry Vegetable Crate (55% off)** or **Highland Milk Cartons**.
  3. Click **Reserve Coupon**. The screen generates a clean digital voucher: `GROC-KND-9821` valid for 24 hours.
  4. Briefly show the grocer scanning or entering the code on `/dashboards/business` to verify and complete the purchase.
- **Spoken Narration (Voiceover):**  
  > *"FoodBridge doesn't just rescue prepared food—it fights food waste at retail supermarkets.  
  > Here, citizen Priyantha discovers near-expiry dairy and vegetable bundles at a 50% discount from Peradeniya Green Grocers. He reserves a digital coupon with zero payment upfront, visits the store, and redeems the code at the cashier counter. Grocers eliminate shrinkage, and local families cut grocery bills in half."*

---

### Act 5: Rural School Midday Meals & Animal Welfare (2:55 – 3:45)

- **Screen:** Public Campaigns Directory (`/charity-campaigns`) $\rightarrow$ Open **Midday Meals for Rural School Children in Gampola**
- **Action:**
  1. Showcase the live progress bar (**85% fulfilled**, 1,700 meals served).
  2. View verified photo updates showing children receiving hot lunch boxes.
  3. Point out the zero-fee direct banking instruction (Rule 5 & Rule 8): donors transfer directly to the charity's official bank account.
  4. Briefly navigate to `/animal-welfare` showcasing the Kundasale Sanctuary feeding stations and animal feed requirements (Rule 7).
- **Spoken Narration (Voiceover):**  
  > *"For long-term food security, verified charities create community campaigns. Here in Gampola, 200 rural students rely on this midday meal initiative.  
  > Notice FoodBridge Rule 8: we never touch charity money or take transaction cuts. Donors pledge through the app and transfer directly to the charity's audited bank account.  
  > And we haven't forgotten animals: verified shelters like Kundasale Animal Sanctuary register feeding locations and claim surplus animal feed—strictly separated from human food."*

---

### Act 6: Business CSR Partnerships & Interactive Map (3:45 – 4:35)

- **Screen:** Business Dashboard (`devon.bakery@foodbridge.lk`) $\rightarrow$ Explore Map (`/explore`)
- **Action:**
  1. Show Devon Heritage Bakery's completed CSR partnership with Kandy Community Relief Foundation, featuring delivery proof and public recognition badge.
  2. Navigate to `/explore` (Leaflet Map).
  3. Toggle filter pills: **Cooked Food Surplus (Green)**, **Grocery Deals (Orange)**, **Charity Campaigns (Blue)**, and **Animal Feeding Points (Purple)** across Kandy, Katugastota, Peradeniya, and Digana.
  4. Click a pin to show rich modal details with one-click directions.
- **Spoken Narration (Voiceover):**  
  > *"Local businesses can also formalize CSR partnerships. Devon Heritage Bakery sponsored 2,000 freshly baked buns for Gampola school children, earning a verified sustainability badge on their public storefront.  
  > Everything comes alive on our interactive spatial map. Citizens, volunteers, and delivery drivers can toggle live filters to discover active meal pickups, discounted groceries, and animal feeding points throughout the Central Province."*

---

### Act 7: The Verified Impact Dashboard & Conclusion (4:35 – 5:00)

- **Screen:** Platform Impact Dashboard (`/impact`)
- **Action:** Scroll through the verified analytics cards, environmental savings, and downloadable CSV export.
- **Spoken Narration (Voiceover):**  
  > *"Every single transaction across Sri Lanka feeds into our real-time Impact Dashboard. Over 1,450 kilograms of food rescued, 2,900 meals distributed, and 3.6 metric tons of greenhouse gas emissions prevented.  
  > Zero food waste. Zero platform transaction cuts. 100% verified community impact.  
  > This is FoodBridge—built with care for Sri Lanka by Team EcoConnect. Thank you!"*

