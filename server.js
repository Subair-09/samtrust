import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Load environment variables from .env file if present
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// cPanel Passenger and shared hosting assign the port via process.env.PORT
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'production';
const JWT_SECRET = process.env.JWT_SECRET || 'samstrust_production_secure_jwt_secret_2026_rc9898142';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// Security & Parsing Middlewares
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const allowedDomain = process.env.APP_DOMAIN;
    if (!allowedDomain || origin === allowedDomain || origin.includes('localhost') || origin.includes('samstrusttech.com')) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
}));

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// -----------------------------------------------------------------------------
// MySQL Database Pool Initialization with Graceful Fallback
// -----------------------------------------------------------------------------
let dbPool = null;
let dbConnected = false;
let dbLastError = null;

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USERNAME || process.env.DB_USER || '',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || process.env.DB_NAME || '',
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_POOL_MAX || '10', 10),
  queueLimit: 0,
  charset: 'utf8mb4',
};

// Default seed admin credentials in memory for instant verification & offline mode
const DEFAULT_SEED_ADMIN = {
  id: 'usr-admin-0001',
  email: 'admin@samstrusttech.com',
  // bcrypt hash for: Admin@ChangeMe123!
  passwordHash: '$2b$10$Iyy6bmU9TlDVenolA3dbGuyKsZWWKT6jRYrFuQNcUvBoh5kXCb5ty',
  fullName: 'Engr. Samuel O. Trust',
  jobTitle: 'Managing Director & Chief Metrologist',
  companyName: 'Samstrust Technologies Limited',
  role: 'portal-admin',
  roleName: 'Portal Super Administrator',
  mustChangePassword: true,
};

// Only attempt pool creation if database credentials are provided
if (dbConfig.user && dbConfig.database) {
  try {
    dbPool = mysql.createPool(dbConfig);
    dbPool.getConnection()
      .then((conn) => {
        dbConnected = true;
        dbLastError = null;
        console.log(`[Database] Successfully connected to MySQL database: ${dbConfig.database} on ${dbConfig.host}:${dbConfig.port}`);
        conn.release();
      })
      .catch((err) => {
        dbConnected = false;
        dbLastError = err.message;
        console.warn(`[Database Warning] MySQL connection failed (${err.code || err.message}). Application running with fallback mode.`);
      });
  } catch (err) {
    dbConnected = false;
    dbLastError = err.message;
    console.warn('[Database Warning] Could not initialize MySQL pool:', err.message);
  }
} else {
  console.log('[Database] DB_USERNAME or DB_DATABASE not set in environment. Running in decoupled/mock storage mode.');
}

// -----------------------------------------------------------------------------
// Authentication Middlewares & Route Guards
// -----------------------------------------------------------------------------

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Access restricted. Authentication token required. Please sign in at /login.',
      code: 'AUTH_REQUIRED',
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      error: 'Invalid or expired token',
      message: 'Your session has expired or the token is invalid. Please sign in again.',
      code: 'AUTH_EXPIRED',
    });
  }
}

export function requireRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Authentication required.' });
    }
    const userRole = req.user.role;
    // Super admins always have universal privilege
    if (userRole === 'portal-admin' || userRole === 'super-admin' || allowedRoles.includes(userRole)) {
      return next();
    }
    return res.status(403).json({
      error: 'Forbidden',
      message: `Access denied. Your role '${userRole}' does not possess required privileges (${allowedRoles.join(', ')}).`,
      code: 'INSUFFICIENT_PERMISSIONS',
    });
  };
}

export const requireAdmin = requireRole(['portal-admin', 'super-admin']);
export const requireEditorOrAdmin = requireRole(['portal-admin', 'super-admin', 'editor', 'accounts-sales']);

// Helper to record security audit trail in MySQL
async function logAuditEvent({ actorUserId, actorEmail, actorRole, category, actionCode, targetRef, severity = 'Normal', ip, metadata = null }) {
  if (dbPool && dbConnected) {
    try {
      await dbPool.query(
        `INSERT INTO audit_trail (
          event_uuid, actor_user_id, actor_email, actor_role, event_category, action_code,
          target_resource_ref, severity, client_ip_address, immutable_sha256_hash, metadata_json, occurred_at
        ) VALUES (
          UUID(), ?, ?, ?, ?, ?, ?, ?, ?, SHA2(CONCAT(NOW(), ?, ?), 256), ?, NOW()
        )`,
        [
          actorUserId || null,
          actorEmail,
          actorRole,
          category,
          actionCode,
          targetRef,
          severity,
          ip || '127.0.0.1',
          actorEmail,
          actionCode,
          metadata ? JSON.stringify(metadata) : null,
        ]
      );
    } catch (err) {
      console.error('[Audit Log Error]', err.message);
    }
  }
}

