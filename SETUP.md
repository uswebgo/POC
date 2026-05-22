# 📅 CONFIGURACIÓN COMPLETA - Agenda Inteligente Híbrida

## Paso 1: Crear el Apps Script en tu Google Sheet

1. **Abre el Google Sheet** con ID: `1fBeXBCztAIzcsblBBE4K8EjXrcFKjoxsEG9ZQzWZetY`
   - Si no existe, créalo en Google Drive

2. **Crea el Apps Script**:
   - Ve a **Herramientas** → **Editor de secuencias de comandos**
   - Se abrirá una nueva pestaña
   - Limpia el código que aparece por defecto
   - Copia TODO el contenido del archivo `Code.gs` (arriba)
   - Pega en el editor
   - **Guarda** el proyecto (Ctrl+S)

---

## Paso 2: Desplegar la Función Web

1. En el editor de Apps Script, click en **"Desplegar"** (arriba a la derecha)
2. Selecciona **"Nuevo despliegue"**
3. En el tipo, selecciona **⚙️ Ejecución web**
4. Configura:
   - **Ejecutar como**: Tu cuenta de Google
   - **Quién tiene acceso**: Cualquiera
5. Click en **"Desplegar"**
6. **COPIA EL ID DE DESPLIEGUE** (ejemplo: `AKfycbzX...`)
   - Es muy importante, lo necesitarás en el siguiente paso

---

## Paso 3: Configurar el HTML

1. **Abre el archivo `index.html`** en tu navegador
2. En la sección **"⚙️ Configuración"**:
   - **Tu Correo**: Ingresa tu email de Gmail (donde recibirás notificaciones)
   - **ID de la Función Apps Script**: Pega el ID que copiaste en el Paso 2
3. Click en **"💾 Guardar Configuración"**

---

## Paso 4: Activar las Notificaciones Automáticas

1. Vuelve al **Google Sheet**
2. Se verá un nuevo menú **📅 Agenda** en la barra superior
3. Click en **"⚙️ Configurar Triggers Automáticos"**
4. Aparecerá un aviso confirmando que las verificaciones se ejecutarán cada 10 minutos

---

## Paso 5: Probar que Todo Funciona

### Opción A: Prueba Manual
1. En Google Apps Script, ve a **Ejecución** → **Ejecutar** (función: `probarEnvio`)
2. Se enviará un email de prueba a tu correo Gmail

### Opción B: Crea un Evento de Prueba
1. En el HTML, ve a **✍️ Manual / Rutinas**
2. Crea un evento con:
   - Título: "Evento de Prueba"
   - Hora: 15 minutos en el futuro
   - Click en **"Guardar en Agenda"**
3. Espera máximo 10 minutos (o fuerza verificación manual desde el Sheet)

---

## 🎯 Cómo Usar la Aplicación

### Agregar Eventos Manualmente
1. Ve a **✍️ Manual / Rutinas**
2. Completa los campos
3. Selecciona si se repite (diaria, semanal, anual)
4. Click en **"Guardar en Agenda"**
5. El evento se guarda localmente Y en el Google Sheet como respaldo

### Agregar Eventos desde Foto (IA)
1. Ve a **🤖 Carga por Foto (IA)**
2. Click en **"📋 Copiar instrucciones para la IA"**
3. Abre **Google Gemini** (gemini.google.com)
4. Pega las instrucciones en el chat
5. Sube una foto de tu calendario/horario
6. Copia la respuesta JSON que genera Gemini
7. Pégala en el textarea del HTML
8. Click en **"Procesar e Importar Eventos"**

### Notificaciones
- Se envían automáticamente **15 minutos antes** de cada evento
- Las notificaciones llegan por email (desde GmailApp)
- El estado se actualiza en el Google Sheet

---

## 📊 Ver Estadísticas

En el Google Sheet:
1. Abre el menú **📅 Agenda**
2. Click en **"📊 Ver Estadísticas"**
3. Verás:
   - Total de eventos guardados
   - Notificaciones enviadas
   - Eventos pendientes

---

## 🔧 Solución de Problemas

### No aparece el menú "Agenda" en el Sheet
- Recarga la página del Google Sheet
- O abre el Apps Script y presiona la función `onOpen()` manualmente

### Los emails no llegan
1. Verifica que tu email está bien configurado en el HTML
2. En Google Apps Script, ve a **Ejecuciones** y busca errores
3. Prueba con `probarEnvio()` para enviar un email de test

### El HTML no se conecta con Apps Script
1. Verifica que el ID de despliegue sea correcto (largo de 50+ caracteres)
2. Asegúrate de que seleccionaste "Cualquiera" en permisos al desplegar
3. Recarga el HTML (Ctrl+Shift+R)

### Los eventos no aparecen en el Sheet
1. Abre el Google Sheet
2. Busca una hoja llamada "Eventos"
3. Si no existe, crea una manualmente (el script la creará automáticamente al primer evento)

---

## 📱 Usar en tu Móvil

- Accede al `index.html` desde el navegador móvil
- Guarda un acceso directo en la pantalla de inicio
- Funciona offline con localStorage, sincroniza cuando hay conexión

---

## 🔐 Seguridad

✅ Tus emails de Gmail se envían desde la plataforma de Google (no se almacenan credenciales)
✅ Los datos se guardan en tu propio Google Sheet
✅ No necesitas claves de EmailJS (más seguro que el código anterior)
✅ Todo es privado en tu cuenta de Google

---

## 📝 Notas Importantes

- Los eventos se guardan **localmente en el navegador** (localStorage)
- El Google Sheet es un **respaldo** de seguridad
- Las notificaciones se verifican **cada 10 minutos** (configurable)
- Para cambiar el margen de notificación, edita `MARGEN_NOTIFICACION` en Code.gs

---

## 🆘 Contacto / Ayuda

Si algo no funciona:
1. Abre la consola del navegador (F12) para ver errores
2. En Google Apps Script, revisa **Ejecuciones** para logs
3. Verifica que todo esté configurado en orden: Email, Script ID, Triggers

**¡Listo! Tu Agenda Inteligente Híbrida está funcionando.** 🎉
