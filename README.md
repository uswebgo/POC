# 📅 Agenda Inteligente Híbrida

Aplicación **Progressive Web App (PWA)** inteligente para planificación con sincronización en Google Sheets, notificaciones automáticas y funcionamiento offline.

## ⚡ Inicio Rápido (5 min)

1. **Google Apps Script**: Copia `Code.gs` → Desplegar como "Ejecución web"
2. **Copiar Deployment ID** (algo como `AKfycbzX...`)
3. **Abre la app**: https://agenda-inteligente.pages.dev
4. **Configuración**: Email + Deployment ID
5. **Activa Triggers**: Google Sheet → Menú 📅 → ⚙️ Configurar

## ✨ Características

✅ **Interfaz responsiva** - Diseño optimizado para móviles (iOS/Android)  
✅ **PWA Install** - Se instala como app nativa en el celular  
✅ **Google Sheets Integration** - Respaldo automático de eventos  
✅ **GmailApp Notifications** - Recordatorios por email (15 min antes)  
✅ **Funcionamiento Offline** - Service Worker para acceso sin internet  
✅ **Carga por IA** - Importar eventos desde fotos (Gemini)  
✅ **Compartir en RRSS** - Comparte la app con WhatsApp, Telegram, etc.  
✅ **Botones persistentes** - Navegación tipo app móvil en la parte inferior

---

## 🚀 Deployment en Cloudflare Pages

### Opción 1: Desde GitHub (Recomendado)

#### Paso 1: Crear repositorio en GitHub

```bash
# Clonar o crear el repo localmente
git clone https://github.com/tu-usuario/agenda-inteligente.git
cd agenda-inteligente

# Inicializar Git si es nuevo
git init
git add .
git commit -m "Initial commit: Agenda Inteligente v2.0"
git branch -M main
git remote add origin https://github.com/tu-usuario/agenda-inteligente.git
git push -u origin main
```

#### Paso 2: Conectar con Cloudflare Pages

