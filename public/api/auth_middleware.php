<?php
/**
 * Samstrust Technologies Limited (RC 9898142)
 * Authentication & RBAC Guard Middlewares
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/jwt.php';

/**
 * Extract Bearer token from incoming request headers
 */
function getBearerToken(): ?string {
    $header = null;

    if (!empty($_SERVER['HTTP_AUTHORIZATION'])) {
        $header = trim($_SERVER['HTTP_AUTHORIZATION']);
    } elseif (!empty($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        $header = trim($_SERVER['REDIRECT_HTTP_AUTHORIZATION']);
    } elseif (function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        if (isset($headers['Authorization'])) {
            $header = trim($headers['Authorization']);
        } elseif (isset($headers['authorization'])) {
            $header = trim($headers['authorization']);
        }
    }

    if (!$header && !empty($_GET['token'])) {
        return trim($_GET['token']);
    }

    if ($header && preg_match('/Bearer\s(\S+)/i', $header, $matches)) {
        return $matches[1];
    }

    return null;
}

/**
 * Require valid JWT authentication for protected routes
 * Halts execution and emits standard JSON error if unauthenticated
 */
function requireAuth(): array {
    $token = getBearerToken();

    if (!$token) {
        http_response_code(401);
        echo json_encode([
            'error' => 'Unauthorized',
            'message' => 'Access restricted. Authentication token required. Please sign in at /login.',
            'code' => 'AUTH_REQUIRED',
        ]);
        exit;
    }

    try {
        $decoded = JWT::decode($token, JWT_SECRET);
        return $decoded;
    } catch (Exception $e) {
        http_response_code(401);
        echo json_encode([
            'error' => 'Invalid or expired token',
            'message' => 'Your session has expired or the token is invalid. Please sign in again.',
            'code' => 'AUTH_EXPIRED',
        ]);
        exit;
    }
}

/**
 * Require specific RBAC role or portal super admin privilege
 */
function requireRole(array $user, array $allowedRoles): void {
    $userRole = $user['role'] ?? '';

    // Super administrators universally bypass role restriction
    if ($userRole === 'portal-admin' || $userRole === 'super-admin' || in_array($userRole, $allowedRoles, true)) {
        return;
    }

    http_response_code(403);
    echo json_encode([
        'error' => 'Forbidden',
        'message' => "Access denied. Your role '{$userRole}' does not possess required privileges (" . implode(', ', $allowedRoles) . ').',
        'code' => 'INSUFFICIENT_PERMISSIONS',
    ]);
    exit;
}
