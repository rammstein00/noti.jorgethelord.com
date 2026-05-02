<?php
// get_user_visits.php - Devuelve las visitas de HOY para el usuario autenticado
// Usa zona horaria America/Havana (misma de AdsKeeper) para determinar "hoy"
require_once 'cors.php';
require_once 'config.php';
require_once 'jwt.php';

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
    exit;
}

$token = JWT::getBearerToken();
if (!$token) {
    http_response_code(401);
    echo json_encode(["error" => "Authorization header missing"]);
    exit;
}

$payload = JWT::verify($token, JWT_SECRET);
if (!$payload) {
    http_response_code(401);
    echo json_encode(["error" => "Invalid or expired token"]);
    exit;
}

$user_id = $payload['user_id'];

// Si un admin consulta las visitas de otro usuario
if (isset($payload['role']) && $payload['role'] === 'admin' && isset($_GET['target_user_id'])) {
    $user_id = (int)$_GET['target_user_id'];
}

$pdo = getDB();

// Determinar "hoy" en zona horaria America/Havana
$tz = new DateTimeZone('America/Havana');
$today = (new DateTime('now', $tz))->format('Y-m-d');

// Sumar las visitas de HOY de todos los enlaces de este usuario
$stmt = $pdo->prepare("
    SELECT COALESCE(SUM(dv.visit_count), 0) as today_visits
    FROM noti_daily_visits dv
    JOIN noti_links l ON dv.link_id = l.id
    WHERE l.user_id = ? AND dv.visit_date = ?
");
$stmt->execute([$user_id, $today]);
$result = $stmt->fetch();

http_response_code(200);
echo json_encode([
    "success" => true,
    "total_visits" => (int)$result['today_visits'],
    "date" => $today,
    "timezone" => "America/Havana"
]);
