# ⚙️ Configuración Cloudflare — Agenda Inteligente v2

## 🏗️ Arquitectura Actual: Hybrid Mode

**Agenda Inteligente usa Cloudflare Workers (no Pages puro):**

```
┌─────────────────────────────────────────────┐
│ Cliente (Navegador / App Móvil)             │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│ Cloudflare Workers (_worker.js)             │
│ ├─ Sirve archivos estáticos (index.html)    │
│ ├─ Maneja SPA routing (/events, /settings)  │
│ ├─ Health check (/api/health)               │
│ └─ Seguridad headers                        │
└────────────────┬────────────────────────────┘
                 │
          ┌──────┴───────┐
          ▼              ▼
    ┌──────────┐  ┌────────────────┐
    │ Supabase │  │ Google Apps    │
    │ (datos)  │  │ Script (email) │
    └──────────┘  └────────────────┘
```

**¿Por qué Workers y no Pages puro?**

✅ Más control sobre rutas y SPA routing
✅ Health check endpoint (`/api/health`)
✅ Headers y redirects configurables
✅ Preparado para futuras APIs
✅ Mejor manejo de errores
✅ Mismo resultado que Pages, pero más flexible

---

## 🚀 Deployment

### Opción 1: Local Development
```bash
npm run dev
# Abre http://localhost:8787
```

### Opción 2: Production Deploy
```bash
npm run deploy
# Se ejecuta: wrangler deploy
# Publica en Cloudflare Workers
```

### Opción 3: Staging (Testing)
```bash
npm run deploy:preview
# Desplega en ambiente staging para testing
```

---

## 📋 Verificación Post-Deploy

### Health Check
```bash
curl https://agenda-inteligente.pages.dev/api/health

# Respuesta esperada:
{
  "status": "ok",
  "timestamp": "2026-05-22T...",
  "app": "agenda-inteligente",
  "version": "2.0.0"
}
```

### Headers
```bash
curl -I https://agenda-inteligente.pages.dev

# Deberías ver:
# X-Content-Type-Options: nosniff
# X-Frame-Options: SAMEORIGIN
# Strict-Transport-Security: max-age=31536000
```

### App Funcional
1. Abre https://agenda-inteligente.pages.dev
2. Verifica que puedas:
   - Crear eventos
   - Ver lista de eventos
   - Navegar sin errores (SPA routing)
   - Service Worker activo (offline mode)

---

## ⚙️ Archivos Clave

| Archivo | Propósito |
|---------|-----------|
| `_worker.js` | Servidor Cloudflare Workers (SPA routing) |
| `wrangler.toml` | Configuración de Workers |
| `_headers` | Headers HTTP de seguridad + cache |
| `_redirects` | SPA routing (fallback a index.html) |
| `index.html` | App principal (PWA) |
| `sw.js` | Service Worker (offline + caching) |
| `manifest.json` | PWA manifest (instalable) |

---

## 🛠️ Troubleshooting

| Problema | Causa | Solución |
|----------|-------|----------|
| `net::ERR_CONNECTION_CLOSED` | RLS policies bloqueando | Verificar en Supabase RLS settings |
| App muestra error en console | CORS desde Supabase | Supabase CORS ya configurable por defecto |
| Service Worker no funciona | Headers incorrectos | Verificar `_headers` (incluye Service-Worker-Allowed) |
| Rutas de SPA 404 | SPA routing incorrecto | Verificar `_redirects` redirige todo a index.html |
| Health check falla | Worker no desplegado | Ejecutar `npm run deploy` |

---

## 📚 Referencias

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [KV Asset Handler](https://developers.cloudflare.com/workers/runtime-apis/kv/static-assets/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/cli-wrangler/)

---

## ✨ Resultado Final

```
✅ App en vivo: https://agenda-inteligente.pages.dev
✅ Deploy con: npm run deploy
✅ Dev local: npm run dev
✅ Health check: /api/health
✅ HTTPS automático (Cloudflare)
✅ Global CDN
✅ $0/mes
✅ Arquitectura clara y documentada
```

**¡Deployment listo!** 🚀
