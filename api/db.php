<?php
/**
 * Samstrust Technologies Limited (RC 9898142)
 * PDO Database Layer with Graceful Decoupled Fallback
 */

require_once __DIR__ . '/config.php';

$pdo = null;
$dbConnected = false;
$dbLastError = null;

if (!empty($dbConfig['user']) && !empty($dbConfig['database'])) {
    try {
        $dsn = sprintf(
            'mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4',
            $dbConfig['host'],
            $dbConfig['port'],
            $dbConfig['database']
        );
        
        $pdo = new PDO($dsn, $dbConfig['user'], $dbConfig['password'], [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci",
        ]);
        
        $dbConnected = true;
    } catch (PDOException $e) {
        $dbConnected = false;
        $dbLastError = $e->getMessage();
        error_log("[Database Warning] MySQL connection failed ({$e->getCode()}): {$e->getMessage()}");
    }
} else {
    $dbLastError = 'Database credentials not configured in environment.';
}

/**
 * Record immutable security and compliance audit event into audit_trail table
 */
function logAuditEvent($pdo, array $eventData) {
    if (!$pdo) {
        return false;
    }

    try {
        $actorEmail = $eventData['actorEmail'] ?? 'anonymous';
        $actionCode = $eventData['actionCode'] ?? 'UNKNOWN_ACTION';
        $clientIp = $eventData['ip'] ?? ($_SERVER['REMOTE_ADDR'] ?? '127.0.0.1');

        $stmt = $pdo->prepare("
            INSERT INTO audit_trail (
                event_uuid,
                actor_user_id,
                actor_email,
                actor_role,
                event_category,
                action_code,
                target_resource_ref,
                severity,
                client_ip_address,
                immutable_sha256_hash,
                metadata_json,
                occurred_at
            ) VALUES (
                UUID(),
                :actor_user_id,
                :actor_email,
                :actor_role,
                :event_category,
                :action_code,
                :target_resource_ref,
                :severity,
                :client_ip_address,
                SHA2(CONCAT(NOW(), :actor_email_hash, :action_code_hash), 256),
                :metadata_json,
                NOW()
            )
        ");

        return $stmt->execute([
            ':actor_user_id' => $eventData['actorUserId'] ?? null,
            ':actor_email' => $actorEmail,
            ':actor_role' => $eventData['actorRole'] ?? 'anonymous',
            ':event_category' => $eventData['category'] ?? 'General',
            ':action_code' => $actionCode,
            ':target_resource_ref' => $eventData['targetRef'] ?? 'SYSTEM',
            ':severity' => $eventData['severity'] ?? 'Normal',
            ':client_ip_address' => $clientIp,
            ':actor_email_hash' => $actorEmail,
            ':action_code_hash' => $actionCode,
            ':metadata_json' => isset($eventData['metadata']) ? json_encode($eventData['metadata']) : null,
        ]);
    } catch (Exception $e) {
        error_log("[Audit Log Error] " . $e->getMessage());
        return false;
    }
}
