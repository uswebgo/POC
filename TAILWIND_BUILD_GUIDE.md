# 🎨 Tailwind CSS Build Guide

## Status Actual (v2.4+)

- **Método**: Tailwind CDN con `defer` (optimizado)
- **Performance**: ~50KB gzipped (aceptable para MVP)
- **Warning**: "should not be used in production" (minor, no impacta funcionalidad)

---

## 🚀 Opción: Compilar Tailwind Localmente (Futuro)

Si necesitas compilación local completa, aquí están los archivos ya preparados:

- `tailwind.config.js` ✅ Configuración lista
- `postcss.config.js` ✅ PostCSS configurado
- `input.css` ✅ Directivas de Tailwind

### ¿Por qué no funcionó el build ahora?

Conflicto entre **Windows + pnpm + bash** en el ejecutable de Tailwind CLI.

### Soluciones alternativas:

#### **Opción A: Usar Windows PowerShell (NO Bash)**
```powershell
# Ejecutar en PowerShell (no WSL/Git Bash)
pnpm run build:css
```

#### **Opción B: Usar Vite (Recomendado)**
Si quieres un setup completo:
```bash
pnpm create vite@latest --template vanilla
# Luego mover los archivos HTML/JS
```

#### **Opción C: Usar Docker**
```bash
docker run -it -v $(pwd):/app node:20 bash
cd /app && npm run build:css
```

#### **Opción D: Online Compilador**
Usa https://play.tailwindcss.com para compilar input.css y descargar style.css

---

## 📋 Scripts Disponibles

```bash
# Dev con watch (compilar mientras editas)
pnpm run build:css:watch

# Build una sola vez
pnpm run build:css

# Deploy (incluye build automático)
pnpm run deploy
```

---

## 🎯 Cuándo Compilar

**Compila Tailwind cuando:**
- ✅ Tienes muchas páginas (optimización de CSS)
- ✅ Necesitas zero CDN dependencies
- ✅ Tienes velocidad de descarga limitada
- ✅ Quieres máxima performance en producción

**NO necesitas compilar cuando:**
- ❌ Es un MVP/prototipo (ahora)
- ❌ La app es pequeña
- ❌ Tienes buena conectividad
- ❌ El CDN es suficiente (Cloudflare lo es)

---

## 📊 Comparación

| Métrica | CDN | Compilado |
|---------|-----|-----------|
| Setup Time | ⚡ Inmediato | ⏱️ 5 min |
| Build Time | N/A | ⚡ <1 seg |
| CSS Size | 50KB | ~10KB |
| Performance | ✅ Rápido | ✅ Más rápido |
| Production Warnings | ⚠️ 1 warning | ✅ None |
| Offline Support | ❌ No | ✅ Sí |
| Mantenimiento | ✅ Simple | ⚠️ More config |

---

## 🔗 Recursos

- [Tailwind Docs - Installation](https://tailwindcss.com/docs/installation)
- [PostCSS Docs](https://postcss.org/)
- [pnpm Scripts](https://pnpm.io/package_json#scripts)

---

## 📝 Notas

- Los archivos de configuración ya están preparados
- Solo necesitas ejecutar en el entorno correcto (PowerShell o sin WSL)
- El CDN actual es suficiente para la mayoría de casos
- Migra a compilación cuando la app crezca

**Status actual: ✅ Optimizado con CDN + defer loading**
