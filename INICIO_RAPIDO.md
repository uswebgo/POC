# ⚡ INICIO RÁPIDO - Agenda Inteligente Híbrida

## 1️⃣ Configurar Google Apps Script (5 min)

### Paso 1: Abre el Sheet
- Abre: https://docs.google.com/spreadsheets/d/1fBeXBCztAIzcsblBBE4K8EjXrcFKjoxsEG9ZQzWZetY/edit

### Paso 2: Crea el Apps Script
- **Herramientas** → **Editor de secuencias de comandos**
- Copia TODO de `Code.gs` → Pega en el editor
- **Ctrl+S** (Guardar)

### Paso 3: Desplega la función web
1. Click **Desplegar** (arriba a la derecha)
2. **Nuevo despliegue**
3. Tipo: **Ejecución web**
4. Ejecutar como: Tu cuenta
5. Acceso: **Cualquiera**
6. **Desplegar**
7. **COPIA EL ID** (parece: `AKfycbzX...`)

---

## 2️⃣ Subir a GitHub (3 min)

```bash
# Abre terminal en la carpeta del proyecto
cd "C:\Users\LENOVO\Documents\Agenda Javi"

# Inicializa Git
git init
git add .
git commit -m "Agenda Inteligente v2.0"
git branch -M main

# Crea repo vacío en GitHub.com primero
# Luego conecta:
git remote add origin https://github.com/tu-usuario/agenda-inteligente.git
git push -u origin main
```

---

## 3️⃣ Desplegar en Cloudflare Pages (2 min)

1. Ve a https://dash.cloudflare.com/
2. **Pages** → **Crear proyecto**
3. **Conectar a Git** → Selecciona `agenda-inteligente`
4. Configuración:
   - **Rama**: `main`
   - **Comando de compilación**: Déjalo vacío
   - **Directorio de salida**: `.`
5. **Guardar e implementar**

✅ Tu URL: `https://agenda-inteligente.pages.dev`

---

## 4️⃣ Configurar la App (1 min)

1. Abre tu URL de Cloudflare Pages
2. **⚙️ Configuración**:
   - **Tu Correo**: `tu.email@gmail.com`
   - **ID Apps Script**: El que copiaste en Paso 1
3. **💾 Guardar**

---

## 5️⃣ Activar Notificaciones (1 min)

1. Vuelve al **Google Sheet**
2. Menú **📅 Agenda** → **⚙️ Configurar Triggers**
3. ✅ Listo. Las verificaciones corren cada 10 min

---

## ✅ ¡LISTO! 

Tu app está funcionando:
- ✨ Interfaz móvil responsiva con Tailwind
- 📲 Puedes instalarla como app
- 💾 Sincroniza con Google Sheets
- 📧 Envía notificaciones por email
- 🔄 Funciona offline

### URLs Importantes:
- **App en vivo**: https://agenda-inteligente.pages.dev
- **Google Sheet**: https://docs.google.com/spreadsheets/d/1fBeXBCztAIzcsblBBE4K8EjXrcFKjoxsEG9ZQzWZetY
- **GitHub Repo**: https://github.com/tu-usuario/agenda-inteligente

---

## 🆘 Si algo no funciona:

**Los emails no llegan:**
- Verifica que el email esté bien configurado
- En Google Apps Script → **Ejecuciones** → busca errores

**La app no sincroniza:**
- Verifica el ID del Apps Script
- Recarga con F5
- Abre la consola (F12) para ver errores

**No puedo instalar como app:**
- Asegúrate de estar en HTTPS (Cloudflare Pages lo es)
- En móvil, busca el icono de "Instalar" o "Más opciones"
- Funciona mejor en Chrome

---

## 📱 Usar en el Celular

### iOS (iPhone/iPad):
1. Abre en Safari
2. Click **Compartir** → **Agregar a pantalla de inicio**
3. ¡Listo!

### Android:
1. Abre en Chrome
2. Click en el icono **Instalar** (abajo)
3. ¡Listo!

---

## 🎯 Siguientes Pasos:

- [ ] Crea algunos eventos de prueba
- [ ] Prueba cargar un horario por foto (Gemini)
- [ ] Instala la app en tu celular
- [ ] Comparte la URL con tus amigos
- [ ] Ajusta el margen de notificación si lo necesitas

**¡Disfruta tu Agenda Inteligente!** 📅✨
