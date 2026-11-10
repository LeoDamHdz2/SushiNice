<!DOCTYPE html>
<html lang="es">
<head>
 <meta charset="UTF-8" />
 <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
 <title>SushiNice | Sushi Auténtico</title>
 <link rel="stylesheet" href="style.css?v=<?= filemtime(__DIR__ . '/style.css') ?>"/>
 <link rel="preconnect" href="https://fonts.googleapis.com">
 <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@400;700;900&family=Montserrat:wght@300;400;600;800&display=swap" rel="stylesheet">
 <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"/>
</head>
<body>

<!-- NAVBAR -->
<nav class="navbar" id="navbar">
 <div class="nav-logo">
 <span class="logo-jp">寿司</span>
 <span class="logo-text">SushiNice</span>
 </div>
 <ul class="nav-links" id="navLinks">
 <li><a href="#home">Inicio</a></li>
 <li><a href="#menu">Menú</a></li>
 <li><a href="#promo">Promos</a></li>
 <li><a href="#ai-section">IA Recomendaciones</a></li>
 <li><a href="#contact">Contacto</a></li>
 <li><a href="#ubicacion">Ubicación</a></li>
 </ul>
 <div class="nav-actions">
 <button class="btn-order" onclick="openCart()"><i class="fas fa-shopping-bag"></i> Ordenar</button>
 <button class="btn-login" onclick="openProfile()"><i class="fas fa-user"></i> Entrar / mi pedido</button>
 <button class="btn-login" id="logoutButton" onclick="logout()" hidden>Salir</button>
 <button class="hamburger" id="hamburger"><i class="fas fa-bars"></i></button>
 </div>
</nav>

<!-- HERO -->
<section class="hero" id="home">
 <div class="hero-bg-circles">
 <div class="circle c1"></div>
 <div class="circle c2"></div>
 </div>
 <div class="hero-content">
 <p class="hero-tag">お食事 · Experiencia Japonesa</p>
 <h1 class="hero-title">El Arte del<br/><span class="red-text">Sushi Perfecto</span></h1>
 <p class="hero-sub">Rolls artesanales, ingredientes frescos y sabores que te transportan a Japón.</p>
 <div class="hero-btns">
 <button class="btn-primary" onclick="document.getElementById('menu').scrollIntoView({behavior:'smooth'})">Ver Menú</button>
 <button class="btn-ghost" onclick="document.getElementById('ai-section').scrollIntoView({behavior:'smooth'})"> IA Recomendacion</button>
 </div>
 <div class="hero-stats">
 <div class="stat"><span>120+</span><p>Rolls únicos</p></div>
 <div class="stat"><span>4.9</span><p>Calificación</p></div>
 <div class="stat"><span>8 años</span><p>De experiencia</p></div>
 </div>
 </div>
 <div class="hero-img-wrap">
 <div class="hero-plate">
 <img src="images/hero-sushi.svg" alt="Variedad de sushi sobre un plato japonés"/>
 </div>
 <div class="badge-float">
 <span>20% OFF</span>
 <small>Todos los rolls</small>
 </div>
 </div>
</section>

<!-- PROMO BANNER -->
<section class="promo-banner" id="promo">
 <div class="promo-track">
 <span> ROLLS ESPECIALES · </span><span> ENVÍO GRATIS DESDE $400 · </span>
 <span> COMBOS FAMILIARES · </span><span> SUSHI DE TEMPORADA · </span>
 <span> ROLLS ESPECIALES · </span><span> ENVÍO GRATIS DESDE $400 · </span>
 </div>
</section>

<!-- MENU -->
<section class="menu-section" id="menu">
 <div class="section-header">
 <p class="section-tag">お品書き</p>
 <h2>Nuestro <span class="red-text">Menú</span></h2>
 <p class="section-sub">Ingredientes frescos, sabores auténticos</p>
 </div>

 <!-- CATEGORY TABS -->
 <div class="menu-tabs">
 <button class="tab active" data-cat="sopas">Sopas / Ramen</button>
 <button class="tab" data-cat="ensaladas">Ensaladas</button>
 <button class="tab" data-cat="kushiagues">Kushiagues</button>
 <button class="tab" data-cat="rolls">Rolls Especiales</button>
 <button class="tab" data-cat="bebidas">Bebidas</button>
 </div>

 <div class="menu-grid" id="menuGrid"></div>
</section>

