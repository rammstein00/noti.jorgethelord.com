<?php
// create_link.php
require_once 'cors.php';
require_once 'config.php';
require_once 'jwt.php';

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
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

$input = json_decode(file_get_contents("php://input"), true);
if (empty($input['originalUrl'])) {
    http_response_code(400);
    echo json_encode(["error" => "Missing original URL"]);
    exit;
}

$original_url = filter_var(trim($input['originalUrl']), FILTER_SANITIZE_URL);
if (!filter_var($original_url, FILTER_VALIDATE_URL)) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid URL format"]);
    exit;
}

$cta_text = isset($input['ctaText']) ? trim($input['ctaText']) : '';
$user_id = $payload['user_id'];

function generateRandomString($length = 6) {
    $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    $charactersLength = strlen($characters);
    $randomString = '';
    for ($i = 0; $i < $length; $i++) {
        $randomString .= $characters[random_int(0, $charactersLength - 1)];
    }
    return $randomString;
}

$pdo = getDB();

// Loop para asegurar un short_code único
$short_code = '';
$max_attempts = 10;
$attempts = 0;

while ($attempts < $max_attempts) {
    $short_code = generateRandomString(6);
    $stmt = $pdo->prepare("SELECT id FROM noti_links WHERE short_code = ?");
    $stmt->execute([$short_code]);
    if (!$stmt->fetch()) {
        break;
    }
    $attempts++;
}

if ($attempts == $max_attempts) {
    http_response_code(500);
    echo json_encode(["error" => "Failed to generate a unique short code."]);
    exit;
}

try {
    $stmt = $pdo->prepare("INSERT INTO noti_links (user_id, original_url, short_code, cta_text, mirrored) VALUES (?, ?, ?, ?, 0)");
    $stmt->execute([$user_id, $original_url, $short_code, $cta_text]);
    $link_id = $pdo->lastInsertId();
    
    // Duplicar link a noticriisp.com
    $mirrored = 0;
    try {
        $mirror_data = json_encode([
            'mirror_secret' => MIRROR_SECRET,
            'short_code' => $short_code,
            'original_url' => $original_url,
            'cta_text' => $cta_text
        ]);
        
        $ch = curl_init(MIRROR_URL);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $mirror_data);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 5);
        $mirror_response = curl_exec($ch);
        $mirror_status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($mirror_status >= 200 && $mirror_status < 300) {
            $mirrored = 1;
            $pdo->prepare("UPDATE noti_links SET mirrored = 1 WHERE id = ?")->execute([$link_id]);
        }
    } catch (Exception $mirror_err) {
        // Si falla el mirror, el link local sigue funcionando
    }
    
    $shortDataUrl = "https://noti.jorgethelord.com/l/" . $short_code;
    
    http_response_code(201);
    echo json_encode([
        "message" => "Link created",
        "link" => [
            "id" => $link_id,
            "shortCode" => $short_code,
            "shortUrl" => $shortDataUrl,
            "originalUrl" => $original_url,
            "ctaText" => $cta_text,
            "visits" => 0,
            "mirrored" => $mirrored
        ]
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database error: " . $e->getMessage()]);
}
