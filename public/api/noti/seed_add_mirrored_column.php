<?php
// seed_add_mirrored_column.php
// Agrega columna 'mirrored' a noti_links y migra links existentes a noticriisp.com
require_once __DIR__ . '/config.php';

$pdo = getDB();

// Paso 1: Agregar columna mirrored si no existe
try {
    $pdo->exec("ALTER TABLE noti_links ADD COLUMN mirrored TINYINT(1) DEFAULT 0");
    echo "✅ Columna 'mirrored' agregada\n";
} catch (Exception $e) {
    if (strpos($e->getMessage(), 'Duplicate column') !== false) {
        echo "ℹ️ Columna 'mirrored' ya existe\n";
    } else {
        echo "❌ Error: " . $e->getMessage() . "\n";
        exit;
    }
}

// Paso 2: Migrar todos los links existentes a noticriisp.com
$stmt = $pdo->query("SELECT id, original_url, short_code, cta_text FROM noti_links WHERE mirrored = 0");
$links = $stmt->fetchAll();

echo "\n📦 Migrando " . count($links) . " links a noticriisp.com...\n";

$success = 0;
$failed = 0;

foreach ($links as $link) {
    $mirror_data = json_encode([
        'mirror_secret' => MIRROR_SECRET,
        'short_code' => $link['short_code'],
        'original_url' => $link['original_url'],
        'cta_text' => $link['cta_text'] ?? ''
    ]);
    
    $ch = curl_init(MIRROR_URL);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $mirror_data);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    $response = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($status >= 200 && $status < 300) {
        $pdo->prepare("UPDATE noti_links SET mirrored = 1 WHERE id = ?")->execute([$link['id']]);
        $success++;
        echo "  ✅ {$link['short_code']} → mirrored\n";
    } else {
        $failed++;
        echo "  ❌ {$link['short_code']} → failed (HTTP $status): $response\n";
    }
}

echo "\n🏁 Migración completada: $success exitosos, $failed fallidos\n";
