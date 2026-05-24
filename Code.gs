/**
 * AGENDA INTELIGENTE — Google Apps Script v4.2
 * Integración con Supabase + Google Calendar + Notificaciones HTML
 * ✅ Con soporte CORS para webhooks desde PWA
 */

// ===== CONSTANTES GLOBALES =====
const CONFIG = {
  // Supabase POC
  SUPABASE_URL: 'https://wzvdjdomystzltpwycnm.supabase.co',
  SUPABASE_SERVICE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6dmRqZG9teXN0emx0cHd5Y25tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTU4NTA5OCwiZXhwIjoyMDk1MTYxMDk4fQ.Morn6ztlRc8goZuM48bMKZDElkmtWGTzj0ms0yrPR4g',

  // Email (será dinámico por usuario autenticado)
  EMAIL_DESTINO: 'noreply@agenda-poc.app',
  EMAIL_REMITENTE: 'noreply@agenda-inteligente.app',
  MARGEN_NOTIFICACION: 15, // minutos antes

  // Google Calendar
  CALENDAR_ID: 'primary', // usa el calendar principal

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
};

// ===== HEADERS SUPABASE =====
function getSupabaseHeaders() {
  return {
    'Authorization': `Bearer ${CONFIG.SUPABASE_SERVICE_KEY}`,
    'Content-Type': 'application/json',
    'apikey': CONFIG.SUPABASE_SERVICE_KEY,
  };
}

// ===== CORS SUPPORT =====
/**
 * ✅ Maneja solicitudes OPTIONS (CORS preflight)
 */
function doOptions(e) {
  return respuestaConCors({}, 200);
}

/**
 * ✅ Maneja solicitudes GET desde la PWA
 * Ejemplo: ?action=guardarEvento&evento={...}&email={...}
 * También acepta: ?action=nuevoEvento&titulo=...&categoria=...
 */
function doGet(e) {
  try {
    const action = e.parameter.action;
    const evento = e.parameter.evento ? JSON.parse(decodeURIComponent(e.parameter.evento)) : null;
    const email = e.parameter.email || CONFIG.EMAIL_DESTINO;

    // Aceptar múltiples acciones
    if ((action === 'guardarEvento' || action === 'nuevoEvento') && evento) {
      guardarEventoEnSupabase(evento, email);
      Logger.log(`✅ Webhook GET: ${action} recibido`);
      return respuestaConCors({
        success: true,
        message: 'Notificación procesada',
      }, 200);
    }

    // Notificaciones simples (sin objeto evento)
    if (action === 'nuevoEvento' || action === 'verificarNotificaciones') {
      Logger.log(`ℹ️ Webhook GET simple: ${action} recibido`);
      return respuestaConCors({
        success: true,
        message: 'OK',
      }, 200);
    }

    Logger.log(`⚠️ Acción no reconocida: ${action}`);
    return respuestaConCors({
      success: true,
      message: 'OK',
    }, 200);
  } catch (err) {
    Logger.log('❌ Error doGet: ' + err);
    return respuestaConCors({
      success: true,
      message: 'OK',
    }, 200);
  }
}

/**
 * ✅ Maneja solicitudes POST (para compatibilidad)
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    if (data.action === 'guardarEvento') {
      guardarEventoEnSupabase(data.evento, data.email);
      return respuestaConCors({
        success: true,
        message: 'Evento guardado en Supabase',
      }, 200);
    }

    return respuestaConCors({
      success: false,
      message: 'Acción no reconocida',
    }, 400);
  } catch (err) {
    Logger.log('❌ Error doPost: ' + err);
    return respuestaConCors({
      success: false,
      message: err.toString(),
    }, 500);
  }
}

/**
 * ✅ Genera respuesta con headers CORS
 */
function respuestaConCors(data, statusCode) {
  const output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  output.setHeader('Access-Control-Allow-Origin', '*');
  output.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  output.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  return output;
}

