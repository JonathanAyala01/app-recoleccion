<?php

declare(strict_types=1);

return [
    'host' => getenv('DB_HOST') ?: 'localhost',
    'port' => getenv('DB_PORT') ?: '3306',
    'name' => getenv('DB_NAME') ?: 'app_recoleccion',
    'user' => getenv('DB_USER') ?: 'root',
    'pass' => getenv('DB_PASS') ?: '',
    'charset' => getenv('DB_CHARSET') ?: 'utf8mb4',
    'table' => 'logistics_state',
    // Cambiá estas claves por tus contraseñas reales.
    'admin_password' => getenv('ADMIN_PASSWORD') ?: 'admin2026',
    'viewer_password' => getenv('VIEWER_PASSWORD') ?: 'vista2026',
];
