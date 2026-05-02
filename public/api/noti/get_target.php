<?php
// get_target.php
require_once 'cors.php';
require_once 'config.php';

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
    exit;
}

if (empty($_GET['code'])) {
    http_response_code(400);
    echo json_encode(["error" => "Missing short code"]);
    exit;
}

$short_code = trim($_GET['code']);
$pdo = getDB();

try {
    // Crear tabla de visitas si no existe (rápido si ya existe)
    $pdo->exec("CREATE TABLE IF NOT EXISTS noti_link_visits (
        id INT AUTO_INCREMENT PRIMARY KEY,
        link_id INT NOT NULL,
        ip_hash VARCHAR(64) NOT NULL,
        visited_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX(link_id),
        INDEX(ip_hash),
        INDEX(visited_at)
    )");

    $stmt = $pdo->prepare("SELECT id, original_url, user_id, COALESCE(mirrored, 0) as mirrored FROM noti_links WHERE short_code = ?");
    $stmt->execute([$short_code]);
    $link = $stmt->fetch();
    
    if (!$link) {
        http_response_code(404);
        echo json_encode(["error" => "Link not found"]);
        exit;
    }

    $link_id = $link['id'];
    
    // Obtener IP y User-Agent para identificar el dispositivo/visita
    $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
    $ua = $_SERVER['HTTP_USER_AGENT'] ?? 'unknown_device';
    $visitor_hash = md5($ip . $ua);

    // Comprobar si visitó en los últimos 30 minutos
    $check_stmt = $pdo->prepare("SELECT id FROM noti_link_visits WHERE link_id = ? AND ip_hash = ? AND visited_at >= DATE_SUB(NOW(), INTERVAL 30 MINUTE) LIMIT 1");
    $check_stmt->execute([$link_id, $visitor_hash]);
    
    if (!$check_stmt->fetchColumn()) {
        // Es una visita única (no estuvo en los últimos 30 min)
        // Registrar visita
        $insert_stmt = $pdo->prepare("INSERT INTO noti_link_visits (link_id, ip_hash) VALUES (?, ?)");
        $insert_stmt->execute([$link_id, $visitor_hash]);
        
        // Incrementar el contador general en noti_links
        $update_stmt = $pdo->prepare("UPDATE noti_links SET visits = visits + 1 WHERE id = ?");
        $update_stmt->execute([$link_id]);
    }
    
    http_response_code(200);
    echo json_encode([
        "originalUrl" => $link['original_url'],
        "ownerId" => $link['user_id'],
        "mirrored" => (int)$link['mirrored']
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database error: " . $e->getMessage()]);
}
