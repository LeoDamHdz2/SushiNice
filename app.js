// ============================================================
// SUSHINICE – APP LOGIC
// ============================================================

// ── STATE ──
let cart = [];
let currentUser = null;
let currentCat = 'sopas';
let MENU_DATA = {};
let profileRefreshTimer = null;

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
  document.getElementById('orderConfirmation').style.display = 'none';
  document.getElementById('guestTrackingDetails').style.display = 'none';
  document.getElementById('accountOrderDetails').style.display = 'none';
  document.getElementById('cartContents').style.display = 'block';
  document.getElementById('checkoutForm').style.display = 'none';
  document.getElementById('checkoutForm').reset();
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
  if (currentUser) {
    const form = document.getElementById('checkoutForm');
    form.elements.name.value = currentUser.name;
    form.elements.email.value = currentUser.email;
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
    const isGuestOrder = Boolean(result.order.trackingCode);
    document.getElementById('orderConfirmationSummary').textContent =
      `Pedido #${result.order.id} recibido el ${formatOrderDate(result.order.orderedAt)}. Total: ${formatPrice(result.order.total)}. Estado: pendiente.`;
    document.getElementById('guestTrackingDetails').style.display = isGuestOrder ? 'block' : 'none';
    document.getElementById('accountOrderDetails').style.display = isGuestOrder ? 'none' : 'block';
    document.getElementById('guestTrackingCode').value = result.order.trackingCode || '';
    document.getElementById('orderConfirmation').style.display = 'block';
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
    openProfile();
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
  loginButton.append(icon, document.createTextNode(currentUser ? ` Mi perfil: ${currentUser.name}` : ' Entrar / mi pedido'));
  loginButton.setAttribute('aria-label', currentUser ? `Mi perfil de ${currentUser.name}` : 'Iniciar sesión o consultar un pedido');
  logoutButton.hidden = !currentUser;
}

function openProfile() {
  const modal = document.getElementById('profileModal');
  document.getElementById('profileAccount').hidden = !currentUser;
  document.getElementById('profileSignIn').style.display = currentUser ? 'none' : 'block';
  document.getElementById('adminShortcut').hidden = !currentUser || !currentUser.isAdmin;
  document.getElementById('guestOrderResult').textContent = '';
  if (currentUser) {
    document.getElementById('profileUser').textContent = `${currentUser.name} · ${currentUser.email}`;
  }
  modal.classList.add('open');
  if (currentUser) {
    loadProfileOrders();
    if (!profileRefreshTimer) profileRefreshTimer = setInterval(loadProfileOrders, 30000);
  }
}

function closeProfile() {
  document.getElementById('profileModal').classList.remove('open');
  if (profileRefreshTimer) {
    clearInterval(profileRefreshTimer);
    profileRefreshTimer = null;
  }
}

async function loadProfileOrders() {
  try {
    const result = await apiRequest('my-orders', {}, 'GET');
    renderProfileOrders(result.orders);
  } catch (error) {
    const container = document.getElementById('profileOrders');
    container.innerHTML = `<p class="profile-error">${escapeHtml(error.message || 'No se pudieron cargar tus pedidos.')}</p>`;
  }
}

function renderProfileOrders(orders) {
  const container = document.getElementById('profileOrders');
  if (orders.length === 0) {
    container.innerHTML = '<p class="cart-empty">Aún no tienes pedidos asociados a tu cuenta.</p>';
    return;
  }
  container.innerHTML = orders.map(order => renderCustomerOrder(order)).join('');
}

function formatOrderDate(value) {
  const date = new Date(String(value).replace(' ', 'T'));
  return Number.isNaN(date.getTime())
    ? escapeHtml(value)
    : date.toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' });
}

function orderStatusLabel(status) {
  return ({
    pending: 'Pendiente',
    preparing: 'En preparación',
    ready: 'Listo',
    completed: 'Completado',
    cancelled: 'Cancelado',
  })[status] || status;
}

