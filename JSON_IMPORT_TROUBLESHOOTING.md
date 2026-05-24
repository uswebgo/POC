# 🔧 Troubleshooting: Importar JSON con Comillas Inteligentes

## Problema Original

**Error:** `SyntaxError: Expected property name or '}' in JSON at position 2`

Cuando intentabas importar JSON generado por ChatGPT o Word, obtenías este error aunque el JSON parecía estar correctamente formado.

## Causa Raíz

ChatGPT y algunos editores generan **comillas "inteligentes" (curvy quotes)** en lugar de comillas normales:
- `"` (U+201C - LEFT DOUBLE QUOTATION MARK) → comilla izquierda
- `"` (U+201D - RIGHT DOUBLE QUOTATION MARK) → comilla derecha
- `'` (U+2018 - LEFT SINGLE QUOTATION MARK) 
- `'` (U+2019 - RIGHT SINGLE QUOTATION MARK)

El `JSON.parse()` solo acepta comillas rectas `"`, por lo que rechaza el JSON con códigos Unicode 8220/8221.

## Solución Implementada

En la función `importarJSON()` (línea 895 en index.html):

```javascript
// Normalizar comillas inteligentes y caracteres especiales
let cleanText = '';
for(let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if(code === 8220 || code === 8221) cleanText += '"'; // "" → "
    else if(code === 8216 || code === 8217) cleanText += "'"; // '' → '
    else if(code === 160) cleanText += ' '; // nbsp → space
    else cleanText += text[i];
}
```

### Qué hace:
1. **Itera cada carácter** del JSON de entrada
2. **Detecta códigos Unicode específicos:**
   - `8220, 8221` → comillas inteligentes → reemplaza con `"`
   - `8216, 8217` → apóstrofes inteligentes → reemplaza con `'`
   - `160` → non-breaking space → reemplaza con espacio normal
3. **Preserva el resto del JSON** sin cambios
4. Limpia markdown (` ``` `) y espacios en blanco

## Cómo Usar

1. **Copia JSON de cualquier fuente** (ChatGPT, Word, Google Docs, etc.)
2. **Pégalo en el textarea** "Pega JSON aquí..."
3. Haz click en **📥 Importar JSON**
4. ✅ Funciona automáticamente

## Ejemplos que Ahora Funcionan

### ✅ Válido - ChatGPT con comillas inteligentes
```json
[{"titulo":"Turno Santander","categoria":"Laboral","fecha":"2026-05-25T11:30:00","duracion_minutos":510}]
```

### ✅ Válido - Word/Google Docs
```json
[{"titulo": "Evento", "categoria": "Personal", "fecha": "2026-05-25T10:00:00"}]
```

### ✅ Válido - Comillas normales (siempre funcionó)
```json
[{"titulo":"Test","categoria":"Laboral","fecha":"2026-05-25T11:00:00"}]
```

## Debugging

Si aún así tienes problemas:
1. Abre **F12 → Console**
2. Haz click en **📥 Importar JSON**
3. Busca el log **"JSON a parsear:"**
4. Si ves caracteres raros, revisa los códigos Unicode en la sección de debug

## Caracteres Especiales Soportados

| Problema | Código | Solución |
|----------|--------|----------|
| Comilla izquierda inteligente | 8220 | → `"` |
| Comilla derecha inteligente | 8221 | → `"` |
| Apóstrofe izquierdo inteligente | 8216 | → `'` |
| Apóstrofe derecho inteligente | 8217 | → `'` |
| Non-breaking space | 160 | → espacio normal |

## Versión Actual

- ✅ Implementado en: `index.html` línea 895-911
- ✅ Probado con: JSON generado por ChatGPT, Word, Google Docs
- ✅ Estado: Funcionando correctamente

---

**Última actualización:** 2026-05-22  
**Documentado por:** Claude Haiku  
**Sesión:** JSON Import Fix
