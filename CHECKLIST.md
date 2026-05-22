# ✅ CHECKLIST - Agenda Inteligente Híbrida

## 📋 Antes de Empezar
- [ ] Tienes una cuenta de Google
- [ ] Tienes una cuenta de GitHub
- [ ] Tienes una cuenta de Cloudflare (gratis)
- [ ] Git instalado en tu PC

---

## 🎯 FASE 1: Google Apps Script (10 min)

### Preparación
- [ ] Abre Google Sheet: https://docs.google.com/spreadsheets/d/1fBeXBCztAIzcsblBBE4K8EjXrcFKjoxsEG9ZQzWZetY/edit
- [ ] Si es la primera vez, hazlo una copia o dale acceso a tu cuenta

### Crear el Script
- [ ] Ve a **Herramientas** → **Editor de secuencias de comandos**
- [ ] Limpia el código por defecto
- [ ] Copia TODO de `Code.gs`
- [ ] Pégalo en el editor
- [ ] **Ctrl+S** (Guardar)

### Desplegar
- [ ] Click **Desplegar** (arriba derecha)
- [ ] **Nuevo despliegue**
- [ ] Tipo: **Ejecución web**
- [ ] Ejecutar como: Tu cuenta Google
- [ ] Acceso: **Cualquiera**
- [ ] Click **Desplegar**
- [ ] **COPIA Y GUARDA EL ID DE DESPLIEGUE** (es largo, tipo AKfycbzX...)

### Verificar
- [ ] En el Apps Script, ve a **Ejecuciones**
- [ ] Deberías ver al menos 1 ejecución exitosa
- [ ] En Google Sheet, aparece menú **📅 Agenda**
- [ ] Prueba: Menú → **📊 Ver Estadísticas** (debe funcionar)

---

## 🌐 FASE 2: GitHub (10 min)

### Preparar Repositorio Local
- [ ] Abre terminal/PowerShell en: `C:\Users\LENOVO\Documents\Agenda Javi`
- [ ] Ejecuta:
  ```bash
  git init
  git add .
  git commit -m "Agenda Inteligente v2.0 - Inicial"
  git branch -M main
  ```

### Crear Repositorio en GitHub
- [ ] Ve a https://github.com/new
- [ ] Nombre: `agenda-inteligente`
- [ ] Descripción: "Aplicación inteligente de planificación con Google Sheets"
- [ ] Privado o Público (a tu gusto)
- [ ] **Create repository**
- [ ] Copia la URL (HTTPS)

### Conectar y Push
- [ ] En terminal:
  ```bash
  git remote add origin [LA-URL-QUE-COPIASTE]
  git push -u origin main
  ```
- [ ] Recarga GitHub en el navegador
- [ ] Deberías ver todos los archivos

### Verificar
- [ ] Todos los archivos visibles en GitHub
- [ ] Rama `main` es default
- [ ] README.md se ve bien formateado

---

## 🚀 FASE 3: Cloudflare Pages (5 min)

### Conectar Cloudflare con GitHub
- [ ] Ve a https://dash.cloudflare.com/
- [ ] Click en **Pages** (lado izquierdo)
- [ ] Click en **Crear proyecto**
- [ ] **Conectar a Git** → Autoriza GitHub
- [ ] Selecciona: `tu-usuario/agenda-inteligente`

### Configurar Despliegue
- [ ] **Rama de producción**: `main`
- [ ] **Comando de compilación**: (déjalo VACÍO)
- [ ] **Directorio de salida**: `.` (punto)
- [ ] **Guardar e implementar**
- [ ] Espera a que termine (1-2 min)

### Obtener URL
- [ ] Tu sitio está en: `https://agenda-inteligente.pages.dev`
- [ ] O un dominio personalizado si lo deseas
- [ ] Visita la URL → deberías ver tu app

### Verificar Deployment
- [ ] [ ] La app se carga
- [ ] [ ] El logo aparece
- [ ] [ ] Los botones funcionan
- [ ] [ ] Se ve bien en móvil (F12 → responsive)

---

## ⚙️ FASE 4: Configurar la App (5 min)

### Abrir la App
- [ ] Abre: `https://agenda-inteligente.pages.dev`
- [ ] (O `file:///C:/Users/LENOVO/Documents/Agenda Javi/index.html` localmente)

### Configuración Inicial
- [ ] Sección **⚙️ Configuración**
- [ ] **Tu Correo**: Tu email de Gmail (ej: javi@gmail.com)
- [ ] **ID Función Apps Script**: Pega el ID que copiaste en Fase 1
- [ ] Click **💾 Guardar Configuración**
- [ ] Recarga la página (F5)

### Activar Triggers
- [ ] Ve al Google Sheet
- [ ] Menú **📅 Agenda** → **⚙️ Configurar Triggers Automáticos**
- [ ] Click en OK
- [ ] Verás un mensaje de éxito

### Verificar
- [ ] [ ] El mensaje de configuración se guardó
- [ ] [ ] Aparece el menú en el Google Sheet
- [ ] [ ] Mensaje de triggers configurados

---

## 📱 FASE 5: Pruebas (10 min)

