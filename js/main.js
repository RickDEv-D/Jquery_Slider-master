const APP_VERSION = '2.0.0';

const dbKeys = {
  users: 'hp_users',
  products: 'hp_products',
  coupons: 'hp_coupons',
  batches: 'hp_batches',
  validated: 'hp_validated',
  orders: 'hp_orders',
  session: 'hp_session',
  cart: 'hp_cart',
  appVersion: 'hp_app_version'
};

const demoImg = ['imgs/img-1.jpg', 'imgs/img-2.jpg', 'imgs/img-3.jpg'];

const seed = {
  users: [
    { id: 1, username: 'admin', password: 'admin123', role: 'admin' },
    { id: 2, username: 'moderador', password: 'mod123', role: 'moderador' },
    { id: 3, username: 'usuario', password: 'user123', role: 'usuario' }
  ],
  products: [
    { id: 1, name: 'Dipirona 500mg', category: 'Analgésicos', price: 14.9, sold: 120, image: demoImg[0], description: 'Alívio rápido para dor e febre.' },
    { id: 2, name: 'Paracetamol 750mg', category: 'Analgésicos', price: 17.9, sold: 150, image: demoImg[1], description: 'Controle de febre e dores leves a moderadas.' },
    { id: 3, name: 'Vitamina C 1g', category: 'Vitaminas', price: 22.5, sold: 88, image: demoImg[2], description: 'Suporte imunológico diário.' },
    { id: 4, name: 'Complexo B', category: 'Vitaminas', price: 31.2, sold: 75, image: demoImg[0], description: 'Energia, disposição e metabolismo.' },
    { id: 5, name: 'Ômega 3 Premium', category: 'Suplementos', price: 59.9, sold: 190, image: demoImg[1], description: 'Saúde cardiovascular e cerebral.' },
    { id: 6, name: 'Colágeno Hidrolisado', category: 'Suplementos', price: 78.9, sold: 66, image: demoImg[2], description: 'Suporte para pele, cabelos e unhas.' },
    { id: 7, name: 'Protetor Solar FPS70', category: 'Dermocosméticos', price: 44.7, sold: 65, image: demoImg[0], description: 'Proteção UVA/UVB para uso diário.' },
    { id: 8, name: 'Gel de Limpeza Facial', category: 'Dermocosméticos', price: 39.9, sold: 54, image: demoImg[1], description: 'Limpeza profunda sem ressecar.' }
  ],
  coupons: [{ code: 'HORUS10', type: 'percent', value: 10 }],
  batches: [],
  validated: [],
  orders: []
};

const state = { user: null, cart: [], appliedCoupon: null, carousel: 0 };
const byId = (id) => document.getElementById(id);

function read(key, fallback = null) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
function currency(value) { return Number(value).toFixed(2).replace('.', ','); }

function ensureSeed() {
  Object.entries(seed).forEach(([k, v]) => {
    if (!localStorage.getItem(dbKeys[k])) write(dbKeys[k], v);
  });

  if (read(dbKeys.appVersion) !== APP_VERSION) {
    const products = read(dbKeys.products, []);
    const merged = [...products];
    seed.products.forEach((p) => {
      if (!merged.some((x) => x.id === p.id)) merged.push(p);
    });
    write(dbKeys.products, merged);
    write(dbKeys.appVersion, APP_VERSION);
  }
}

function hidePrivateAreas() {
  byId('clientArea').classList.add('hidden');
  byId('productCheckArea').classList.add('hidden');
  byId('adminArea').classList.add('hidden');
}

function boot() {
  ensureSeed();
  state.user = read(dbKeys.session);
  state.cart = read(dbKeys.cart, []);
  bindEvents();
  renderAll();
  initCarousel();
  botMsg('Olá! Sou o assistente Horus Pharma. Como posso ajudar?');
}