<!-- AI RECOMMENDATIONS -->
<section class="ai-section" id="ai-section">
 <div class="ai-bg-deco"></div>
 <div class="section-header">
 <p class="section-tag">人工知能</p>
 <h2> IA <span class="red-text">Recomendaciones</span></h2>
 <p class="section-sub">Nuestra IA aprende tus gustos y sugiere el roll perfecto para ti</p>
 </div>
 <div class="ai-container">
 <div class="ai-chat-box">
 <div class="ai-messages" id="aiMessages">
 <div class="ai-msg bot">
 <div class="bot-avatar">N</div>
 <div class="msg-bubble">¡Hola! Soy NiceBot, tu asistente culinario de SushiNice. ¿Qué tipo de sushi te apetece hoy? Puedo recomendarte basado en tus preferencias </div>
 </div>
 </div>
 <div class="ai-input-row">
 <input type="text" id="aiInput" placeholder="Ej: Algo picante y con camarón..." onkeydown="if(event.key==='Enter') sendAI()"/>
 <button onclick="sendAI()"><i class="fas fa-paper-plane"></i></button>
 </div>
 </div>
 <div class="ai-panel">
 <h3>Encuentra tu favorito</h3>
 <p class="panel-sub">NiceBot recomienda opciones del menú vigente según tus gustos.</p>
 <button class="btn-primary" type="button" onclick="document.getElementById('aiInput').focus()">Pedir una recomendación</button>
 </div>
 </div>
</section>

<!-- CONTACT -->
<section class="contact-section" id="contact">
 <div class="section-header">
 <p class="section-tag">お問い合わせ</p>
 <h2>Contáctanos</h2>
 <p class="section-sub">Estamos para servirte</p>
 </div>
 <div class="contact-grid">
 <div class="contact-info">
 <div class="info-card"><i class="fas fa-phone"></i><div><h4>Teléfono</h4><p>+52 55 1234 5678</p></div></div>
 <div class="info-card"><i class="fas fa-envelope"></i><div><h4>Email</h4><p>hola@sushinice.mx</p></div></div>
 <div class="info-card"><i class="fab fa-whatsapp"></i><div><h4>WhatsApp</h4><p>+52 55 1234 5678</p></div></div>
 <div class="info-card"><i class="fab fa-instagram"></i><div><h4>Instagram</h4><p>@SushiNiceMX</p></div></div>
 <div class="hours-card">
 <h4>⏰ Horarios</h4>
 <p>Lunes – Viernes: 1:00 pm – 10:00 pm</p>
 <p>Sábado – Domingo: 12:00 pm – 11:00 pm</p>
 </div>
 </div>
 <form class="contact-form" onsubmit="submitContact(event)">
 <h3>Envíanos un mensaje</h3>
 <input type="text" name="name" maxlength="100" placeholder="Tu nombre" autocomplete="name" required/>
 <input type="email" name="email" maxlength="254" placeholder="Tu correo" autocomplete="email" required/>
 <input type="tel" name="phone" maxlength="30" placeholder="Teléfono (opcional)" autocomplete="tel"/>
 <textarea name="message" rows="4" maxlength="5000" placeholder="¿En qué podemos ayudarte?" required></textarea>
 <button type="submit" class="btn-primary">Enviar mensaje <i class="fas fa-arrow-right"></i></button>
 </form>
 </div>
</section>

<!-- LOCATION -->
<section class="location-section" id="ubicacion">
 <div class="section-header">
 <p class="section-tag">場所</p>
 <h2>Nuestra <span class="red-text">Ubicación</span></h2>
 </div>
 <div class="location-wrap">
 <div class="location-info">
 <div class="info-card"><i class="fas fa-map-marker-alt"></i><div><h4>Dirección</h4><p>Av. Insurgentes Sur 1234, Col. Del Valle, CDMX</p></div></div>
 <div class="info-card"><i class="fas fa-car"></i><div><h4>Estacionamiento</h4><p>Estacionamiento gratuito disponible</p></div></div>
 <div class="info-card"><i class="fas fa-subway"></i><div><h4>Metro</h4><p>Estación Insurgentes (Línea 1)</p></div></div>
 <a href="https://maps.google.com" target="_blank" class="btn-primary" style="display:inline-block;margin-top:16px;">Abrir en Google Maps <i class="fas fa-external-link-alt"></i></a>
 </div>
 <div class="map-placeholder">
 <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3763.8!2d-99.1676!3d19.4004!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTnCsDI0JzAxLjQiTiA5OcKwMTAnMDMuNCJX!5e0!3m2!1ses!2smx!4v1" width="100%" height="350" style="border:0;border-radius:12px;" allowfullscreen loading="lazy"></iframe>
 </div>
 </div>
</section>

