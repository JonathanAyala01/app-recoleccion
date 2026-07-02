<?php

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$config = require __DIR__ . '/config.php';

function respond(array $payload, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    respond(['error' => 'Method not allowed'], 405);
}

$raw = file_get_contents('php://input');
$payload = json_decode($raw ?: '{}', true);

if (!is_array($payload)) {
    respond(['error' => 'Invalid JSON payload'], 400);
}

$password = trim((string) ($payload['password'] ?? ''));
if ($password === '') {
    respond(['error' => 'Password is required'], 400);
}

$adminPassword = (string) ($config['admin_password'] ?? '');
$viewerPassword = (string) ($config['viewer_password'] ?? '');

if ($adminPassword !== '' && hash_equals($adminPassword, $password)) {
    respond([
        'success' => true,
        'role' => 'admin',
        'label' => 'Administrador',
    ]);
}

if ($viewerPassword !== '' && hash_equals($viewerPassword, $password)) {
    respond([
        'success' => true,
        'role' => 'viewer',
        'label' => 'Vista informativa',
    ]);
}

respond(['error' => 'Contraseña inválida'], 401);
