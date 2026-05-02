<?php
// register.php
require_once 'cors.php';
require_once 'config.php';
require_once 'jwt.php';

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
    exit;
}

$input = json_decode(file_get_contents("php://input"), true);

if (empty($input['name']) || empty($input['email']) || empty($input['password'])) {
    http_response_code(400);
    echo json_encode(["error" => "Missing required fields"]);
    exit;
}

$name = trim($input['name']);
$email = filter_var(trim($input['email']), FILTER_SANITIZE_EMAIL);
$password = $input['password'];

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid email format"]);
    exit;
}

if (strlen($password) < 6) {
    http_response_code(400);
    echo json_encode(["error" => "Password must be at least 6 characters long"]);
    exit;
}

$pdo = getDB();

// Check if email exists
$stmt = $pdo->prepare("SELECT id FROM noti_users WHERE email = ?");
$stmt->execute([$email]);
if ($stmt->fetch()) {
    http_response_code(409);
    echo json_encode(["error" => "Email already registered"]);
    exit;
}

// Generate avatar based on initials
$initials = strtoupper(substr($name, 0, 2));
$avatar_url = "https://ui-avatars.com/api/?name=" . urlencode($name) . "&background=random";

$password_hash = password_hash($password, PASSWORD_DEFAULT);

try {
    $stmt = $pdo->prepare("INSERT INTO noti_users (name, email, password_hash, avatar_url) VALUES (?, ?, ?, ?)");
    $stmt->execute([$name, $email, $password_hash, $avatar_url]);
    
    $user_id = $pdo->lastInsertId();
    
    // Generate JWT token
    $payload = [
        "user_id" => $user_id,
        "email" => $email,
        "role" => 'user'
    ];
    $token = JWT::generate($payload, JWT_SECRET);
    
    http_response_code(201);
    echo json_encode([
        "message" => "Registration successful",
        "token" => $token,
        "user" => [
            "id" => $user_id,
            "name" => $name,
            "email" => $email,
            "avatarUrl" => $avatar_url,
            "role" => 'user'
        ]
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "An error occurred during registration."]);
}
