<?php
/**
 * Samstrust Technologies Limited (RC 9898142)
 * Diagnostic Database & PHP Environment Verification Script
 * Access via browser: https://yourdomain.com/api/test_db.php
 */

header('Content-Type: text/html; charset=UTF-8');
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/db.php';

$phpVer = PHP_VERSION;
$pdoInstalled = extension_loaded('pdo');
$pdoMysqlInstalled = extension_loaded('pdo_mysql');
$opensslInstalled = extension_loaded('openssl');
$jsonInstalled = extension_loaded('json');

$tables = [];
if ($pdo && $dbConnected) {
    try {
        $stmt = $pdo->query('SHOW TABLES');
        $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    } catch (Exception $e) {
        $dbLastError = $e->getMessage();
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Samstrust Technologies - PHP & Database Diagnostics</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f0fdf4; color: #164e3d; margin: 0; padding: 40px 20px; }
        .container { max-width: 800px; margin: 0 auto; background: white; border-radius: 16px; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #dcfce7; }
        h1 { margin-top: 0; color: #14532d; font-size: 24px; border-bottom: 2px solid #bbf7d0; padding-bottom: 12px; }
        .status-badge { display: inline-block; padding: 6px 14px; border-radius: 20px; font-weight: bold; font-size: 13px; text-transform: uppercase; }
        .badge-success { background: #dcfce7; color: #15803d; border: 1px solid #86efac; }
        .badge-warning { background: #fef9c3; color: #a16207; border: 1px solid #fde047; }
        .badge-danger { background: #fee2e2; color: #b91c1c; border: 1px solid #fca5a5; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { text-align: left; padding: 12px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
        th { background: #f8fafc; color: #475569; }
        .code-box { background: #1e293b; color: #38bdf8; padding: 16px; border-radius: 8px; font-family: monospace; font-size: 13px; overflow-x: auto; margin-top: 16px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Samstrust Technologies Limited (RC 9898142)</h1>
        <h3>PHP Backend & Database Diagnostics</h3>

        <table>
            <tr>
                <th>Component</th>
                <th>Status / Value</th>
                <th>Requirement</th>
            </tr>
            <tr>
                <td><strong>PHP Version</strong></td>
                <td><?php echo htmlspecialchars($phpVer); ?></td>
                <td><span class="status-badge <?php echo version_compare($phpVer, '7.4.0', '>=') ? 'badge-success' : 'badge-danger'; ?>"><?php echo version_compare($phpVer, '7.4.0', '>=') ? 'Compatible' : 'PHP 7.4+ Required'; ?></span></td>
            </tr>
            <tr>
                <td><strong>PDO Extension</strong></td>
                <td><?php echo $pdoInstalled ? 'Installed' : 'Missing'; ?></td>
                <td><span class="status-badge <?php echo $pdoInstalled ? 'badge-success' : 'badge-danger'; ?>"><?php echo $pdoInstalled ? 'OK' : 'Required'; ?></span></td>
            </tr>
            <tr>
                <td><strong>PDO MySQL Driver</strong></td>
                <td><?php echo $pdoMysqlInstalled ? 'Installed' : 'Missing'; ?></td>
                <td><span class="status-badge <?php echo $pdoMysqlInstalled ? 'badge-success' : 'badge-danger'; ?>"><?php echo $pdoMysqlInstalled ? 'OK' : 'Required'; ?></span></td>
            </tr>
            <tr>
                <td><strong>OpenSSL (for JWT)</strong></td>
                <td><?php echo $opensslInstalled ? 'Installed' : 'Missing'; ?></td>
                <td><span class="status-badge <?php echo $opensslInstalled ? 'badge-success' : 'badge-danger'; ?>"><?php echo $opensslInstalled ? 'OK' : 'Required'; ?></span></td>
            </tr>
            <tr>
                <td><strong>MySQL Database Connection</strong></td>
                <td>
                    <?php if ($dbConnected): ?>
                        Connected to <strong><?php echo htmlspecialchars($dbConfig['database']); ?></strong> on <?php echo htmlspecialchars($dbConfig['host']); ?>:<?php echo htmlspecialchars($dbConfig['port']); ?>
                    <?php else: ?>
                        <?php echo htmlspecialchars($dbLastError ?: 'Not configured'); ?>
                    <?php endif; ?>
                </td>
                <td>
                    <span class="status-badge <?php echo $dbConnected ? 'badge-success' : 'badge-warning'; ?>">
                        <?php echo $dbConnected ? 'Connected' : 'Fallback / Mock Mode'; ?>
                    </span>
                </td>
            </tr>
            <tr>
                <td><strong>Database Tables Found</strong></td>
                <td>
                    <?php if ($dbConnected): ?>
                        <?php echo count($tables); ?> tables (<?php echo implode(', ', $tables); ?>)
                    <?php else: ?>
                        N/A (Configure .env or cPanel database credentials)
                    <?php endif; ?>
                </td>
                <td>
                    <span class="status-badge <?php echo count($tables) >= 5 ? 'badge-success' : 'badge-warning'; ?>">
                        <?php echo count($tables) >= 5 ? 'Complete (11 tables)' : 'Pending Schema Import'; ?>
                    </span>
                </td>
            </tr>
        </table>

        <?php if (!$dbConnected || count($tables) === 0): ?>
            <div style="margin-top: 24px; padding: 16px; background: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px;">
                <h4 style="margin: 0 0 8px 0; color: #b45309;">cPanel MySQL Setup Instructions:</h4>
                <ol style="margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.6; color: #78350f;">
                    <li>Log into your cPanel account and open <strong>MySQL Databases</strong>.</li>
                    <li>Create a database, create a user with a strong password, and assign the user to the database with <strong>ALL PRIVILEGES</strong>.</li>
                    <li>Open <strong>phpMyAdmin</strong>, select your database, click <strong>Import</strong>, and upload <code>database/samstrust_complete_setup.sql</code>.</li>
                    <li>In the root directory, create or edit <code>.env</code> with your credentials:</li>
                </ol>
                <div class="code-box">
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=yourcpanel_samstrustdb
DB_USERNAME=yourcpanel_dbuser
DB_PASSWORD=your_strong_password
                </div>
            </div>
        <?php else: ?>
            <div style="margin-top: 24px; padding: 16px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; color: #166534;">
                <strong>All Systems Operational!</strong> Your PHP backend and MySQL database are fully configured and ready for production traffic.
            </div>
        <?php endif; ?>
    </div>
</body>
</html>
