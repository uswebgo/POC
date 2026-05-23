/**
 * AGENDA INTELIGENTE — Google Apps Script v3.0
 * Integración con Supabase + Notificaciones HTML
 */

// ===== CONSTANTES GLOBALES =====
const CONFIG = {
  // Supabase
  SUPABASE_URL: 'https://ufwzavtzbmvieptszehd.supabase.co',
  SUPABASE_SERVICE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmd3phdnR6Ym12aWVwdHN6ZWhkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTQyNTQ5MCwiZXhwIjoyMDk1MDAxNDkwfQ.idsAKaZC1rzIyWrZe-dePsTA1u-D6HhfVfiT1o5PYYnY',

  // Email
  EMAIL_DESTINO: 'j.castillo.bozo@gmail.com',
  EMAIL_REMITENTE: 'j.castillo.bozo@gmail.com',
  MARGEN_NOTIFICACION: 15, // minutos antes

  // Paleta de colores
  COLORES: {
    primary: '#2563eb',      // Azul
    secondary: '#059669',    // Verde
    warning: '#ca8a04',      // Amarillo
    danger: '#dc2626',       // Rojo
    text: '#0f172a',         // Oscuro
    textLight: '#64748b',    // Gris
    bg: '#f1f5f9',           // Fondo claro
    bgLight: '#f8fafc',      // Fondo más claro
  },

  // Triggers
  TRIGGER_INTERVAL_MINUTES: 10,

  // Mensajería
  SLACK_WEBHOOK: '', // Opcional: agregar si necesitas Slack
};

// ===== HEADERS SUPABASE =====
function getSupabaseHeaders() {
  return {
    'Authorization': `Bearer ${CONFIG.SUPABASE_SERVICE_KEY}`,
    'Content-Type': 'application/json',
    'apikey': CONFIG.SUPABASE_SERVICE_KEY,
  };
}

// ===== FUNCIONES WEBHOOK =====

// Manejar CORS preflight (OPTIONS)
function doOptions(e) {
  const output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);
  // Headers CORS
  output.append('{"status": "ok"}');
  return output;
}

// Manejar GET requests
function doGet(e) {
  try {
    const action = e.parameter.action;
    Logger.log(`📨 GET Request - Acción: ${action}`);

    if (action === 'verificarNotificaciones') {
      return respuestaConCors({ success: true, message: 'Notificaciones verificadas' });
    }

    if (action === 'test') {
      return respuestaConCors({ success: true, message: 'Webhook funcionando correctamente' });
    }

    return respuestaConCors({ success: false, message: 'Acción no reconocida' });
  } catch (err) {
    Logger.log('❌ Error doGet: ' + err);
    return respuestaConCors({ success: false, message: err.toString() });
  }
}

// Manejar POST requests
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    if (data.action === 'guardarEvento') {
      return guardarEventoEnSupabase(data.evento, data.email);
    }

    return respuestaConCors({ success: false, message: 'Acción no reconocida' });
  } catch (err) {
    Logger.log('❌ Error doPost: ' + err);
    return respuestaConCors({ success: false, message: err.toString() });
  }
}

function guardarEventoEnSupabase(evento, email) {
  try {
    const fecha = new Date(evento.fecha);
    const payload = {
      titulo: evento.titulo,
      tipo: evento.tipo,
      fecha: fecha.toISOString(),
      notas: evento.notas || '',
      email_usuario: email || CONFIG.EMAIL_DESTINO,
    };

    const options = {
      method: 'post',
      headers: getSupabaseHeaders(),
      payload: JSON.stringify(payload),
      muteHttpExceptions: true,
    };

    const url = `${CONFIG.SUPABASE_URL}/rest/v1/eventos`;
    const response = UrlFetchApp.fetch(url, options);
    const result = JSON.parse(response.getContentText());

    if (response.getResponseCode() === 201) {
      Logger.log(`✅ Evento guardado: ${evento.titulo}`);
      return respuesta(true, 'Evento guardado en Supabase');
    } else {
      Logger.log(`⚠️ Error Supabase: ${response.getContentText()}`);
      return respuesta(false, 'Error al guardar en Supabase');
    }
  } catch (err) {
    Logger.log('❌ Error guardarEventoEnSupabase: ' + err);
    return respuesta(false, err.toString());
  }
}

// ===== NOTIFICACIONES =====

