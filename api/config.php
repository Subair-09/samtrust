<?php
/**
 * Samstrust Technologies Limited (RC 9898142)
 * Environment & Application Configuration Blueprint
 * Compatible with cPanel / LAMP / Apache / LiteSpeed / Nginx PHP Hosting
 */

// Simple robust .env loader without third-party dependencies
function loadEnvFile($envPath) {
    if (!file_exists($envPath) || !is_readable($envPath)) {
        return false;
    }
    $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if (empty($line) || $line[0] === '#') {
            continue;
        }
        if (strpos($line, '=') !== false) {
            list($name, $val) = explode('=', $line, 2);
            $name = trim($name);
            $val = trim($val);
            // Remove enclosing quotes if present
            if ((substr($val, 0, 1) === '"' && substr($val, -1) === '"') ||
                (substr($val, 0, 1) === "'" && substr($val, -1) === "'")) {
                $val = substr($val, 1, -1);
            }
            if (!array_key_exists($name, $_SERVER) && !array_key_exists($name, $_ENV)) {
                putenv("{$name}={$val}");
                $_ENV[$name] = $val;
                $_SERVER[$name] = $val;
            }
        }
    }
    return true;
}

// Check common locations for .env
$envCandidates = [
    __DIR__ . '/../.env',
    __DIR__ . '/.env',
    dirname(__DIR__) . '/.env',
    dirname(dirname(__DIR__)) . '/.env',
];

foreach ($envCandidates as $candidate) {
    if (loadEnvFile($candidate)) {
        break;
    }
}

// Helper to get environment variable with fallback
function getEnvVar($key, $default = '') {
    $val = getenv($key);
    if ($val !== false && $val !== '') {
        return $val;
    }
    if (isset($_ENV[$key]) && $_ENV[$key] !== '') {
        return $_ENV[$key];
    }
    if (isset($_SERVER[$key]) && $_SERVER[$key] !== '') {
        return $_SERVER[$key];
    }
    return $default;
}

// -----------------------------------------------------------------------------
// Core Configuration Constants & Settings
// -----------------------------------------------------------------------------
define('APP_ENV', getEnvVar('NODE_ENV', getEnvVar('APP_ENV', 'production')));
define('APP_DOMAIN', getEnvVar('APP_DOMAIN', 'https://www.samstrusttech.com'));
define('JWT_SECRET', getEnvVar('JWT_SECRET', 'samstrust_production_secure_jwt_secret_2026_rc9898142'));
define('JWT_EXPIRES_IN', 86400); // 24 hours in seconds

// Database Configuration
$dbConfig = [
    'host' => getEnvVar('DB_HOST', '127.0.0.1'),
    'port' => (int) getEnvVar('DB_PORT', '3306'),
    'database' => getEnvVar('DB_DATABASE', getEnvVar('DB_NAME', 'samstrus_Adewale')),
    'user' => getEnvVar('DB_USERNAME', getEnvVar('DB_USER', 'samstrus_samstrus')),
    'password' => getEnvVar('DB_PASSWORD', 'Adewale_@09'),
];

// Operational & Commercial Parameters
define('COMMERCIAL_USD_NGN_RATE', (float) getEnvVar('COMMERCIAL_DEFAULT_USD_NGN_RATE', '1580.00'));
define('COMMERCIAL_VAT_PERCENT', (float) getEnvVar('COMMERCIAL_DEFAULT_VAT_PERCENT', '7.5'));
define('CORPORATE_SUPPORT_EMAIL', getEnvVar('CORPORATE_SUPPORT_EMAIL', 'Info@samstrusttech.com'));
define('CORPORATE_HOTLINE', getEnvVar('CORPORATE_HOTLINE', '+2348029844356'));
define('COMPANY_NAME', 'Samstrust Technologies Limited');
define('COMPANY_RC', 'RC 9898142');

// -----------------------------------------------------------------------------
// Seed Account Profiles for Immediate Verification & Offline Fallback
// -----------------------------------------------------------------------------
$seedAdmin = [
    'id' => 'usr-admin-0001',
    'email' => 'admin@samstrusttech.com',
    // Hash for temporary password: Admin@ChangeMe123!
    'password_hash' => '$2y$10$Iyy6bmU9TlDVenolA3dbGuyKsZWWKT6jRYrFuQNcUvBoh5kXCb5ty',
    'fullName' => 'Engr. Samuel O. Trust',
    'jobTitle' => 'Managing Director & Chief Metrologist',
    'companyName' => 'Samstrust Technologies Limited',
    'role' => 'portal-admin',
    'roleName' => 'Portal Super Administrator',
    'mustChangePassword' => true,
];

$seedEditor = [
    'id' => 'usr-editor-0001',
    'email' => 'editor@samstrusttech.com',
    'fullName' => 'Aisha Bello',
    'jobTitle' => 'Senior Technical Marketing & Content Editor',
    'companyName' => 'Samstrust Technologies Limited',
    'role' => 'editor',
    'roleName' => 'Content Editor',
    'mustChangePassword' => false,
];
