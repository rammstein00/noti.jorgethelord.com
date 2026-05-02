<?php
// adskeeper_stats.php - Proxy seguro para consultar estadísticas de AdsKeeper
// Devuelve: visitas (del widget top 1989745), ganancias, clics y CPM
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

// CREDENCIALES PRIVADAS DE ADSKEEPER (Publisher REST API)
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

// Parámetro opcional: intervalo de fechas (default: hoy)
$interval = isset($_GET['interval']) ? $_GET['interval'] : 'today';
$valid_intervals = ['today', 'yesterday', 'thisWeek', 'lastWeek', 'thisMonth', 'lastMonth', 'lastSeven', 'last30Days', 'all'];

if (!in_array($interval, $valid_intervals)) {
    $interval = 'today';
}

// ══════════════════════════════════════════════════════════
// Consulta por widgetId para obtener datos individuales
// El campo "impressions" = "Vistas con visibilidad" por widget
// ══════════════════════════════════════════════════════════
$api_url = "https://api.adskeeper.com/v1/publishers/{$AK_AUTH_ID}/widget-custom-report"
         . "?dateInterval={$interval}"
         . "&dimensions=widgetId"
         . "&metrics=impressions,clicks,wages,cpm"
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
$curl_error   = curl_error($ch);
curl_close($ch);

if ($api_response === false) {
    http_response_code(502);
    echo json_encode(["success" => false, "error" => "Could not reach AdsKeeper API", "detail" => $curl_error]);
    exit;
}

if ($http_code !== 200) {
    http_response_code(502);
    echo json_encode(["success" => false, "error" => "AdsKeeper returned HTTP {$http_code}", "raw" => json_decode($api_response, true)]);
    exit;
}

$data = json_decode($api_response, true);

if ($data === null || !is_array($data)) {
    http_response_code(502);
    echo json_encode(["success" => false, "error" => "Invalid JSON from AdsKeeper"]);
    exit;
}

$visitas_top    = 0;
$total_clicks   = 0;
$total_wages    = 0.00;

foreach ($data as $row) {
    if (!is_array($row) || !isset($row['widgetId'])) continue;
    
    // Solo procesar si el widget actual está en nuestra lista de 4 widgets permitidos
    if (in_array((string)$row['widgetId'], $valid_widgets)) {
        $clicks = isset($row['clicks']) ? (int)$row['clicks'] : 0;
        $wages  = isset($row['wages']) ? (float)$row['wages'] : 0.00;
        
        $total_clicks += $clicks;
        $total_wages  += $wages;
        
        // Visitas = impresiones visibles del widget TOP solamente
        if ((string)$row['widgetId'] === $WIDGET_TOP) {
            $visitas_top = isset($row['impressions']) ? (int)$row['impressions'] : 0;
        }
    }
}

// CPM calculado ANTES de ajustar (sobre valores reales)
// Luego se recalcula con los valores ajustados

// Aplicar factores de comision diferenciados para empleados (no-admin)
if ($user_role !== 'admin') {
    $visitas_top  = (int)round($visitas_top  * 0.70);  // 70% visitas
    $total_clicks = (int)round($total_clicks * 0.95);  // 95% clics
    $total_wages  = round($total_wages  * 0.95, 4);    // 95% ganancias
}

// CPM recalculado sobre valores ajustados: (ganancias / visitas) * 1000
$cpm = $visitas_top > 0 ? ($total_wages / $visitas_top) * 1000 : 0;

http_response_code(200);
echo json_encode([
    "success"  => true,
    "interval" => $interval,
    "stats"    => [
        "visitas"  => $visitas_top,
        "clicks"   => $total_clicks,
        "revenue"  => $total_wages,
        "cpm"      => round($cpm, 4)
    ]
]);

