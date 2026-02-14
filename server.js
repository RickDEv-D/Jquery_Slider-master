const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const { login } = require('./routes/auth');
const { listProducts, getProduct } = require('./routes/products');
const { listOrders, getOrder, createOrder } = require('./routes/orders');
const { getTracking } = require('./routes/tracking');

const PORT = process.env.PORT || 8000;
const rootDir = __dirname;

function sendJson(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
}

function getBody(req) {
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (chunk) => { raw += chunk; });
    req.on('end', () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        resolve({});
      }
    });
  });
}

function serveStatic(reqPath, res) {
  let filePath = path.join(rootDir, reqPath === '/' ? 'index.html' : reqPath);

  if (!filePath.startsWith(rootDir)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(rootDir, 'index.html');
  }

  const ext = path.extname(filePath).toLowerCase();
  const typeMap = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.json': 'application/json; charset=utf-8'
  };

  res.writeHead(200, { 'Content-Type': typeMap[ext] || 'application/octet-stream' });
  fs.createReadStream(filePath).pipe(res);
}

const server = http.createServer(async (req, res) => {
  const parsed = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = parsed.pathname;

  if (pathname === '/api/health' && req.method === 'GET') {
    return sendJson(res, 200, { ok: true, service: 'horus-pharma-api' });
  }

  if (pathname === '/api/auth/login' && req.method === 'POST') {
    const body = await getBody(req);
    const result = login(body);
    return sendJson(res, result.status, result.data);
  }

  if (pathname === '/api/products' && req.method === 'GET') {
    const query = Object.fromEntries(parsed.searchParams.entries());
    const result = listProducts(query);
    return sendJson(res, result.status, result.data);
  }

  if (pathname.startsWith('/api/products/') && req.method === 'GET') {
    const id = pathname.split('/').pop();
    const result = getProduct(id);
    return sendJson(res, result.status, result.data);
  }

  if (pathname === '/api/orders' && req.method === 'GET') {
    const query = Object.fromEntries(parsed.searchParams.entries());
    const result = listOrders(query);
    return sendJson(res, result.status, result.data);
  }

  if (pathname === '/api/orders' && req.method === 'POST') {
    const body = await getBody(req);
    const result = createOrder(body);
    return sendJson(res, result.status, result.data);
  }

  if (pathname.startsWith('/api/orders/') && req.method === 'GET') {
    const id = pathname.split('/').pop();
    const result = getOrder(id);
    return sendJson(res, result.status, result.data);
  }

  if (pathname.startsWith('/api/tracking/') && req.method === 'GET') {
    const code = pathname.split('/').pop();
    const result = getTracking(code);
    return sendJson(res, result.status, result.data);
  }

  return serveStatic(pathname, res);
});

server.listen(PORT, () => {
  console.log(`Horus Pharma rodando em http://localhost:${PORT}`);
});
