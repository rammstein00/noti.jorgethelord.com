<?php
// adskeeper_charts.php - Proxy para datos diarios históricos de AdsKeeper
require_once 'cors.php';
require_once 'config.php';
require_once 'jwt.php';

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
    exit;
}

// Extract JWT token to determine tenant
$user_id = 0;
$user_role = 'admin'; // default to admin if no token
$token = JWT::getBearerToken();
if (!$token && isset($_GET['token'])) {
    $token = trim($_GET['token']);
}
if ($token) {
    $payload = JWT::verify($token, JWT_SECRET);
    if ($payload && isset($payload['user_id'])) {
        $user_id = (int)$payload['user_id'];
        $user_role = isset($payload['role']) ? $payload['role'] : 'user';
    }
}

$AK_AUTH_ID = "655925";
$AK_TOKEN   = "d4b0a05de2baba1b349715ab6bae5640";

// Multi-tenant Dynamic Widget Mapping
if ($user_id === 9) {
    // Manolo's Widgets
    $WIDGET_TOP = "1993803";
    $valid_widgets = ['1993803', '1993804', '1993805', '1993806'];
} elseif ($user_id === 10) {
    // Fermin's Widgets
    $WIDGET_TOP = "1993821";
    $valid_widgets = ['1993821', '1993822', '1993823', '1993824'];
} else {
    // Gato / Admin Default Widgets
    $WIDGET_TOP = "1989745";
    $valid_widgets = ['1989745', '1989746', '1989747', '1989749'];
}

// Siempre pedimos los últimos 30 días para alimentar los gráficos
$api_url = "https://api.adskeeper.com/v1/publishers/{$AK_AUTH_ID}/widget-custom-report"
         . "?dateInterval=last30Days"
         . "&dimensions=date,widgetId"
         . "&metrics=impressions,clicks,wages"
         . "&timeZone=America/Havana";

$ch = curl_init();
curl_setopt_array($ch, [
    CURLOPT_URL            => $api_url,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT        => 15,
    CURLOPT_HTTPHEADER     => [
        "Authorization: Bearer {$AK_TOKEN}",
        "Accept: application/json"
    ],
    CURLOPT_SSL_VERIFYPEER => true,
]);

$api_response = curl_exec($ch);
$http_code    = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($api_response === false || $http_code !== 200) {
    http_response_code(502);
    echo json_encode(["success" => false, "error" => "Could not reach AdsKeeper API"]);
    exit;
}

$data = json_decode($api_response, true);
if ($data === null || !is_array($data)) {
    http_response_code(502);
    echo json_encode(["success" => false, "error" => "Invalid JSON from AdsKeeper"]);
    exit;
}

// Agrupar por fecha
$daily_stats = [];

foreach ($data as $row) {
    if (!is_array($row) || !isset($row['date']) || !isset($row['widgetId'])) continue;
    
    $date = $row['date']; // ej: "2026-04-12"
    $widgetId = (string)$row['widgetId'];
    
    if (in_array($widgetId, $valid_widgets)) {
        if (!isset($daily_stats[$date])) {
            $daily_stats[$date] = [
                'date' => $date,
                'visitas' => 0,
                'clicks' => 0,
                'revenue' => 0.00
            ];
        }
        
        $daily_stats[$date]['clicks'] += isset($row['clicks']) ? (int)$row['clicks'] : 0;
        $daily_stats[$date]['revenue'] += isset($row['wages']) ? (float)$row['wages'] : 0.00;
        
        // Las visitas del día se toman del widget TOP para que coincidan con el valor real del Dashboard
        if ($widgetId === $WIDGET_TOP) {
            $daily_stats[$date]['visitas'] = isset($row['impressions']) ? (int)$row['impressions'] : 0;
        }
    }
}

// Re-indexar y ordenar por fecha ascendente para el frontend
$results = array_values($daily_stats);
usort($results, function($a, $b) {
    return strcmp($a['date'], $b['date']);
});

// Aplicar factores de comision diferenciados para empleados (no-admin)
if ($user_role !== 'admin') {
    $results = array_map(function($row) {
        $row['visitas'] = (int)round($row['visitas'] * 0.70);  // 70% visitas
        $row['clicks']  = (int)round($row['clicks']  * 0.95);  // 95% clics
        $row['revenue'] = round($row['revenue'] * 0.95, 4);    // 95% ganancias
        return $row;
    }, $results);
}

http_response_code(200);
echo json_encode([
    "success" => true,
    "data" => $results
]);
