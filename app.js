// ============================================================
// SUSHINICE – APP LOGIC
// ============================================================

// ── STATE ──
let cart = [];
let currentUser = null;
let currentCat = 'sopas';

// ══════════════════════════════════
// INIT
// ══════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  renderMenu('sopas');
  initSalesChart();
  initTopItems();
  initNavScroll();
  initMenuTabs();
  restoreSession();
});

// ══════════════════════════════════
// NAVBAR
// ══════════════════════════════════
function initNavScroll() {
  window.addEventListener('scroll', () => {
    const nav = document.getElementById('navbar');
    nav.classList.toggle('scrolled', window.scrollY > 40);
  });
  document.getElementById('hamburger').addEventListener('click', () => {
    document.getElementById('navLinks').classList.toggle('open');
  });
}

// ══════════════════════════════════
// MENU RENDER
// ══════════════════════════════════
function initMenuTabs() {
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderMenu(tab.dataset.cat);
    });
  });
}

function renderMenu(cat) {
  currentCat = cat;
  const grid = document.getElementById('menuGrid');
  const items = MENU_DATA[cat] || [];
  grid.innerHTML = items.map(item => `
    <div class="menu-card" onclick="addToCart(${item.id})">
      <img class="menu-card-img" src="${item.img}" alt="${item.name}"
           onerror="this.src='https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=400&q=80'"/>
      <div class="menu-card-body">
        <div class="menu-card-category">${item.category}</div>
        <div class="menu-card-name">${item.name}</div>
        <div class="menu-card-desc">${item.desc}</div>
        <div class="menu-card-footer">
          <span class="menu-card-price">$${item.price}</span>
          <button class="btn-add" onclick="event.stopPropagation();addToCart(${item.id})">+</button>
        </div>
      </div>
    </div>
  `).join('');
}

// ══════════════════════════════════
// CART
// ══════════════════════════════════
function getAllItems() {
  return Object.values(MENU_DATA).flat();
}

function addToCart(id) {
  const item = getAllItems().find(i => i.id === id);
  if (!item) return;
  const existing = cart.find(c => c.id === id);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ ...item, qty: 1 });
  }
  showToast(`${item.name} agregado a tu orden`);
  updateCartBadge();
}

function updateCartBadge() {
  const total = cart.reduce((s, i) => s + i.qty, 0);
  const btn = document.querySelector('.btn-order');
  btn.innerHTML = `<i class="fas fa-shopping-bag"></i> Ordenar${total > 0 ? ` (${total})` : ''}`;
}

function openCart() {
  renderCart();
  document.getElementById('cartModal').classList.add('open');
}
function closeCart() {
  document.getElementById('cartModal').classList.remove('open');
}

