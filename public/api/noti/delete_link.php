<?php
// delete_link.php
require_once 'cors.php';
require_once 'config.php';
require_once 'jwt.php';

if ($_SERVER["REQUEST_METHOD"] !== "DELETE") {
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

if (!isset($_GET['id'])) {
    http_response_code(400);
    echo json_encode(["error" => "Link ID not specified"]);
    exit;
}

$link_id = (int)$_GET['id'];
$user_id = $payload['user_id'];
$role = $payload['role'] ?? 'user';

$pdo = getDB();

try {
    // Check if the link exists
    $stmt = $pdo->prepare("SELECT user_id FROM noti_links WHERE id = ?");
    $stmt->execute([$link_id]);
    $link = $stmt->fetch();

    if (!$link) {
         http_response_code(404);
         echo json_encode(["error" => "Enlace no encontrado"]);
         exit;
    }

    // Check permissions: only the owner or an admin can delete it
    if ($link['user_id'] != $user_id && $role !== 'admin') {
         http_response_code(403);
         echo json_encode(["error" => "No tienes permisos para borrar este enlace"]);
         exit;
    }

    // Delete the link
    $delStmt = $pdo->prepare("DELETE FROM noti_links WHERE id = ?");
    $delStmt->execute([$link_id]);

    http_response_code(200);
    echo json_encode(["success" => true, "message" => "Enlace eliminado correctamente"]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database error: " . $e->getMessage()]);
}
