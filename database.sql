SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS usuarios (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(254) NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    es_admin TINYINT(1) NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    UNIQUE KEY uq_usuarios_correo (correo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS menu_items (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(120) NOT NULL,
    categoria VARCHAR(40) NOT NULL,
    descripcion VARCHAR(500) NOT NULL,
    precio DECIMAL(10,2) NOT NULL,
    imagen VARCHAR(500) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_menu_categoria (categoria)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS pedidos (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    usuario_id INT UNSIGNED NULL,
    folio_secreto_hash CHAR(64) NULL,
    nombre_cliente VARCHAR(100) NOT NULL,
    correo_cliente VARCHAR(254) NOT NULL,
    telefono VARCHAR(30) NOT NULL,
    domicilio VARCHAR(500) NOT NULL,
    estado ENUM('pending', 'preparing', 'ready', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
    total DECIMAL(10,2) NOT NULL,
    cargo_cancelacion DECIMAL(10,2) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_pedidos_folio_secreto (folio_secreto_hash),
    KEY idx_pedidos_fecha_estado (created_at, estado),
    KEY idx_pedidos_usuario (usuario_id),
    CONSTRAINT fk_pedidos_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS pedido_items (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    pedido_id BIGINT UNSIGNED NOT NULL,
    menu_item_id INT UNSIGNED NULL,
    nombre_item VARCHAR(120) NOT NULL,
    categoria_item VARCHAR(40) NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    cantidad SMALLINT UNSIGNED NOT NULL,
    PRIMARY KEY (id),
    KEY idx_pedido_items_pedido (pedido_id),
    KEY idx_pedido_items_producto (menu_item_id),
    CONSTRAINT fk_pedido_items_pedido FOREIGN KEY (pedido_id) REFERENCES pedidos (id) ON DELETE CASCADE,
    CONSTRAINT fk_pedido_items_menu FOREIGN KEY (menu_item_id) REFERENCES menu_items (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS mensajes_contacto (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(254) NOT NULL,
    telefono VARCHAR(30) NULL,
    mensaje TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_mensajes_contacto_fecha (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO menu_items (id, nombre, categoria, descripcion, precio, imagen) VALUES
    (1, 'Wakame', 'sopas', 'Alga marina en caldo dashi con tofu y cebollín', 48, 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&q=80'),
    (2, 'Tori Ramen', 'sopas', 'Fideo udón en caldo de pollo con huevo, nori y bambú', 105, 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=400&q=80'),
    (3, 'Ebi Ramen', 'sopas', 'Camarón jugoso en caldo tonkotsu con fideos y cebollín', 115, 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=400&q=80'),
    (4, 'Tempura Ramen', 'sopas', 'Verduras y 4 camarones capeados sobre caldo base dorado', 120, 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&q=80'),
    (5, 'Kaisen Ramen', 'sopas', 'Combinación de mariscos premium: pulpo, calamar, camarón', 135, 'https://images.unsplash.com/photo-1576577445504-6af96477db52?w=400&q=80'),
    (6, 'Gomoku Ramen', 'sopas', 'Mariscos y carne de res en caldo intenso con verduras', 135, 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=400&q=80'),
    (7, 'Kany Ensalada', 'ensaladas', 'Base lechuga italiana y romana, espinacas, zanahoria, pepino, betabel y surimi', 75, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80'),
    (8, 'Tori Ensalada', 'ensaladas', 'Tiras de milanesa de pollo asada o empanizada sobre base verde', 90, 'https://images.unsplash.com/photo-1551248429-40975aa4de74?w=400&q=80'),
    (9, 'Abocado', 'ensaladas', 'Ensalada fresca con aguacate cremoso, ajonjolí y aderezo japonés', 80, 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&q=80'),
    (10, 'Tori Kushiague', 'kushiagues', 'Brocheta de pollo empanizada, crujiente y jugosa', 18, 'https://images.unsplash.com/photo-1562802378-063ec186a863?w=400&q=80'),
    (11, 'Sakana Kushiague', 'kushiagues', 'Brocheta de pescado empanizado con toque de limón', 18, 'https://images.unsplash.com/photo-1503764654157-72d979d9af2f?w=400&q=80'),
    (12, 'Shake Salmón', 'kushiagues', 'Brocheta de salmón fresco, empanizado y sellado perfectamente', 25, 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&q=80'),
    (13, 'Ebi Camarón', 'kushiagues', 'Brocheta de camarón premium empanizado, dorado y crujiente', 23, 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&q=80'),
    (14, 'Queso Kushiague', 'kushiagues', 'Brocheta con queso gratinado, perfecta para los amantes del queso', 18, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80'),
    (15, 'Dragon Roll', 'rolls', 'Roll relleno de langostino y pepino, cubierto de aguacate y salsa unagi', 165, 'https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=400&q=80'),
    (16, 'Philadelphia Roll', 'rolls', 'Salmón fresco, queso Philadelphia y pepino. Clásico infalible', 120, 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=400&q=80'),
    (17, 'Volcano Roll', 'rolls', 'Roll horneado con mezcla de mariscos gratinada, explosión de sabor', 155, 'https://images.unsplash.com/photo-1562802378-063ec186a863?w=400&q=80'),
    (18, 'Rainbow Roll', 'rolls', 'California roll cubierto con variedad de pescados y aguacate multicolor', 175, 'https://images.unsplash.com/photo-1559410545-0bdcd187e0a6?w=400&q=80'),
    (19, 'Spicy Tuna Roll', 'rolls', 'Atún fresco mezclado con salsa picante, pepino y aguacate', 145, 'https://images.unsplash.com/photo-1534482421-64566f976cfa?w=400&q=80'),
    (20, 'Nice Special Roll', 'rolls', 'Nuestro roll signature: camarón tempura, salmón, aguacate y salsa especial SushiNice', 195, 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400&q=80'),
    (21, 'Sake Frío', 'bebidas', 'Sake japonés premium servido frío en copa tradicional', 85, 'https://images.unsplash.com/photo-1546173159-315724a31696?w=400&q=80'),
    (22, 'Té Verde Matcha', 'bebidas', 'Té matcha ceremonial preparado al momento, caliente o frío', 45, 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=400&q=80'),
    (23, 'Limonada Yuzu', 'bebidas', 'Limonada artesanal con yuzu japonés, fresca y aromática', 55, 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=400&q=80'),
    (24, 'Agua de Jamaica', 'bebidas', 'Jamaica natural preparada diariamente, sin azúcar añadida', 35, 'https://images.unsplash.com/photo-1497534446932-c925b458314e?w=400&q=80');
