<?php
// count_visit.php - Contador de visitas con deduplicación por dispositivo
// Solo suma +1 si el frontend confirma que es una visita válida (30 min por enlace por dispositivo)
// Registra visitas tanto en el total (noti_links.visits) como en el diario (noti_daily_visits)
require_once 'cors.php';
require_once 'config.php';

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (empty($input['code'])) {
    http_response_code(400);
    echo json_encode(["error" => "Missing short code"]);
    exit;
}

$short_code = trim($input['code']);
$pdo = getDB();

// Usar zona horaria America/Havana para determinar "hoy"
$tz = new DateTimeZone('America/Havana');
$today = (new DateTime('now', $tz))->format('Y-m-d');

try {
    $stmt = $pdo->prepare("SELECT id FROM noti_links WHERE short_code = ?");
    $stmt->execute([$short_code]);
    $link = $stmt->fetch();
    
    if (!$link) {
        http_response_code(404);
        echo json_encode(["error" => "Link not found"]);
        exit;
    }
    
    $link_id = $link['id'];
    
    // 1. Sumar +1 al total histórico del enlace
    $updateStmt = $pdo->prepare("UPDATE noti_links SET visits = visits + 1 WHERE id = ?");
    $updateStmt->execute([$link_id]);
    
    // 2. Sumar +1 al contador diario (crear fila si no existe para hoy)
    $dailyStmt = $pdo->prepare("
        INSERT INTO noti_daily_visits (link_id, visit_date, visit_count) 
        VALUES (?, ?, 1) 
        ON DUPLICATE KEY UPDATE visit_count = visit_count + 1
    ");
    $dailyStmt->execute([$link_id, $today]);
    
    http_response_code(200);
    echo json_encode(["success" => true, "counted" => true, "date" => $today]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database error"]);
}
