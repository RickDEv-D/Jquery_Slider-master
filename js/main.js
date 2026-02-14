const APP_VERSION = '1.1.0';

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

const seed = {
  users: [
    { username: 'admin', password: 'admin123', role: 'admin' },
    { username: 'moderador', password: 'mod123', role: 'moderador' },
    { username: 'usuario', password: 'user123', role: 'usuario' }
  ],
  products: [
    { id: 1, name: 'Dipirona 500mg', category: 'Analgésicos', price: 14.9, sold: 120, description: 'Alívio rápido para dor e febre.' },
    { id: 2, name: 'Paracetamol 750mg', category: 'Analgésicos', price: 17.9, sold: 150, description: 'Controle de febre e dores leves a moderadas.' },
    { id: 3, name: 'Vitamina C 1g', category: 'Vitaminas', price: 22.5, sold: 88, description: 'Suporte imunológico diário.' },
    { id: 4, name: 'Complexo B', category: 'Vitaminas', price: 31.2, sold: 75, description: 'Energia, disposição e metabolismo.' },
    { id: 5, name: 'Ômega 3 Premium', category: 'Suplementos', price: 59.9, sold: 190, description: 'Saúde cardiovascular e cerebral.' },
    { id: 6, name: 'Colágeno Hidrolisado', category: 'Suplementos', price: 78.9, sold: 66, description: 'Suporte para pele, cabelos e unhas.' },
    { id: 7, name: 'Protetor Solar FPS70', category: 'Dermocosméticos', price: 44.7, sold: 65, description: 'Proteção UVA/UVB para uso diário.' },
    { id: 8, name: 'Gel de Limpeza Facial', category: 'Dermocosméticos', price: 39.9, sold: 54, description: 'Limpeza profunda sem ressecar.' },
    { id: 9, name: 'Termômetro Digital', category: 'Equipamentos', price: 29.9, sold: 81, description: 'Medição rápida e precisa de temperatura.' },
    { id: 10, name: 'Monitor de Pressão Braço', category: 'Equipamentos', price: 129.9, sold: 37, description: 'Acompanhamento de pressão arterial em casa.' }
  ],
  coupons: [{ code: 'HORUS10', type: 'percent', value: 10 }],
  batches: [],
  validated: [],
  orders: []
};

const state = {
  user: null,
  cart: [],
  appliedCoupon: null,
  carousel: 0
};

const byId = (id) => document.getElementById(id);

function read(key, fallback = null) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function ensureSeed() {
  Object.entries(seed).forEach(([k, v]) => {
    if (!localStorage.getItem(dbKeys[k])) write(dbKeys[k], v);
  });

  const currentVersion = read(dbKeys.appVersion);
  if (currentVersion !== APP_VERSION) {
    migrateSeedData();
    write(dbKeys.appVersion, APP_VERSION);
  }
}

function migrateSeedData() {
  const existingProducts = read(dbKeys.products, []);
  const mergedProducts = [...existingProducts];

  seed.products.forEach((product) => {
    if (!mergedProducts.some((p) => p.id === product.id)) {
      mergedProducts.push(product);
    }
  });

  write(dbKeys.products, mergedProducts);

  const existingCoupons = read(dbKeys.coupons, []);
  seed.coupons.forEach((coupon) => {
    if (!existingCoupons.some((c) => c.code === coupon.code)) {
      existingCoupons.push(coupon);
    }
  });
  write(dbKeys.coupons, existingCoupons);
}

function currency(value) {
  return Number(value).toFixed(2).replace('.', ',');
}

function boot() {
  ensureSeed();
  state.user = read(dbKeys.session);
  state.cart = read(dbKeys.cart, []);
  initEvents();
  renderAll();
  initCarousel();
  botMsg('Olá! Sou o assistente Horus Pharma. Como posso ajudar?');
}

