<?php
// adskeeper_hourly.php - Datos agrupados por hora del día
// Usa startHour/endHour para obtener datos de cada hora individual
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
$user_role = 'admin';
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
    $WIDGET_TOP = "1993803";
    $valid_widgets = ['1993803', '1993804', '1993805', '1993806'];
} elseif ($user_id === 10) {
    $WIDGET_TOP = "1993821";
    $valid_widgets = ['1993821', '1993822', '1993823', '1993824'];
} else {
    $WIDGET_TOP = "1989745";
    $valid_widgets = ['1989745', '1989746', '1989747', '1989749'];
}

// Consultar las 24 horas en paralelo usando curl_multi
$mh = curl_multi_init();
$handles = [];

for ($h = 0; $h < 24; $h++) {
    $api_url = "https://api.adskeeper.com/v1/publishers/{$AK_AUTH_ID}/widget-custom-report"
             . "?dateInterval=last30Days"
             . "&dimensions=widgetId"
             . "&metrics=impressions,clicks,wages"
             . "&timeZone=America/Havana"
             . "&startHour={$h}"
             . "&endHour={$h}";

    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL            => $api_url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 20,
        CURLOPT_HTTPHEADER     => [
            "Authorization: Bearer {$AK_TOKEN}",
            "Accept: application/json"
        ],
        CURLOPT_SSL_VERIFYPEER => true,
    ]);
    
    curl_multi_add_handle($mh, $ch);
    $handles[$h] = $ch;
}

// Ejecutar todas las solicitudes en paralelo
$active = null;
do {
    $mrc = curl_multi_exec($mh, $active);
    if ($active) {
        curl_multi_select($mh);
    }
} while ($active && $mrc == CURLM_OK);

// Recoger los resultados
$hourly = [];
for ($h = 0; $h < 24; $h++) {
    $hourly[$h] = ['hour' => sprintf('%02d', $h), 'visitas' => 0, 'clicks' => 0, 'revenue' => 0.00];
    
    $response = curl_multi_getcontent($handles[$h]);
    $http_code = curl_getinfo($handles[$h], CURLINFO_HTTP_CODE);
    curl_multi_remove_handle($mh, $handles[$h]);
    curl_close($handles[$h]);
    
    if ($http_code !== 200 || $response === false) continue;
    
    $data = json_decode($response, true);
    if (!is_array($data)) continue;
    
    foreach ($data as $row) {
        if (!is_array($row) || !isset($row['widgetId'])) continue;
        $widgetId = (string)$row['widgetId'];
        
        if (in_array($widgetId, $valid_widgets)) {
            $hourly[$h]['clicks'] += isset($row['clicks']) ? (int)$row['clicks'] : 0;
            $hourly[$h]['revenue'] += isset($row['wages']) ? (float)$row['wages'] : 0.00;
            
            if ($widgetId === $WIDGET_TOP) {
                $hourly[$h]['visitas'] += isset($row['impressions']) ? (int)$row['impressions'] : 0;
            }
        }
    }
}

curl_multi_close($mh);

// Aplicar factores de comision diferenciados para empleados (no-admin)
if ($user_role !== 'admin') {
    foreach ($hourly as &$row) {
        $row['visitas'] = (int)round($row['visitas'] * 0.70);  // 70% visitas
        $row['clicks']  = (int)round($row['clicks']  * 0.95);  // 95% clics
        $row['revenue'] = round($row['revenue'] * 0.95, 4);    // 95% ganancias
    }
}

$results = array_values($hourly);

http_response_code(200);
echo json_encode([
    "success" => true,
    "data" => $results
]);
