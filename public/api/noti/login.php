<?php
// login.php
require_once 'cors.php';
require_once 'config.php';
require_once 'jwt.php';

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
    exit;
}

$input = json_decode(file_get_contents("php://input"), true);

if (empty($input['email']) || empty($input['password'])) {
    http_response_code(400);
    echo json_encode(["error" => "Missing email or password"]);
    exit;
}

$email = trim($input['email']);
$password = $input['password'];

$pdo = getDB();

$stmt = $pdo->prepare("SELECT id, name, email, password_hash, avatar_url, role FROM noti_users WHERE email = ?");
$stmt->execute([$email]);
$user = $stmt->fetch();

if ($user && password_verify($password, $user['password_hash'])) {
    
    // Generate JWT token
    $payload = [
        "user_id" => $user['id'],
        "email" => $user['email'],
        "role" => $user['role']
    ];
    $token = JWT::generate($payload, JWT_SECRET);
    
    http_response_code(200);
    echo json_encode([
        "message" => "Login successful",
        "token" => $token,
        "user" => [
            "id" => $user['id'],
            "name" => $user['name'],
            "email" => $user['email'],
            "avatarUrl" => $user['avatar_url'],
            "role" => $user['role']
        ]
    ]);
} else {
    http_response_code(401);
    echo json_encode(["error" => "Invalid email or password"]);
}
