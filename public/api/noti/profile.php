<?php
// profile.php
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

$pdo = getDB();
$stmt = $pdo->prepare("SELECT id, name, email, avatar_url, role, created_at FROM noti_users WHERE id = ?");
$stmt->execute([$payload['user_id']]);
$user = $stmt->fetch();

if (!$user) {
    http_response_code(404);
    echo json_encode(["error" => "User not found"]);
    exit;
}

http_response_code(200);
echo json_encode([
    "user" => [
        "id" => $user['id'],
        "name" => $user['name'],
        "email" => $user['email'],
        "avatarUrl" => $user['avatar_url'],
        "role" => $user['role'],
        "createdAt" => $user['created_at']
    ]
]);