<!-- FOOTER -->
<footer class="footer">
 <div class="footer-inner">
 <div class="footer-brand">
 <span class="logo-jp">寿司</span>
 <span class="logo-text">SushiNice</span>
 <p>El sabor de Japón en tu mesa</p>
 </div>
 <div class="footer-links">
 <h4>Navegación</h4>
 <a href="#home">Inicio</a><a href="#menu">Menú</a>
 <a href="#promo">Promos</a><a href="#contact">Contacto</a>
 </div>
 <div class="footer-social">
 <h4>Síguenos</h4>
 <div class="social-row">
 <a href="#"><i class="fab fa-instagram"></i></a>
 <a href="#"><i class="fab fa-facebook"></i></a>
 <a href="#"><i class="fab fa-tiktok"></i></a>
 <a href="#"><i class="fab fa-whatsapp"></i></a>
 </div>
 </div>
 </div>
 <div class="footer-bottom">
 <p>© 2025 SushiNice · Todos los derechos reservados</p>
 <p>Hecho en México</p>
 </div>
</footer>

<!-- LOGIN MODAL -->
<div class="modal-overlay" id="loginModal">
 <div class="modal">
 <button class="modal-close" onclick="closeLogin()"></button>
 <div class="modal-logo"><span class="logo-jp">寿司</span> SushiNice</div>
 <div class="modal-tabs">
 <button class="mtab active" onclick="switchLogin('login', this)">Iniciar Sesión</button>
 <button class="mtab" onclick="switchLogin('register', this)">Registrarse</button>
 </div>
 <form id="loginForm" onsubmit="doLogin(event)">
 <input type="email" placeholder="Correo electrónico" id="loginEmail" autocomplete="email" required/>
 <input type="password" placeholder="Contraseña" id="loginPass" autocomplete="current-password" required/>
 <button class="btn-primary" type="submit" style="width:100%">Entrar</button>
 </form>
 <form id="registerForm" onsubmit="doRegister(event)" style="display:none">
 <input type="text" placeholder="Nombre completo" id="registerName" maxlength="100" autocomplete="name" required/>
 <input type="email" placeholder="Correo electrónico" id="registerEmail" maxlength="254" autocomplete="email" required/>
 <input type="password" placeholder="Contraseña (mínimo 8 caracteres)" id="registerPass" minlength="8" autocomplete="new-password" required/>
 <input type="password" placeholder="Confirmar contraseña" id="registerPassConfirm" minlength="8" autocomplete="new-password" required/>
 <button class="btn-primary" type="submit" style="width:100%">Crear cuenta</button>
 </form>
 </div>
</div>

<!-- CUSTOMER PROFILE AND GUEST ORDER TRACKING -->
<div class="modal-overlay" id="profileModal">
 <div class="modal modal-profile">
 <button class="modal-close" type="button" aria-label="Cerrar perfil" onclick="closeProfile()"></button>
 <h2>Mi perfil y mis pedidos</h2>
 <section id="profileAccount" hidden>
 <div class="profile-user" id="profileUser"></div>
 <button class="mmi-btn" id="adminShortcut" type="button" onclick="closeProfile();openAdmin()" hidden>Abrir administración</button>
 <h3>Mis pedidos</h3>
 <div id="profileOrders" aria-live="polite"></div>
 </section>
 <section class="guest-order-lookup">
 <h3>Consultar pedido de invitado</h3>
 <p>Ingresa el folio y el código secreto que recibiste al confirmar tu pedido.</p>
 <form id="guestLookupForm" onsubmit="lookupGuestOrder(event)">
 <input type="number" name="id" min="1" placeholder="Folio del pedido" required/>
 <input type="text" name="trackingCode" minlength="64" maxlength="64" pattern="[a-fA-F0-9]{64}" autocomplete="off" placeholder="Código secreto de 64 caracteres" required/>
 <button class="btn-primary" type="submit">Consultar estado</button>
 </form>
 <div id="guestOrderResult" aria-live="polite"></div>
 </section>
 <div id="profileSignIn">
 <p>Inicia sesión para consultar el historial de pedidos de tu cuenta.</p>
 <button class="btn-primary" type="button" onclick="closeProfile();document.getElementById('loginModal').classList.add('open')">Iniciar sesión</button>
 </div>
 </div>
</div>