function initEvents() {
  byId('menuToggle').onclick = () => byId('menu').classList.toggle('open');
  byId('btnCart').onclick = () => byId('cartPanel').classList.toggle('hidden');
  byId('btnLogin').onclick = () => byId('loginModal').classList.remove('hidden');
  byId('btnLogout').onclick = logout;
  byId('doLogin').onclick = login;
  byId('btnAdmin').onclick = () => toggleAdmin(true);
  byId('searchInput').oninput = renderProducts;
  byId('filterCategory').onchange = renderProducts;
  byId('filterSort').onchange = renderProducts;
  byId('applyCoupon').onclick = applyCoupon;
  byId('trackBtn').onclick = trackPackage;
  byId('validateQrBtn').onclick = validateQr;
  byId('pixBtn').onclick = pixCheckout;
  byId('refreshDb').onclick = renderDb;
  byId('chatToggle').onclick = () => byId('chatWindow').classList.toggle('hidden');
  byId('chatInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleChat();
  });

  byId('loginModal').addEventListener('click', (event) => {
    if (event.target.id === 'loginModal') byId('loginModal').classList.add('hidden');
  });
}

function renderAll() {
  renderCategories();
  renderProducts();
  renderCart();
  renderOrders();
  renderCeo();
  renderDb();
  renderAuthArea();
}

function renderAuthArea() {
  byId('btnLogin').classList.toggle('hidden', !!state.user);
  byId('btnLogout').classList.toggle('hidden', !state.user);
  byId('btnLogout').textContent = state.user ? `Sair (${state.user.username})` : 'Sair';
}

function renderCategories() {
  const products = read(dbKeys.products, []);
  const categories = [...new Set(products.map((p) => p.category))].sort();
  byId('categoryGrid').innerHTML = categories
    .map((category) => `<div class="card"><h3>${category}</h3><p>${products.filter((p) => p.category === category).length} itens</p></div>`)
    .join('');

  byId('filterCategory').innerHTML = '<option value="">Categoria</option>' + categories.map((c) => `<option>${c}</option>`).join('');
}

function renderProducts() {
  const term = byId('searchInput').value.toLowerCase().trim();
  const category = byId('filterCategory').value;
  const sort = byId('filterSort').value;

  let products = read(dbKeys.products, []).filter((p) =>
    p.name.toLowerCase().includes(term) && (!category || p.category === category)
  );

  if (sort === 'priceAsc') products.sort((a, b) => a.price - b.price);
  if (sort === 'priceDesc') products.sort((a, b) => b.price - a.price);
  if (sort === 'bestSellers') products.sort((a, b) => b.sold - a.sold);

  byId('productGrid').innerHTML = products.length
    ? products
      .map((p) => `
      <div class="card">
        <h3>${p.name}</h3>
        <p><i class="fa-solid fa-tag"></i> ${p.category}</p>
        <p><strong>R$ ${currency(p.price)}</strong></p>
        <p>${p.description}</p>
        <button class="ghost" onclick="viewProduct(${p.id})">Página do Produto</button>
        <button class="primary" onclick="addCart(${p.id})">Adicionar</button>
      </div>
    `)
      .join('')
    : '<p>Nenhum produto encontrado para os filtros selecionados.</p>';
}

window.viewProduct = function viewProduct(id) {
  const product = read(dbKeys.products, []).find((p) => p.id === id);
  if (!product) return;
  const detail = byId('productDetail');
  detail.classList.remove('hidden');
  detail.innerHTML = `
    <h3>${product.name}</h3>
    <p>Categoria: ${product.category}</p>
    <p>Preço: R$ ${currency(product.price)}</p>
    <p>${product.description}</p>
    <button class="primary" onclick="addCart(${product.id})">Comprar</button>
  `;
};

window.addCart = function addCart(id) {
  const product = read(dbKeys.products, []).find((p) => p.id === id);
  if (!product) return;

  const existing = state.cart.find((item) => item.id === id);
  if (existing) {
    existing.qty += 1;
  } else {
    state.cart.push({ id: product.id, name: product.name, price: product.price, qty: 1 });
  }

  write(dbKeys.cart, state.cart);
  renderCart();
};

