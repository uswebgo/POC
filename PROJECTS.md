# 📅 Agenda Inteligente Híbrida — Documentación de Proyectos

**IMPORTANTE**: Este documento registra TODOS los aspectos del proyecto. NO eliminar información sin actualizar aquí primero.

---

## 🎯 Proyecto Activo

### **Agenda Inteligente Híbrida**

| Propiedad | Valor |
|-----------|-------|
| **URL Principal** | https://agenda-inteligente.pages.dev |
| **Repositorio** | https://github.com/uswebgo/agenda-inteligente |
| **Rama** | main |
| **Tipo** | PWA estático + Google Apps Script |
| **Cloudflare** | Workers (Hybrid Mode - sirve assets + SPA routing) |
| **Google Apps Script** | Centralizado para eventos + emails + webhooks |
| **Base de datos** | Supabase PostgreSQL (principal) |

---

## 🏗️ Arquitectura Hybrid: Cloudflare Workers + Supabase

```
Cliente (navegador/móvil)
    │
    ▼
Cloudflare Workers (_worker.js)
    ├─ Sirve index.html (app principal)
    ├─ Maneja SPA routing (/events, /settings)
    ├─ Health check (/api/health)
    ├─ Headers de seguridad + cache control
    └─ PWA assets (manifest.json, sw.js)
         │
         ├──────────────────┬──────────────────┐
         ▼                  ▼                  ▼
    Supabase          Google Apps        Google Sheets
    PostgreSQL        Script             (auditoria)
    (datos vivos)     (webhooks          (opcional)
                      + emails)
```

---

## ✨ Funcionalidades

✅ **Crear eventos** (manual o por foto con IA)  
✅ **Repeticiones** (diaria, semanal, anual)  
✅ **Categorización** (Laboral, Colegio, Cumpleaños, Personal)  
✅ **Sincronización** con Google Sheets  
✅ **Notificaciones** automáticas por email (15 min antes)  
✅ **PWA instalable** en iOS/Android  
✅ **Funciona offline** (Service Worker)  
✅**Compartible en RRSS** (WhatsApp, Telegram, LinkedIn, Twitter)  

---

## 🌐 Rutas Principales

| Ruta | Método | Descripción |
|------|--------|-------------|
| `/` | GET | App principal (PWA) |
| `/admin/` | GET | (No implementado) |
| `/api/health` | GET | Health check |
| `/manifest.json` | GET | PWA manifest |

---

## 📦 Estructura de Archivos

```
agenda-inteligente/
├── index.html              # App principal (Tailwind CSS)
├── manifest.json           # PWA config + logos de Drive
├── sw.js                   # Service Worker (offline)
├── package.json            # Metadatos
├── .gitignore              # Git config
├── _headers                # Security + cache headers
├── _redirects              # SPA routing (Cloudflare Pages)
├── .github/
│   └── workflows/
│       └── deploy.yml      # (futuro: CI/CD)
├── Code.gs                 # Google Apps Script (backend)
├── README.md               # Documentación principal
├── CHECKLIST.md            # Setup paso a paso
├── PROJECTS.md             # Este archivo
└── deploy.bat              # Helper Windows (opcional)
```

---

## 🔑 Configuración Crítica

### Google Apps Script

**Línea 8 de Code.gs:**

```javascript
const EMAIL_DESTINO = 'j.castillo.bozo@gmail.com'; // Tu email aquí
```

**Deployment ID** (obtenido en Google Apps Script):
```
AKfycbwYHIpA0-QMBCEQfb2NKJDFt4MiWxNfWUDpnmiYzxrqx2m6dIJ-WZopRkLMMeD7Y3GALg
```

### Cloudflare Workers (wrangler.toml)

**CONFIGURACIÓN CORRECTA:**

```toml
# Archivo: wrangler.toml
name = "agenda-inteligente"
main = "_worker.js"
compatibility_date = "2026-05-22"
compatibility_flags = ["nodejs_compat"]

[assets]
directory = "."
binding = "ASSETS"
include = ["index.html", "manifest.json", "sw.js", "_headers", "_redirects"]
exclude = [".git", "node_modules", "*.md", "*.gs", ".wrangler"]
```

**Deploy:**
```bash
npm run deploy
# o
wrangler deploy
```

---

## 📱 Instalación en Dispositivos

### Android (Chrome)
1. Abre https://agenda-inteligente.pages.dev
2. Click icono **Instalar** (barra de dirección)
3. Confirma

### iOS (Safari)
1. Abre en Safari
2. **Compartir** → **Agregar a pantalla de inicio**
3. Confirma

---

## 🛠️ Desarrollo Local

### Ver cambios localmente

```bash
# Opción 1: Archivo directo
file:///C:/Users/LENOVO/Documents/Agenda Javi/index.html

# Opción 2: Servidor Python
cd "C:\Users\LENOVO\Documents\Agenda Javi"
python -m http.server 8000
# Abre http://localhost:8000
```

### Hacer cambios en el código

```bash
# 1. Edita los archivos
# 2. Commit a Git
git add .
git commit -m "feat: descripción del cambio"

# 3. Push a GitHub (Cloudflare Pages redeploy automático)
git push origin main

# 4. Para cambios en Code.gs:
# - Edita en Google Apps Script → Guardar
# - No requiere redeploy (se ejecuta al enviar evento)
```