<!-- ADMIN PANEL MODAL -->
<div class="modal-overlay" id="adminModal">
 <div class="modal modal-admin">
 <button class="modal-close" onclick="closeAdmin()"></button>
 <h2>Panel de Administración</h2>
 <div class="admin-tabs">
 <button class="atab active" type="button" onclick="switchAdmin('ventas', this)">Ventas</button>
 <button class="atab" type="button" onclick="switchAdmin('menu', this)">Menú</button>
 <button class="atab" type="button" onclick="switchAdmin('pedidos', this)">Pedidos</button>
 </div>
 <div id="adminVentas" class="admin-panel">
 <h3>Resumen de Ventas</h3>
 <div class="admin-stats">
 <div class="astat red"><h4 id="salesToday">—</h4><p>Ventas hoy</p></div>
 <div class="astat"><h4 id="ordersToday">—</h4><p>Pedidos hoy</p></div>
 <div class="astat"><h4 id="averageTicket">—</h4><p>Ticket promedio hoy</p></div>
 <div class="astat"><h4 id="activeOrders">—</h4><p>Pedidos activos</p></div>
 </div>
 <div class="ai-prediction-box">
 <h4>Ventas registradas · últimos 7 días</h4>
 <div class="sales-chart" id="salesChart"></div>
 <div class="top-items">
 <h4>Platillos más pedidos · últimos 30 días</h4>
 <div id="topItems"></div>
 </div>
 </div>
 </div>
 <div id="adminMenu" class="admin-panel" style="display:none">
 <h3>Gestionar Menú</h3>
 <div class="menu-manager" id="menuManager"></div>
 <button class="btn-primary" type="button" onclick="addItem()" style="margin-top:16px">+ Agregar platillo</button>
 <form id="menuItemForm" class="menu-item-form" onsubmit="saveMenuItem(event)" style="display:none">
 <input type="hidden" name="id"/>
 <input type="text" name="name" maxlength="120" placeholder="Nombre del platillo" required/>
 <select name="category" required>
 <option value="sopas">Sopas / Ramen</option>
 <option value="ensaladas">Ensaladas</option>
 <option value="kushiagues">Kushiagues</option>
 <option value="rolls">Rolls Especiales</option>
 <option value="bebidas">Bebidas</option>
 </select>
 <textarea name="description" maxlength="500" placeholder="Descripción" required></textarea>
 <input type="number" name="price" min="0" max="99999999" step="0.01" placeholder="Precio en MXN" required/>
 <input type="url" name="image" maxlength="500" placeholder="URL de imagen HTTPS" required/>
 <div class="mmi-actions">
 <button class="btn-primary" type="submit">Guardar</button>
 <button class="mmi-btn" type="button" onclick="cancelMenuEdit()">Cancelar</button>
 </div>
 </form>
 </div>
 <div id="adminPedidos" class="admin-panel" style="display:none">
 <h3>Pedidos Activos</h3>
 <div id="ordersList"></div>
 </div>
 </div>
</div>

<!-- CART MODAL -->
<div class="modal-overlay" id="cartModal">
 <div class="modal modal-cart">
 <button class="modal-close" onclick="closeCart()"></button>
 <h2>Tu Orden</h2>
 <div id="cartContents">
 <div id="cartItems"></div>
 <div class="cart-total" id="cartTotal"></div>
 <button class="btn-primary" type="button" onclick="checkout()" style="width:100%;margin-top:16px">Continuar con el pedido</button>
 </div>
 <form id="checkoutForm" onsubmit="submitOrder(event)" style="display:none">
 <p>Completa tus datos de contacto y entrega para registrar tu pedido.</p>
 <input type="text" name="name" maxlength="100" placeholder="Nombre completo" autocomplete="name" required/>
 <input type="email" name="email" maxlength="254" placeholder="Correo electrónico" autocomplete="email" required/>
 <input type="tel" name="phone" maxlength="30" placeholder="Teléfono" autocomplete="tel" required/>
 <textarea name="address" maxlength="500" placeholder="Domicilio de entrega" autocomplete="street-address" required></textarea>
 <div class="cart-total" id="checkoutSummary"></div>
 <button class="btn-primary" type="submit" style="width:100%;margin-top:16px">Enviar pedido</button>
 <button class="mmi-btn" type="button" onclick="cancelCheckout()" style="width:100%;margin-top:8px">Volver a mi orden</button>
 </form>
 <div id="orderConfirmation" class="order-confirmation" style="display:none" aria-live="polite">
 <h3>Pedido registrado</h3>
 <p id="orderConfirmationSummary"></p>
 <div id="guestTrackingDetails" style="display:none">
 <p>Guarda el folio y el código secreto para consultar el estado y cancelar tu pedido después.</p>
 <label for="guestTrackingCode">Código secreto del pedido</label>
 <div class="tracking-code-row">
 <input id="guestTrackingCode" type="text" readonly/>
 <button class="mmi-btn" type="button" onclick="copyGuestTrackingCode()">Copiar</button>
 </div>
 <button class="btn-primary" type="button" onclick="closeCart();openProfile()">Consultar mi pedido</button>
 </div>
 <div id="accountOrderDetails" style="display:none">
 <button class="btn-primary" type="button" onclick="closeCart();openProfile()">Ver mis pedidos</button>
 </div>
 <button class="mmi-btn" type="button" onclick="closeCart()" style="width:100%;margin-top:8px">Cerrar</button>
 </div>
 </div>
</div>

<!-- NOTIFICATION TOAST -->
<div class="toast" id="toast"></div>

<script src="data.js?v=<?= filemtime(__DIR__ . '/data.js') ?>"></script>
<script src="app.js?v=<?= filemtime(__DIR__ . '/app.js') ?>"></script>
</body>
</html>
