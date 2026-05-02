<?php
// config.php - Configuración de la base de datos para noti.jorgethelord.com

define('DB_HOST', 'localhost');
define('DB_NAME', 'u737085983_jorge');
define('DB_USER', 'u737085983_jorge');
define('DB_PASS', 'Broda123..');

// JWT Secret Key (usar una cadena secreta y única)
define('JWT_SECRET', 'noti_crisp_2026_super_secret_jwt_key_9z2x');
define('JWT_EXPIRY', 86400 * 7); // 7 días

// Configuración para duplicar links a noticriisp.com
define('MIRROR_SECRET', 'noti_mirror_2026_xK9mP2_secret');
define('MIRROR_URL', 'https://noticriisp.com/api/noti/mirror_link.php');

function getDB() {
    static $pdo = null;
    if ($pdo === null) {
        try {
            $pdo = new PDO(
                "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
                DB_USER,
                DB_PASS,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                ]
            );
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Database connection failed']);
            exit;
        }
    }
    return $pdo;
}
