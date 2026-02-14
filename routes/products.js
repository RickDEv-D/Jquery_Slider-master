const { readDb } = require('../data/store');

function listProducts(query) {
  const { q = '', category = '', sort = '' } = query;
  const db = readDb();

  let products = db.products.filter((p) => {
    const byName = p.name.toLowerCase().includes(String(q).toLowerCase());
    const byCategory = !category || p.category === category;
    return byName && byCategory;
  });

  if (sort === 'priceAsc') products.sort((a, b) => a.price - b.price);
  if (sort === 'priceDesc') products.sort((a, b) => b.price - a.price);
  if (sort === 'bestSellers') products.sort((a, b) => b.sold - a.sold);

  return { status: 200, data: products };
}

function getProduct(id) {
  const db = readDb();
  const product = db.products.find((p) => p.id === Number(id));
  if (!product) return { status: 404, data: { error: 'Produto não encontrado' } };
  return { status: 200, data: product };
}

module.exports = { listProducts, getProduct };
