CREATE TABLE IF NOT EXISTS logistics_state (
    id TINYINT UNSIGNED NOT NULL PRIMARY KEY,
    agencies_json LONGTEXT NOT NULL,
    drivers_json LONGTEXT NOT NULL,
    internals_json LONGTEXT NOT NULL,
    route_sheets_json LONGTEXT NOT NULL,
    zones_json LONGTEXT NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO logistics_state (id, agencies_json, drivers_json, internals_json, route_sheets_json, zones_json)
VALUES (1, '[]', '[]', '[]', '[]', '[]')
ON DUPLICATE KEY UPDATE id = id;
