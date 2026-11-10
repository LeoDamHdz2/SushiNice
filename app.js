// ============================================================
// SUSHINICE – APP LOGIC
// ============================================================

// ── STATE ──
let cart = [];
let currentUser = null;
let currentCat = 'sopas';
let MENU_DATA = {};

// ══════════════════════════════════
// INIT
// ══════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  initNavScroll();
  initMenuTabs();
  loadMenu();
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
      <img class="menu-card-img" src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}"/>
      <div class="menu-card-body">
        <div class="menu-card-category">${escapeHtml(categoryName(item.category))}</div>
        <div class="menu-card-name">${escapeHtml(item.name)}</div>
        <div class="menu-card-desc">${escapeHtml(item.description)}</div>
        <div class="menu-card-footer">
          <span class="menu-card-price">${formatPrice(item.price)}</span>
          <button class="btn-add" onclick="event.stopPropagation();addToCart(${item.id})">+</button>
        </div>
      </div>
    </div>
  `).join('');
  if (items.length === 0) {
    grid.innerHTML = '<p class="cart-empty">No hay platillos disponibles en esta categoría.</p>';
  }
}

// ══════════════════════════════════
// CART
// ══════════════════════════════════
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]);
}

function formatPrice(value) {
  return `$${Number(value).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function categoryName(category) {
  return ({
    sopas: 'Sopas / Ramen',
    ensaladas: 'Ensaladas',
    kushiagues: 'Kushiagues',
    rolls: 'Rolls Especiales',
    bebidas: 'Bebidas',
  })[category] || category;
}

async function apiRequest(action, payload = {}, method = 'POST') {
  const options = { method, headers: { Accept: 'application/json' }, credentials: 'same-origin' };
  if (method === 'POST') {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify({ ...payload, action });
  }
  const url = method === 'GET' ? `api.php?action=${encodeURIComponent(action)}` : 'api.php';
  const response = await fetch(url, options);
  const body = await response.text();
  let result;
  try {
    result = JSON.parse(body);
  } catch {
    throw new Error('El servidor devolvió una respuesta inválida.');
  }
  if (!response.ok) throw new Error(result.error || 'No se pudo completar la operación.');
  return result;
}

async function loadMenu() {
  try {
    const result = await apiRequest('menu', {}, 'GET');
    MENU_DATA = {};
    for (const item of result.items) {
      item.id = Number(item.id);
      item.price = Number(item.price);
      (MENU_DATA[item.category] ||= []).push(item);
    }
    renderMenu(currentCat);
  } catch (error) {
    showToast(error.message || 'No se pudo cargar el menú.');
  }
}

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
        <div class="cart-item-name">${escapeHtml(item.name)}</div>
        <div class="cart-item-qty">x${item.qty}</div>
      </div>
      <div style="display:flex;align-items:center;gap:12px;">
        <span class="cart-item-price">${formatPrice(item.price * item.qty)}</span>
        <button class="btn-remove" onclick="removeFromCart(${item.id})"><i class="fas fa-times"></i></button>
      </div>
    </div>
  `).join('');
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  totalEl.innerHTML = `Total: <span style="color:var(--red)">${formatPrice(total)}</span>`;
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  renderCart();
  updateCartBadge();
}

function checkout() {
  if (cart.length === 0) {
    showToast('Agrega al menos un platillo antes de continuar.');
    return;
  }
  document.getElementById('checkoutSummary').textContent =
    `Total estimado: ${formatPrice(cart.reduce((sum, item) => sum + item.price * item.qty, 0))}`;
  document.getElementById('cartContents').style.display = 'none';
  document.getElementById('checkoutForm').style.display = 'block';
}

function cancelCheckout() {
  document.getElementById('checkoutForm').style.display = 'none';
  document.getElementById('cartContents').style.display = 'block';
}

async function submitOrder(event) {
  event.preventDefault();
  if (cart.length === 0) {
    showToast('Tu orden está vacía.');
    cancelCheckout();
    return;
  }
  const form = event.currentTarget;
  const button = form.querySelector('button[type="submit"]');
  const fields = Object.fromEntries(new FormData(form));
  button.disabled = true;
  button.textContent = 'Guardando pedido...';
  try {
    const result = await apiRequest('create-order', {
      ...fields,
      items: cart.map(item => ({ id: item.id, qty: item.qty })),
    });
    cart = [];
    form.reset();
    cancelCheckout();
    updateCartBadge();
    closeCart();
    showToast(`Pedido #${result.order.id} confirmado. Total: ${formatPrice(result.order.total)}`);
  } catch (error) {
    showToast(error.message || 'No se pudo guardar el pedido.');
  } finally {
    button.disabled = false;
    button.textContent = 'Enviar pedido';
  }
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
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  options.signal = controller.signal;
  if (method === 'POST') {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(payload);
  }
  const url = method === 'GET' ? 'auth.php?action=session' : 'auth.php';
  try {
    const response = await fetch(url, options);
    const body = await response.text();
    let result;
    try {
      result = JSON.parse(body);
    } catch {
      throw new Error('El servidor devolvió una respuesta inválida.');
    }
    if (!response.ok) throw new Error(result.error || 'No se pudo completar la operación.');
    return result;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('El servidor tardó demasiado en responder. Revisa que Apache y MySQL estén activos e inténtalo de nuevo.');
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
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
  const form = event.currentTarget;
  const submitButton = form.querySelector('button[type="submit"]');
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPass').value;
  submitButton.disabled = true;
  submitButton.textContent = 'Iniciando sesión...';
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
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = 'Entrar';
  }
}

