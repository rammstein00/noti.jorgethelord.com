<?php
// get_users.php
require_once 'cors.php';
require_once 'config.php';
require_once 'jwt.php';

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
    exit;
}

$headers = getallheaders();
if (!isset($headers['Authorization'])) {
    http_response_code(401);
    echo json_encode(["error" => "No token provided"]);
    exit;
}

$token = str_replace('Bearer ', '', $headers['Authorization']);
$payload = JWT::verify($token, JWT_SECRET);

if (!$payload) {
    http_response_code(401);
    echo json_encode(["error" => "Invalid token"]);
    exit;
}

// Ensure the user calling this is an admin
if ($payload['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(["error" => "Acceso denegado. Se requiere nivel de Super Administrador."]);
    exit;
}

$pdo = getDB();

try {
    $stmt = $pdo->prepare("SELECT id, name, email, avatar_url, role FROM noti_users ORDER BY id ASC");
    $stmt->execute();
    $users = $stmt->fetchAll();
    
    http_response_code(200);
    echo json_encode([
        "users" => $users
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database error"]);
}
