<?php
/**
 * Samstrust Technologies Limited (RC 9898142)
 * Pure PHP JSON Web Token (JWT) Implementation (HS256)
 * Zero external dependencies - compatible with PHP 7.4 through PHP 8.4+
 */

class JWT {
    /**
     * Generate a signed JWT token
     *
     * @param array $payload Key-value payload data
     * @param string $secret HMAC SHA-256 secret key
     * @param int $expiresIn Expiry duration in seconds (default: 86400 = 24 hours)
     * @return string Signed JWT token string
     */
    public static function encode(array $payload, string $secret, int $expiresIn = 86400): string {
        $header = [
            'typ' => 'JWT',
            'alg' => 'HS256'
        ];

        $now = time();
        if (!isset($payload['iat'])) {
            $payload['iat'] = $now;
        }
        if (!isset($payload['exp'])) {
            $payload['exp'] = $now + $expiresIn;
        }

        $headerEncoded = self::base64UrlEncode(json_encode($header));
        $payloadEncoded = self::base64UrlEncode(json_encode($payload));

        $signature = hash_hmac('sha256', "{$headerEncoded}.{$payloadEncoded}", $secret, true);
        $signatureEncoded = self::base64UrlEncode($signature);

        return "{$headerEncoded}.{$payloadEncoded}.{$signatureEncoded}";
    }

    /**
     * Verify and decode a JWT token
     *
     * @param string $token The JWT token to verify
     * @param string $secret The HMAC SHA-256 secret key
     * @return array Decoded payload
     * @throws Exception On invalid format, signature mismatch, or expiration
     */
    public static function decode(string $token, string $secret): array {
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            throw new Exception("Invalid token format: expected 3 segments");
        }

        list($headerEncoded, $payloadEncoded, $signatureEncoded) = $parts;

        // Verify header
        $header = json_decode(self::base64UrlDecode($headerEncoded), true);
        if (!$header || ($header['alg'] ?? '') !== 'HS256') {
            throw new Exception("Unsupported or missing token algorithm");
        }

        // Verify signature
        $expectedSignature = hash_hmac('sha256', "{$headerEncoded}.{$payloadEncoded}", $secret, true);
        $providedSignature = self::base64UrlDecode($signatureEncoded);

        if (!hash_equals($expectedSignature, $providedSignature)) {
            throw new Exception("Invalid token signature");
        }

        // Verify payload
        $payload = json_decode(self::base64UrlDecode($payloadEncoded), true);
        if (!$payload) {
            throw new Exception("Malformed token payload JSON");
        }

        // Check expiration
        if (isset($payload['exp']) && $payload['exp'] < time()) {
            throw new Exception("Token has expired");
        }

        return $payload;
    }

    /**
     * URL-safe Base64 encode
     */
    public static function base64UrlEncode(string $data): string {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    /**
     * URL-safe Base64 decode
     */
    public static function base64UrlDecode(string $data): string {
        $remainder = strlen($data) % 4;
        if ($remainder) {
            $padLen = 4 - $remainder;
            $data .= str_repeat('=', $padLen);
        }
        return base64_decode(strtr($data, '-_', '+/'));
    }
}