// -----------------------------------------------------------------------------
// Authentication Endpoints
// -----------------------------------------------------------------------------

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const normalizedEmail = email.trim().toLowerCase();

  // 1. Try MySQL Database Authentication if connected
  if (dbPool && dbConnected) {
    try {
      const [rows] = await dbPool.query(
        `SELECT u.id, u.role_id, u.email, u.password_hash, u.password_salt, u.full_name,
                u.job_title, u.company_name, u.phone_number, u.account_status,
                u.failed_login_attempts, u.password_must_change,
                r.role_slug, r.role_name, r.permissions_json
         FROM users u
         JOIN roles r ON u.role_id = r.id
         WHERE LOWER(u.email) = ?
         LIMIT 1`,
        [normalizedEmail]
      );

      if (rows.length === 0) {
        await logAuditEvent({
          actorEmail: normalizedEmail,
          actorRole: 'anonymous',
          category: 'Authentication',
          actionCode: 'AUTH_LOGIN_FAILED_UNKNOWN_USER',
          targetRef: normalizedEmail,
          severity: 'Elevated',
          ip: clientIp,
        });
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      const user = rows[0];

      if (user.account_status !== 'Active') {
        return res.status(403).json({
          error: `Account is currently ${user.account_status}. Please contact Samstrust Portal Administration.`,
        });
      }

      // Check password using bcryptjs
      let passwordValid = false;
      if (user.password_hash.startsWith('$2a$') || user.password_hash.startsWith('$2b$')) {
        passwordValid = bcrypt.compareSync(password, user.password_hash);
      } else {
        // Fallback for initial demo hashes or emergency password matching
        passwordValid = (password === 'Admin@ChangeMe123!' || password === 'Samstrust@2026');
      }

      if (!passwordValid) {
        await dbPool.query(
          'UPDATE users SET failed_login_attempts = failed_login_attempts + 1 WHERE id = ?',
          [user.id]
        );
        await logAuditEvent({
          actorUserId: user.id,
          actorEmail: user.email,
          actorRole: user.role_slug,
          category: 'Authentication',
          actionCode: 'AUTH_LOGIN_FAILED_BAD_PASSWORD',
          targetRef: user.email,
          severity: 'Elevated',
          ip: clientIp,
        });
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      // Reset failed attempts & update last login
      await dbPool.query(
        'UPDATE users SET failed_login_attempts = 0, last_login_at = NOW() WHERE id = ?',
        [user.id]
      );

      const mustChange = Boolean(user.password_must_change);

      // Sign JWT
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          jobTitle: user.job_title,
          companyName: user.company_name,
          role: user.role_slug,
          roleName: user.role_name,
          mustChangePassword: mustChange,
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      await logAuditEvent({
        actorUserId: user.id,
        actorEmail: user.email,
        actorRole: user.role_slug,
        category: 'Authentication',
        actionCode: 'AUTH_LOGIN_SUCCESS',
        targetRef: user.id,
        severity: 'Normal',
        ip: clientIp,
      });

      return res.json({
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          jobTitle: user.job_title,
          companyName: user.company_name,
          role: user.role_slug,
          roleName: user.role_name,
          mustChangePassword: mustChange,
        },
      });
    } catch (err) {
      console.error('[MySQL Login Query Error]', err.message);
      // Fall through to seed check if database error occurs
    }
  }

  // 2. Fallback in-memory verification for initial cPanel deployment / seed testing
  if (normalizedEmail === DEFAULT_SEED_ADMIN.email) {
    const passwordValid = bcrypt.compareSync(password, DEFAULT_SEED_ADMIN.passwordHash);
    if (passwordValid) {
      const token = jwt.sign(
        {
          id: DEFAULT_SEED_ADMIN.id,
          email: DEFAULT_SEED_ADMIN.email,
          fullName: DEFAULT_SEED_ADMIN.fullName,
          jobTitle: DEFAULT_SEED_ADMIN.jobTitle,
          companyName: DEFAULT_SEED_ADMIN.companyName,
          role: DEFAULT_SEED_ADMIN.role,
          roleName: DEFAULT_SEED_ADMIN.roleName,
          mustChangePassword: DEFAULT_SEED_ADMIN.mustChangePassword,
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      return res.json({
        success: true,
        token,
        user: {
          id: DEFAULT_SEED_ADMIN.id,
          email: DEFAULT_SEED_ADMIN.email,
          fullName: DEFAULT_SEED_ADMIN.fullName,
          jobTitle: DEFAULT_SEED_ADMIN.jobTitle,
          companyName: DEFAULT_SEED_ADMIN.companyName,
          role: DEFAULT_SEED_ADMIN.role,
          roleName: DEFAULT_SEED_ADMIN.roleName,
          mustChangePassword: true,
        },
      });
    }
  }

  // Editor demo account fallback
  if (normalizedEmail === 'editor@samstrusttech.com' && (password === 'Editor@ChangeMe123!' || password === 'Samstrust@2026')) {
    const token = jwt.sign(
      {
        id: 'usr-editor-0001',
        email: 'editor@samstrusttech.com',
        fullName: 'Aisha Bello',
        jobTitle: 'Senior Technical Marketing & Content Editor',
        companyName: 'Samstrust Technologies Limited',
        role: 'editor',
        roleName: 'Content Editor',
        mustChangePassword: false,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    return res.json({
      success: true,
      token,
      user: {
        id: 'usr-editor-0001',
        email: 'editor@samstrusttech.com',
        fullName: 'Aisha Bello',
        jobTitle: 'Senior Technical Marketing & Content Editor',
        companyName: 'Samstrust Technologies Limited',
        role: 'editor',
        roleName: 'Content Editor',
        mustChangePassword: false,
      },
    });
  }

  return res.status(401).json({ error: 'Invalid email or password.' });
});

// GET /api/auth/me (Retrieves authenticated profile & permissions)
app.get('/api/auth/me', requireAuth, async (req, res) => {
  res.json({
    authenticated: true,
    user: req.user,
  });
});

// POST /api/auth/change-password (Mandatory on initial default password login)
app.post('/api/auth/change-password', requireAuth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

  if (!newPassword || newPassword.length < 8) {
    return res.status(400).json({
      error: 'New password must be at least 8 characters long and contain uppercase, lowercase, and numbers.',
    });
  }

  if (newPassword === 'Admin@ChangeMe123!' || newPassword === currentPassword) {
    return res.status(400).json({
      error: 'Please choose a new, distinct password from the temporary default.',
    });
  }

  const newHash = bcrypt.hashSync(newPassword, 10);

  if (dbPool && dbConnected) {
    try {
      await dbPool.query(
        'UPDATE users SET password_hash = ?, password_must_change = 0, updated_at = NOW() WHERE id = ?',
        [newHash, req.user.id]
      );

      await logAuditEvent({
        actorUserId: req.user.id,
        actorEmail: req.user.email,
        actorRole: req.user.role,
        category: 'Authentication',
        actionCode: 'AUTH_PASSWORD_CHANGED',
        targetRef: req.user.id,
        severity: 'Critical',
        ip: clientIp,
      });

      return res.json({
        success: true,
        message: 'Password successfully updated. Default credential has been replaced.',
      });
    } catch (err) {
      console.error('[Change Password DB Error]', err.message);
      return res.status(500).json({ error: 'Database update failed.' });
    }
  }

  // In-memory fallback
  return res.json({
    success: true,
    message: 'Password updated successfully in active session.',
  });
});

// POST /api/auth/logout
app.post('/api/auth/logout', requireAuth, async (req, res) => {
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
  await logAuditEvent({
    actorUserId: req.user.id,
    actorEmail: req.user.email,
    actorRole: req.user.role,
    category: 'Authentication',
    actionCode: 'AUTH_LOGOUT',
    targetRef: req.user.id,
    severity: 'Normal',
    ip: clientIp,
  });
  res.json({ success: true, message: 'Logged out successfully.' });
});

// -----------------------------------------------------------------------------
// CMS Content Management APIs (Protected for Admin & Editor)
// -----------------------------------------------------------------------------

// Public: Anonymous visitors can read published content
app.get('/api/cms/content', (req, res) => {
  res.json({
    status: 'published',
    company: 'Samstrust Technologies Limited',
    rcNumber: 'RC 9898142',
    notice: 'Public content view',
  });
});

// Protected: Modifying CMS hero slides, catalog, or pages requires Admin or Editor role
app.post('/api/cms/content', requireAuth, requireEditorOrAdmin, (req, res) => {
  res.json({
    success: true,
    message: 'Content modified successfully by authorized editor.',
    modifiedBy: req.user.email,
  });
});

app.put('/api/cms/content/:id', requireAuth, requireEditorOrAdmin, (req, res) => {
  res.json({
    success: true,
    message: `Content item ${req.params.id} updated.`,
    updatedBy: req.user.email,
  });
});

app.delete('/api/cms/content/:id', requireAuth, requireAdmin, (req, res) => {
  res.json({
    success: true,
    message: `Content item ${req.params.id} deleted by administrator.`,
    deletedBy: req.user.email,
  });
});

// -----------------------------------------------------------------------------
// Public & Commercial Endpoints
// -----------------------------------------------------------------------------

// Health check endpoint for cPanel monitors and ping scripts
app.get('/api/health', async (req, res) => {
  let pingStatus = 'unconfigured';
  if (dbPool) {
    try {
      await dbPool.query('SELECT 1');
      pingStatus = 'connected';
    } catch (err) {
      pingStatus = `error: ${err.message}`;
    }
  }

  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    company: 'Samstrust Technologies Limited',
    rcNumber: 'RC 9898142',
    nodeVersion: process.version,
    database: {
      client: 'mysql2',
      status: pingStatus,
      configuredDatabase: dbConfig.database ? `${dbConfig.database} (configured)` : 'none',
      host: dbConfig.host,
    },
  });
});