function bindEvents() {
  byId('menuToggle').onclick = () => byId('menu').classList.toggle('open');
  byId('btnCart').onclick = () => byId('cartPanel').classList.toggle('hidden');

  byId('btnLogin').onclick = () => byId('loginModal').classList.remove('hidden');
  byId('btnRegister').onclick = () => byId('registerModal').classList.remove('hidden');
  byId('btnLogout').onclick = logout;
  byId('doLogin').onclick = login;
  byId('doRegister').onclick = register;

  byId('btnClientArea').onclick = () => {
    if (!state.user) return alert('Faça login para acessar área do cliente.');
    hidePrivateAreas();
    byId('clientArea').classList.remove('hidden');
    renderOrders();
  };

  byId('btnProductCheck').onclick = () => {
    hidePrivateAreas();
    byId('productCheckArea').classList.remove('hidden');
  };

  byId('btnAdminArea').onclick = () => {
    if (!state.user || !['admin', 'moderador'].includes(state.user.role)) {
      return alert('Somente admin/moderador.');
    }
    hidePrivateAreas();
    byId('adminArea').classList.remove('hidden');
    renderAdminData();
  };

  byId('closeClientArea').onclick = hidePrivateAreas;
  byId('closeProductCheckArea').onclick = hidePrivateAreas;
  byId('closeAdminArea').onclick = hidePrivateAreas;

  byId('searchInput').oninput = renderProducts;
  byId('filterCategory').onchange = renderProducts;
  byId('filterSort').onchange = renderProducts;
  byId('applyCoupon').onclick = applyCoupon;
  byId('trackBtn').onclick = trackPackage;
  byId('validateQrBtn').onclick = validateQr;
  byId('pixBtn').onclick = pixCheckout;

  byId('chatToggle').onclick = () => byId('chatWindow').classList.toggle('hidden');
  byId('chatInput').addEventListener('keydown', (e) => { if (e.key === 'Enter') handleChat(); });

  byId('saveProd').onclick = saveProduct;
  byId('saveCoupon').onclick = saveCoupon;
  byId('genBatch').onclick = saveBatch;

  ['loginModal', 'registerModal'].forEach((id) => {
    byId(id).addEventListener('click', (event) => {
      if (event.target.id === id) byId(id).classList.add('hidden');
    });
  });
}

function renderAll() {
  renderAuthArea();
  renderCategories();
  renderProducts();
  renderCart();
  renderOrders();
  renderAdminData();
}

function renderAuthArea() {
  const isLogged = !!state.user;
  const isAdmin = isLogged && ['admin', 'moderador'].includes(state.user.role);
  byId('btnLogin').classList.toggle('hidden', isLogged);
  byId('btnRegister').classList.toggle('hidden', isLogged);
  byId('btnLogout').classList.toggle('hidden', !isLogged);
  byId('btnClientArea').classList.toggle('hidden', !isLogged);
  byId('btnAdminArea').classList.toggle('hidden', !isAdmin);
  byId('btnLogout').textContent = isLogged ? `Sair (${state.user.username})` : 'Sair';

  const ceo = byId('ceoSection');
  ceo.classList.toggle('hidden', !(state.user && state.user.role === 'admin'));
}

function renderCategories() {
  const products = read(dbKeys.products, []);
  const categories = [...new Set(products.map((p) => p.category))].sort();
  byId('categoryGrid').innerHTML = categories.map((c) => `<div class="card"><h3>${c}</h3><p>${products.filter((p) => p.category === c).length} itens</p></div>`).join('');
  byId('filterCategory').innerHTML = '<option value="">Categoria</option>' + categories.map((c) => `<option>${c}</option>`).join('');
}

function renderProducts() {
  const term = byId('searchInput').value.toLowerCase().trim();
  const category = byId('filterCategory').value;
  const sort = byId('filterSort').value;
  let products = read(dbKeys.products, []).filter((p) => p.name.toLowerCase().includes(term) && (!category || p.category === category));

  if (sort === 'priceAsc') products.sort((a, b) => a.price - b.price);
  if (sort === 'priceDesc') products.sort((a, b) => b.price - a.price);
  if (sort === 'bestSellers') products.sort((a, b) => b.sold - a.sold);

  byId('productGrid').innerHTML = products.length ? products.map((p) => `
    <div class="card">
      <img class="product-photo" src="${p.image || demoImg[0]}" alt="${p.name}" />
      <h3>${p.name}</h3>
      <p><i class="fa-solid fa-tag"></i> ${p.category}</p>
      <p><strong>R$ ${currency(p.price)}</strong></p>
      <p>${p.description}</p>
      <button class="ghost" onclick="viewProduct(${p.id})">Página do Produto</button>
      <button class="primary" onclick="addCart(${p.id})">Adicionar</button>
    </div>
  `).join('') : '<p>Nenhum produto encontrado.</p>';
}

