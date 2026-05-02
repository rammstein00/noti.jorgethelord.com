<?php
// get_links.php
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

// If an admin requests a specific user's links, override the $user_id
if (isset($payload['role']) && $payload['role'] === 'admin' && isset($_GET['target_user_id'])) {
    $user_id = (int)$_GET['target_user_id'];
}

$pdo = getDB();

$stmt = $pdo->prepare("SELECT id, original_url, short_code, cta_text, visits, created_at FROM noti_links WHERE user_id = ? ORDER BY created_at DESC");
$stmt->execute([$user_id]);
$links = $stmt->fetchAll();

$formattedLinks = array_map(function($l) {
    return [
         "id" => $l['id'],
         "originalUrl" => $l['original_url'],
         "shortCode" => $l['short_code'],
         "shortUrl" => "https://jorgethelord.com/l/" . $l['short_code'],
         "ctaText" => $l['cta_text'],
         "visits" => $l['visits'],
         "createdAt" => $l['created_at']
    ];
}, $links);

http_response_code(200);
echo json_encode(["links" => $formattedLinks]);
