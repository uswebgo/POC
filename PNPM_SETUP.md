# 📦 pnpm Setup — Agenda Inteligente

**pnpm** es un gestor de paquetes más seguro, rápido y eficiente que npm.

---

## ✅ Instalación de pnpm

### **Opción 1: Usando npm (una sola vez)**

```bash
npm install -g pnpm
```

### **Opción 2: Usando Homebrew (Mac/Linux)**

```bash
brew install pnpm
```

### **Opción 3: Usando Scoop (Windows)**

```bash
scoop install pnpm
```

### **Opción 4: Descargar del sitio oficial**

https://pnpm.io/installation

---

## 🚀 Usar pnpm en el proyecto

### **1. Instalar dependencias**

```bash
cd "C:\Users\LENOVO\Documents\Agenda Javi"
pnpm install
```

### **2. Desplegar a Cloudflare**

```bash
pnpm deploy
```

---

## 📊 Comparativa

| Aspecto | npm | pnpm | yarn |
|---------|-----|------|------|
| **Seguridad** | ⚠️ Vulnerabilidades históricas | ✅ Más seguro | ✅ Seguro |
| **Velocidad** | 🐢 Normal | 🚀 Muy rápido (3x) | ⚡ Rápido |
| **Espacio en disco** | 📦 Mucho | 💾 Poco (hard links) | 📦 Normal |
| **Dependencias fantasma** | ❌ Sí | ✅ No | ✅ No |
| **Reproducibilidad** | ⚠️ A veces | ✅ Garantizada | ✅ Garantizada |

---

## 🔐 Por qué pnpm es más seguro

1. **Strict mode** — No permite dependencias no declaradas
2. **Hard links** — Los paquetes se comparten (no duplicados)
3. **No acceso a node_modules innecesarios** — Aislamiento mejor

---

## 📝 Comandos comunes

```bash
# Instalar dependencias
pnpm install

# Agregar un paquete
pnpm add nombre-paquete

# Agregar como dev
pnpm add -D nombre-paquete

# Eliminar paquete
pnpm remove nombre-paquete

# Actualizar paquetes
pnpm update

# Ejecutar script
pnpm deploy
pnpm dev

# Limpiar caché
pnpm store prune
```

---

## ✨ Resultado

Una vez instales pnpm y ejecutes `pnpm install`:

```
✅ Dependencias instaladas de forma segura
✅ Proyecto listo para desplegar
✅ pnpm-lock.yaml generado (git add)
✅ node_modules con hard links (espacio eficiente)
```

---

## 🚀 Próximo paso

```bash
pnpm deploy
```

¡Y tu Worker estará en vivo! 🎉