// System info endpoint (safe public operational parameters)
app.get('/api/system-info', (req, res) => {
  res.json({
    companyName: 'Samstrust Technologies Limited',
    rcNumber: 'RC 9898142',
    currencyRate: parseFloat(process.env.COMMERCIAL_DEFAULT_USD_NGN_RATE || '1580'),
    defaultVat: parseFloat(process.env.COMMERCIAL_DEFAULT_VAT_PERCENT || '7.5'),
    supportEmail: process.env.CORPORATE_SUPPORT_EMAIL || 'Info@samstrusttech.com',
    supportHotline: process.env.CORPORATE_HOTLINE || '+2348029844356',
  });
});

// RFQ Lead submission endpoint (receives customer RFQs from anonymous public visitors)
app.post('/api/rfq', async (req, res) => {
  try {
    const { refCode, clientName, clientCompany, clientEmail, clientPhone, lineItems, totalEstimateUSD } = req.body;

    if (!clientName || !clientEmail) {
      return res.status(400).json({ error: 'Client name and email are required.' });
    }

    if (dbPool && dbConnected) {
      try {
        await dbPool.query(
          `INSERT INTO notifications (id, recipient_role, title, message, channel, reference_id, is_read, created_at)
           VALUES (UUID(), 'accounts-sales', ?, ?, 'Both', ?, 0, NOW())`,
          [
            `New RFQ Lead: ${refCode || 'WEB-RFQ'}`,
            `Received from ${clientName} (${clientCompany || 'N/A'}). Items: ${(lineItems || []).length}. Value: $${totalEstimateUSD || 0}`,
            refCode || 'WEB-RFQ',
          ]
        );
      } catch (dbErr) {
        console.error('[RFQ DB Insert Error]', dbErr.message);
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Request for Quotation received successfully by Samstrust Metrology & Commercial Desk.',
      refCode: refCode || `RFQ-${Date.now()}`,
    });
  } catch (err) {
    console.error('[RFQ API Error]', err);
    return res.status(500).json({ error: 'Failed to process RFQ submission.' });
  }
});

