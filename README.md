# Horus Pharma - E-commerce Farmacêutico (Front-end SPA)

Aplicação front-end em HTML/CSS/JS puro com:
- login com níveis (`usuario`, `moderador`, `admin`)
- painel administrativo para produtos, cupons, lotes e pedidos
- catálogo com busca/filtros/mais vendidos
- carrinho + cupom + checkout PIX simulado
- rastreio (API com fallback)
- validação de autenticidade por QR (uso único)
- chatbot "Fale Conosco"
- layout responsivo com menu web e bottom nav mobile

## Como pôr para rodar (passo a passo)

### 1) Entrar na pasta do projeto
```bash
cd /workspace/Jquery_Slider-master
```

### 2) Subir um servidor local
```bash
python3 -m http.server 8000 --bind 0.0.0.0 --directory /workspace/Jquery_Slider-master
```

### 3) Abrir no navegador
- `http://localhost:8000`
- se estiver em container remoto, use também `http://127.0.0.1:8000`

### 4) Encerrar o servidor
No terminal do servidor: `Ctrl + C`

## Usuários de teste
- `admin / admin123`
- `moderador / mod123`
- `usuario / user123`

## Dicas rápidas (se não abrir)
- Verifique se a porta está ocupada:
```bash
lsof -i :8000
```
- Se estiver ocupada, rode em outra porta (ex.: 8010):
```bash
python3 -m http.server 8010 --bind 0.0.0.0 --directory /workspace/Jquery_Slider-master
```
- Depois abra: `http://localhost:8010`

## Observações
- Os dados são persistidos em `localStorage`.
- Seeds de produtos/cupons são migrados automaticamente por versão da aplicação.
