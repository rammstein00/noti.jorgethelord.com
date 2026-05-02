<?php
// delete_user.php
require_once 'cors.php';
require_once 'config.php';
require_once 'jwt.php';

if ($_SERVER["REQUEST_METHOD"] !== "DELETE") {
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

if (!isset($_GET['id'])) {
    http_response_code(400);
    echo json_encode(["error" => "User ID not specified"]);
    exit;
}

$target_user_id = (int)$_GET['id'];

// Prevent the admin from deleting themselves
if ($payload['user_id'] == $target_user_id) {
    http_response_code(400);
    echo json_encode(["error" => "No puedes eliminarte a ti mismo."]);
    exit;
}

$pdo = getDB();

try {
    // DELETE LINKS FIRST (Application-level cascade)
    $stmtLinks = $pdo->prepare("DELETE FROM noti_links WHERE user_id = ?");
    $stmtLinks->execute([$target_user_id]);

    // THEN DELETE THE USER
    $stmt = $pdo->prepare("DELETE FROM noti_users WHERE id = ?");
    $stmt->execute([$target_user_id]);
    
    if ($stmt->rowCount() > 0) {
        http_response_code(200);
        echo json_encode(["success" => true, "message" => "Usuario eliminado."]);
    } else {
        http_response_code(404);
        echo json_encode(["error" => "Usuario no encontrado"]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database error or user has active links protecting deletion."]);
}
