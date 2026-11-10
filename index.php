<!DOCTYPE html>
<html lang="es">
<head>
 <meta charset="UTF-8" />
 <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
 <title>SushiNice | Sushi Auténtico</title>
 <link rel="stylesheet" href="style.css"/>
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
 <button class="btn-login" onclick="openLogin()"><i class="fas fa-user"></i> Entrar</button>
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
 <img src="images/hero-sushi.png" alt="Sushi" onerror="this.src='https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=500&q=80'"/>
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
 <h3> Predicción de Ventas</h3>
 <p class="panel-sub">Análisis IA · Semana actual</p>
 <div class="sales-chart" id="salesChart"></div>
 <div class="top-items">
 <h4> Top Vendidos (IA)</h4>
 <div id="topItems"></div>
 </div>
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
 <input type="text" placeholder="Tu nombre" required/>
 <input type="email" placeholder="Tu correo" required/>
 <input type="tel" placeholder="Teléfono (opcional)"/>
 <textarea rows="4" placeholder="¿En qué podemos ayudarte?"></textarea>
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
 <p>Hecho con en México</p>
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

<!-- ADMIN PANEL MODAL -->
<div class="modal-overlay" id="adminModal">
 <div class="modal modal-admin">
 <button class="modal-close" onclick="closeAdmin()"></button>
 <h2Panel de Administración</h2>
 <div class="admin-tabs">
 <button class="atab active" onclick="switchAdmin('ventas')"Ventas</button>
 <button class="atab" onclick="switchAdmin('menu')"Menú</button>
 <button class="atab" onclick="switchAdmin('pedidos')"Pedidos</button>
 </div>
 <div id="adminVentas" class="admin-panel">
 <h3>Resumen de Ventas</h3>
 <div class="admin-stats">
 <div class="astat red"><h4>$12,450</h4><p>Ventas hoy</p></div>
 <div class="astat"><h4>87</h4><p>Pedidos hoy</p></div>
 <div class="astat"><h4>$143.10</h4><p>Ticket promedio</p></div>
 <div class="astat"><h4>96%</h4><p>Satisfacción</p></div>
 </div>
 <div class="ai-prediction-box">
 <h4> Predicción IA – Próxima semana</h4>
 <div id="predChart"></div>
 </div>
 </div>
 <div id="adminMenu" class="admin-panel" style="display:none">
 <h3>Gestionar Menú</h3>
 <div class="menu-manager" id="menuManager"></div>
 <button class="btn-primary" onclick="addItem()" style="margin-top:16px">+ Agregar Ítem</button>
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
 <h2Tu Orden</h2>
 <div id="cartItems"></div>
 <div class="cart-total" id="cartTotal"></div>
 <button class="btn-primary" onclick="checkout()" style="width:100%;margin-top:16px">Confirmar Pedido</button>
 </div>
</div>

<!-- NOTIFICATION TOAST -->
<div class="toast" id="toast"></div>

<script src="data.js"></script>
<script src="app.js"></script>
</body>
</html>
