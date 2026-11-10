<?php

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

session_set_cookie_params([
    'httponly' => true,
    'secure' => isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
    'samesite' => 'Lax',
]);
session_start();

function api_respond(int $status, array $data): void
{
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function api_request_data(): array
{
    $data = json_decode(file_get_contents('php://input'), true);

    if (!is_array($data)) {
        api_respond(400, ['error' => 'La solicitud no tiene un formato válido.']);
    }

    return $data;
}

function api_require_admin(): void
{
    if (empty($_SESSION['user']['isAdmin'])) {
        api_respond(403, ['error' => 'Se requieren permisos de administrador.']);
    }
}

function api_require_user(): int
{
    $userId = filter_var($_SESSION['user']['id'] ?? null, FILTER_VALIDATE_INT);
    if ($userId === false || $userId < 1) {
        api_respond(401, ['error' => 'Inicia sesión para consultar tus pedidos.']);
    }

    return $userId;
}

function api_load_order_items(PDO $pdo, array $orderIds): array
{
    if ($orderIds === []) {
        return [];
    }

    $placeholders = implode(',', array_fill(0, count($orderIds), '?'));
    $statement = $pdo->prepare(
        "SELECT pedido_id, nombre_item AS name, categoria_item AS category, "
        . "precio_unitario AS unit_price, cantidad AS quantity "
        . "FROM pedido_items WHERE pedido_id IN ($placeholders) ORDER BY id"
    );
    $statement->execute($orderIds);
    $items = [];
    foreach ($statement->fetchAll() as $item) {
        $items[(int) $item['pedido_id']][] = [
            'name' => $item['name'],
            'category' => $item['category'],
            'unitPrice' => $item['unit_price'],
            'quantity' => (int) $item['quantity'],
        ];
    }

    return $items;
}

function api_cancellation_fee_cents(array $items): int
{
    $foodSubtotalCents = 0;
    $beverageSubtotalCents = 0;
    foreach ($items as $item) {
        $subtotalCents = (int) round(
            (float) $item['unitPrice'] * (int) $item['quantity'] * 100,
            0,
            PHP_ROUND_HALF_UP
        );
        if ($item['category'] === 'bebidas') {
            $beverageSubtotalCents += $subtotalCents;
        } else {
            $foodSubtotalCents += $subtotalCents;
        }
    }

    return intdiv($foodSubtotalCents, 2) + ($foodSubtotalCents % 2) + $beverageSubtotalCents;
}

function api_order_view(array $order, array $items): array
{
    $canCancel = in_array($order['status'], ['pending', 'preparing'], true);

    return [
        'id' => (int) $order['id'],
        'status' => $order['status'],
        'orderedAt' => $order['ordered_at'],
        'name' => $order['name'],
        'email' => $order['email'],
        'phone' => $order['phone'],
        'address' => $order['address'],
        'total' => $order['total'],
        'cancellationFee' => $order['cancellation_fee'],
        'cancellationFeeEstimate' => $canCancel
            ? number_format(api_cancellation_fee_cents($items) / 100, 2, '.', '')
            : null,
        'canCancel' => $canCancel,
        'items' => $items,
    ];
}

function api_tracking_code(array $data): string
{
    $orderId = filter_var($data['id'] ?? null, FILTER_VALIDATE_INT);
    $code = $data['trackingCode'] ?? null;
    if (
        $orderId === false || $orderId < 1
        || !is_string($code)
        || !preg_match('/\A[a-f0-9]{64}\z/i', $code)
    ) {
        api_respond(422, ['error' => 'Escribe el folio y el código secreto que recibiste al hacer tu pedido.']);
    }

    return strtolower($code);
}

function api_string(array $data, string $key, int $maxLength, bool $required = true): string
{
    $input = $data[$key] ?? '';
    if (!is_string($input) && !is_numeric($input)) {
        api_respond(422, ['error' => 'Revisa los campos obligatorios y sus longitudes.']);
    }
    $value = trim((string) $input);
    if (($required && $value === '') || strlen($value) > $maxLength) {
        api_respond(422, ['error' => 'Revisa los campos obligatorios y sus longitudes.']);
    }

    return $value;
}

function api_menu_item(array $data): array
{
    $name = api_string($data, 'name', 120);
    $category = api_string($data, 'category', 40);
    $description = api_string($data, 'description', 500);
    $image = api_string($data, 'image', 500);
    $price = filter_var($data['price'] ?? null, FILTER_VALIDATE_FLOAT);

    if (!in_array($category, ['sopas', 'ensaladas', 'kushiagues', 'rolls', 'bebidas'], true)) {
        api_respond(422, ['error' => 'La categoría seleccionada no es válida.']);
    }
    if ($price === false || $price < 0 || $price > 99999999) {
        api_respond(422, ['error' => 'Escribe un precio válido.']);
    }
    if (
        !filter_var($image, FILTER_VALIDATE_URL)
        || parse_url($image, PHP_URL_SCHEME) !== 'https'
    ) {
        api_respond(422, ['error' => 'La imagen debe usar una dirección HTTPS válida.']);
    }

    return [
        'name' => $name,
        'category' => $category,
        'description' => $description,
        'price' => number_format((float) $price, 2, '.', ''),
        'image' => $image,
    ];
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
if ($method !== 'GET' && $method !== 'POST') {
    header('Allow: GET, POST');
    api_respond(405, ['error' => 'Método no permitido.']);
}
$data = $method === 'POST' ? api_request_data() : [];
$action = $method === 'GET' ? (string) ($_GET['action'] ?? '') : (string) ($data['action'] ?? '');

try {
    require_once __DIR__ . '/conexion.php';

    if ($method === 'GET' && $action === 'menu') {
        $statement = $pdo->query(
            'SELECT id, nombre AS name, categoria AS category, descripcion AS description, '
            . 'precio AS price, imagen AS image FROM menu_items ORDER BY id'
        );
        api_respond(200, ['items' => $statement->fetchAll()]);
    }

    if ($action === 'create-order' && $method === 'POST') {
        $name = api_string($data, 'name', 100);
        $email = strtolower(api_string($data, 'email', 254));
        $phone = api_string($data, 'phone', 30);
        $address = api_string($data, 'address', 500);
        $lines = $data['items'] ?? null;

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            api_respond(422, ['error' => 'Escribe un correo electrónico válido.']);
        }
        if (!is_array($lines) || count($lines) < 1 || count($lines) > 30) {
            api_respond(422, ['error' => 'Agrega entre 1 y 30 productos a tu pedido.']);
        }

        $quantities = [];
        foreach ($lines as $line) {
            if (!is_array($line)) {
                api_respond(422, ['error' => 'Hay un producto o cantidad inválidos en el pedido.']);
            }
            $id = filter_var($line['id'] ?? null, FILTER_VALIDATE_INT);
            $quantity = filter_var($line['qty'] ?? null, FILTER_VALIDATE_INT);
            if ($id === false || $id < 1 || $quantity === false || $quantity < 1 || $quantity > 50) {
                api_respond(422, ['error' => 'Hay un producto o cantidad inválidos en el pedido.']);
            }
            $quantities[$id] = ($quantities[$id] ?? 0) + $quantity;
            if ($quantities[$id] > 50) {
                api_respond(422, ['error' => 'La cantidad máxima por producto es 50.']);
            }
        }

        $pdo->beginTransaction();
        $placeholders = implode(',', array_fill(0, count($quantities), '?'));
        $statement = $pdo->prepare(
            "SELECT id, nombre, categoria, precio FROM menu_items WHERE id IN ($placeholders) ORDER BY id"
        );
        $statement->execute(array_keys($quantities));
        $items = $statement->fetchAll();
        if (count($items) !== count($quantities)) {
            $pdo->rollBack();
            api_respond(422, ['error' => 'Uno o más productos ya no están disponibles. Actualiza el menú e inténtalo de nuevo.']);
        }

        $total = 0.0;
        foreach ($items as $item) {
            $total += (float) $item['precio'] * $quantities[(int) $item['id']];
        }
        $userId = $_SESSION['user']['id'] ?? null;
        $trackingCode = $userId === null ? bin2hex(random_bytes(32)) : null;
        $statement = $pdo->prepare(
            'INSERT INTO pedidos '
            . '(usuario_id, folio_secreto_hash, nombre_cliente, correo_cliente, telefono, domicilio, total) '
            . 'VALUES (?, ?, ?, ?, ?, ?, ?)'
        );
        $statement->execute([
            $userId,
            $trackingCode !== null ? hash('sha256', $trackingCode) : null,
            $name,
            $email,
            $phone,
            $address,
            number_format($total, 2, '.', ''),
        ]);
        $orderId = (int) $pdo->lastInsertId();

        $insertItem = $pdo->prepare(
            'INSERT INTO pedido_items '
            . '(pedido_id, menu_item_id, nombre_item, categoria_item, precio_unitario, cantidad) '
            . 'VALUES (?, ?, ?, ?, ?, ?)'
        );
        foreach ($items as $item) {
            $insertItem->execute([
                $orderId,
                $item['id'],
                $item['nombre'],
                $item['categoria'],
                $item['precio'],
                $quantities[(int) $item['id']],
            ]);
        }
        $pdo->commit();
        $order = ['id' => $orderId, 'total' => number_format($total, 2, '.', '')];
        $statement = $pdo->prepare(
            "SELECT DATE_FORMAT(created_at, '%Y-%m-%dT%H:%i:%s') FROM pedidos WHERE id = ?"
        );
        $statement->execute([$orderId]);
        $order['orderedAt'] = $statement->fetchColumn();
        if ($trackingCode !== null) {
            $order['trackingCode'] = $trackingCode;
        }
        api_respond(201, [
            'message' => 'Tu pedido se guardó correctamente.',
            'order' => $order,
        ]);
    }

    if ($action === 'my-orders' && $method === 'GET') {
        $userId = api_require_user();
        $statement = $pdo->prepare(
            'SELECT id, estado AS status, created_at AS ordered_at, nombre_cliente AS name, '
            . 'correo_cliente AS email, telefono AS phone, domicilio AS address, total, '
            . 'cargo_cancelacion AS cancellation_fee FROM pedidos '
            . 'WHERE usuario_id = ? ORDER BY created_at DESC, id DESC LIMIT 50'
        );
        $statement->execute([$userId]);
        $orders = $statement->fetchAll();
        $itemsByOrder = api_load_order_items($pdo, array_map(
            static fn(array $order): int => (int) $order['id'],
            $orders
        ));
        api_respond(200, [
            'orders' => array_map(
                static fn(array $order): array => api_order_view(
                    $order,
                    $itemsByOrder[(int) $order['id']] ?? []
                ),
                $orders
            ),
        ]);
    }

    if ($action === 'guest-order' && $method === 'POST') {
        $code = api_tracking_code($data);
        $orderId = (int) $data['id'];
        $statement = $pdo->prepare(
            'SELECT id, estado AS status, created_at AS ordered_at, nombre_cliente AS name, '
            . 'correo_cliente AS email, telefono AS phone, domicilio AS address, total, '
            . 'cargo_cancelacion AS cancellation_fee FROM pedidos '
            . 'WHERE id = ? AND usuario_id IS NULL AND folio_secreto_hash = ? LIMIT 1'
        );
        $statement->execute([$orderId, hash('sha256', $code)]);
        $order = $statement->fetch();
        if (!$order) {
            api_respond(404, ['error' => 'No encontramos el pedido. Revisa el folio y el código secreto.']);
        }
        $items = api_load_order_items($pdo, [(int) $order['id']]);
        api_respond(200, [
            'order' => api_order_view($order, $items[(int) $order['id']] ?? []),
        ]);
    }

    if ($action === 'cancel-order' && $method === 'POST') {
        $orderId = filter_var($data['id'] ?? null, FILTER_VALIDATE_INT);
        if ($orderId === false || $orderId < 1) {
            api_respond(422, ['error' => 'El número de pedido no es válido.']);
        }

        $userId = $_SESSION['user']['id'] ?? null;
        $trackingCode = null;
        if (($data['trackingCode'] ?? '') !== '') {
            $trackingCode = api_tracking_code($data);
        }
        if ($userId === null && $trackingCode === null) {
            api_respond(401, ['error' => 'Inicia sesión o usa el código secreto de tu pedido de invitado.']);
        }

        $pdo->beginTransaction();
        $statement = $pdo->prepare(
            'SELECT id, estado AS status, created_at AS ordered_at, nombre_cliente AS name, '
            . 'correo_cliente AS email, telefono AS phone, domicilio AS address, total, '
            . 'cargo_cancelacion AS cancellation_fee FROM pedidos '
            . 'WHERE id = ? AND (usuario_id = ? OR (usuario_id IS NULL AND folio_secreto_hash = ?)) '
            . 'FOR UPDATE'
        );
        $statement->execute([
            $orderId,
            $userId,
            $trackingCode !== null ? hash('sha256', $trackingCode) : null,
        ]);
        $order = $statement->fetch();
        if (!$order) {
            $pdo->rollBack();
            api_respond(404, ['error' => 'No encontramos el pedido en tu cuenta.']);
        }
        if (!in_array($order['status'], ['pending', 'preparing'], true)) {
            $pdo->rollBack();
            api_respond(409, ['error' => 'El pedido ya no se puede cancelar: solo se aceptan cancelaciones antes de que esté listo.']);
        }

        $itemsByOrder = api_load_order_items($pdo, [(int) $order['id']]);
        $items = $itemsByOrder[(int) $order['id']] ?? [];
        $fee = api_cancellation_fee_cents($items);
        $cancellationFee = number_format($fee / 100, 2, '.', '');
        $statement = $pdo->prepare(
            "UPDATE pedidos SET estado = 'cancelled', cargo_cancelacion = ? "
            . "WHERE id = ? AND estado IN ('pending', 'preparing')"
        );
        $statement->execute([$cancellationFee, $orderId]);
        if ($statement->rowCount() !== 1) {
            $pdo->rollBack();
            api_respond(409, ['error' => 'El pedido cambió de estado y ya no se puede cancelar. Actualiza el perfil e inténtalo de nuevo.']);
        }
        $pdo->commit();

        $order['status'] = 'cancelled';
        $order['cancellation_fee'] = $cancellationFee;
        api_respond(200, [
            'message' => 'Cancelación registrada. El cargo quedó anotado, pero no se procesó ningún pago.',
            'order' => api_order_view($order, $items),
        ]);
    }

    if ($action === 'contact' && $method === 'POST') {
        $name = api_string($data, 'name', 100);
        $email = strtolower(api_string($data, 'email', 254));
        $phone = api_string($data, 'phone', 30, false);
        $message = api_string($data, 'message', 5000);
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            api_respond(422, ['error' => 'Escribe un correo electrónico válido.']);
        }
        $statement = $pdo->prepare(
            'INSERT INTO mensajes_contacto (nombre, correo, telefono, mensaje) VALUES (?, ?, ?, ?)'
        );
        $statement->execute([$name, $email, $phone !== '' ? $phone : null, $message]);
        api_respond(201, ['message' => 'Tu mensaje se guardó correctamente.']);
    }

    if ($action === 'menu-save' && $method === 'POST') {
        api_require_admin();
        $item = api_menu_item($data);
        $id = filter_var($data['id'] ?? null, FILTER_VALIDATE_INT);
        if ($id === false) {
            $statement = $pdo->prepare(
                'INSERT INTO menu_items (nombre, categoria, descripcion, precio, imagen) VALUES (?, ?, ?, ?, ?)'
            );
            $statement->execute([
                $item['name'], $item['category'], $item['description'], $item['price'], $item['image'],
            ]);
            api_respond(201, ['message' => 'El platillo se agregó al menú.', 'id' => (int) $pdo->lastInsertId()]);
        }
        if ($id < 1) {
            api_respond(422, ['error' => 'El platillo seleccionado no es válido.']);
        }
        $statement = $pdo->prepare(
            'UPDATE menu_items SET nombre = ?, categoria = ?, descripcion = ?, precio = ?, imagen = ? WHERE id = ?'
        );
        $statement->execute([
            $item['name'], $item['category'], $item['description'], $item['price'], $item['image'], $id,
        ]);
        if ($statement->rowCount() === 0) {
            $check = $pdo->prepare('SELECT id FROM menu_items WHERE id = ?');
            $check->execute([$id]);
            if (!$check->fetch()) {
                api_respond(404, ['error' => 'El platillo ya no existe.']);
            }
        }
        api_respond(200, ['message' => 'El platillo se actualizó correctamente.']);
    }

    if ($action === 'menu-delete' && $method === 'POST') {
        api_require_admin();
        $id = filter_var($data['id'] ?? null, FILTER_VALIDATE_INT);
        if ($id === false || $id < 1) {
            api_respond(422, ['error' => 'El platillo seleccionado no es válido.']);
        }
        $statement = $pdo->prepare('DELETE FROM menu_items WHERE id = ?');
        $statement->execute([$id]);
        if ($statement->rowCount() !== 1) {
            api_respond(404, ['error' => 'El platillo ya no existe.']);
        }
        api_respond(200, ['message' => 'El platillo se eliminó del menú.']);
    }

    if ($action === 'admin-dashboard' && $method === 'GET') {
        api_require_admin();
        $statement = $pdo->query(
            "SELECT COALESCE(SUM(total), 0) AS sales, COUNT(*) AS orders, "
            . "COALESCE(AVG(total), 0) AS average, "
            . "(SELECT COUNT(*) FROM pedidos WHERE estado IN ('pending', 'preparing', 'ready')) AS active "
            . "FROM pedidos WHERE DATE(created_at) = CURRENT_DATE() AND estado <> 'cancelled'"
        );
        api_respond(200, ['stats' => $statement->fetch()]);
    }

    if ($action === 'admin-sales' && $method === 'GET') {
        api_require_admin();
        $statement = $pdo->query(
            "SELECT DATE_FORMAT(created_at, '%Y-%m-%d') AS day, COALESCE(SUM(total), 0) AS total "
            . "FROM pedidos WHERE created_at >= CURRENT_DATE() - INTERVAL 6 DAY "
            . "AND estado <> 'cancelled' GROUP BY DATE(created_at)"
        );
        $totals = [];
        foreach ($statement->fetchAll() as $row) {
            $totals[$row['day']] = (float) $row['total'];
        }
        $days = [];
        for ($offset = 6; $offset >= 0; $offset--) {
            $date = new DateTimeImmutable("-$offset days");
            $key = $date->format('Y-m-d');
            $days[] = [
                'date' => $key,
                'label' => $date->format('D'),
                'total' => $totals[$key] ?? 0,
            ];
        }
        $statement = $pdo->query(
            "SELECT pi.nombre_item AS name, SUM(pi.cantidad) AS quantity "
            . "FROM pedido_items pi JOIN pedidos p ON p.id = pi.pedido_id "
            . "WHERE p.created_at >= CURRENT_DATE() - INTERVAL 29 DAY AND p.estado <> 'cancelled' "
            . "GROUP BY pi.nombre_item ORDER BY quantity DESC, name LIMIT 5"
        );
        api_respond(200, ['days' => $days, 'topItems' => $statement->fetchAll()]);
    }

    if ($action === 'admin-orders' && $method === 'GET') {
        api_require_admin();
        $statement = $pdo->query(
            "SELECT p.id, p.nombre_cliente AS customer, p.correo_cliente AS email, "
            . "p.telefono AS phone, p.domicilio AS address, p.estado AS status, p.total, p.created_at, "
            . "GROUP_CONCAT(CONCAT(pi.nombre_item, ' x', pi.cantidad) ORDER BY pi.id SEPARATOR ', ') AS items "
            . "FROM pedidos p JOIN pedido_items pi ON pi.pedido_id = p.id "
            . "WHERE p.estado IN ('pending', 'preparing', 'ready') "
            . "GROUP BY p.id ORDER BY p.created_at DESC LIMIT 100"
        );
        api_respond(200, ['orders' => $statement->fetchAll()]);
    }

    if ($action === 'order-status' && $method === 'POST') {
        api_require_admin();
        $id = filter_var($data['id'] ?? null, FILTER_VALIDATE_INT);
        $status = (string) ($data['status'] ?? '');
        if (
            $id === false || $id < 1
            || !in_array($status, ['pending', 'preparing', 'ready', 'completed'], true)
        ) {
            api_respond(422, ['error' => 'El estado o pedido seleccionado no es válido.']);
        }
        $pdo->beginTransaction();
        $statement = $pdo->prepare('SELECT estado FROM pedidos WHERE id = ? FOR UPDATE');
        $statement->execute([$id]);
        $currentStatus = $statement->fetchColumn();
        if ($currentStatus === false) {
            $pdo->rollBack();
            api_respond(404, ['error' => 'El pedido ya no existe.']);
        }
        if (
            $currentStatus === 'cancelled'
            || ($currentStatus === 'completed' && $status !== 'completed')
        ) {
            $pdo->rollBack();
            api_respond(409, ['error' => 'No se puede reactivar un pedido cancelado ni retroceder un pedido completado.']);
        }
        $rank = ['pending' => 0, 'preparing' => 1, 'ready' => 2, 'completed' => 3];
        if ($rank[$status] < $rank[$currentStatus]) {
            $pdo->rollBack();
            api_respond(409, ['error' => 'El estado de un pedido no se puede retroceder.']);
        }
        $statement = $pdo->prepare('UPDATE pedidos SET estado = ? WHERE id = ?');
        $statement->execute([$status, $id]);
        $pdo->commit();
        api_respond(200, ['message' => 'El estado del pedido se actualizó.']);
    }

    api_respond(400, ['error' => 'La acción solicitada no es válida.']);
} catch (PDOException $exception) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    error_log($exception->getMessage());
    api_respond(500, ['error' => 'No se pudo completar la operación. Inténtalo de nuevo.']);
}