window.rmCart = function rmCart(id) {
  state.cart = state.cart.filter((item) => item.id !== id);
  write(dbKeys.cart, state.cart);
  renderCart();
};

function renderCart() {
  byId('cartCount').textContent = state.cart.reduce((sum, item) => sum + item.qty, 0);

  byId('cartItems').innerHTML = state.cart.length
    ? state.cart
      .map((item) => `<div class="card"><h4>${item.name}</h4><p>Qtd: ${item.qty} | R$ ${currency(item.price)}</p><button class="ghost" onclick="rmCart(${item.id})">Remover</button></div>`)
      .join('')
    : '<p>Carrinho vazio.</p>';

  const subtotal = state.cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const discount = state.appliedCoupon ? subtotal * (state.appliedCoupon.value / 100) : 0;
  const total = subtotal - discount;

  byId('subtotal').textContent = currency(subtotal);
  byId('discount').textContent = currency(discount);
  byId('total').textContent = currency(total);
}

function login() {
  const username = byId('loginUser').value.trim();
  const password = byId('loginPass').value.trim();
  const user = read(dbKeys.users, []).find((u) => u.username === username && u.password === password);

  if (!user) {
    alert('Credenciais inválidas.');
    return;
  }

  state.user = user;
  write(dbKeys.session, user);
  byId('loginModal').classList.add('hidden');
  renderAuthArea();
  renderOrders();
}

function logout() {
  state.user = null;
  write(dbKeys.session, null);
  byId('adminPanel').classList.add('hidden');
  renderAuthArea();
  renderOrders();
}

function toggleAdmin(open = false) {
  if (!state.user || !['admin', 'moderador'].includes(state.user.role)) {
    alert('Acesso restrito a admin/moderador.');
    return;
  }

  const panel = byId('adminPanel');
  if (open) panel.classList.remove('hidden');
  else panel.classList.toggle('hidden');

  renderAdminTab('produtos');
  document.querySelectorAll('.tabs button').forEach((btn) => {
    btn.onclick = () => renderAdminTab(btn.dataset.tab);
  });
}

function renderAdminTab(tab) {
  const target = byId('tabContent');

  if (tab === 'produtos') {
    target.innerHTML = `
      <div class="inline-form">
        <input id="pName" placeholder="Nome" />
        <input id="pCat" placeholder="Categoria" />
        <input id="pPrice" placeholder="Preço" type="number" min="0" step="0.01" />
        <input id="pDesc" placeholder="Descrição" />
        <button class="primary" id="saveProd">Salvar Produto</button>
      </div>
      <div>${read(dbKeys.products, []).map((p) => `<p>${p.id} - ${p.name} (R$ ${currency(p.price)})</p>`).join('')}</div>
    `;

    byId('saveProd').onclick = () => {
      const name = byId('pName').value.trim();
      const category = byId('pCat').value.trim();
      const price = Number(byId('pPrice').value);
      const description = byId('pDesc').value.trim();

      if (!name || !category || !Number.isFinite(price) || price <= 0 || !description) {
        alert('Preencha todos os campos corretamente.');
        return;
      }

      const products = read(dbKeys.products, []);
      products.push({ id: Date.now(), name, category, price, sold: 0, description });
      write(dbKeys.products, products);
      renderAll();
      renderAdminTab('produtos');
    };
  }

  if (tab === 'cupons') {
    target.innerHTML = `
      <div class="inline-form">
        <input id="cCode" placeholder="Cupom" />
        <input id="cVal" placeholder="%" type="number" min="1" max="100" />
        <button class="primary" id="saveCoupon">Salvar Cupom</button>
      </div>
      ${read(dbKeys.coupons, []).map((c) => `<p>${c.code} - ${c.value}%</p>`).join('')}
    `;

    byId('saveCoupon').onclick = () => {
      const code = byId('cCode').value.trim().toUpperCase();
      const value = Number(byId('cVal').value);
      if (!code || !Number.isFinite(value) || value < 1 || value > 100) {
        alert('Cupom inválido.');
        return;
      }

      const coupons = read(dbKeys.coupons, []);
      const alreadyExists = coupons.some((coupon) => coupon.code === code);
      if (alreadyExists) {
        alert('Este cupom já existe.');
        return;
      }

      coupons.push({ code, type: 'percent', value });
      write(dbKeys.coupons, coupons);
      renderAdminTab('cupons');
    };
  }

  if (tab === 'lotes') {
    target.innerHTML = `
      <div class="inline-form">
        <input id="batchProd" placeholder="Produto" />
        <input id="batchQty" type="number" min="1" placeholder="Quantidade" />
        <button class="primary" id="genBatch">Gerar lote QR</button>
      </div>
      <div id="batchList"></div>
    `;

    byId('genBatch').onclick = () => {
      const product = byId('batchProd').value.trim();
      const qty = Number(byId('batchQty').value);
      if (!product || !Number.isFinite(qty) || qty < 1) {
        alert('Preencha produto e quantidade válida.');
        return;
      }

      const batches = read(dbKeys.batches, []);
      const code = `HP-${Date.now().toString(36).toUpperCase()}`;
      batches.push({ code, product, qty, createdAt: new Date().toISOString() });
      write(dbKeys.batches, batches);
      renderAdminTab('lotes');
    };

    byId('batchList').innerHTML = read(dbKeys.batches, [])
      .map((batch) => `<div class="card"><p>${batch.product} - ${batch.code}</p><img alt="qr" src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${batch.code}"></div>`)
      .join('');
  }

  if (tab === 'pedidos') {
    const orders = read(dbKeys.orders, []);
    target.innerHTML = orders.length
      ? orders.map((order) => `<div class="card"><p>Pedido ${order.id} - ${order.status}</p><button class="ghost" onclick="advanceOrder('${order.id}')">Avançar Status</button></div>`).join('')
      : '<p>Sem pedidos.</p>';
  }
}