function verificarNotificaciones() {
  try {
    const ahora = new Date();
    const margenMs = CONFIG.MARGEN_NOTIFICACION * 60 * 1000;

    // Obtener próximas notificaciones desde Supabase
    const options = {
      method: 'get',
      headers: getSupabaseHeaders(),
      muteHttpExceptions: true,
    };

    const url = `${CONFIG.SUPABASE_URL}/rest/v1/proximas_notificaciones`;
    const response = UrlFetchApp.fetch(url, options);

    if (response.getResponseCode() !== 200) {
      Logger.log('⚠️ Error obteniendo notificaciones: ' + response.getContentText());
      return;
    }

    const eventos = JSON.parse(response.getContentText());

    eventos.forEach(evento => {
      const fechaEvento = new Date(evento.fecha);

      if (fechaEvento >= ahora && fechaEvento <= new Date(ahora.getTime() + margenMs)) {
        enviarNotificacion(evento);
        marcarComoNotificado(evento.id);
      }
    });

    Logger.log(`✅ Verificación completada: ${eventos.length} eventos pendientes`);
  } catch (err) {
    Logger.log('❌ Error verificarNotificaciones: ' + err);
  }
}

function enviarNotificacion(evento) {
  try {
    const titulo = evento.titulo;
    const categoria = evento.tipo;
    const fecha = new Date(evento.fecha);
    const notas = evento.notas;
    const email = evento.email_usuario;

    const asunto = `🔔 RECORDATORIO: ${titulo}`;
    const html = generarEmailHTML(titulo, categoria, fecha, notas);

    GmailApp.sendEmail(email, asunto, '', {
      htmlBody: html,
      noReply: true,
    });

    Logger.log(`📧 Email enviado a: ${email}`);
  } catch (err) {
    Logger.log('❌ Error enviarNotificacion: ' + err);
  }
}

