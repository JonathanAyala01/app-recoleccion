<?php

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, PUT, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$config = require __DIR__ . '/config.php';
$stateFile = __DIR__ . '/state.json';

function defaultState(): array
{
    return [
        'agencies' => [],
        'drivers' => [],
        'internals' => [],
        'routeSheets' => [],
        'zones' => [],
    ];
}

function respond(array $payload, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function getPdo(array $config): PDO
{
    $dsn = sprintf(
        'mysql:host=%s;port=%s;dbname=%s;charset=%s',
        $config['host'],
        $config['port'],
        $config['name'],
        $config['charset']
    );

    return new PDO($dsn, $config['user'], $config['pass'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
}

function ensureSchema(PDO $pdo, array $config): void
{
    $table = preg_replace('/[^a-zA-Z0-9_]/', '', $config['table']);
    $pdo->exec(
        "CREATE TABLE IF NOT EXISTS `{$table}` (
            id TINYINT UNSIGNED NOT NULL PRIMARY KEY,
            agencies_json LONGTEXT NOT NULL,
            drivers_json LONGTEXT NOT NULL,
            internals_json LONGTEXT NOT NULL,
            route_sheets_json LONGTEXT NOT NULL,
            zones_json LONGTEXT NOT NULL,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
    );

    try {
        $stmt = $pdo->prepare("SELECT COUNT(*) AS count FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = :schema AND TABLE_NAME = :table AND COLUMN_NAME = 'internals_json'");
        $stmt->execute([
            ':schema' => $config['name'],
            ':table' => $table,
        ]);
        $hasColumn = (int) ($stmt->fetch()['count'] ?? 0) > 0;

        if (!$hasColumn) {
            $pdo->exec("ALTER TABLE `{$table}` ADD COLUMN internals_json LONGTEXT NOT NULL AFTER drivers_json");
        }
    } catch (Throwable $e) {
        // Keep going; some hosts restrict INFORMATION_SCHEMA access or already have the column.
    }
}

function decodeStateRow(array $row): array
{
    return [
        'agencies' => json_decode($row['agencies_json'] ?? '[]', true) ?: [],
        'drivers' => json_decode($row['drivers_json'] ?? '[]', true) ?: [],
        'internals' => json_decode($row['internals_json'] ?? '[]', true) ?: [],
        'routeSheets' => json_decode($row['route_sheets_json'] ?? '[]', true) ?: [],
        'zones' => json_decode($row['zones_json'] ?? '[]', true) ?: [],
        'updatedAt' => $row['updated_at'] ?? null,
    ];
}

function readState(PDO $pdo, array $config): array
{
    $table = preg_replace('/[^a-zA-Z0-9_]/', '', $config['table']);
    $stmt = $pdo->query("SELECT agencies_json, drivers_json, internals_json, route_sheets_json, zones_json, updated_at FROM `{$table}` WHERE id = 1 LIMIT 1");
    $row = $stmt->fetch();

    if (!$row) {
        return defaultState();
    }

    return decodeStateRow($row);
}

function normalizePayload(array $payload): array
{
    return [
        'agencies' => array_values(is_array($payload['agencies'] ?? null) ? $payload['agencies'] : []),
        'drivers' => array_values(is_array($payload['drivers'] ?? null) ? $payload['drivers'] : []),
        'internals' => array_values(is_array($payload['internals'] ?? null) ? $payload['internals'] : []),
        'routeSheets' => array_values(is_array($payload['routeSheets'] ?? null) ? $payload['routeSheets'] : []),
        'zones' => array_values(is_array($payload['zones'] ?? null) ? $payload['zones'] : []),
    ];
}

function saveState(PDO $pdo, array $config, array $state): void
{
    $table = preg_replace('/[^a-zA-Z0-9_]/', '', $config['table']);
    $stmt = $pdo->prepare(
        "INSERT INTO `{$table}` (id, agencies_json, drivers_json, internals_json, route_sheets_json, zones_json)
         VALUES (1, :agencies, :drivers, :internals, :routes, :zones)
         ON DUPLICATE KEY UPDATE
            agencies_json = VALUES(agencies_json),
            drivers_json = VALUES(drivers_json),
            internals_json = VALUES(internals_json),
            route_sheets_json = VALUES(route_sheets_json),
            zones_json = VALUES(zones_json)"
    );

    $stmt->execute([
        ':agencies' => json_encode($state['agencies'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
        ':drivers' => json_encode($state['drivers'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
        ':internals' => json_encode($state['internals'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
        ':routes' => json_encode($state['routeSheets'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
        ':zones' => json_encode($state['zones'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
    ]);
}

function readFileState(string $stateFile): array
{
    if (!is_file($stateFile)) {
        return defaultState();
    }

    $raw = file_get_contents($stateFile);
    $decoded = json_decode($raw ?: '{}', true);
    if (!is_array($decoded)) {
        return defaultState();
    }

    return normalizePayload($decoded);
}

function saveFileState(string $stateFile, array $state): void
{
    file_put_contents(
        $stateFile,
        json_encode($state, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT),
        LOCK_EX
    );
}

$useDatabase = true;
try {
    $pdo = getPdo($config);
    ensureSchema($pdo, $config);
} catch (Throwable $e) {
    $useDatabase = false;
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    $state = $useDatabase ? readState($pdo, $config) : readFileState($stateFile);
    respond(['data' => $state, 'storage' => $useDatabase ? 'database' : 'file']);
}

if ($method === 'PUT' || $method === 'POST') {
    $raw = file_get_contents('php://input');
    $payload = json_decode($raw ?: '{}', true);

    if (!is_array($payload)) {
        respond([
            'error' => 'Invalid JSON payload',
        ], 400);
    }

    $state = normalizePayload($payload);
    if ($useDatabase) {
        saveState($pdo, $config, $state);
    } else {
        saveFileState($stateFile, $state);
    }

    respond([
        'success' => true,
        'data' => $state,
        'storage' => $useDatabase ? 'database' : 'file',
    ]);
}

respond([
    'error' => 'Method not allowed',
], 405);
