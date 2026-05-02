<?php
// fetch_preview.php
require_once 'cors.php';
require_once 'jwt.php';

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
    exit;
}

// Optional: you can mandate authentication here to prevent abuse
$token = JWT::getBearerToken();
if (!$token || !JWT::verify($token, JWT_SECRET)) {
    http_response_code(401);
    echo json_encode(["error" => "Unauthorized"]);
    exit;
}

if (empty($_GET['url'])) {
    http_response_code(400);
    echo json_encode(["error" => "Missing URL"]);
    exit;
}

$target_url = filter_var(urldecode($_GET['url']), FILTER_SANITIZE_URL);
if (!filter_var($target_url, FILTER_VALIDATE_URL)) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid URL format"]);
    exit;
}

$context = stream_context_create([
    'http' => [
        'user_agent' => 'NotiCrispBot/1.0 (+https://jorgethelord.com)',
        'timeout' => 5
    ],
    'ssl' => [
        'verify_peer' => false,
        'verify_peer_name' => false
    ]
]);

$html = @file_get_contents($target_url, false, $context);

if ($html === false) {
    echo json_encode([
        "title" => "Vista previa no disponible",
        "description" => "No pudimos acceder a los datos de esta página.",
        "image" => null,
        "domain" => parse_url($target_url, PHP_URL_HOST)
    ]);
    exit;
}

$doc = new DOMDocument();
@$doc->loadHTML(mb_convert_encoding($html, 'HTML-ENTITIES', 'UTF-8'));

$title = '';
$description = '';
$image = '';
$domain = parse_url($target_url, PHP_URL_HOST);

$nodes = $doc->getElementsByTagName('title');
if ($nodes->length > 0) {
    $title = $nodes->item(0)->nodeValue;
}

$metas = $doc->getElementsByTagName('meta');
for ($i = 0; $i < $metas->length; $i++) {
    $meta = $metas->item($i);
    $property = $meta->getAttribute('property');
    $name = $meta->getAttribute('name');
    $content = $meta->getAttribute('content');

    if ($property === 'og:title' && !empty($content)) {
        $title = $content;
    }
    if ($property === 'og:description' && !empty($content)) {
        $description = $content;
    }
    if ($property === 'og:image' && !empty($content)) {
        $image = $content;
    }
    if ($name === 'description' && empty($description) && !empty($content)) {
        $description = $content;
    }
}

http_response_code(200);
echo json_encode([
    "title" => $title ?: "Sin título",
    "description" => $description ?: "Sin descripción...",
    "image" => $image ?: null,
    "domain" => $domain
]);
