<?php
// create_daily_visits_table.php - Ejecutar UNA VEZ para crear la tabla de visitas diarias
// Subir a Hostinger y abrir en el navegador una sola vez: 
// https://jorgethelord.com/api/noti/create_daily_visits_table.php
require_once 'config.php';

$pdo = getDB();

try {
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS noti_daily_visits (
            id INT AUTO_INCREMENT PRIMARY KEY,
            link_id INT NOT NULL,
            visit_date DATE NOT NULL,
            visit_count INT DEFAULT 0,
            UNIQUE KEY unique_link_date (link_id, visit_date),
            INDEX idx_visit_date (visit_date),
            INDEX idx_link_id (link_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");
    
    echo json_encode(["success" => true, "message" => "Table noti_daily_visits created successfully"]);
} catch (Exception $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