window.viewProduct = function viewProduct(id) {
  const p = read(dbKeys.products, []).find((x) => x.id === id);
  if (!p) return;
  byId('productDetail').classList.remove('hidden');
  byId('productDetail').innerHTML = `
    <img class="product-photo" src="${p.image || demoImg[0]}" alt="${p.name}" />
    <h3>${p.name}</h3>
    <p>Categoria: ${p.category}</p>
    <p>Preço: R$ ${currency(p.price)}</p>
    <p>${p.description}</p>
    <button class="primary" onclick="addCart(${p.id})">Comprar</button>
  `;
};

window.addCart = function addCart(id) {
  const p = read(dbKeys.products, []).find((x) => x.id === id);
  if (!p) return;
  const found = state.cart.find((item) => item.id === id);
  if (found) found.qty += 1;
  else state.cart.push({ id: p.id, name: p.name, price: p.price, image: p.image || demoImg[0], qty: 1 });
  write(dbKeys.cart, state.cart);
  renderCart();
};

window.incQty = function incQty(id) {
  const item = state.cart.find((x) => x.id === id);
  if (!item) return;
  item.qty += 1;
  write(dbKeys.cart, state.cart);
  renderCart();
};

window.decQty = function decQty(id) {
  const item = state.cart.find((x) => x.id === id);
  if (!item) return;
  item.qty -= 1;
  if (item.qty <= 0) state.cart = state.cart.filter((x) => x.id !== id);
  write(dbKeys.cart, state.cart);
  renderCart();
};

function renderCart() {
  byId('cartCount').textContent = state.cart.reduce((s, i) => s + i.qty, 0);
  byId('cartItems').innerHTML = state.cart.length ? state.cart.map((i) => `
    <div class="cart-row">
      <img src="${i.image}" alt="${i.name}" />
      <div>
        <h4>${i.name}</h4>
        <small>R$ ${currency(i.price)}</small>
      </div>
      <div class="qty-box">
        <button class="ghost" onclick="decQty(${i.id})">-</button>
        <span>${i.qty}</span>
        <button class="ghost" onclick="incQty(${i.id})">+</button>
      </div>
    </div>
  `).join('') : '<p>Carrinho vazio.</p>';

  const subtotal = state.cart.reduce((s, i) => s + i.price * i.qty, 0);
  const discount = state.appliedCoupon ? subtotal * (state.appliedCoupon.value / 100) : 0;
  byId('subtotal').textContent = currency(subtotal);
  byId('discount').textContent = currency(discount);
  byId('total').textContent = currency(subtotal - discount);
}

function login() {
  const username = byId('loginUser').value.trim();
  const password = byId('loginPass').value.trim();
  const user = read(dbKeys.users, []).find((u) => u.username === username && u.password === password);
  if (!user) return alert('Credenciais inválidas.');
  state.user = user;
  write(dbKeys.session, user);
  byId('loginModal').classList.add('hidden');
  renderAll();
}

function register() {
  const username = byId('registerUser').value.trim();
  const password = byId('registerPass').value.trim();
  if (!username || password.length < 4) return alert('Preencha usuário e senha (mínimo 4).');

  const users = read(dbKeys.users, []);
  if (users.some((u) => u.username.toLowerCase() === username.toLowerCase())) return alert('Usuário já existe.');

  const user = { id: Date.now(), username, password, role: 'usuario' };
  users.push(user);
  write(dbKeys.users, users);
  state.user = user;
  write(dbKeys.session, user);
  byId('registerModal').classList.add('hidden');
  renderAll();
}

function logout() {
  state.user = null;
  write(dbKeys.session, null);
  hidePrivateAreas();
  renderAll();
}

