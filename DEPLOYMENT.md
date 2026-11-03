# FoodBridge Production Deployment Guide

> **Target Architecture:**  
> - **Frontend:** [Netlify](https://www.netlify.com/) (React 19 + Vite SPA, Global CDN, Automated Deploy Previews)  
> - **Backend:** [Render](https://render.com/) (Spring Boot 3, Java 21, Multi-stage Docker Web Service)  
> - **Database:** [Supabase](https://supabase.com/) (Managed PostgreSQL 15+, Connection Pooling, Automated Flyway Migrations)  
> - **Storage:** [Supabase Storage](https://supabase.com/storage) (Object Storage CDN for Documents, Photos, and Handover Receipts)  
> - **Developed by:** Team EcoConnect — Sri Lanka  

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Step 1: Supabase Production Setup](#step-1-supabase-production-setup)
   - [Database Provisioning & Connection Strings](#database-provisioning--connection-strings)
   - [Storage Bucket & Policies](#storage-bucket--policies)
   - [Database Migrations & Demo Data Seeding](#database-migrations--demo-data-seeding)
3. [Step 2: Backend Deployment on Render](#step-2-backend-deployment-on-render)
   - [Option A: Deploy via Render Blueprint (Recommended)](#option-a-deploy-via-render-blueprint-recommended)
   - [Option B: Manual Docker Web Service Setup](#option-b-manual-docker-web-service-setup)
   - [Backend Environment Variables Reference](#backend-environment-variables-reference)
   - [Backend Health Check & Verification](#backend-health-check--verification)
4. [Step 3: Frontend Deployment on Netlify](#step-3-frontend-deployment-on-netlify)
   - [Build Configuration & Monorepo Settings](#build-configuration--monorepo-settings)
   - [SPA Routing Rules (_redirects)](#spa-routing-rules-_redirects)
   - [Frontend Environment Variables Reference](#frontend-environment-variables-reference)
   - [Custom Domain & HTTPS Setup](#custom-domain--https-setup)
5. [CORS & Network Security](#5-cors--network-security)
6. [Image & Document Storage via Supabase](#6-image--document-storage-via-supabase)
7. [Pre-Flight Production Checklist](#7-pre-flight-production-checklist)
8. [Troubleshooting Common Issues](#8-troubleshooting-common-issues)

---

## 1. Architecture Overview

```text
┌─────────────────────────────────────────────────────────────┐
│                       NETLIFY CDN                           │
│  React 19 + Vite SPA | Global Edge Network | HTTPS | SPA   │
│  (https://foodbridge.netlify.app or custom domain)          │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS API Calls (Bearer JWT)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                      RENDER WEB SERVICE                      │
│  Spring Boot 3 + Java 21 Container (Port 8080)              │
│  - RBAC & Security Filter Chain                              │
│  - REST Controllers & Business Logic                        │
│  - File Upload Validation (Magic bytes, MIME, size check)   │
│  - Automatic Flyway Migrations (V1 to V12)                  │
│  - Public Health Check: GET /api/health                     │
└──────────────┬──────────────────────────────┬───────────────┘
               │ JDBC over TLS (SSL)          │ REST API (Bearer Key)
               ▼                              ▼
┌──────────────────────────────┐┌──────────────────────────────┐
│     SUPABASE POSTGRESQL      ││       SUPABASE STORAGE       │
│  - Relational Schema         ││  Bucket: foodbridge-uploads  │
│  - Connection Pooler (6543)  ││  - verification/             │
│  - 13 Pre-seeded Demo Users  ││  - campaigns/                │
│  - Role Segregation & RLS    ││  - partnerships/             │
└──────────────────────────────┘└──────────────────────────────┘
```

---

## Step 1: Supabase Production Setup

### Database Provisioning & Connection Strings

1. Log into your [Supabase Dashboard](https://supabase.com/dashboard) and click **New Project**.
2. Name the project `foodbridge-production`, select a region close to Sri Lanka (e.g. `ap-southeast-1` Singapore or `ap-south-1` Mumbai), and choose a strong database password.
3. Once provisioned, navigate to **Project Settings** > **Database**:
   - **Connection Pooling:** Under **Connection string**, select **JDBC**.
   - Note the connection URL:
     ```ini
     # Direct Connection (Port 5432):
     jdbc:postgresql://db.YOUR_PROJECT_REF.supabase.co:5432/postgres?sslmode=require

     # Transaction Pooler (Port 6543 - Recommended for serverless/containers):
     jdbc:postgresql://aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require
     ```
   - **User:** `postgres`
   - **Password:** `<YOUR_DATABASE_PASSWORD>`

### Storage Bucket & Policies

FoodBridge uses Supabase Storage for secure handling of business registration certificates, charity credentials, handover photos, and campaign receipts.

1. Navigate to **Storage** in the Supabase Dashboard and click **New Bucket**.
2. Create bucket named: `foodbridge-uploads`
3. Toggle **Public bucket** to `ON` (allows verified photos and documents to be displayed to users with CDN caching).
4. Navigate to **Storage** > **Policies** and verify the storage security rules:
   - **SELECT (Read):** Allow public read access to all users:
     ```sql
     CREATE POLICY "Public Read FoodBridge Uploads"
     ON storage.objects FOR SELECT
     USING (bucket_id = 'foodbridge-uploads');
     ```
   - **INSERT (Upload):** Allow authenticated uploads via the service role key or signed tokens:
     ```sql
     CREATE POLICY "Service Role Uploads"
     ON storage.objects FOR INSERT
     WITH CHECK (bucket_id = 'foodbridge-uploads');
     ```

### Database Migrations & Demo Data Seeding

- **Automated Flyway Migrations:**  
  When the backend container starts on Render, Flyway automatically checks the schema and applies all versions from `V1__init_foodbridge_schema.sql` up to `V12__add_platform_settings_schema.sql`. No manual table creation is required.
- **Kandy Demo Dataset Seeding (Optional for staging/demo environments):**  
  To populate the realistic Kandy dataset (4 restaurants, 3 grocers, 2 charities, 1 animal organization, 5 campaigns, impact records), run either:
  - **Via SQL Editor:** Open Supabase SQL Editor and execute [`backend/src/main/resources/db/seed_demo_data_kandy.sql`](file:///q:/MY%20Projects/FoodBridge/backend/src/main/resources/db/seed_demo_data_kandy.sql).
  - **Via REST Endpoint:** Call `POST https://your-backend.onrender.com/api/public/demo-data/seed?force=true`.

---

## Step 2: Backend Deployment on Render

### Option A: Deploy via Render Blueprint (Recommended)

FoodBridge contains an Infrastructure-as-Code blueprint file [`render.yaml`](file:///q:/MY%20Projects/FoodBridge/render.yaml) at the repository root.

1. Go to your [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** and select **Blueprint**.
3. Connect your GitHub repository (`FoodBridge`).
4. Render will parse `render.yaml` and discover the `foodbridge-backend` Docker Web Service.
5. In the configuration prompt, provide your Supabase secrets:
   - `DB_URL`: Your Supabase JDBC URL
   - `DB_USERNAME`: `postgres`
   - `DB_PASSWORD`: Your Supabase database password
   - `SUPABASE_URL`: `https://YOUR_PROJECT_REF.supabase.co`
   - `SUPABASE_ANON_KEY`: Your Supabase Anon Key
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase Service Role Key
6. Click **Apply**. Render will build the container, perform the health check, and assign a live URL (e.g. `https://foodbridge-backend.onrender.com`).

---

### Option B: Manual Docker Web Service Setup

If configuring manually on Render:

1. Click **New +** > **Web Service**.
2. Choose **Build and deploy from a Git repository** and select `FoodBridge`.
3. Configure settings:
   | Setting | Value |
   | :--- | :--- |
   | **Name** | `foodbridge-backend` |
   | **Region** | Singapore or Oregon |
   | **Branch** | `main` |
   | **Root Directory** | `backend` *(or leave empty if using root Dockerfile)* |
   | **Runtime** | `Docker` |
   | **Dockerfile Path** | `./Dockerfile` *(or `./backend/Dockerfile` if Root Directory is empty)* |
   | **Instance Type** | Free or Starter |
   | **Health Check Path** | `/api/health` |

4. Scroll down to **Environment Variables** and enter the variables listed in the table below.
5. Click **Create Web Service**.

---

### Backend Environment Variables Reference

| Variable Name | Required | Default / Example Value | Description |
| :--- | :---: | :--- | :--- |
| `PORT` | Yes | `8080` | Container listening port (Render dynamically manages this). |
| `SPRING_PROFILES_ACTIVE` | Yes | `default` | Activates PostgreSQL configuration (do not use `local`). |
| `DB_URL` | Yes | `jdbc:postgresql://db.xxx.supabase.co:5432/postgres?sslmode=require` | Supabase PostgreSQL JDBC connection string. |
| `DB_USERNAME` | Yes | `postgres` | Supabase PostgreSQL username. |
| `DB_PASSWORD` | Yes | `<supabase-db-password>` | Supabase PostgreSQL password. |
| `DB_POOL_MAX` | No | `10` | Maximum HikariCP connection pool size. |
| `DB_POOL_MIN` | No | `2` | Minimum idle connections. |
| `DB_INIT_FAIL_TIMEOUT` | No | `-1` | Prevents startup crash if remote DB latency occurs. |
| `JWT_SECRET` | Yes | `<secure-256-bit-random-string>` | Secret key for signing and verifying JWT tokens. |
| `JWT_EXPIRATION_MS` | No | `3600000` | Access token lifespan (1 hour in ms). |
| `JWT_REFRESH_EXPIRATION_MS` | No | `604800000` | Refresh token lifespan (7 days in ms). |
| `CORS_ALLOWED_ORIGINS` | Yes | `https://*.netlify.app,https://foodbridge.netlify.app,https://foodbridge.lk,http://localhost:5173` | Comma-separated list of allowed client origins. |
| `SUPABASE_URL` | Yes | `https://YOUR_PROJECT_REF.supabase.co` | Supabase project API URL. |
| `SUPABASE_ANON_KEY` | Yes | `eyJhbGci...` | Supabase public anon key. |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | `eyJhbGci...` | Supabase service role key (for server-side storage writes). |
| `SUPABASE_STORAGE_BUCKET` | No | `foodbridge-uploads` | Target bucket name for uploads. |
| `ADMIN_EMAIL` | No | `admin@foodbridge.lk` | Default platform administrator email. |
| `ADMIN_PASSWORD` | No | `Admin@FoodBridge2026` | Default administrator password. |

---

### Backend Health Check & Verification

Once deployed, Render monitors container readiness through:
```bash
curl -I https://foodbridge-backend.onrender.com/api/health
```

Expected response:
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "status": "UP",
  "application": "FoodBridge REST API",
  "version": "1.0.0",
  "environment": "production",
  "timestamp": "2026-11-03T08:00:00Z"
}
```

---

## Step 3: Frontend Deployment on Netlify

### Build Configuration & Monorepo Settings

Netlify is pre-configured via [`netlify.toml`](file:///q:/MY%20Projects/FoodBridge/netlify.toml) and [`frontend/public/_redirects`](file:///q:/MY%20Projects/FoodBridge/frontend/public/_redirects).

1. Log into your [Netlify Dashboard](https://app.netlify.com/) and click **Add new site** > **Import an existing project**.
2. Select your Git provider (**GitHub**) and choose `FoodBridge`.
3. Set the build parameters:
   | Setting | Value |
   | :--- | :--- |
   | **Base directory** | `frontend` |
   | **Build command** | `npm run build` |
   | **Publish directory** | `dist` |
   | **Node.js Version** | `20` *(set in `netlify.toml`)* |

---

### SPA Routing Rules (`_redirects`)

Because FoodBridge is a Single-Page Application (SPA) powered by React Router, deep page reloads (e.g. `/explore`, `/charity-campaigns`, `/dashboards/admin`) must return `index.html` with a 200 status code.

This is handled automatically by:
1. `frontend/public/_redirects`:
   ```text
   /*    /index.html   200
   ```
2. `netlify.toml`:
   ```toml
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

When Vite builds, `_redirects` is copied directly to the root of `dist/`.

---

### Frontend Environment Variables Reference

Navigate to **Site Configuration** > **Environment variables** on Netlify and define:

| Variable Name | Required | Example Production Value | Purpose |
| :--- | :---: | :--- | :--- |
| `VITE_API_BASE_URL` | Yes | `https://foodbridge-backend.onrender.com/api` | Base URL of the live Spring Boot REST API. |
| `VITE_SUPABASE_URL` | Yes | `https://YOUR_PROJECT_REF.supabase.co` | Supabase API endpoint. |
| `VITE_SUPABASE_ANON_KEY` | Yes | `eyJhbGci...` | Public client key for map pins and asset loading. |
| `VITE_SUPABASE_STORAGE_BUCKET` | No | `foodbridge-uploads` | Name of the public storage bucket. |
| `VITE_APP_NAME` | No | `FoodBridge` | Platform title. |
| `VITE_TEAM_NAME` | No | `EcoConnect` | Developer attribution. |

Click **Deploy site**.

---

### Custom Domain & HTTPS Setup

1. In your Netlify Site dashboard, go to **Domain management**.
2. Click **Add a domain** (e.g. `foodbridge.lk` or `app.foodbridge.lk`).
3. Follow the DNS instructions to add a CNAME record or configure Netlify DNS.
4. Netlify will automatically provision a free Let's Encrypt SSL/TLS certificate.
5. Add the new custom domain to `CORS_ALLOWED_ORIGINS` in your Render backend settings.

---

## 5. CORS & Network Security

Cross-Origin Resource Sharing is configured in `backend/src/main/java/com/ecoconnect/foodbridge/config/CorsConfig.java`:

- Supports exact domains (`https://foodbridge.netlify.app`, `https://foodbridge.lk`).
- Supports wildcard origin patterns (`https://*.netlify.app`) so that all Netlify **Deploy Previews** and branch deploys work without manual configuration.
- Allows authenticated requests (`allowCredentials = true`).
- Supports standard HTTP methods: `GET, POST, PUT, PATCH, DELETE, OPTIONS`.
- Exposes `Authorization` headers for client token renewals.

---

## 6. Image & Document Storage via Supabase

### Upload Lifecycle

1. **Client Selection:** A user uploads a file (e.g. business registration document, food photo, campaign receipt).
2. **Security Inspection (`FileUploadSecurityService`):**
   - File size verification ($\le 5\text{ MB}$).
   - Allowed extension check (`.jpg`, `.jpeg`, `.png`, `.webp`, `.pdf`).
   - MIME type validation.
   - Magic bytes / byte header verification (rejecting camouflaged executables or polyglots).
   - Filename sanitization and UUID assignment to prevent directory traversal (`../`).
3. **Storage Dispatch (`SupabaseStorageService`):**
   - Transmits binary payload to `POST ${SUPABASE_URL}/storage/v1/object/foodbridge-uploads/{category}/{uuid}.ext`.
   - Returns permanent public CDN URL: `${SUPABASE_URL}/storage/v1/object/public/foodbridge-uploads/{category}/{uuid}.ext`.
   - If Supabase credentials are not present (such as during local development or offline testing), falls back to `/api/uploads/{category}/{uuid}.ext` without throwing an error.

---

## 7. Pre-Flight Production Checklist

Before launching to the public, verify each item:

- [ ] **Database Connection:** Supabase connection string uses `sslmode=require` and credentials are tested.
- [ ] **Flyway Migrations:** All 12 migrations apply cleanly on startup (`SELECT * FROM flyway_schema_history`).
- [ ] **JWT Secret:** `JWT_SECRET` is set to an environment variable with at least 256 bits of entropy (`openssl rand -base64 32`).
- [ ] **Admin Account:** Default admin password has been customized via `ADMIN_PASSWORD` environment variable.
- [ ] **CORS Origins:** Render `CORS_ALLOWED_ORIGINS` includes the exact Netlify production URL and any custom domains.
- [ ] **Supabase Storage:** Bucket `foodbridge-uploads` exists and has public read access enabled.
- [ ] **Netlify SPA Routing:** Visiting a deep link directly (e.g. `https://foodbridge.netlify.app/explore`) loads properly and does not return 404.
- [ ] **Backend Health Check:** `GET /api/health` returns `200 OK` with JSON status `"UP"`.
- [ ] **Security Headers:** `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, and `X-Frame-Options: SAMEORIGIN` are present on responses.
- [ ] **End-to-End Test:** A test user can register/log in, reserve a grocery coupon, and view the live impact dashboard.

---

## 8. Troubleshooting Common Issues

### 1. Backend 503 / Render Deploy Timeout
- **Cause:** Free tier Render instances spin down after inactivity, and cold starts can take 45–60 seconds.
- **Solution:** Render's `HEALTHCHECK` is configured with `--start-period=45s` and `--retries=3`. For production high-availability, upgrade to Render's **Starter** instance type.

### 2. Database Connection Refused / SSL Error
- **Cause:** Missing `?sslmode=require` or using direct connection on restricted IPv6 networks.
- **Solution:** Always append `?sslmode=require` to `DB_URL`. If Render cannot resolve Supabase's direct endpoint, switch to the Supabase **Connection Pooler** URL (port 6543).

### 3. Netlify 404 on Page Refresh
- **Cause:** Missing SPA redirect rule.
- **Solution:** Verify that `frontend/public/_redirects` exists and contains `/* /index.html 200`.

### 4. CORS Error in Browser Console
- **Symptom:** `Access to fetch at ... from origin ... has been blocked by CORS policy`.
- **Solution:** Check the Render dashboard for `CORS_ALLOWED_ORIGINS`. Ensure your Netlify URL (e.g. `https://foodbridge.netlify.app`) is included in the comma-separated list without trailing slashes.

### 5. Supabase Storage 403 Forbidden on Upload
- **Cause:** Missing or invalid `SUPABASE_SERVICE_ROLE_KEY`.
- **Solution:** In Render environment variables, verify that `SUPABASE_SERVICE_ROLE_KEY` is the secret service role key (not the public anon key).
