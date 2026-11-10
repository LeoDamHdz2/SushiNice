<?php

declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

require_once __DIR__ . '/conexion.php';

$columns = [
    'pedidos' => [
        'folio_secreto_hash' => 'CHAR(64) NULL',
        'cargo_cancelacion' => 'DECIMAL(10,2) NULL',
    ],
    'pedido_items' => [
        'categoria_item' => 'VARCHAR(40) NULL',
    ],
];

foreach ($columns as $table => $tableColumns) {
    foreach ($tableColumns as $column => $definition) {
        $check = $pdo->prepare(
            'SELECT COUNT(*) FROM information_schema.COLUMNS '
            . 'WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?'
        );
        $check->execute([$table, $column]);
        if ((int) $check->fetchColumn() === 0) {
            $pdo->exec("ALTER TABLE `$table` ADD COLUMN `$column` $definition");
            echo "Added $table.$column\n";
        }
    }
}

$check = $pdo->prepare(
    'SELECT COUNT(*) FROM information_schema.STATISTICS '
    . 'WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND INDEX_NAME = ?'
);
$check->execute(['pedidos', 'uq_pedidos_folio_secreto']);
if ((int) $check->fetchColumn() === 0) {
    $pdo->exec('ALTER TABLE `pedidos` ADD UNIQUE INDEX `uq_pedidos_folio_secreto` (`folio_secreto_hash`)');
    echo "Added pedidos.uq_pedidos_folio_secreto\n";
}

$pdo->exec(
    'UPDATE pedido_items pi JOIN menu_items mi ON mi.id = pi.menu_item_id '
    . 'SET pi.categoria_item = mi.categoria WHERE pi.categoria_item IS NULL'
);

echo "Existing order items now retain their original category when available.\n";