window.advanceOrder = function advanceOrder(id) {
  const statusFlow = ['Processando', 'Em separação', 'Enviado', 'Entregue'];
  const orders = read(dbKeys.orders, []);
  const order = orders.find((o) => o.id === id);
  if (!order) return;

  const current = statusFlow.indexOf(order.status);
  order.status = statusFlow[Math.min(current + 1, statusFlow.length - 1)];

  write(dbKeys.orders, orders);
  renderOrders();
  renderAdminTab('pedidos');
};

function applyCoupon() {
  const code = byId('couponInput').value.trim().toUpperCase();
  const coupon = read(dbKeys.coupons, []).find((c) => c.code === code);

  if (!coupon) {
    alert('Cupom inválido.');
    return;
  }

  state.appliedCoupon = coupon;
  renderCart();
}

async function trackPackage() {
  const code = byId('trackingCode').value.trim();
  if (!code) return;

  const result = byId('trackingResult');
  result.textContent = 'Consultando API...';

  try {
    const response = await fetch(`https://brasilapi.com.br/api/correios/v1/tracking/${code}`);
    if (!response.ok) throw new Error();
    const data = await response.json();
    result.textContent = JSON.stringify(data, null, 2);
  } catch {
    result.textContent = JSON.stringify({ codigo: code, status: 'Fallback local: Em trânsito', ultimaAtualizacao: new Date().toLocaleString('pt-BR') }, null, 2);
  }
}

function validateQr() {
  const code = byId('qrValidateInput').value.trim();
  const batches = read(dbKeys.batches, []);
  const validated = read(dbKeys.validated, []);

  if (!batches.some((batch) => batch.code === code)) {
    byId('qrValidateResult').textContent = 'Lote/QR não encontrado.';
    return;
  }

  if (validated.includes(code)) {
    byId('qrValidateResult').textContent = 'Este produto já foi validado e não pode ser validado novamente.';
    return;
  }

  validated.push(code);
  write(dbKeys.validated, validated);
  byId('qrValidateResult').textContent = 'Produto autêntico validado com sucesso! Registro salvo na database.';
}