function renderCart() {
  const container = document.getElementById('cartItems');
  const totalEl = document.getElementById('cartTotal');
  if (cart.length === 0) {
    container.innerHTML = '<p class="cart-empty">Tu orden está vacía. Agrega algo del menú.</p>';
    totalEl.innerHTML = '';
    return;
  }
  container.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div>
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-qty">x${item.qty}</div>
      </div>
      <div style="display:flex;align-items:center;gap:12px;">
        <span class="cart-item-price">$${item.price * item.qty}</span>
        <button class="btn-remove" onclick="removeFromCart(${item.id})"><i class="fas fa-times"></i></button>
      </div>
    </div>
  `).join('');
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  totalEl.innerHTML = `Total: <span style="color:var(--red)">$${total}</span>`;
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  renderCart();
  updateCartBadge();
}

function checkout() {
  if (cart.length === 0) return;
  showToast('Pedido confirmado. Preparando tu orden...');
  cart = [];
  updateCartBadge();
  closeCart();
}

// ══════════════════════════════════
// LOGIN / AUTH
// ══════════════════════════════════
function openLogin() {
  if (currentUser) {
    if (currentUser.isAdmin) openAdmin();
    else showToast(`Sesión activa: ${currentUser.name}`);
    return;
  }
  document.getElementById('loginModal').classList.add('open');
}
function closeLogin() {
  document.getElementById('loginModal').classList.remove('open');
}

function switchLogin(tab, button) {
  document.querySelectorAll('.mtab').forEach(t => t.classList.toggle('active', t === button));
  document.getElementById('loginForm').style.display = tab === 'login' ? 'block' : 'none';
  document.getElementById('registerForm').style.display = tab === 'register' ? 'block' : 'none';
}

async function authRequest(payload, method = 'POST') {
  const options = { method, headers: { Accept: 'application/json' }, credentials: 'same-origin' };
  if (method === 'POST') {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(payload);
  }
  const url = method === 'GET' ? 'auth.php?action=session' : 'auth.php';
  const response = await fetch(url, options);
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'No se pudo completar la operación.');
  return result;
}

async function restoreSession() {
  try {
    const result = await authRequest(null, 'GET');
    currentUser = result.user;
    updateAuthUI();
  } catch (error) {
    showToast(error.message || 'No se pudo recuperar la sesión.');
  }
}

function updateAuthUI() {
  const loginButton = document.querySelector('.btn-login');
  const logoutButton = document.getElementById('logoutButton');
  loginButton.replaceChildren();
  const icon = document.createElement('i');
  icon.className = 'fas fa-user';
  loginButton.append(icon, document.createTextNode(currentUser ? ` ${currentUser.name}` : ' Entrar'));
  logoutButton.hidden = !currentUser;
}

async function doLogin(event) {
  event.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPass').value;
  try {
    const result = await authRequest({ action: 'login', email, password });
    currentUser = result.user;
    updateAuthUI();
    closeLogin();
    document.getElementById('loginForm').reset();
    showToast(`Bienvenido, ${currentUser.name}`);
    if (currentUser.isAdmin) setTimeout(openAdmin, 500);
  } catch (error) {
    showToast(error.message || 'No se pudo iniciar sesión.');
  }
}

async function doRegister(event) {
  event.preventDefault();
  const name = document.getElementById('registerName').value.trim();
  const email = document.getElementById('registerEmail').value.trim();
  const password = document.getElementById('registerPass').value;
  const confirmation = document.getElementById('registerPassConfirm').value;

  if (password !== confirmation) {
    showToast('Las contraseñas no coinciden.');
    return;
  }

  try {
    await authRequest({ action: 'register', name, email, password });
    document.getElementById('registerForm').reset();
    document.getElementById('loginEmail').value = email;
    switchLogin('login', document.querySelector('.mtab'));
    showToast('Cuenta creada. Ahora puedes iniciar sesión.');
  } catch (error) {
    showToast(error.message || 'No se pudo crear la cuenta.');
  }
}

async function logout() {
  try {
    await authRequest({ action: 'logout' });
    currentUser = null;
    updateAuthUI();
    closeAdmin();
    showToast('Sesión cerrada.');
  } catch (error) {
    showToast(error.message || 'No se pudo cerrar la sesión.');
  }
}

// ══════════════════════════════════
// ADMIN PANEL
// ══════════════════════════════════
function openAdmin() {
  if (!currentUser || !currentUser.isAdmin) {
    showToast('Acceso solo para administradores'); return;
  }
  renderAdminMenu();
  renderOrders();
  renderPredChart();
  document.getElementById('adminModal').classList.add('open');
}
function closeAdmin() {
  document.getElementById('adminModal').classList.remove('open');
}

function switchAdmin(panel) {
  document.querySelectorAll('.atab').forEach(t => t.classList.remove('active'));
  event.target.classList.add('active');
  document.getElementById('adminVentas').style.display = panel === 'ventas' ? 'block' : 'none';
  document.getElementById('adminMenu').style.display = panel === 'menu' ? 'block' : 'none';
  document.getElementById('adminPedidos').style.display = panel === 'pedidos' ? 'block' : 'none';
}

function renderAdminMenu() {
  const container = document.getElementById('menuManager');
  const all = getAllItems();
  container.innerHTML = all.map(item => `
    <div class="menu-manage-item">
      <span class="mmi-name">${item.name}</span>
      <span class="mmi-price">$${item.price}</span>
      <div class="mmi-actions">
        <button class="mmi-btn" onclick="editItem(${item.id})">Editar</button>
        <button class="mmi-btn" onclick="showToast('Item eliminado')">Eliminar</button>
      </div>
    </div>
  `).join('');
}

function editItem(id) {
  showToast('Modo edicion habilitado');
}
function addItem() {
  showToast('Formulario de nuevo item (en desarrollo)');
}

function renderOrders() {
  const container = document.getElementById('ordersList');
  container.innerHTML = ACTIVE_ORDERS.map(o => `
    <div class="order-item">
      <div>
        <strong>${o.id}</strong> · ${o.items}
        <div style="font-size:0.75rem;color:var(--gray);margin-top:4px">Hace ${o.time} · ${o.total}</div>
      </div>
      <span class="order-badge ${o.status === 'ready' ? 'badge-ready' : 'badge-pending'}">
        ${o.status === 'ready' ? 'Listo' : 'En preparacion'}
      </span>
    </div>
  `).join('');
}

function renderPredChart() {
  const container = document.getElementById('predChart');
  if (!container) return;
  const max = Math.max(...SALES_DATA.prediction);
  container.innerHTML = `
    <div class="pred-bars">
      ${SALES_DATA.days.map((day, i) => {
        const h = Math.round((SALES_DATA.prediction[i] / max) * 90);
        const isHigh = SALES_DATA.prediction[i] === max;
        return `
          <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;">
            <div class="pred-bar ${isHigh ? 'high' : ''}"
                 style="height:${h}px;background:${isHigh ? 'var(--gold)' : 'var(--red)'};border-radius:4px 4px 0 0;width:100%"></div>
            <span style="font-size:0.65rem;color:var(--gray)">${day}</span>
          </div>`;
      }).join('')}
    </div>
  `;
}

// ══════════════════════════════════
// AI CHAT
// ══════════════════════════════════
function sendAI() {
  const input = document.getElementById('aiInput');
  const text = input.value.trim();
  if (!text) return;
  appendMsg(text, 'user');
  input.value = '';
  setTimeout(() => {
    appendMsg('...', 'bot typing');
    setTimeout(() => {
      removeTyping();
      const response = getAIResponse(text);
      appendMsg(response.reply, 'bot');
    }, 1200);
  }, 300);
}

function appendMsg(text, type) {
  const box = document.getElementById('aiMessages');
  const isBot = type.includes('bot');
  const isTyping = type.includes('typing');
  const div = document.createElement('div');
  div.className = `ai-msg ${isBot ? 'bot' : 'user'}${isTyping ? ' ai-typing' : ''}`;
  div.innerHTML = isBot
    ? `<div class="bot-avatar">N</div><div class="msg-bubble">${formatMsg(text)}</div>`
    : `<div class="msg-bubble">${text}</div>`;
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
}

function removeTyping() {
  document.querySelector('.ai-typing')?.remove();
}

function formatMsg(text) {
  return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
}

function getAIResponse(text) {
  const lower = text.toLowerCase();
  const kws = AI_RESPONSES.keywords;
  if (lower.includes('picante') || lower.includes('picoso') || lower.includes('spicy')) return kws.picante;
  if (lower.includes('salmon') || lower.includes('salmón')) return kws.salmon;
  if (lower.includes('camaron') || lower.includes('camarón') || lower.includes('shrimp')) return kws.camaron;
  if (lower.includes('vegetal') || lower.includes('verdura') || lower.includes('vegetariano')) return kws.vegetal;
  if (lower.includes('recomienda') || lower.includes('popular') || lower.includes('mejor')) return kws.recomendacion;
  if (lower.includes('economic') || lower.includes('barato') || lower.includes('precio')) return kws.economico;
  return kws.default;
}

// ══════════════════════════════════
// SALES CHART (public panel)
// ══════════════════════════════════
function initSalesChart() {
  const container = document.getElementById('salesChart');
  if (!container) return;
  const maxVal = Math.max(...SALES_DATA.actual, ...SALES_DATA.prediction);
  const chartH = 180;
  container.innerHTML = SALES_DATA.days.map((day, i) => {
    const actualH = Math.round((SALES_DATA.actual[i] / maxVal) * chartH);
    const predH = Math.round((SALES_DATA.prediction[i] / maxVal) * chartH);
    return `
      <div class="bar-wrap">
        <div style="position:relative;display:flex;align-items:flex-end;gap:3px;height:${chartH}px">
          <div class="bar actual" style="height:${actualH}px;width:16px">
            <span class="bar-val">$${Math.round(SALES_DATA.actual[i]/1000)}k</span>
          </div>
          <div class="bar prediction" style="height:${predH}px;width:16px"></div>
        </div>
        <span class="bar-label">${day}</span>
      </div>`;
  }).join('');
}

function initTopItems() {
  const container = document.getElementById('topItems');
  if (!container) return;
  container.innerHTML = SALES_DATA.topItems.map(item => `
    <div class="top-item">
      <span class="top-item-name">${item.name}</span>
      <div class="top-item-bar">
        <div class="top-item-fill" style="width:${item.pct}%"></div>
      </div>
      <span class="top-item-pct">${item.pct}%</span>
    </div>
  `).join('');
}

// ══════════════════════════════════
// CONTACT
// ══════════════════════════════════
function submitContact(e) {
  e.preventDefault();
  showToast('Mensaje enviado. Te contactaremos pronto.');
  e.target.reset();
}

// ══════════════════════════════════
// TOAST
// ══════════════════════════════════
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// ── Close modals on overlay click ──
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => {
    if (e.target === overlay) overlay.classList.remove('open');
  });
});
