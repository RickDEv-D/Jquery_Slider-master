const { readDb, writeDb } = require('../data/store');

function listOrders(query) {
  const { user } = query;
  const db = readDb();
  if (!user) return { status: 200, data: db.orders };
  return { status: 200, data: db.orders.filter((o) => o.user === user) };
}

function getOrder(id) {
  const db = readDb();
  const order = db.orders.find((o) => o.id === id);
  if (!order) return { status: 404, data: { error: 'Pedido não encontrado' } };
  return { status: 200, data: order };
}

function createOrder(body) {
  const { user, items = [], total = 0 } = body || {};
  if (!user || !Array.isArray(items) || !items.length) {
    return { status: 400, data: { error: 'Pedido inválido' } };
  }

  const db = readDb();
  const order = {
    id: `PED-${Date.now()}`,
    user,
    items,
    total,
    status: 'Processando',
    tracking: `TRK${Date.now().toString().slice(-8)}`,
    createdAt: new Date().toISOString()
  };

  db.orders.push(order);
  writeDb(db);
  return { status: 201, data: order };
}

module.exports = { listOrders, getOrder, createOrder };
