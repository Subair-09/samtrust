<?php
/**
 * Samstrust Technologies Limited (RC 9898142)
 * Production Single Page Application (SPA) Entry Controller
 */

$distIndex = __DIR__ . '/dist/index.html';
$rootIndex = __DIR__ . '/index.html';

// 1. If compiled production bundle exists in dist/, serve it
if (file_exists($distIndex)) {
    header('Content-Type: text/html; charset=UTF-8');
    readfile($distIndex);
    exit;
}

// 2. If root index.html exists
if (file_exists($rootIndex)) {
    $content = file_get_contents($rootIndex);
    // If it's an uncompiled Vite source file pointing to /src/main.tsx
    if (strpos($content, '/src/main.tsx') !== false) {
        ?>
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <title>Samstrust Technologies Limited - Production Build Required</title>
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #F4F8F6; color: #164E3D; padding: 40px; text-align: center; }
                .card { background: white; max-width: 620px; margin: 40px auto; padding: 32px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); text-align: left; border: 1px solid #d1fae5; }
                h1 { color: #164E3D; margin-top: 0; font-size: 22px; }
                code { background: #e8f3ee; padding: 3px 6px; border-radius: 4px; font-weight: bold; }
                ol { padding-left: 20px; line-height: 1.6; }
                .btn { display: inline-block; background: #164E3D; color: white; padding: 10px 18px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 12px; }
            </style>
        </head>
        <body>
            <div class="card">
                <h1>Samstrust Technologies Limited</h1>
                <p><strong>PHP Backend & API are Online!</strong></p>
                <p>The compiled production frontend bundle (<code>dist/</code> folder) has not been compiled or uploaded yet.</p>
                <p><strong>To activate the full frontend:</strong></p>
                <ol>
                    <li>Run <code>npm run build</code> locally to compile the React frontend.</li>
                    <li>Upload the generated <code>dist/</code> folder (or copy its contents) to your hosting <code>public_html</code>.</li>
                    <li>Verify your database and PHP settings at <a href="/api/test_db.php" style="color: #164E3D; font-weight: bold;">/api/test_db.php</a>.</li>
                </ol>
                <a href="/api/test_db.php" class="btn">Run Database Diagnostics &rarr;</a>
            </div>
        </body>
        </html>
        <?php
        exit;
    }

    header('Content-Type: text/html; charset=UTF-8');
    echo $content;
    exit;
}

http_response_code(404);
echo "Application entry file not found.";