### Test 1: Crear Evento Manual
- [ ] Tab **✍️ Manual**
- [ ] Título: "Test Evento"
- [ ] Categoría: "Personal"
- [ ] Fecha: 5 minutos en el futuro
- [ ] Click **➕ Guardar en Agenda**
- [ ] Deberías ver:
  - [ ] Evento en la lista abajo
  - [ ] Status "Sincronizando..." en la header
  - [ ] El evento aparece en el Google Sheet

### Test 2: Email de Notificación
- [ ] En Google Apps Script, ve a **Ejecución** → **Ejecutar**
- [ ] Busca la función `probarEnvio()`
- [ ] Click en play
- [ ] Espera 1-2 segundos
- [ ] Revisa tu email (puede tardar unos minutos)
- [ ] Deberías recibir un email de prueba

### Test 3: Instalación en Móvil
- [ ] Abre la URL en tu celular (Android/iOS)
- [ ] **Android Chrome**: Busca icono "Instalar" en la barra
- [ ] **iOS Safari**: Compartir → Agregar a pantalla de inicio
- [ ] Verifica que aparezca el logo correcto
- [ ] Abre la app instalada

### Test 4: Funcionalidad Offline
- [ ] Activa modo avión en el móvil
- [ ] Abre la app instalada
- [ ] Debería cargar desde el caché
- [ ] Prueba crear un evento offline
- [ ] Desactiva modo avión
- [ ] El evento debería sincronizarse

---

## 🎯 FASE 6: Uso Real (Opcional)

### Crear Algunos Eventos
- [ ] Planifica tu semana
- [ ] Usa diferentes categorías
- [ ] Prueba repeticiones (diaria, semanal)
- [ ] Agrega notas descriptivas

### Probar Carga por IA
- [ ] Tab **🤖 Foto IA**
- [ ] Click **📋 Copiar Instrucciones**
- [ ] Ve a https://gemini.google.com
- [ ] Pega las instrucciones
- [ ] Sube una foto de tu calendario/horario
- [ ] Copia la respuesta JSON
- [ ] Vuelve a la app y pégala
- [ ] Click **✅ Procesar e Importar**

### Compartir la App
- [ ] Click botón **Compartir** (abajo)
- [ ] Comparte con amigos por WhatsApp, Telegram, etc.
- [ ] Verifica que el preview se vea bien en RRSS

---

## 🔧 FASE 7: Mantenimiento (Después)

### Hacer Cambios
- [ ] Edita los archivos localmente
- [ ] `git add .`
- [ ] `git commit -m "Descripción del cambio"`
- [ ] `git push origin main`
- [ ] Cloudflare automáticamente redeploy (1-2 min)

### Cambiar Dominio
- [ ] Si compraste un dominio: Cloudflare Pages → Custom domain
- [ ] Verifica que funcione correctamente

### Monitorear
- [ ] Revisa Google Sheet periódicamente
- [ ] En Google Apps Script → Ejecuciones → verificar errores
- [ ] Prueba notificaciones mensualmente

---

## ❌ TROUBLESHOOTING

### El Apps Script no funciona
- [ ] Verifica que el archivo Code.gs esté completo
- [ ] Ve a **Ejecuciones** en Google Apps Script → busca errores
- [ ] Prueba la función `probarEnvio()`
- [ ] Si hay error de permisos, autentica la app

### La app no sincroniza
- [ ] Verifica que el ID del Apps Script sea correcto (mínimo 50 caracteres)
- [ ] Abre consola del navegador (F12) → busca errores
- [ ] El ID debe ser de un "Ejecución web", no de la app

### No recibo emails
- [ ] Verifica que tu email esté bien escrito
- [ ] Revisa la carpeta de Spam
- [ ] En Google Apps Script → Ejecuciones → busca errores
- [ ] Prueba `probarEnvio()` primero

### El icono no se ve
- [ ] Los IDs de Google Drive están correctos:
  - Logo: `1eQJlngZSouUJxarOvjBuB0ZuwN66jrPR`
  - Social: `1cAkrJpNh5KgpJ1tQnQktHniWrLMX6NO4`
- [ ] Las imágenes deben ser públicas (compartidas)
- [ ] Prueba acceso directo: `https://lh3.googleusercontent.com/d/1eQJlngZSouUJxarOvjBuB0ZuwN66jrPR`

### No puedo instalar como app
- [ ] Debe ser HTTPS (Cloudflare Pages lo es)
- [ ] En Chrome: busca el icono "Instalar" (abajo)
- [ ] En Safari: Compartir → Agregar a pantalla de inicio
- [ ] Si no aparece, fuerza recarga (Ctrl+Shift+R)

---

## ✨ ¡LISTO!

Si completaste TODO, tu **Agenda Inteligente Híbrida** está 100% funcional:

✅ Aplicación en vivo en Cloudflare Pages  
✅ Sincronización con Google Sheets  
✅ Notificaciones automáticas por email  
✅ Instalable como app móvil  
✅ Funciona offline  
✅ Código en GitHub  
✅ Compartible en RRSS  

🎉 **¡Felicidades!** Tu app está lista.

---

**Preguntas?** Revisa:
- README.md - Documentación completa
- INICIO_RAPIDO.md - Pasos rápidos
- ESTRUCTURA.txt - Cómo funciona todo

**Última actualización:** Mayo 2026