function renderCustomerOrder(order, trackingCode = '') {
  const refreshButton = `
    <button class="mmi-btn" type="button" onclick="refreshCustomerOrder(${order.id}, '${trackingCode}')">
      Actualizar estado
    </button>`;
  const cancellation = order.canCancel
    ? `<div class="order-cancellation">
         Cargo de cancelación: <strong>${formatPrice(order.cancellationFeeEstimate)}</strong>
         <small>50 % de alimentos y otros productos; 100 % de bebidas. El cargo queda registrado, pero no se realiza un cobro real.</small>
       </div>
       ${refreshButton}
       <button class="btn-primary" type="button" onclick="cancelCustomerOrder(${order.id}, '${trackingCode}', ${Number(order.cancellationFeeEstimate)})">Cancelar pedido</button>`
    : order.status === 'cancelled'
      ? `<p class="order-cancellation">Cargo de cancelación registrado: <strong>${formatPrice(order.cancellationFee || 0)}</strong>. No se realizó un cobro real.</p>${refreshButton}`
      : `<p class="order-cancellation">Este pedido ya está listo o fue completado; no se puede cancelar.</p>${refreshButton}`;
  return `
    <article class="customer-order-card">
      <div class="customer-order-header">
        <h4>Pedido #${order.id}</h4>
        <span class="order-status order-status-${escapeHtml(order.status)}">${orderStatusLabel(order.status)}</span>
      </div>
      <p class="customer-order-date">Ordenado el ${formatOrderDate(order.orderedAt)}</p>
      <p class="customer-order-contact">
        ${escapeHtml(order.name)} · ${escapeHtml(order.email)} · ${escapeHtml(order.phone)}<br/>
        Entrega: ${escapeHtml(order.address)}
      </p>
      <ul class="customer-order-items">
        ${order.items.map(item => `
          <li><span>${escapeHtml(item.name)} × ${Number(item.quantity)}<small>${escapeHtml(categoryName(item.category || ''))}</small></span>
          <span>${formatPrice(Number(item.unitPrice) * Number(item.quantity))}</span></li>
        `).join('')}
      </ul>
      <p class="customer-order-total">Total del pedido: <strong>${formatPrice(order.total)}</strong></p>
      ${cancellation}
    </article>`;
}

async function lookupGuestOrder(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const button = form.querySelector('button[type="submit"]');
  const fields = Object.fromEntries(new FormData(form));
  const resultContainer = document.getElementById('guestOrderResult');
  button.disabled = true;
  resultContainer.textContent = 'Buscando pedido...';
  try {
    await renderGuestOrder(Number(fields.id), fields.trackingCode.trim());
  } catch (error) {
    resultContainer.innerHTML = `<p class="profile-error">${escapeHtml(error.message || 'No se encontró el pedido.')}</p>`;
  } finally {
    button.disabled = false;
  }
}

async function renderGuestOrder(id, trackingCode) {
  const result = await apiRequest('guest-order', { id, trackingCode });
  document.getElementById('guestOrderResult').innerHTML =
    renderCustomerOrder(result.order, trackingCode);
}

async function refreshCustomerOrder(id, trackingCode) {
  if (trackingCode) {
    const resultContainer = document.getElementById('guestOrderResult');
    resultContainer.textContent = 'Actualizando estado...';
    try {
      await renderGuestOrder(id, trackingCode);
    } catch (error) {
      resultContainer.innerHTML = `<p class="profile-error">${escapeHtml(error.message || 'No se pudo actualizar el pedido.')}</p>`;
    }
    return;
  }
  await loadProfileOrders();
}

async function cancelCustomerOrder(id, trackingCode, estimatedFee) {
  const fee = formatPrice(estimatedFee);
  if (!window.confirm(
    `Vas a cancelar el pedido #${id}. El cargo será ${fee}: 50 % para alimentos y otros productos y 100 % para bebidas. ` +
    'El cargo quedará registrado; por ahora, no se procesará ningún pago. ¿Deseas continuar?'
  )) return;

  try {
    const result = await apiRequest('cancel-order', {
      id,
      ...(trackingCode ? { trackingCode } : {}),
    });
    showToast(`Pedido #${id} cancelado. Cargo registrado: ${formatPrice(result.order.cancellationFee)}. No se realizó un cobro.`);
    if (trackingCode) {
      document.getElementById('guestOrderResult').innerHTML =
        renderCustomerOrder(result.order, trackingCode);
    } else {
      await loadProfileOrders();
    }
  } catch (error) {
    showToast(error.message || 'No se pudo cancelar el pedido.');
    if (trackingCode) {
      await refreshCustomerOrder(id, trackingCode);
    } else {
      await loadProfileOrders();
    }
  }
}

async function copyGuestTrackingCode() {
  const code = document.getElementById('guestTrackingCode').value;
  try {
    await navigator.clipboard.writeText(code);
    showToast('Código secreto copiado.');
  } catch {
    showToast('No se pudo copiar. Selecciona y copia el código manualmente.');
  }
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
    openProfile();
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
    closeProfile();
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
      </select>
    </div>
  `).join('');
  if (orders.length === 0) container.innerHTML = '<p class="cart-empty">No hay pedidos activos.</p>';
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
    if (e.target !== overlay) return;
    if (overlay.id === 'profileModal') closeProfile();
    else if (overlay.id === 'cartModal') closeCart();
    else overlay.classList.remove('open');
  });
});
