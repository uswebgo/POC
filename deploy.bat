@echo off
chcp 65001 >nul
cls
echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║          📅 Agenda Inteligente - Deploy Assistant              ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

:menu
echo Selecciona una opción:
echo.
echo 1. Inicializar Git (primera vez)
echo 2. Subir cambios a GitHub
echo 3. Instalar Wrangler (CLI de Cloudflare)
echo 4. Ver instrucciones de Cloudflare Pages
echo 5. Abrir Google Sheet
echo 6. Ver este proyecto en GitHub
echo.
set /p opcion="Opción (1-6): "

if "%opcion%"=="1" goto git_init
if "%opcion%"=="2" goto git_push
if "%opcion%"=="3" goto install_wrangler
if "%opcion%"=="4" goto cloudflare_info
if "%opcion%"=="5" goto open_sheet
if "%opcion%"=="6" goto open_github
goto menu

:git_init
echo.
echo Inicializando repositorio Git...
git init
git add .
git commit -m "Agenda Inteligente v2.0 - Inicial"
git branch -M main
echo.
echo ✓ Git inicializado. Ahora debes:
echo   1. Crear repositorio vacío en GitHub.com
echo   2. Ejecutar: git remote add origin https://github.com/tu-usuario/agenda-inteligente.git
echo   3. Ejecutar: git push -u origin main
echo.
pause
goto menu

:git_push
echo.
echo ¿Cuál es tu mensaje de commit?
set /p msg="Mensaje: "
git add .
git commit -m "%msg%"
git push origin main
echo.
echo ✓ Cambios subidos a GitHub
echo.
pause
goto menu

:install_wrangler
echo.
echo Instalando Wrangler CLI...
npm install -g wrangler
echo.
echo ✓ Wrangler instalado. Ahora ejecuta:
echo   wrangler login
echo   wrangler pages publish .
echo.
pause
goto menu

:cloudflare_info
echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║              PASOS PARA CLOUDFLARE PAGES                       ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
echo 1. Ve a https://dash.cloudflare.com/
echo 2. Click en "Pages" del menú lateral
echo 3. "Crear un proyecto" > "Conectar a Git"
echo 4. Autoriza GitHub y selecciona "agenda-inteligente"
echo 5. Configuración:
echo    - Rama: main
echo    - Comando compilación: (déjalo vacío)
echo    - Directorio salida: .
echo 6. "Guardar e implementar"
echo.
echo Tu dominio será: https://agenda-inteligente.pages.dev
echo.
pause
goto menu

:open_sheet
start https://docs.google.com/spreadsheets/d/1fBeXBCztAIzcsblBBE4K8EjXrcFKjoxsEG9ZQzWZetY
echo ✓ Abriendo Google Sheet...
goto menu

:open_github
set /p user="Nombre de usuario GitHub: "
start https://github.com/%user%/agenda-inteligente
echo ✓ Abriendo GitHub...
goto menu