function pixCheckout() {
  if (!state.user) {
    alert('Faça login para finalizar a compra.');
    return;
  }

  if (!state.cart.length) {
    alert('Carrinho vazio.');
    return;
  }

  const total = Number(byId('total').textContent.replace(',', '.'));
  const txid = `PIX-${Date.now()}`;
  const payload = `00020101021226850014br.gov.bcb.pix2563pix.horuspharma.com/txid/${txid}520400005303986540${total.toFixed(2)}5802BR5920HORUS PHARMA LTDA6009SAO PAULO62070503***6304ABCD`;

  byId('pixArea').classList.remove('hidden');
  byId('pixArea').innerHTML = `
    <p>TXID: ${txid}</p>
    <p>Copia e cola PIX:</p>
    <textarea>${payload}</textarea>
    <img alt="pix-qr" src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(payload)}">
    <button class="primary" id="confirmPix">Simular pagamento confirmado</button>
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
    renderCeo();
    alert('Pagamento PIX confirmado e pedido criado!');
  };
}

function renderOrders() {
  if (!state.user) {
    byId('ordersList').innerHTML = '<p>Faça login para ver seus pedidos.</p>';
    return;
  }

  const orders = read(dbKeys.orders, []).filter((order) => order.user === state.user.username);
  byId('ordersList').innerHTML = orders.length
    ? orders.map((order) => `<div class="card"><h4>${order.id}</h4><p>Status: ${order.status}</p><p>Rastreio: ${order.tracking}</p><p>Total: R$ ${currency(order.total)}</p></div>`).join('')
    : '<p>Você ainda não possui pedidos.</p>';
}

function renderCeo() {
  const products = read(dbKeys.products, []);
  const orders = read(dbKeys.orders, []);
  const users = read(dbKeys.users, []);
  const revenue = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);

  byId('ceoMetrics').innerHTML = `
    <div class="card"><h3>Receita total</h3><p>R$ ${currency(revenue)}</p></div>
    <div class="card"><h3>Pedidos</h3><p>${orders.length}</p></div>
    <div class="card"><h3>Produtos</h3><p>${products.length}</p></div>
    <div class="card"><h3>Usuários</h3><p>${users.length}</p></div>
  `;
}

function renderDb() {
  byId('databaseAccess').value = JSON.stringify({
    users: read(dbKeys.users, []),
    products: read(dbKeys.products, []),
    coupons: read(dbKeys.coupons, []),
    batches: read(dbKeys.batches, []),
    validated: read(dbKeys.validated, []),
    orders: read(dbKeys.orders, [])
  }, null, 2);
}

function initCarousel() {
  const slides = [...document.querySelectorAll('.slide')];
  const dots = byId('carouselDots');

  dots.innerHTML = slides
    .map((_, i) => `<button ${i === 0 ? 'class="active"' : ''} data-index="${i}"></button>`)
    .join('');

  dots.querySelectorAll('button').forEach((dot) => {
    dot.onclick = () => setSlide(Number(dot.dataset.index));
  });

  setInterval(() => setSlide((state.carousel + 1) % slides.length), 4500);
}

function setSlide(index) {
  state.carousel = index;
  document.querySelectorAll('.slide').forEach((slide, i) => slide.classList.toggle('active', i === index));
  byId('carouselDots').querySelectorAll('button').forEach((dot, i) => dot.classList.toggle('active', i === index));
}

function handleChat() {
  const input = byId('chatInput');
  const text = input.value.trim();
  if (!text) return;

  botMsg(`Você: ${text}`);

  const answer = /pedido|rastreio/i.test(text)
    ? 'Use a seção Rastreio e informe o código do pedido.'
    : /cupom|promo/i.test(text)
      ? 'Use HORUS10 para desconto inicial.'
      : 'Obrigado! Um atendente humano retornará em breve.';

  setTimeout(() => botMsg(`Bot: ${answer}`), 300);
  input.value = '';
}

function botMsg(message) {
  const box = byId('chatMessages');
  box.innerHTML += `<p>${message}</p>`;
  box.scrollTop = box.scrollHeight;
}

boot();