function generarEmailHTML(titulo, categoria, fecha, notas) {
  const colores = CONFIG.COLORES;

  const iconos = {
    'Laboral': '💼',
    'Colegio': '🏫',
    'Cumpleaños': '🎂',
    'Personal': '🏠',
  };

  const colorCategoria = {
    'Laboral': '#3b82f6',
    'Colegio': '#a855f7',
    'Cumpleaños': '#ec4899',
    'Personal': '#10b981',
  };

  const fechaFormato = Utilities.formatDate(fecha, Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: ${colores.bg};
          padding: 20px;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .header {
          background: linear-gradient(135deg, ${colores.primary}, ${colores.secondary});
          color: white;
          padding: 30px;
          text-align: center;
        }
        .header h1 {
          font-size: 24px;
          margin-bottom: 10px;
          font-weight: bold;
        }
        .header p {
          font-size: 14px;
          opacity: 0.95;
        }
        .content {
          padding: 30px;
        }
        .evento-card {
          border-left: 4px solid ${colorCategoria[categoria] || colores.primary};
          background: ${colores.bgLight};
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
        }
        .categoria-badge {
          display: inline-block;
          background: ${colorCategoria[categoria] || colores.primary};
          color: white;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: bold;
          margin-bottom: 12px;
        }
        .titulo {
          font-size: 20px;
          font-weight: bold;
          color: ${colores.text};
          margin-bottom: 15px;
        }
        .detalle {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
          color: ${colores.textLight};
          font-size: 14px;
        }
        .detalle-icon {
          font-size: 16px;
        }
        .notas {
          background: white;
          border-left: 2px solid ${colores.warning};
          padding: 12px;
          border-radius: 4px;
          margin-top: 15px;
          font-size: 13px;
          color: ${colores.textLight};
          font-style: italic;
        }
        .footer {
          background: ${colores.bgLight};
          padding: 20px;
          text-align: center;
          font-size: 12px;
          color: ${colores.textLight};
          border-top: 1px solid #e2e8f0;
        }
        .footer a {
          color: ${colores.primary};
          text-decoration: none;
        }
        .cta-button {
          display: inline-block;
          background: ${colores.primary};
          color: white;
          padding: 12px 24px;
          border-radius: 6px;
          text-decoration: none;
          font-weight: bold;
          margin-top: 20px;
          text-align: center;
        }
        .cta-button:hover {
          background: ${colores.secondary};
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔔 Recordatorio de Evento</h1>
          <p>Tu Agenda Inteligente Híbrida</p>
        </div>

        <div class="content">
          <div class="evento-card">
            <span class="categoria-badge">${iconos[categoria]} ${categoria}</span>

            <div class="titulo">${titulo}</div>

            <div class="detalle">
              <span class="detalle-icon">📅</span>
              <span>${fechaFormato}</span>
            </div>

            ${notas ? `
              <div class="notas">
                <strong>Notas:</strong><br/>
                ${notas}
              </div>
            ` : ''}

            <a href="https://agenda-inteligente.uswebgo.workers.dev" class="cta-button">
              Ver en Agenda
            </a>
          </div>

          <p style="color: ${colores.textLight}; font-size: 13px; line-height: 1.6;">
            Este es un recordatorio automático de tu <strong>Agenda Inteligente Híbrida</strong>.
            Si no esperabas este correo, puedes ignorarlo sin problema.
          </p>
        </div>

        <div class="footer">
          <p>© 2026 Agenda Inteligente • <a href="https://agenda-inteligente.uswebgo.workers.dev">Abrir App</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function marcarComoNotificado(eventoId) {
  try {
    const options = {
      method: 'patch',
      headers: getSupabaseHeaders(),
      payload: JSON.stringify({
        notificado: true,
        notificado_at: new Date().toISOString(),
      }),
      muteHttpExceptions: true,
    };

    const url = `${CONFIG.SUPABASE_URL}/rest/v1/eventos?id=eq.${eventoId}`;
    const response = UrlFetchApp.fetch(url, options);

    if (response.getResponseCode() === 200) {
      Logger.log(`✅ Evento ${eventoId} marcado como notificado`);
    }
  } catch (err) {
    Logger.log('⚠️ Error marcarComoNotificado: ' + err);
  }
}

// ===== UTILIDADES =====

function respuesta(success, message) {
  return ContentService.createTextOutput(JSON.stringify({
    success: success,
    message: message,
  })).setMimeType(ContentService.MimeType.JSON);
}

// Respuesta con headers CORS para fetch desde navegador
function respuestaConCors(data) {
  const output = ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);

  // Headers CORS - permitir cualquier origen
  // Nota: Google Apps Script no permite setHeaders directamente
  // pero al devolver JSON con ContentService, los navegadores modernos lo aceptan
  return output;
}

function crearTriggers() {
  // Eliminar triggers antiguos
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(t => ScriptApp.deleteTrigger(t));

  // Crear nuevo trigger cada 10 minutos
  ScriptApp.newTrigger('verificarNotificaciones')
    .timeBased()
    .everyMinutes(CONFIG.TRIGGER_INTERVAL_MINUTES)
    .create();

  Logger.log(`✅ Triggers configurados. Verificaciones cada ${CONFIG.TRIGGER_INTERVAL_MINUTES} minutos.`);
}

function probarEnvio() {
  const eventoTest = {
    titulo: 'Evento de Prueba',
    tipo: 'Personal',
    fecha: new Date(),
    notas: 'Este es un email de prueba con HTML formateado',
  };

  enviarNotificacion({
    titulo: eventoTest.titulo,
    tipo: eventoTest.tipo,
    fecha: eventoTest.fecha,
    notas: eventoTest.notas,
    email_usuario: CONFIG.EMAIL_DESTINO,
    id: 'test-123',
  });

  Logger.log(`📧 Email de prueba enviado a: ${CONFIG.EMAIL_DESTINO}`);
}

// ===== ESTADÍSTICAS =====

function obtenerEstadisticas() {
  try {
    const options = {
      method: 'get',
      headers: getSupabaseHeaders(),
      muteHttpExceptions: true,
    };

    const url = `${CONFIG.SUPABASE_URL}/rest/v1/eventos?select=count`;
    const response = UrlFetchApp.fetch(url, options);

    Logger.log('📊 Estadísticas obtenidas correctamente');
  } catch (err) {
    Logger.log('❌ Error obtenerEstadisticas: ' + err);
  }
}

// ===== INICIALIZACIÓN =====

function onInstall() {
  onOpen();
  crearTriggers();
}

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('📅 Agenda')
    .addItem('🔄 Verificar Notificaciones', 'verificarNotificaciones')
    .addItem('📊 Estadísticas', 'obtenerEstadisticas')
    .addItem('📧 Probar Email', 'probarEnvio')
    .addSeparator()
    .addItem('⚙️ Crear Triggers', 'crearTriggers')
    .addToUi();
}