function guardarEventoEnSupabase(evento, email) {
  try {
    const fecha = new Date(evento.fecha);
    const payload = {
      titulo: evento.titulo,
      categoria: evento.categoria || evento.tipo, // Soporta ambos nombres
      fecha: fecha.toISOString(),
      notas: evento.notas || '',
      email_usuario: email || CONFIG.EMAIL_DESTINO,
      sincronizado_calendar: false,
    };

    // Agregar duración si existe
    if (evento.duracion_minutos) {
      payload.duracion_minutos = evento.duracion_minutos;
    }

    const options = {
      method: 'post',
      headers: getSupabaseHeaders(),
      payload: JSON.stringify(payload),
      muteHttpExceptions: true,
    };

    const url = `${CONFIG.SUPABASE_URL}/rest/v1/eventos`;
    const response = UrlFetchApp.fetch(url, options);

    if (response.getResponseCode() === 201) {
      Logger.log(`✅ Evento guardado: ${evento.titulo}`);
      return true;
    } else {
      Logger.log(`⚠️ Error Supabase: ${response.getContentText()}`);
      return false;
    }
  } catch (err) {
    Logger.log('❌ Error guardarEventoEnSupabase: ' + err);
    return false;
  }
}

// ===== SINCRONIZAR CON GOOGLE CALENDAR (Multi-usuario con OAuth) =====
function sincronizarAGoogleCalendar() {
  try {
    // Obtener todos los usuarios con calendar autorizado
    const usuariosUrl = `${CONFIG.SUPABASE_URL}/rest/v1/usuarios?calendar_autorizado=eq.true&select=email,google_calendar_token`;
    const usuariosOptions = {
      method: 'get',
      headers: getSupabaseHeaders(),
      muteHttpExceptions: true,
    };

    const usuariosResponse = UrlFetchApp.fetch(usuariosUrl, usuariosOptions);

    if (usuariosResponse.getResponseCode() !== 200) {
      Logger.log('⚠️ Error obteniendo usuarios: ' + usuariosResponse.getContentText());
      return;
    }

    const usuarios = JSON.parse(usuariosResponse.getContentText());
    let totalSincronizados = 0;

    usuarios.forEach(usuario => {
      try {
        const sincronizados = sincronizarEventosDelUsuario(usuario.email, usuario.google_calendar_token);
        totalSincronizados += sincronizados;
      } catch (err) {
        Logger.log(`⚠️ Error sincronizando para ${usuario.email}: ${err}`);
      }
    });

    Logger.log(`✅ Sincronización multi-usuario completada: ${totalSincronizados} eventos`);
  } catch (err) {
    Logger.log('❌ Error sincronizarAGoogleCalendar: ' + err);
  }
}

function sincronizarEventosDelUsuario(emailUsuario, accessToken) {
  try {
    // Obtener eventos no sincronizados del usuario
    const eventosUrl = `${CONFIG.SUPABASE_URL}/rest/v1/eventos?email_usuario=eq.${emailUsuario}&sincronizado_calendar=eq.false&order=fecha`;
    const eventosOptions = {
      method: 'get',
      headers: getSupabaseHeaders(),
      muteHttpExceptions: true,
    };

    const eventosResponse = UrlFetchApp.fetch(eventosUrl, eventosOptions);

    if (eventosResponse.getResponseCode() !== 200) {
      Logger.log(`⚠️ Error obteniendo eventos para ${emailUsuario}: ${eventosResponse.getContentText()}`);
      return 0;
    }

    const eventos = JSON.parse(eventosResponse.getContentText());
    let sincronizados = 0;

    eventos.forEach(evento => {
      try {
        const fechaInicio = new Date(evento.fecha);
        const duracionMinutos = evento.duracion_minutos || 60;
        const fechaFin = new Date(fechaInicio.getTime() + duracionMinutos * 60 * 1000);

        // Crear evento en Google Calendar del usuario usando su token OAuth
        const eventId = crearEventoEnGoogleCalendar(
          accessToken,
          evento.titulo,
          fechaInicio,
          fechaFin,
          evento.notas,
          evento.categoria,
          emailUsuario
        );

        if (eventId) {
          marcarSincronizadoEnCalendar(evento.id, eventId);
          sincronizados++;
          Logger.log(`📅 Evento sincronizado: ${evento.titulo} → ${emailUsuario}`);
        }
      } catch (err) {
        Logger.log(`⚠️ Error con evento ${evento.id}: ${err}`);
      }
    });

    return sincronizados;
  } catch (err) {
    Logger.log(`❌ Error sincronizarEventosDelUsuario para ${emailUsuario}: ${err}`);
    return 0;
  }
}

