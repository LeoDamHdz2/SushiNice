# SushiNice

## Arquitectura vigente

La aplicación entregada funciona con PHP 8, Apache, PDO y MySQL. La autenticación existente usa sesiones PHP (`auth.php`); no usa Node.js, Express ni JWT. La hoja de actualización al inicio de `SushiNice_V7.pdf` aclara y reemplaza las referencias de arquitectura obsoletas de las páginas originales. Esta documentación y el código PHP son la referencia vigente.

El navegador obtiene el menú y envía pedidos y mensajes a `api.php`. Los datos se guardan en MySQL. Las operaciones del panel de administración requieren una sesión PHP cuyo usuario tenga `es_admin = 1`.

## Instalación local con XAMPP

1. Inicia Apache y MySQL en XAMPP.
2. Crea la base de datos si aún no existe:

   ```sql
   CREATE DATABASE sushinice CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

3. Importa el esquema y los platillos iniciales desde la raíz del proyecto:

   ```powershell
   cmd.exe /c "C:\xampp\mysql\bin\mysql.exe --default-character-set=utf8mb4 -u root sushinice < C:\xampp\htdocs\sushinice\database.sql"
   ```

   Si MySQL tiene contraseña, agrega `-p` al comando de `mysql.exe`. El script es repetible: crea las tablas que falten y agrega los platillos iniciales sin sobrescribirlos.

4. Configura para el proceso de Apache estas variables de entorno:

   - `DB_HOST`: servidor MySQL (por defecto `localhost`).
   - `DB_NAME`: base de datos (por defecto `sushinice`).
   - `DB_USER`: usuario (por defecto `root`).
   - `DB_PASSWORD`: contraseña (por defecto vacía).

   No guardes contraseñas reales en el repositorio. Después de cambiar la configuración de Apache, reinícialo.

5. Abre `http://localhost/sushinice/index.php`. Registra una cuenta y, desde MySQL, habilita explícitamente la cuenta de administración que corresponda:

   ```sql
   UPDATE usuarios SET es_admin = 1 WHERE correo = 'admin@example.com';
   ```

   Sustituye el correo por el de la cuenta registrada. El registro público nunca otorga permisos de administrador.

## Datos y operaciones

- `database.sql` crea `usuarios`, `menu_items`, `pedidos`, `pedido_items` y `mensajes_contacto`; también siembra el menú inicial.
- `auth.php` registra usuarios, inicia y cierra sesiones.
- `api.php?action=menu` entrega los productos de MySQL.
- El formulario de pedido acepta invitados; el servidor vuelve a validar el menú, calcula los precios vigentes y guarda el pedido y sus renglones en una transacción.
- El contacto se guarda en `mensajes_contacto`.
- La edición del menú, los pedidos, sus estados y las métricas de ventas están restringidos a administradores. El panel calcula cifras y gráficas a partir de pedidos guardados; no publica cifras de ventas simuladas.
- NiceBot obtiene los nombres y precios recomendados del menú actual, por lo que no conserva precios ni platillos desactualizados.