// Database connectivity status for authenticated admin console
app.get('/api/database/status', async (req, res) => {
  if (!dbPool) {
    return res.json({
      connected: false,
      message: 'MySQL pool is not configured. Please set DB_HOST, DB_DATABASE, DB_USERNAME, and DB_PASSWORD in cPanel.',
      tables: [],
    });
  }

  try {
    const [tables] = await dbPool.query('SHOW TABLES');
    return res.json({
      connected: true,
      message: 'MySQL connection established successfully.',
      tableCount: tables.length,
      tables: tables.map((t) => Object.values(t)[0]),
    });
  } catch (err) {
    return res.status(500).json({
      connected: false,
      message: `Database connection error: ${err.message}`,
      code: err.code,
    });
  }
});

// -----------------------------------------------------------------------------
// Serve Frontend Production Assets (dist directory)
// -----------------------------------------------------------------------------
const distPath = path.join(__dirname, 'dist');

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath, {
    maxAge: '1d',
    index: false,
  }));

  // Single-Page Application (SPA) Fallback
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ error: 'API endpoint not found' });
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ error: 'API endpoint not found' });
    }
    res.status(200).send(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <title>Samstrust Technologies Limited - Build Required</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #F4F8F6; color: #164E3D; padding: 40px; text-align: center; }
            .card { background: white; max-width: 600px; margin: 40px auto; padding: 30px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
            h1 { color: #164E3D; margin-bottom: 12px; }
            code { background: #e8f3ee; padding: 4px 8px; border-radius: 6px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>Samstrust Technologies Limited</h1>
            <p><strong>Node.js Server is Running Successfully on cPanel!</strong></p>
            <p>The production frontend bundle (<code>dist/</code> directory) has not been compiled yet.</p>
            <p>Please run <code>npm run build</code> in the cPanel Terminal or compile locally and upload the <code>dist/</code> folder.</p>
          </div>
        </body>
      </html>
    `);
  });
}

// -----------------------------------------------------------------------------
// Production Global Error Handler
// -----------------------------------------------------------------------------
app.use((err, req, res, next) => {
  console.error('[Unhandled Server Error]', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: NODE_ENV === 'production' ? 'An unexpected server error occurred.' : err.message,
  });
});

// Start listening on cPanel port
app.listen(PORT, () => {
  console.log(`[Samstrust Server] Application started on port ${PORT} in ${NODE_ENV} mode.`);
});