async function doRegister(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const submitButton = form.querySelector('button[type="submit"]');
  const name = document.getElementById('registerName').value.trim();
  const email = document.getElementById('registerEmail').value.trim();
  const password = document.getElementById('registerPass').value;
  const confirmation = document.getElementById('registerPassConfirm').value;

  if (password !== confirmation) {
    showToast('Las contraseñas no coinciden.');
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = 'Creando cuenta...';
  try {
    await authRequest({ action: 'register', name, email, password });
    document.getElementById('registerForm').reset();
    document.getElementById('loginEmail').value = email;
    switchLogin('login', document.querySelector('.mtab'));
    showToast('Cuenta creada. Ahora puedes iniciar sesión.');
  } catch (error) {
    showToast(error.message || 'No se pudo crear la cuenta.');
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = 'Crear cuenta';
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
  document.getElementById('adminModal').classList.add('open');
  switchAdmin('ventas', document.querySelector('.atab'));
  loadAdminData();
}
function closeAdmin() {
  document.getElementById('adminModal').classList.remove('open');
}

function switchAdmin(panel, button) {
  document.querySelectorAll('.atab').forEach(tab => tab.classList.toggle('active', tab === button));
  document.getElementById('adminVentas').style.display = panel === 'ventas' ? 'block' : 'none';
  document.getElementById('adminMenu').style.display = panel === 'menu' ? 'block' : 'none';
  document.getElementById('adminPedidos').style.display = panel === 'pedidos' ? 'block' : 'none';
  if (panel === 'menu') renderAdminMenu();
  if (panel === 'pedidos') loadAdminOrders();
}

async function loadAdminData() {
  try {
    const [dashboard, sales] = await Promise.all([
      apiRequest('admin-dashboard', {}, 'GET'),
      apiRequest('admin-sales', {}, 'GET'),
    ]);
    document.getElementById('salesToday').textContent = formatPrice(dashboard.stats.sales);
    document.getElementById('ordersToday').textContent = dashboard.stats.orders;
    document.getElementById('averageTicket').textContent = formatPrice(dashboard.stats.average);
    document.getElementById('activeOrders').textContent = dashboard.stats.active || 0;
    renderSalesChart(sales.days);
    renderTopItems(sales.topItems);
  } catch (error) {
    showToast(error.message || 'No se pudieron cargar las estadísticas.');
  }
}

function renderAdminMenu() {
  const container = document.getElementById('menuManager');
  const all = getAllItems().sort((first, second) => first.id - second.id);
  container.innerHTML = all.map(item => `
    <div class="menu-manage-item">
      <span class="mmi-name">${escapeHtml(item.name)}</span>
      <span class="mmi-price">${formatPrice(item.price)}</span>
      <div class="mmi-actions">
        <button class="mmi-btn" type="button" onclick="editItem(${item.id})">Editar</button>
        <button class="mmi-btn" type="button" onclick="deleteItem(${item.id})">Eliminar</button>
      </div>
    </div>
  `).join('');
  if (all.length === 0) container.innerHTML = '<p class="cart-empty">El menú no tiene platillos.</p>';
}

function editItem(id) {
  const item = getAllItems().find(menuItem => menuItem.id === id);
  if (!item) {
    showToast('El platillo ya no existe.');
    return;
  }
  const form = document.getElementById('menuItemForm');
  form.elements.id.value = item.id;
  form.elements.name.value = item.name;
  form.elements.category.value = item.category;
  form.elements.description.value = item.description;
  form.elements.price.value = item.price;
  form.elements.image.value = item.image;
  form.style.display = 'grid';
  form.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function addItem() {
  const form = document.getElementById('menuItemForm');
  form.reset();
  form.elements.id.value = '';
  form.style.display = 'grid';
  form.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function cancelMenuEdit() {
  const form = document.getElementById('menuItemForm');
  form.reset();
  form.style.display = 'none';
}

async function saveMenuItem(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const button = form.querySelector('button[type="submit"]');
  const fields = Object.fromEntries(new FormData(form));
  if (fields.id) fields.id = Number(fields.id);
  fields.price = Number(fields.price);
  button.disabled = true;
  try {
    await apiRequest('menu-save', fields);
    cancelMenuEdit();
    await loadMenu();
    renderAdminMenu();
    showToast('El menú se guardó correctamente.');
  } catch (error) {
    showToast(error.message || 'No se pudo guardar el platillo.');
  } finally {
    button.disabled = false;
  }
}

async function deleteItem(id) {
  const item = getAllItems().find(menuItem => menuItem.id === id);
  if (!item || !window.confirm(`¿Eliminar ${item.name} del menú?`)) return;
  try {
    await apiRequest('menu-delete', { id });
    await loadMenu();
    renderAdminMenu();
    showToast('El platillo se eliminó del menú.');
  } catch (error) {
    showToast(error.message || 'No se pudo eliminar el platillo.');
  }
}

async function loadAdminOrders() {
  try {
    const result = await apiRequest('admin-orders', {}, 'GET');
    renderOrders(result.orders);
  } catch (error) {
    showToast(error.message || 'No se pudieron cargar los pedidos.');
  }
}

function renderOrders(orders) {
  const container = document.getElementById('ordersList');
  container.innerHTML = orders.map(order => `
    <div class="order-item">
      <div>
        <strong>Pedido #${order.id}</strong> · ${escapeHtml(order.items)}
        <div style="font-size:0.75rem;color:var(--gray);margin-top:4px">
          ${escapeHtml(order.customer)} · ${escapeHtml(order.email)} · ${escapeHtml(order.phone)} · ${formatPrice(order.total)}
        </div>
        <div style="font-size:0.75rem;color:var(--gray);margin-top:4px">${escapeHtml(order.address)}</div>
      </div>
      <select aria-label="Estado del pedido ${order.id}" onchange="updateOrderStatus(${order.id}, this.value)">
        ${['pending', 'preparing', 'ready'].map(status => `
          <option value="${status}" ${order.status === status ? 'selected' : ''}>
            ${orderStatusLabel(status)}
          </option>`).join('')}
        <option value="completed">Completado</option>
        <option value="cancelled">Cancelado</option>
      </select>
    </div>
  `).join('');
  if (orders.length === 0) container.innerHTML = '<p class="cart-empty">No hay pedidos activos.</p>';
}

function orderStatusLabel(status) {
  return ({ pending: 'Pendiente', preparing: 'En preparación', ready: 'Listo' })[status] || status;
}

async function updateOrderStatus(id, status) {
  try {
    await apiRequest('order-status', { id, status });
    await Promise.all([loadAdminOrders(), loadAdminData()]);
    showToast('Estado del pedido actualizado.');
  } catch (error) {
    showToast(error.message || 'No se pudo actualizar el pedido.');
    loadAdminOrders();
  }
}

function renderSalesChart(days) {
  const container = document.getElementById('salesChart');
  const max = Math.max(...days.map(day => Number(day.total)), 1);
  container.innerHTML = days.map(day => {
    const height = Math.round((Number(day.total) / max) * 170);
    const label = new Date(`${day.date}T12:00:00`).toLocaleDateString('es-MX', { weekday: 'short' });
    return `
      <div class="bar-wrap">
        <div style="position:relative;display:flex;align-items:flex-end;height:180px">
          <div class="bar actual" title="${formatPrice(day.total)}" style="height:${height}px;width:22px">
            ${Number(day.total) > 0 ? `<span class="bar-val">${formatPrice(day.total)}</span>` : ''}
          </div>
        </div>
        <span class="bar-label">${escapeHtml(label)}</span>
      </div>`;
  }).join('');
}

function renderTopItems(items) {
  const container = document.getElementById('topItems');
  const max = Math.max(...items.map(item => Number(item.quantity)), 1);
  container.innerHTML = items.map(item => {
    const percentage = Math.round((Number(item.quantity) / max) * 100);
    return `
      <div class="top-item">
        <span class="top-item-name">${escapeHtml(item.name)}</span>
        <div class="top-item-bar"><div class="top-item-fill" style="width:${percentage}%"></div></div>
        <span class="top-item-pct">${Number(item.quantity)} pzas.</span>
      </div>`;
  }).join('');
  if (items.length === 0) container.innerHTML = '<p class="cart-empty">Aún no hay ventas registradas.</p>';
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
      appendMsg(response, 'bot');
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
    : `<div class="msg-bubble">${escapeHtml(text)}</div>`;
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
}

function removeTyping() {
  document.querySelector('.ai-typing')?.remove();
}

function formatMsg(text) {
  return escapeHtml(text).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
}

function getAIResponse(text) {
  const lower = text.toLowerCase();
  const kws = AI_RESPONSES.keywords;
  let recommendation = kws.default;
  if (lower.includes('picante') || lower.includes('picoso') || lower.includes('spicy')) {
    recommendation = kws.picante;
  } else if (lower.includes('salmon') || lower.includes('salmón')) {
    recommendation = kws.salmon;
  } else if (lower.includes('camaron') || lower.includes('camarón') || lower.includes('shrimp')) {
    recommendation = kws.camaron;
  } else if (lower.includes('vegetal') || lower.includes('verdura') || lower.includes('vegetariano')) {
    recommendation = kws.vegetal;
  } else if (lower.includes('recomienda') || lower.includes('popular') || lower.includes('mejor')) {
    recommendation = kws.recomendacion;
  } else if (lower.includes('economic') || lower.includes('barato') || lower.includes('precio')) {
    recommendation = kws.economico;
  }

  if (recommendation === kws.default) {
    return 'Bienvenido a SushiNice. ' + recommendation.intro;
  }

  const items = recommendation === kws.economico
    ? getAllItems().sort((first, second) => first.price - second.price).slice(0, 3)
    : recommendation.items.map(id => getAllItems().find(item => item.id === id)).filter(Boolean);
  if (items.length === 0) return 'No hay platillos disponibles en este momento. Inténtalo más tarde.';
  return `${recommendation.intro} ${items.map(item => `**${item.name}** (${formatPrice(item.price)})`).join(', ')}.`;
}

// ══════════════════════════════════
// CONTACT
// ══════════════════════════════════
async function submitContact(e) {
  e.preventDefault();
  const form = e.currentTarget;
  const button = form.querySelector('button[type="submit"]');
  const fields = Object.fromEntries(new FormData(form));
  button.disabled = true;
  try {
    await apiRequest('contact', fields);
    form.reset();
    showToast('Mensaje enviado y guardado. Te contactaremos pronto.');
  } catch (error) {
    showToast(error.message || 'No se pudo guardar el mensaje.');
  } finally {
    button.disabled = false;
  }
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
