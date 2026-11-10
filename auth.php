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

function respond(int $status, array $data): void
{
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function request_data(): array
{
    $data = json_decode(file_get_contents('php://input'), true);

    if (!is_array($data)) {
        respond(400, ['error' => 'La solicitud no tiene un formato válido.']);
    }

    return $data;
}

function public_user(array $user): array
{
    return [
        'id' => (int) $user['id'],
        'name' => $user['nombre'],
        'email' => $user['correo'],
        'isAdmin' => (bool) $user['es_admin'],
    ];
}

if ($_SERVER['REQUEST_METHOD'] === 'GET' && ($_GET['action'] ?? '') === 'session') {
    respond(200, ['user' => $_SESSION['user'] ?? null]);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: GET, POST');
    respond(405, ['error' => 'Método no permitido.']);
}

$data = request_data();
$action = $data['action'] ?? '';

try {
    require_once __DIR__ . '/conexion.php';

    if ($action === 'register') {
        $name = trim((string) ($data['name'] ?? ''));
        $email = strtolower(trim((string) ($data['email'] ?? '')));
        $password = (string) ($data['password'] ?? '');

        if ($name === '' || strlen($name) > 100) {
            respond(422, ['error' => 'Escribe un nombre de hasta 100 caracteres.']);
        }
        if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 254) {
            respond(422, ['error' => 'Escribe un correo electrónico válido.']);
        }
        if (strlen($password) < 8) {
            respond(422, ['error' => 'La contraseña debe tener al menos 8 caracteres.']);
        }

        $statement = $pdo->prepare(
            'INSERT INTO usuarios (nombre, correo, contrasena) VALUES (?, ?, ?)'
        );
        $statement->execute([$name, $email, password_hash($password, PASSWORD_DEFAULT)]);

        respond(201, ['message' => 'Cuenta creada correctamente.']);
    }

    if ($action === 'login') {
        $email = strtolower(trim((string) ($data['email'] ?? '')));
        $password = (string) ($data['password'] ?? '');

        if (!filter_var($email, FILTER_VALIDATE_EMAIL) || $password === '') {
            respond(422, ['error' => 'Escribe un correo y una contraseña válidos.']);
        }

        $statement = $pdo->prepare(
            'SELECT id, nombre, correo, contrasena, es_admin FROM usuarios WHERE correo = ? LIMIT 1'
        );
        $statement->execute([$email]);
        $user = $statement->fetch();

        if (!$user || !password_verify($password, $user['contrasena'])) {
            respond(401, ['error' => 'Correo o contraseña incorrectos.']);
        }

        session_regenerate_id(true);
        $_SESSION['user'] = public_user($user);

        respond(200, ['user' => $_SESSION['user']]);
    }

    if ($action === 'logout') {
        $_SESSION = [];
        if (ini_get('session.use_cookies')) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', [
                'expires' => time() - 42000,
                'path' => $params['path'],
                'domain' => $params['domain'],
                'secure' => $params['secure'],
                'httponly' => $params['httponly'],
                'samesite' => 'Lax',
            ]);
        }
        session_destroy();
        respond(200, ['message' => 'Sesión cerrada.']);
    }

    respond(400, ['error' => 'La acción solicitada no es válida.']);
} catch (PDOException $exception) {
    if ($action === 'register' && $exception->getCode() === '23000') {
        respond(409, ['error' => 'Ya existe una cuenta con ese correo.']);
    }

    error_log($exception->getMessage());
    respond(500, ['error' => 'No se pudo completar la operación. Inténtalo de nuevo.']);
}
