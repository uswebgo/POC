# 🔗 Configuración del Webhook - Google Apps Script

## Estado Actual

- ⚠️ **Webhook desactivado temporalmente** (causa CORS 404)
- ✅ App funciona perfectamente sin el webhook
- El webhook es **opcional** - solo envía notificaciones a Google Apps Script

## Problema Actual

Cuando `importarJSON()` intenta notificar al webhook:
```
Access to fetch at 'https://script.google.com/macros/s/[ID]/exec?action=verificarNotificaciones' 
has been blocked by CORS policy
```

**Causa:** El Apps Script no devuelve headers CORS o el endpoint no está publicado correctamente.

## Solución

### Opción A: Deshabilitar Webhook (Actual)
El webhook está comentado en `index.html` línea 931-932.
- ✅ App funciona sin errores
- ✅ JSON se importa correctamente
- ⚠️ No hay notificaciones a Apps Script

### Opción B: Configurar CORS en Google Apps Script
Para habilitar el webhook, necesitas:

1. **En `Code.gs`, agregar función CORS:**
```javascript
function doOptions(e) {
  return ContentService.createTextOutput()
    .setMimeType(ContentService.MimeType.JSON);
}
```

2. **Publicar Apps Script como Web App:**
   - Deploy → Nuevo Deploy
   - Tipo: Web app
   - Ejecutar como: Tu cuenta
   - Quién tiene acceso: Todos

3. **Verificar que el endpoint responde:**
   - Abre en navegador: `https://script.google.com/macros/s/[ID]/exec?action=test`
   - Debe devolver algo (no 404)

4. **Descomenta el webhook en `index.html` línea 931-932**

### Opción C: Usar POST con Apps Script (más robusto)
En lugar de GET con CORS, usar POST sin necesidad de CORS preflight:
```javascript
fetch(APPS_SCRIPT_WEBHOOK, {
    method: 'POST',
    mode: 'no-cors',
    body: JSON.stringify({ action: 'verificarNotificaciones' })
})
```

## Variables de Entorno

```javascript
// En index.html línea ~480
const APPS_SCRIPT_WEBHOOK = 'https://script.google.com/macros/s/AKfycbzC-Nc-B2zFTjcAl63ZMgX0i2EskdwxNBIW8B0Nc_MyJvYd_dqhcDe88rGvk__yOceIxg/exec';
```

## Cuándo Necesitas el Webhook

✅ **Usa webhook cuando:**
- Quieras sincronizar automáticamente con Google Calendar
- Necesites enviar notificaciones por email
- Quieras ejecutar acciones en Google Sheets

❌ **No necesitas webhook si:**
- Solo usas Supabase para datos
- No necesitas notificaciones automáticas
- La app es para uso local/personal

## Testing del Webhook

```javascript
// En consola del navegador, verifica si funciona:
fetch('https://script.google.com/macros/s/[TU-ID]/exec?action=test')
    .then(r => r.text())
    .then(console.log)
    .catch(e => console.error('CORS Error:', e));
```

## Archivos Relacionados

- `index.html` - Línea 931-932 (llamada webhook)
- `Code.gs` - Google Apps Script principal
- `APPS_SCRIPT_WEBHOOK` - URL del endpoint

## Estado Producción

| Componente | Estado | Notas |
|-----------|--------|-------|
| JSON Import | ✅ | Funciona perfectamente |
| Webhook | ⚠️ | Desactivado (CORS) |
| Supabase | ✅ | Sincronización funcionando |
| Google Calendar | ✅ | Manual (botón en app) |

---

**Última actualización:** 2026-05-22  
**Estado:** Documentado para implementación futura
