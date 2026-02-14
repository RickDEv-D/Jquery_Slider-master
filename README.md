# Horus Pharma - E-commerce Farmacêutico (SPA + Rotas API)

Projeto com frontend (HTML/CSS/JS) e backend Node.js (sem dependências externas) para servir páginas e rotas de API.

## Estrutura gerada (arquivos e rotas)

- `server.js` → servidor principal
- `routes/auth.js` → rotas de autenticação
- `routes/products.js` → rotas de catálogo
- `routes/orders.js` → rotas de pedidos
- `routes/tracking.js` → rota de rastreio
- `data/seed.json` → dados iniciais
- `data/store.js` → leitura/escrita de banco local (`data/db.json`)

## Como rodar

### 1) entrar na pasta
```bash
cd /workspace/Jquery_Slider-master
```

### 2) iniciar servidor
```bash
npm start
```

### 3) abrir no navegador
- `http://localhost:8000`

## Rotas disponíveis

### Health
- `GET /api/health`

### Auth
- `POST /api/auth/login`
  - body: `{ "username": "admin", "password": "admin123" }`

### Produtos
- `GET /api/products`
- `GET /api/products?q=dipirona&category=Analgésicos&sort=priceAsc`
- `GET /api/products/:id`

### Pedidos
- `GET /api/orders`
- `GET /api/orders?user=usuario`
- `GET /api/orders/:id`
- `POST /api/orders`
  - body: `{ "user": "usuario", "items": [{"id":1,"qty":1}], "total": 14.9 }`

### Rastreio
- `GET /api/tracking/:code`

## Usuários de teste
- `admin / admin123`
- `moderador / mod123`
- `usuario / user123`
