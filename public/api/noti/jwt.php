<?php
// jwt.php - Micro librería para generar y verificar tokens JWT en PHP nativo sin dependencias

class JWT {
    public static function generate($payload, $secret) {
        $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
        $header_enc = self::base64UrlEncode($header);
        
        $payload['exp'] = time() + JWT_EXPIRY; // Utiliza la constante JWT_EXPIRY
        $payload_enc = self::base64UrlEncode(json_encode($payload));
        
        $signature = hash_hmac('sha256', "$header_enc.$payload_enc", $secret, true);
        $signature_enc = self::base64UrlEncode($signature);
        
        return "$header_enc.$payload_enc.$signature_enc";
    }

    public static function verify($token, $secret) {
        $parts = explode('.', $token);
        if (count($parts) !== 3) return false;
        
        list($header_enc, $payload_enc, $signature_enc) = $parts;
        
        $signature = self::base64UrlEncode(hash_hmac('sha256', "$header_enc.$payload_enc", $secret, true));
        
        if (!hash_equals($signature, $signature_enc)) return false;
        
        $payload = json_decode(self::base64UrlDecode($payload_enc), true);
        if (isset($payload['exp']) && $payload['exp'] < time()) return false; // Token expirado
        
        return $payload;
    }

    public static function getBearerToken() {
        $headers = null;
        if (isset($_SERVER['Authorization'])) {
            $headers = trim($_SERVER["Authorization"]);
        } else if (isset($_SERVER['HTTP_AUTHORIZATION'])) { // Nginx or fast CGI
            $headers = trim($_SERVER["HTTP_AUTHORIZATION"]);
        } else if (function_exists('apache_request_headers')) {
            $requestHeaders = apache_request_headers();
            $requestHeaders = array_combine(array_map('ucwords', array_keys($requestHeaders)), array_values($requestHeaders));
            if (isset($requestHeaders['Authorization'])) {
                $headers = trim($requestHeaders['Authorization']);
            }
        }
        if (!empty($headers)) {
            if (preg_match('/Bearer\s(\S+)/', $headers, $matches)) {
                return $matches[1];
            }
        }
        return null;
    }

    private static function base64UrlEncode($data) {
        return str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($data));
    }

    private static function base64UrlDecode($data) {
        $pad = strlen($data) % 4;
        if ($pad) $data .= str_repeat('=', 4 - $pad);
        return base64_decode(str_replace(['-', '_'], ['+', '/'], $data));
    }
}
