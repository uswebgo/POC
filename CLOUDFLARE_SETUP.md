# ⚙️ Configuración Cloudflare Pages — Agenda Inteligente

**IMPORTANTE**: Cloudflare Pages para sitios **estáticos** NO usa wrangler.toml.  
Si ves errores de build, es porque está intentando ejecutar comandos de deploy incorrectos.

---

## ✅ Configuración Correcta (MANUAL)

### 1. Dashboard de Cloudflare

1. Ve a: https://dash.cloudflare.com/
2. **Pages** → **agenda-inteligente**
3. Click en **Settings** (arriba)
4. Click en **Builds & deployments** (izquierda)

### 2. Cambiar Build Settings

**IMPORTANTE: Estos campos deben quedar VACÍOS o en valores por defecto**

```
Build command:           [DÉJALO VACÍO] ← Click en X si tiene algo
Build output directory:  [DÉJALO VACÍO] o . (punto)
Root directory:          / (slash)
Deploy command:          [DÉJALO VACÍO] ← Click en X si tiene algo
```

### 3. Guardar

Click en **Save** (esquina superior derecha).

---

## 🚀 Qué sucede después

1. Cloudflare **automáticamente redeployará** con los nuevos settings
2. Espera ~30-60 segundos
3. Verifica el **Build log** → Status debe ser ✅ **Success**

---

## 📋 Checklist

- [ ] Settings → Builds & deployments abierto
- [ ] "Build command" está VACÍO
- [ ] "Deploy command" está VACÍO
- [ ] "Root directory" es `/`
- [ ] Click en Save
- [ ] Status cambió a "Building..."
- [ ] Esperar a que termine (30-60 seg)
- [ ] Status ahora es ✅ Success
- [ ] App accesible en https://agenda-inteligente.pages.dev

---

## 🔍 Verificación

Cuando esté deployado, deberías ver:

```bash
curl -I https://agenda-inteligente.pages.dev

HTTP/2 200
Content-Type: text/html; charset=UTF-8
x-content-type-options: nosniff
x-frame-options: SAMEORIGIN
cache-control: public, max-age=3600, must-revalidate
```

---

## ❌ Si sigue fallando

### 1. Verificar que NO hay archivos "wrangler"

```bash
cd "C:\Users\LENOVO\Documents\Agenda Javi"
ls *.toml  # No debe haber nada
ls *.json  # Solo package.json (sin wrangler.json)
```

### 2. Limpiar git

```bash
# Si agregaste wrangler.toml antes, eliminarlo del historio:
git rm --cached wrangler.toml
git commit -m "remove: wrangler.toml"
git push origin main
```

### 3. Hard reset en Cloudflare

- Ve a Pages → agenda-inteligente
- Botón "..." (3 puntos) → **Clear build cache**
- Trigger a new deployment (el botón de play)

### 4. Si aún falla

Contacta a Cloudflare Support con:
- URL: https://dash.cloudflare.com/
- Proyecto: agenda-inteligente
- Error en Build log: [copiar y pegar el error]

---

## 🎯 Por qué funciona así

| Tipo de Proyecto | Herramienta | Build | Deploy |
|---|---|---|---|
| **Static Site (Nuestro caso)** | Cloudflare Pages | ❌ No | ✅ Automático |
| **Next.js / React** | Cloudflare Pages | ✅ `npm run build` | ✅ Automático |
| **Cloudflare Worker** | Wrangler + Workers | ✅ Wrangler build | ✅ `wrangler deploy` |
| **API Backend** | Node / Python | ✅ npm install | ✅ Manual |

**La Agenda Inteligente es un sitio estático** (HTML + JS vanilla + CSS Tailwind via CDN).  
Cloudflare Pages lo detecta automáticamente y lo sirve tal cual.

---

## 📚 Referencias

- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Build settings](https://developers.cloudflare.com/pages/platform/builds/build-configuration/)
- [Wrangler (NO necesario para Pages estático)](https://developers.cloudflare.com/workers/cli-wrangler/)

---

## ✨ Resultado Final

Una vez configurado correctamente:

```
✅ Tu app está en: https://agenda-inteligente.pages.dev
✅ Auto-deploy con cada git push
✅ HTTPS automático
✅ Global CDN
✅ $0/mes
```

**¡Listo!** No hay más errores de build. 🎉
