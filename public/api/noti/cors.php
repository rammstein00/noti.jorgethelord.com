<?php
// cors.php - Manejo de cabeceras CORS para la comunicación con noti.jorgethelord.com

$allowed_origins = [
    'https://noti.jorgethelord.com',
    'http://localhost:3000', // Vite default dev port
    'http://localhost:5173', // Vite alternate dev port
];

$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';

if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    // Para entornos más permisivos o de postman (opcional, remover en prod estricta)
    // header("Access-Control-Allow-Origin: *");
}

header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");
header('Content-Type: application/json; charset=utf-8');

// Manejar preflight request (OPTIONS) y terminar rápido
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