---

## 📊 URLs Importantes

| Qué | URL |
|-----|-----|
| **App en vivo** | https://agenda-inteligente.pages.dev |
| **GitHub repo** | https://github.com/uswebgo/agenda-inteligente |
| **Google Sheet** | https://docs.google.com/spreadsheets/d/1fBeXBCztAIzcsblBBE4K8EjXrcFKjoxsEG9ZQzWZetY |
| **Google Apps Script** | Script ID: `AKfycbwYHIpA0-QMBCEQfb2NKJDFt4MiWxNfWUDpnmiYzxrqx2m6dIJ-WZopRkLMMeD7Y3GALg` |

---

## 🔐 Seguridad Implementada

| Capa | Mecanismo |
|------|-----------|
| **Frontend** | Validación de email + sanitización de inputs |
| **Service Worker** | CSP + cache-control + HSTS |
| **Backend (GAS)** | Email validation + timestamp + audit log en Sheet |
| **HTTPS** | Cloudflare Pages (automático) |
| **CORS** | No necesario (GAS acepta cualquier origen) |

---

## 🚨 Troubleshooting

| Síntoma | Causa | Solución |
|---------|-------|----------|
| `net::ERR_CONNECTION_CLOSED` | Supabase RLS policy bloqueando | Verificar RLS en Supabase → Events tabla → Policies |
| Worker no sirve archivos | Wrangler.toml mal configurado | Verificar `[assets]` section incluya todos archivos necesarios |
| App no sincroniza a Supabase | Deployment ID incorrecto | Verificar APPS_SCRIPT_WEBHOOK en wrangler.toml |
| Emails no llegan | Webhook no ejecutado | Verificar que Google Apps Script esté desplegado (`Deploy`) |
| Service Worker no funciona | Headers incorrectos | Verificar `_headers` incluye `Service-Worker-Allowed: /` |
| PWA no se instala | manifest.json incorrecto | Verificar manifest.json tiene `start_url: "/"` |
| Rutas SPA retornan 404 | SPA routing incorrecto | Verificar `_redirects` redirige todas rutas a `/index.html` |

---

## 📝 Checklist: Cambios Importantes

Antes de hacer cambios significativos:

- [ ] **¿Voy a eliminar información?** → CONSULTA PRIMERO
- [ ] **¿Cambio rutas de navegación?** → Actualizar README + PROJECTS.md
- [ ] **¿Modifico Code.gs?** → Documentar en el archivo
- [ ] **¿Cambio Deployment ID?** → Actualizar en index.html + PROJECTS.md
- [ ] **¿Configuración Cloudflare?** → Registrar en este documento

---

## 🚫 Política: Nunca Eliminar Sin Consultar

**ANTES DE ELIMINAR CUALQUIER COSA:**

1. **CONSULTA** — Mostrar qué se va a eliminar
2. **ESPERA APROBACIÓN** — No proceder sin confirmación
3. **DOCUMENTA** — Registra qué se eliminó y cuándo
4. **RECUPERA DE GIT** — Si es necesario: `git show <commit>:<archivo>`

Aplica a:
- ❌ Archivos de configuración
- ❌ Rutas en README/PROJECTS.md
- ❌ Google Apps Script functions
- ❌ Cualquier información documentada

**Razón:** Prevenir pérdida de información crítica.

---

## 📌 Historial de Cambios

| Fecha | Cambio | Rama |
|-------|--------|------|
| 2026-05-22 | Mejorar _worker.js (import al inicio, better error handling) | main |
| 2026-05-22 | Mejorar wrangler.toml (documentación clara, staging env) | main |
| 2026-05-22 | Mejorar package.json (scripts útiles, descripción actualizada) | main |
| 2026-05-22 | Mejorar _headers (HSTS, Service-Worker-Allowed, comentarios) | main |
| 2026-05-22 | Mejorar _redirects (documentación de SPA routing) | main |
| 2026-05-22 | Actualizar CLOUDFLARE_SETUP.md (arquitectura Hybrid Mode) | main |
| 2026-05-22 | Actualizar PROJECTS.md (Workers, no Pages; Supabase principal) | main |
| 2026-05-22 | Integración Supabase PostgreSQL (migración de Sheets) | main |
| 2026-05-22 | Google Apps Script webhooks para sincronización | main |
| 2026-05-15 | UI con Tailwind CSS + PWA instalable | main |
| 2026-05-15 | Inicial: GitHub + Cloudflare Workers setup | main |

---

## 🤝 Contacto

- **Email**: j.castillo.bozo@gmail.com
- **WhatsApp**: (agregar si es necesario)
- **GitHub**: uswebgo

---

## ✅ Estado Actual

```
✅ App en vivo (HTTPS) - Cloudflare Workers
✅ PWA instalable (iOS/Android)
✅ Supabase PostgreSQL (datos principal)
✅ Sincronización con Google Calendar
✅ Notificaciones por email (Google Apps Script)
✅ Funciona offline (Service Worker)
✅ Compartible en RRSS
✅ SPA routing robusto
✅ Health check endpoint (/api/health)
✅ Arquitectura documentada (Hybrid Mode)
⏳ Dashboard admin (futuro)
⏳ Multi-usuario (futuro)
⏳ Autenticación en rutas /admin/ (futuro)
```
