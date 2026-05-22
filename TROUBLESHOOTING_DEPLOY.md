# 🔧 Troubleshooting Deployment — Agenda Inteligente

Documento oficial de errores encontrados y soluciones aplicadas durante el deployment en Cloudflare Workers.

---

## 📋 Índice

1. [Error: Asset too large (node_modules)](#error-asset-too-large)
2. [Error: Infinite loop in _redirects](#error-infinite-loop)
3. [Error: Unexpected fields in wrangler.toml](#error-unexpected-fields)
4. [Error: Invalid _redirects configuration](#error-invalid-redirects)
5. [Seguridad: Usar pnpm en lugar de npm](#security-pnpm)

---

## ❌ Error: Asset too large (node_modules)

### **Síntoma**
```
✘ [ERROR] Asset too large.
  Cloudflare Workers supports assets with sizes of up to 25 MiB.
  We found a file /opt/buildhome/repo/node_modules/workerd/bin/workerd with a size of 119 MiB.
```

### **Causa**
- Cloudflare Pages estaba intentando ejecutar `npx wrangler deploy`
- Esto instalaba wrangler en node_modules (119 MiB)
- Los assets incluían node_modules completo (excedía límite de 25 MiB)
- Pages no es adecuado para proyectos que requieren compilación

### **Solución Aplicada**

Cambiar de **Cloudflare Pages** a **Cloudflare Workers**:
- Workers puede servir archivos estáticos directamente
- No intenta instalar dependencias en assets
- Más control sobre qué se incluye

**En Cloudflare Dashboard:**
```
Pages → agenda-inteligente → Settings → Builds & deployments

Build command:      (VACÍO)
Deploy command:     (VACÍO)
```

**O directamente usar Workers:**
```bash
wrangler deploy
```

### **Prevención Futura**
✅ Usar `.assetsignore` para excluir `node_modules/`
✅ Usar `.gitignore` para excluir `node_modules/`
✅ No ejecutar `npm install` / `pnpm install` en Cloudflare (depende de cada proyecto)

---

## ❌ Error: Infinite loop in _redirects

### **Síntoma**
```
Invalid _redirects configuration:
Line 1: Infinite loop detected in this rule.
This would cause a redirect to strip `.html` or `/index` and end up triggering this rule again.
[code: 100324]
```

### **Causa**
```
# ❌ MAL
/* /index.html 200
```

Esta línea redirige TODO (incluyendo `/index.html`) a `/index.html`, causando un loop infinito.

### **Solución Aplicada**

Opción 1: Dejar vacío `_redirects` (Worker maneja routing):
```
# Simple SPA routing para Cloudflare Workers
# El Worker (_worker.js) maneja todo
```

Opción 2: Usar rutas explícitas (si usas Pages puro):
```
# ✅ BIEN - Rutas específicas
/index.html 200
/manifest.json 200
/sw.js 200
/assets/* 200

# Últimamente: SPA fallback (pero DESPUÉS de las rutas específicas)
/* /index.html 200
```

### **Prevención Futura**
✅ El `_worker.js` maneja SPA routing automáticamente
✅ No necesitas redirecciones complejas con Workers
✅ Si usas Pages, siempre excluye archivos estáticos explícitamente

---

## ❌ Error: Unexpected fields in wrangler.toml

### **Síntoma**
```
▲ [WARNING] Processing wrangler.toml configuration:
    - Unexpected fields found in build field: "upload"
    - Unexpected fields found in assets field: "0"
    - Unexpected fields found in top-level field: "type"
```

### **Causa**
```toml
# ❌ MAL - Sintaxis antigua/incorrecta
type = "javascript"
account_id = ""

[build.upload]
format = "modules"
main = "./_worker.js"

[[assets]]
binding = "ASSETS"
```

Wrangler 4.83+ cambió la sintaxis.

### **Solución Aplicada**

```toml
# ✅ BIEN - Sintaxis actual
name = "agenda-inteligente"
main = "_worker.js"
compatibility_date = "2026-05-22"
compatibility_flags = ["nodejs_compat"]

[assets]
binding = "ASSETS"
directory = "."
```

**Cambios clave:**
- Eliminar `type`, `account_id`, `workers_dev`
- `main` va en top-level, no en `[build.upload]`
- `[assets]` es una tabla simple, no array `[[assets]]`
- Eliminar campos `upload` innecesarios

### **Prevención Futura**
✅ Verificar versión de Wrangler: `wrangler --version`
✅ Consultar docs oficiales: https://developers.cloudflare.com/workers/wrangler/configuration/
✅ Usar `wrangler init` para generar configuración base
✅ Actualizar Wrangler cuando haya advertencias: `npm install -g wrangler@latest`

---

## ❌ Error: Invalid _redirects configuration (URLs)

### **Síntoma**
```
Invalid _redirects configuration:
Line 4: URLs should either be relative (e.g. begin with a forward-slash), 
or use HTTPS (e.g. begin with "https://".)
```

### **Causa**
```
# ❌ MAL - :notfound no es una URL válida
/*.png :notfound
/*.jpg :notfound
/*.svg :notfound
```

Cloudflare solo acepta URLs reales (con `/` o `https://`).

### **Solución Aplicada**

Eliminar redirecciones innecesarias y dejar que el Worker maneje el routing:

```
# ✅ BIEN
# Simple SPA routing para Cloudflare Workers
# El Worker (_worker.js) maneja todo
```

El `_worker.js` incluye:
```javascript
// Si no existe el archivo, intenta servir index.html (SPA)
if (!file.includes('.')) {
  const indexRequest = new Request(`${url.origin}/index.html`, request);
  return ASSETS(indexRequest, [env.ASSETS]);
}
```

### **Prevención Futura**
✅ Usar Worker (`_worker.js`) para SPA routing complejo
✅ Si usas Pages, mantén `_redirects` simple
✅ Evitar palabras clave especiales (`:notfound`, etc.) sin investigar sintaxis

---

## 🔒 Security: Usar pnpm en lugar de npm

### **Problema**
npm ha tenido históricamente vulnerabilidades de seguridad.

### **Solución Aplicada**

Migrar a **pnpm**:

```bash
# Instalar pnpm globalmente
npm install -g pnpm

# Usar pnpm para el proyecto
pnpm install
pnpm deploy
```

### **Ventajas de pnpm**
✅ **Más seguro** - Strict mode evita dependencias no declaradas
✅ **Más rápido** - 3x más rápido que npm
✅ **Menos espacio** - Hard links en lugar de copias
✅ **Mejor reproducibilidad** - `pnpm-lock.yaml` más confiable

### **Configuración en package.json**
```json
{
  "packageManager": "pnpm@9.0.0",
  "scripts": {
    "deploy": "wrangler deploy",
    "dev": "wrangler dev"
  }
}
```

### **Prevención Futura**
✅ Especificar `packageManager` en `package.json`
✅ Usar pnpm en nuevos proyectos Cloudflare
✅ Documentar: "Usa pnpm, no npm"

---

## 📊 Resumen de Cambios

| Archivo | Problema | Solución |
|---------|----------|----------|
| **Cloudflare Pages setup** | Asset too large | Migrar a Workers |
| **wrangler.toml** | Sintaxis obsoleta | Actualizar a Wrangler 4.83+ |
| **_redirects** | Loop infinito | Dejar Worker manejar routing |
| **_worker.js** | No existía | Crear servidor SPA estático |
| **package.json** | Usar npm inseguro | Migrar a pnpm |
| **pnpm-lock.yaml** | No presente | Generar con `pnpm install` |

---

## ✅ Deploy Final (Success)

```
✨ Success! Uploaded 9 files (1.14 sec)
Total Upload: 54.29 KiB / gzip: 14.51 KiB

Your Worker has access to the following bindings:
Binding            Resource
env.ASSETS         Assets
```

**URL Final:**
```
https://agenda-inteligente.uswebgo.workers.dev
```

---

## 🚀 Comando Correcto para Deploy

```bash
# 1. Instalar dependencias (una sola vez)
pnpm install

# 2. Desplegar a Cloudflare
pnpm deploy

# O equivalente:
wrangler deploy
```

---

## 📝 Checklist para Futuros Deployments

- [ ] Usar `pnpm` en lugar de `npm`
- [ ] Verificar `wrangler.toml` con docs actuales
- [ ] Incluir `_worker.js` para servir assets
- [ ] Mantener `_redirects` simple o vacío
- [ ] Ejecutar `pnpm install` antes de deploy
- [ ] Usar `wrangler deploy` (no `pnpm deploy`)
- [ ] Verificar que aparezcan los bindings (ASSETS)
- [ ] Probar app en URL final

---

## 🔗 Referencias Útiles

| Recurso | URL |
|---------|-----|
| Wrangler Docs | https://developers.cloudflare.com/workers/wrangler/ |
| Workers Configuration | https://developers.cloudflare.com/workers/wrangler/configuration/ |
| pnpm Docs | https://pnpm.io/ |
| Cloudflare Workers | https://developers.cloudflare.com/workers/ |
| Assets Static Files | https://developers.cloudflare.com/workers/wrangler/bundling/static-assets/ |

---

## 📞 Si Sigue Fallando

1. **Actualizar Wrangler:**
   ```bash
   pnpm add -D wrangler@latest
   ```

2. **Limpiar caché:**
   ```bash
   rm -rf .wrangler/
   pnpm install
   wrangler deploy
   ```

3. **Revisar logs detallados:**
   ```bash
   cat ~/.wrangler/logs/wrangler-*.log
   ```

4. **Contactar Cloudflare Support:**
   - Dashboard: https://dash.cloudflare.com/
   - Issue tracker: https://github.com/cloudflare/workers-sdk/issues

---

**Documento actualizado:** 2026-05-22  
**Versiones testeadas:**
- Wrangler: 4.83.0 → 4.93.1
- Node: 22.16.0
- pnpm: 9.0.0