function applyCoupon() {
  const code = byId('couponInput').value.trim().toUpperCase();
  const c = read(dbKeys.coupons, []).find((x) => x.code === code);
  if (!c) return alert('Cupom inválido.');
  state.appliedCoupon = c;
  renderCart();
}

async function trackPackage() {
  const code = byId('trackingCode').value.trim();
  if (!code) return;
  const out = byId('trackingResult');
  out.textContent = 'Consultando...';
  try {
    const res = await fetch(`https://brasilapi.com.br/api/correios/v1/tracking/${code}`);
    if (!res.ok) throw new Error('falha');
    out.textContent = JSON.stringify(await res.json(), null, 2);
  } catch {
    out.textContent = JSON.stringify({ codigo: code, status: 'Em trânsito (fallback local)', ultimaAtualizacao: new Date().toLocaleString('pt-BR') }, null, 2);
  }
}

function saveBatch() {
  if (!state.user || !['admin', 'moderador'].includes(state.user.role)) return alert('Acesso negado.');
  const product = byId('batchProd').value.trim();
  const qty = Number(byId('batchQty').value);
  if (!product || qty < 1) return alert('Dados inválidos.');

  const products = read(dbKeys.products, []);
  const found = products.find((p) => p.name.toLowerCase() === product.toLowerCase());
  const code = `HP-${Date.now().toString(36).toUpperCase()}`;
  const batches = read(dbKeys.batches, []);
  batches.push({ code, product, productId: found ? found.id : null, qty, createdAt: new Date().toISOString() });
  write(dbKeys.batches, batches);
  renderAdminData();
}

function validateQr() {
  const code = byId('qrValidateInput').value.trim();
  const batches = read(dbKeys.batches, []);
  const validated = read(dbKeys.validated, []);
  const batch = batches.find((b) => b.code === code);

  if (!batch) {
    byId('qrValidateResult').textContent = 'Lote/QR não encontrado.';
    return;
  }

  if (validated.some((v) => v.code === code)) {
    byId('qrValidateResult').textContent = 'Produto já validado anteriormente.';
    return;
  }

  const record = {
    code,
    product: batch.product,
    productId: batch.productId,
    validatedAt: new Date().toISOString(),
    validatedBy: state.user ? state.user.username : 'visitante'
  };
  validated.push(record);
  write(dbKeys.validated, validated);
  byId('qrValidateResult').textContent = 'Produto autêntico validado com sucesso!';
  renderAdminData();
}

function pixCheckout() {
  if (!state.user) return alert('Faça login para finalizar a compra.');
  if (!state.cart.length) return alert('Carrinho vazio.');

  const total = Number(byId('total').textContent.replace(',', '.'));
  const txid = `PIX-${Date.now()}`;
  const payload = `PIX-HORUS-${txid}-${total.toFixed(2)}`;

  byId('pixArea').classList.remove('hidden');
  byId('pixArea').innerHTML = `
    <p>TXID: ${txid}</p>
    <textarea>${payload}</textarea>
    <img alt="pix-qr" src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(payload)}" />
    <button id="confirmPix" class="primary">Confirmar pagamento</button>
  `;

  byId('confirmPix').onclick = () => {
    const orders = read(dbKeys.orders, []);
    orders.push({
      id: `PED-${Date.now()}`,
      user: state.user.username,
      items: [...state.cart],
      total,
      status: 'Processando',
      tracking: `TRK${Date.now().toString().slice(-8)}`
    });
    write(dbKeys.orders, orders);
    state.cart = [];
    state.appliedCoupon = null;
    write(dbKeys.cart, []);
    renderCart();
    renderOrders();
    renderAdminData();
    alert('Pedido criado com sucesso!');
  };
}

function renderOrders() {
  if (!state.user) {
    byId('ordersList').innerHTML = '<p>Faça login para visualizar seus pedidos.</p>';
    return;
  }
  const orders = read(dbKeys.orders, []).filter((o) => o.user === state.user.username);
  byId('ordersList').innerHTML = orders.length ? orders.map((o) => `<div class="card"><h4>${o.id}</h4><p>Status: ${o.status}</p><p>Rastreio: ${o.tracking}</p><p>Total: R$ ${currency(o.total)}</p></div>`).join('') : '<p>Sem pedidos no momento.</p>';
}