1. Ve a [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Click en **Pages** en el menú lateral
3. Click en **Crear un proyecto**
4. Selecciona **Conectar a Git**
5. Autoriza GitHub
6. Selecciona tu repositorio `agenda-inteligente`
7. En **Configuración del proyecto**:
   - **Rama de producción**: `main`
   - **Comando de compilación**: Déjalo vacío (son archivos estáticos)
   - **Directorio de salida**: `.` (carpeta raíz)
8. Click en **Guardar e implementar**

✅ Tu app estará disponible en: `https://agenda-inteligente.pages.dev`

### Opción 2: Deployment Manual

```bash
# Instalar Wrangler CLI
npm install -g wrangler

# Login en Cloudflare
wrangler login

# Deployar archivos
wrangler pages publish .
```

---

## 🔧 Configuración del Apps Script

### Paso 1: Desplegar el Apps Script

1. Ve a tu Google Sheet: `https://docs.google.com/spreadsheets/d/1fBeXBCztAIzcsblBBE4K8EjXrcFKjoxsEG9ZQzWZetY`
2. **Herramientas** → **Editor de secuencias de comandos**
3. Limpia el código y pega el contenido de `Code.gs`
4. **Guardar** (Ctrl+S)
5. Click en **Desplegar** → **Nuevo despliegue**
6. Tipo: **Ejecución web**
7. Ejecutar como: Tu cuenta
8. Quién tiene acceso: **Cualquiera**
9. **Desplegar** y **COPIA EL ID**

### Paso 2: Configurar en el HTML

1. Abre tu app en Cloudflare Pages (o `index.html` localmente)
2. Ve a **⚙️ Configuración**
3. **Tu Correo**: tu.email@gmail.com
4. **ID Función Apps Script**: Pega el ID del Paso 1
5. Click en **💾 Guardar Configuración**

### Paso 3: Activar Triggers

1. Vuelve al Google Sheet
2. Menú **📅 Agenda** → **⚙️ Configurar Triggers Automáticos**
3. ✅ Listo. Verificará notificaciones cada 10 minutos

---

## 📱 Instalar como App

### iOS (Safari)
1. Abre la URL en Safari
2. Click en **Compartir** → **Agregar a pantalla de inicio**
3. Pon el nombre y listo

### Android (Chrome)
1. Abre la URL en Chrome
2. Click en el icono **Instalar** (parte inferior)
3. Confirma y listo

---

## 🎯 Cómo Usar

### Agregar Evento Manual
1. Tab **✍️ Manual**
2. Completa título, categoría, fecha
3. Selecciona repetición (opcional)
4. Click **➕ Guardar en Agenda**

### Cargar Eventos desde Foto
1. Tab **🤖 Foto IA**
2. Click **📋 Copiar Instrucciones**
3. Abre [Gemini](https://gemini.google.com)
4. Pega las instrucciones y sube tu foto
5. Copia el JSON que genera Gemini
6. Pégalo en el textarea y click **✅ Procesar**

### Compartir la App
- Click en **Compartir** (parte inferior)
- Usa WhatsApp, Telegram, LinkedIn, etc.

---

## 📊 Estructura de Archivos

```
agenda-inteligente/
├── index.html           # Aplicación principal (Tailwind CSS)
├── manifest.json        # Configuración PWA
├── sw.js               # Service Worker (offline)
├── Code.gs             # Google Apps Script (Sheets + emails)
├── _redirects          # Configuración Cloudflare Pages
├── package.json        # Metadatos del proyecto
├── .gitignore          # Archivos a ignorar en Git
└── README.md           # Este archivo
```

---

## 🔒 Seguridad

- ✅ **Sin almacenar credenciales** - GmailApp desde Apps Script
- ✅ **Sin EmailJS** - Gmail nativo más seguro
- ✅ **Datos en Google Sheets** - Tu propia cuenta
- ✅ **PWA estándar** - Sin necesidad de backend externo

---

## 🐛 Solución de Problemas

### No aparece el botón "Instalar"
- Asegúrate que la URL sea HTTPS
- En Cloudflare Pages siempre es HTTPS
- Prueba en Chrome (mejor soporte PWA)

### Los emails no llegan
1. Verifica el email en la configuración
2. En Google Apps Script → **Ejecuciones** → busca errores
3. Prueba función `probarEnvio()` en Apps Script

### El Google Sheet no sincroniza
- Verifica que el ID del Apps Script sea correcto
- Recarga la página del HTML
- Verifica console (F12) para errores

### Los eventos desaparecen
- localStorage es local del navegador/app
- Google Sheet es el respaldo permanente
- Si desinstala la app, revisa el Sheet

---

## 📈 Performance

- **Tamaño**: < 50KB (sin librerías externas)
- **Carga**: < 1 segundo
- **Offline**: Completamente funcional
- **Actualizaciones**: Automáticas vía Service Worker

---

## 📝 Notas

- Los eventos se guardan **localmente primero** (rápido)
- Se **sincronizan con Sheets** en background
- Las notificaciones se verifican **cada 10 minutos**
- Puedes cambiar esto en `MARGEN_NOTIFICACION` en `Code.gs`

---

## 🔄 Actualizaciones Futuras

- [ ] Sincronización bidireccional con Sheets
- [ ] Búsqueda y filtrado avanzado
- [ ] Exportar a iCal
- [ ] Integración con Google Calendar
- [ ] Notificaciones push nativas

---

## 📄 Licencia

MIT - Libre para usar y modificar

---

## 🎉 ¡Listo!

Tu Agenda Inteligente Híbrida está funcionando. Comparte con tus amigos, instálala como app y disfruta de la planificación inteligente.

**URL de Cloudflare Pages:**
```
https://agenda-inteligente.pages.dev
```

Reemplaza con tu nombre y dominio personalizado si lo deseas.