function crearEventoEnGoogleCalendar(accessToken, titulo, fechaInicio, fechaFin, notas, categoria, email) {
  try {
    const evento = {
      summary: titulo,
      description: `${notas || ''}\n\n📁 Categoría: ${categoria}`,
      start: {
        dateTime: fechaInicio.toISOString(),
        timeZone: Session.getScriptTimeZone()
      },
      end: {
        dateTime: fechaFin.toISOString(),
        timeZone: Session.getScriptTimeZone()
      }
    };

    const options = {
      method: 'post',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify(evento),
      muteHttpExceptions: true,
    };

    const url = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';
    const response = UrlFetchApp.fetch(url, options);

    if (response.getResponseCode() === 200) {
      const result = JSON.parse(response.getContentText());
      return result.id;
    } else {
      Logger.log(`❌ Error creando evento en Calendar API: ${response.getContentText()}`);
      return null;
    }
  } catch (err) {
    Logger.log(`❌ Error crearEventoEnGoogleCalendar: ${err}`);
    return null;
  }
}

function marcarSincronizadoEnCalendar(eventoId, calendarEventId) {
  try {
    const options = {
      method: 'patch',
      headers: getSupabaseHeaders(),
      payload: JSON.stringify({
        sincronizado_calendar: true,
        calendar_event_id: calendarEventId,
      }),
      muteHttpExceptions: true,
    };

    const url = `${CONFIG.SUPABASE_URL}/rest/v1/eventos?id=eq.${eventoId}`;
    const response = UrlFetchApp.fetch(url, options);

    if (response.getResponseCode() === 200) {
      Logger.log(`✅ Evento ${eventoId} marcado como sincronizado`);
    }
  } catch (err) {
    Logger.log('⚠️ Error marcarSincronizadoEnCalendar: ' + err);
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
    const categoria = evento.categoria || evento.tipo; // Soporta ambos nombres
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
    'Karate': '🥋',
    'Medicinas': '💊',
    'Horas Médicas': '⚕️',
    'Ejercicio': '💪',
  };

  const colorCategoria = {
    'Laboral': '#3b82f6',
    'Colegio': '#a855f7',
    'Cumpleaños': '#ec4899',
    'Personal': '#10b981',
    'Karate': '#f59e0b',
    'Medicinas': '#ef4444',
    'Horas Médicas': '#06b6d4',
    'Ejercicio': '#84cc16',
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
            <span class="categoria-badge">${iconos[categoria] || '📌'} ${categoria}</span>

            <div class="titulo">${titulo}</div>

            <div class="detalle">
              <span>📅</span>
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

function crearTriggers() {
  // Eliminar triggers antiguos
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(t => ScriptApp.deleteTrigger(t));

  // Trigger para sincronizar con Google Calendar cada 10 minutos
  ScriptApp.newTrigger('sincronizarAGoogleCalendar')
    .timeBased()
    .everyMinutes(CONFIG.TRIGGER_INTERVAL_MINUTES)
    .create();

  // Trigger para verificar notificaciones cada 10 minutos
  ScriptApp.newTrigger('verificarNotificaciones')
    .timeBased()
    .everyMinutes(CONFIG.TRIGGER_INTERVAL_MINUTES)
    .create();

  Logger.log(`✅ Triggers configurados. Ejecuciones cada ${CONFIG.TRIGGER_INTERVAL_MINUTES} minutos.`);
}

function probarEnvio() {
  const eventoTest = {
    titulo: 'Evento de Prueba',
    categoria: 'Personal',
    fecha: new Date(),
    notas: 'Este es un email de prueba con HTML formateado',
  };

  enviarNotificacion({
    titulo: eventoTest.titulo,
    categoria: eventoTest.categoria,
    fecha: eventoTest.fecha,
    notas: eventoTest.notas,
    email_usuario: CONFIG.EMAIL_DESTINO,
    id: 'test-123',
  });

  Logger.log(`📧 Email de prueba enviado a: ${CONFIG.EMAIL_DESTINO}`);
}

function probarSincronizacion() {
  Logger.log('🧪 Iniciando prueba de sincronización...');
  sincronizarAGoogleCalendar();
  Logger.log('✅ Prueba completada');
}

// ===== INICIALIZACIÓN =====

function onInstall() {
  onOpen();
  crearTriggers();
}

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('📅 Agenda')
    .addItem('🔄 Sincronizar con Calendar', 'sincronizarAGoogleCalendar')
    .addItem('🔔 Verificar Notificaciones', 'verificarNotificaciones')
    .addItem('📧 Probar Email', 'probarEnvio')
    .addItem('📋 Probar Sincronización', 'probarSincronizacion')
    .addSeparator()
    .addItem('⚙️ Crear Triggers', 'crearTriggers')
    .addToUi();
}