function saveProduct() {
  if (!state.user || !['admin', 'moderador'].includes(state.user.role)) return alert('Acesso negado.');
  const name = byId('pName').value.trim();
  const category = byId('pCat').value.trim();
  const price = Number(byId('pPrice').value);
  const image = byId('pImage').value.trim() || demoImg[0];
  const description = byId('pDesc').value.trim();
  if (!name || !category || price <= 0 || !description) return alert('Preencha corretamente.');

  const products = read(dbKeys.products, []);
  products.push({ id: Date.now(), name, category, price, sold: 0, image, description });
  write(dbKeys.products, products);
  renderCategories();
  renderProducts();
  renderAdminData();
}

function saveCoupon() {
  if (!state.user || !['admin', 'moderador'].includes(state.user.role)) return alert('Acesso negado.');
  const code = byId('cCode').value.trim().toUpperCase();
  const value = Number(byId('cVal').value);
  if (!code || value < 1 || value > 100) return alert('Cupom inválido.');

  const coupons = read(dbKeys.coupons, []);
  if (coupons.some((c) => c.code === code)) return alert('Cupom já existe.');
  coupons.push({ code, type: 'percent', value });
  write(dbKeys.coupons, coupons);
  renderAdminData();
}

function renderAdminData() {
  const products = read(dbKeys.products, []);
  const coupons = read(dbKeys.coupons, []);
  const batches = read(dbKeys.batches, []);
  const orders = read(dbKeys.orders, []);
  const validated = read(dbKeys.validated, []);

  byId('adminProductsList').innerHTML = products.map((p) => `<p>${p.id} - ${p.name} (R$ ${currency(p.price)})</p>`).join('');
  byId('adminCouponsList').innerHTML = coupons.map((c) => `<p>${c.code} - ${c.value}%</p>`).join('');
  byId('batchList').innerHTML = batches.map((b) => `<div class="card"><p>${b.product} - ${b.code}</p><img alt="qr" src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${b.code}"/></div>`).join('');
  byId('adminOrdersList').innerHTML = orders.length ? orders.map((o) => `<p>${o.id} | ${o.user} | ${o.status} | R$ ${currency(o.total)}</p>`).join('') : '<p>Sem pedidos.</p>';
  byId('validatedList').innerHTML = validated.length ? validated.map((v) => `<p>${v.code} | ${v.product} | ${new Date(v.validatedAt).toLocaleString('pt-BR')} | ${v.validatedBy}</p>`).join('') : '<p>Nenhum produto validado.</p>';

  if (state.user && state.user.role === 'admin') {
    const revenue = orders.reduce((s, o) => s + Number(o.total || 0), 0);
    byId('ceoMetrics').innerHTML = `
      <div class="card"><h3>Receita</h3><p>R$ ${currency(revenue)}</p></div>
      <div class="card"><h3>Pedidos</h3><p>${orders.length}</p></div>
      <div class="card"><h3>Produtos</h3><p>${products.length}</p></div>
      <div class="card"><h3>Validados</h3><p>${validated.length}</p></div>
    `;
    byId('databaseAccess').value = JSON.stringify({ users: read(dbKeys.users, []), products, coupons, batches, validated, orders }, null, 2);
  }
}

function initCarousel() {
  const slides = [...document.querySelectorAll('.slide')];
  setInterval(() => {
    state.carousel = (state.carousel + 1) % slides.length;
    slides.forEach((s, i) => s.classList.toggle('active', i === state.carousel));
  }, 4500);
}

function handleChat() {
  const input = byId('chatInput');
  const text = input.value.trim();
  if (!text) return;
  botMsg(`Você: ${text}`);
  const answer = /pedido|rastreio/i.test(text) ? 'Use a área do cliente para acompanhar pedidos.' : /cupom|promo/i.test(text) ? 'Use HORUS10 para desconto.' : 'Obrigado! Vamos te atender.';
  setTimeout(() => botMsg(`Bot: ${answer}`), 300);
  input.value = '';
}

function botMsg(msg) {
  byId('chatMessages').innerHTML += `<p>${msg}</p>`;
}

boot();
