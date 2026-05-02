<?php
require_once 'config.php';
$pdo = getDB();

try {
    // 1. Eliminar todos los usuarios existentes (los clonados de noticrisp)
    $stmt = $pdo->prepare("DELETE FROM noti_users");
    $stmt->execute();
    echo "✅ Todos los usuarios antiguos fueron eliminados exitosamente.<br>";

    // 2. Crear usuario Admin Normal (dendo)
    $dendo_pass = password_hash('dendo123', PASSWORD_BCRYPT);
    $stmt = $pdo->prepare("INSERT INTO noti_users (name, email, password_hash, role) VALUES (?, ?, ?, ?)");
    $stmt->execute(['dendo', 'dendo@jorgethelord.com', $dendo_pass, 'admin']);
    echo "✅ Usuario 'dendo' creado exitosamente.<br>";

    // 3. Crear usuario Super Admin (rammstein00)
    $rammstein_pass = password_hash('saraelio.', PASSWORD_BCRYPT);
    $stmt = $pdo->prepare("INSERT INTO noti_users (name, email, password_hash, role) VALUES (?, ?, ?, ?)");
    $stmt->execute(['rammstein00', 'rammstein00@jorgethelord.com', $rammstein_pass, 'admin']);
    echo "✅ Usuario 'rammstein00' creado exitosamente.<br>";

    echo "<br><b>¡Todo listo! Por seguridad, por favor borra este archivo (setup_users.php) de tu servidor de Hostinger después de verlo.</b>";

} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage();
}
?>
