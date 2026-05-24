# 🔄 Service Worker Versioning Guide

## 📌 ¿Por Qué?

El Service Worker cachea archivos para funcionar offline. Pero cuando haces deploy de nuevos cambios, los usuarios veían la versión vieja en su móvil hasta que limpiaban el caché manualmente.

**Solución:** Versioning automático del cache.

---

## 🔧 Cómo Funciona

### Sistema Actual (v2.4+)

```javascript
// En sw.js
const CACHE_VERSION = '2026-05-22-2';  // ← INCREMENTAR EN CADA DEPLOY
const CACHE_NAME = `agenda-${CACHE_VERSION}`;
```

**Cuando cambias CACHE_VERSION:**
1. El SW detecta que hay un caché nuevo
2. Elimina automáticamente el caché viejo
3. Descarga y cachea los nuevos archivos
4. Recarga la página automáticamente en el cliente

---

## 📝 Pasos para Cada Deploy

### Antes de hacer `npm run deploy` o `git push`:

1. **Abre sw.js**
2. **Encuentra la línea:**
   ```javascript
   const CACHE_VERSION = '2026-05-22-2';
   ```
3. **Incrementa la versión:**
   ```javascript
   // Opción A: Cambiar timestamp
   const CACHE_VERSION = '2026-05-22-3';

   // Opción B: Cambiar fecha (recomendado)
   const CACHE_VERSION = '2026-05-22-v1';
   ```
4. **Guarda el archivo**
5. **Haz commit:**
   ```bash
   git add sw.js
   git commit -m "chore: actualizar Service Worker cache version"
   ```
6. **Deploy:**
   ```bash
   npm run deploy
   ```

---

## ✅ Resultado

**En el móvil del usuario:**
- ✅ Se detecta el nuevo cache automáticamente
- ✅ Se descarga la versión nueva
- ✅ Se recarga la página sola
- ✅ **SIN que el usuario tenga que hacer nada**

---

## 🔍 Verificación

### En DevTools (PC):
```
F12 → Application → Service Workers
Deberías ver el nuevo cache registrado
```

### En Consola:
```
✅ Service Worker registrado
🔄 Nueva versión disponible
🔄 SW Actualizado a versión: 2026-05-22-2
```

### En Móvil:
```
- Toast: "Nueva versión disponible - Recargando..."
- Se recarga automáticamente
- Ya ve los cambios nuevos
```

---

## 📋 Cambios de Versioning

| Cambio | Necesita Versioning? |
|--------|----------------------|
| index.html actualizado | ✅ SÍ |
| sw.js actualizado | ✅ SÍ |
| style CSS nuevo | ✅ SÍ |
| JavaScript cambios | ✅ SÍ |
| Supabase schema | ❌ NO (es BD, no caché) |
| Documentación (.md) | ❌ NO (no se sirve) |

---

## 🎯 Convencion de Versiones

Elige uno:

### Opción 1: Timestamp + Número
```
2026-05-22-1  // Primera actualización hoy
2026-05-22-2  // Segunda actualización hoy
2026-05-22-3  // Etc.
```

### Opción 2: Semantic Versioning
```
agenda-2.4.0
agenda-2.4.1  // Bugfix
agenda-2.5.0  // Nueva feature
```

### Opción 3: Hash o ID
```
agenda-abc123
agenda-def456
```

**Recomendación:** Usa Timestamp (Opción 1) porque es fácil de seguir.

---

## ⚙️ Comportamiento Automático

### Cuando hay CACHE_VERSION nueva:

```
Client (móvil)
    ↓
    Detecta nuevo SW
    ↓
    Borra caché viejo
    ↓
    Descarga caché nuevo
    ↓
    Recarga página automáticamente ← SIN intervención del usuario
    ↓
    Muestra versión nueva
```

---

## 🔧 Solución Manual (Si es Necesario)

Si el auto-update no funciona:

**En móvil:**
```
1. Chrome → Settings → Site settings → Apps (Agenda Inteligente)
2. Clear cache and cookies
3. Refrescar página
```

Pero **NO debería ser necesario** con el versioning automático.

---

## 📝 Nota Importante

**SIEMPRE incrementa CACHE_VERSION cuando:**
- Cambias index.html (HTML nuevo)
- Cambias sw.js (lógica nueva)
- Cambias estilos CSS (actualización visual)
- Cambias JavaScript (nuevas funciones)

**NO necesita incremento cuando:**
- Cambias solo la BD (Supabase schema)
- Cambias solo documentación (.md)
- Cambias solo configuración de Cloudflare

---

## 🚀 Ventajas

✅ **Automático** - No requiere que el usuario limpie caché  
✅ **Transparente** - El usuario no ve nada raro  
✅ **Rápido** - Se actualiza en segundos  
✅ **Confiable** - Siempre obtiene la versión correcta  
✅ **Sin Downtime** - Funciona offline mientras se actualiza  

---

## 📚 Referencias

- [Service Workers MDN](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Cache Busting Strategies](https://developers.google.com/web/tools/workbox/modules/workbox-strategies)
- [PWA Best Practices](https://developers.google.com/web/fundamentals/architecture/app-shell)
