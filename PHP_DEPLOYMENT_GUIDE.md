# Samstrust Technologies Limited (RC 9898142)
## PHP Backend Deployment & cPanel Shared Hosting Guide

This guide details how to deploy the **Samstrust Technologies Limited** digital platform to any standard PHP / LAMP hosting environment (such as cPanel, Hostinger, Namecheap, Bluehost, or Apache/LiteSpeed VPS) where Node.js / Express is not supported.

---

### 1. Architecture Overview

- **Frontend**: React 19 + TypeScript Single Page Application (SPA), styled with Tailwind CSS.
- **Backend**: Pure PHP 8.x REST API located in `/api/`:
  - `api/index.php`: Master front controller & router for all endpoints.
  - `api/config.php`: Environment variable loader (`.env`) and default parameters.
  - `api/jwt.php`: Lightweight, zero-dependency HS256 JWT encoder & decoder.
  - `api/db.php`: High-performance MySQL connection via PHP PDO with audit trail logging.
  - `api/auth_middleware.php`: Bearer token extraction and 5-role RBAC authorization.
  - `api/test_db.php`: Browser diagnostic tool for database connectivity.
- **Web Server Rules**: `.htaccess` handles:
  1. Passing `Authorization: Bearer <token>` to PHP on Apache/cPanel.
  2. Routing `/api/*` to `api/index.php`.
  3. Blocking direct access to `.env`, `.git`, and `.sql` files.
  4. React SPA client-side routing fallback (`index.html`).

---

### 2. cPanel Database Setup (Step-by-Step)

1. Log into your cPanel account.
2. Under the **Databases** section, click **MySQL Databases**:
   - Create a new database (e.g. `cpaneluser_samstrustdb`).
   - Create a new MySQL user with a strong password (e.g. `cpaneluser_dbapp`).
   - Add the user to the database and check **ALL PRIVILEGES**.
3. Under **Databases**, open **phpMyAdmin**:
   - Select your new database in the left sidebar.
   - Click the **Import** tab at the top.
   - Choose `database/samstrust_complete_setup.sql` from this repository.
   - Click **Import** (or **Go**). This will create all 11 required tables and seed initial RBAC roles.

---

### 3. Environment Configuration (`.env`)

In your hosting root (`public_html`), create or edit a file named `.env`:

```ini
APP_ENV=production
APP_DOMAIN=https://www.samstrusttech.com
JWT_SECRET=samstrust_production_secure_jwt_secret_2026_rc9898142

# Database Connection (Enter your cPanel DB details)
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=cpaneluser_samstrustdb
DB_USERNAME=cpaneluser_dbapp
DB_PASSWORD=YourStrongDatabasePasswordHere

# Commercial Engine Defaults
COMMERCIAL_DEFAULT_USD_NGN_RATE=1580.00
COMMERCIAL_DEFAULT_VAT_PERCENT=7.5
CORPORATE_SUPPORT_EMAIL=Info@samstrusttech.com
CORPORATE_HOTLINE=+2348029844356
```

---

### 4. Deploying Files to `public_html`

#### Method A: Compiling and Uploading `dist/` (Recommended)
1. On your local machine, run:
   ```bash
   npm install --legacy-peer-deps
   npm run build
   ```
2. The compilation will produce the `dist/` directory, which automatically includes:
   - `index.html` (bundled React application)
   - `assets/` (optimized CSS & JS bundles)
   - `.htaccess` (Apache server rules)
   - `api/` (complete PHP backend)
3. Upload all files **inside** `dist/` directly into your cPanel `public_html/`.

#### Method B: Deploying via GitHub Actions (Automated CI/CD)
The repository includes `.github/workflows/main.yml`. When you push to the `main` branch, GitHub Actions builds the project and uploads files via SCP directly into `public_html`.

---

### 5. Verifying the Deployment

1. **Test PHP & Database Status**:
   Visit in your browser:
   `https://www.yourdomain.com/api/test_db.php`
   - Confirms PHP version and PDO MySQL driver.
   - Confirms database connectivity and verifies that the 11 tables exist.

2. **Test Health API**:
   Visit in your browser:
   `https://www.yourdomain.com/api/health`
   Should return:
   ```json
   {
     "status": "healthy",
     "backend": "php-pdo",
     "database": {
       "status": "connected"
     }
   }
   ```

3. **Log in to the Platform**:
   Navigate to `https://www.yourdomain.com/login`:
   - **Super Admin**: `admin@samstrusttech.com` / `Admin@ChangeMe123!`
   - **Content Editor**: `editor@samstrusttech.com` / `Editor@ChangeMe123!`
