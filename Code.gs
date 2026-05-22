// GOOGLE APPS SCRIPT - Copia esto en tu Apps Script de Google Sheets
// Sheet ID: 1fBeXBCztAIzcsblBBE4K8EjXrcFKjoxsEG9ZQzWZetY

const SHEET_ID = '1fBeXBCztAIzcsblBBE4K8EjXrcFKjoxsEG9ZQzWZetY';
const SHEET_NAME = 'Eventos';
const NOTIFICACIONES_SHEET = 'Notificaciones';
const MARGEN_NOTIFICACION = 15; // minutos antes de alertar
const EMAIL_DESTINO = 'j.castillo.bozo@gmail.com'; // 

let ss = SpreadsheetApp.openById(SHEET_ID);

function onOpen() {
    const ui = SpreadsheetApp.getUi();
    ui.createMenu('📅 Agenda')
        .addItem('🔄 Verificar Notificaciones Ahora', 'verificarNotificaciones')
        .addItem('📊 Ver Estadísticas', 'mostrarEstadisticas')
        .addSeparator()
        .addItem('⚙️ Configurar Triggers Automáticos', 'crearTriggers')
        .addToUi();
}

// ===== RECIBIR DATOS DEL HTML =====
function doPost(e) {
    try {
        const data = JSON.parse(e.postData.contents);

        if(data.action === 'guardarEvento') {
            guardarEventoEnSheet(data.evento, data.email);
            return ContentService.createTextOutput(JSON.stringify({
                success: true,
                message: 'Evento guardado en Sheets'
            })).setMimeType(ContentService.MimeType.JSON);
        }

        return ContentService.createTextOutput(JSON.stringify({
            success: false,
            message: 'Acción no reconocida'
        })).setMimeType(ContentService.MimeType.JSON);

    } catch(err) {
        Logger.log('Error doPost: ' + err);
        return ContentService.createTextOutput(JSON.stringify({
            success: false,
            message: err.toString()
        })).setMimeType(ContentService.MimeType.JSON);
    }
}

// ===== GUARDAR EVENTO EN SHEETS =====
function guardarEventoEnSheet(evento, email) {
    try {
        let sheet = getOrCreateSheet(SHEET_NAME);

        if(sheet.getLastRow() === 0) {
            sheet.appendRow([
                'Timestamp',
                'Título',
                'Categoría',
                'Fecha',
                'Hora',
                'Notas',
                'Email Destino',
                'Notificado',
                'ID Evento'
            ]);
        }

        const fecha = new Date(evento.fecha);
        const soloFecha = Utilities.formatDate(fecha, Session.getScriptTimeZone(), 'yyyy-MM-dd');
        const soloHora = Utilities.formatDate(fecha, Session.getScriptTimeZone(), 'HH:mm:ss');

        sheet.appendRow([
            new Date(),
            evento.titulo,
            evento.tipo,
            soloFecha,
            soloHora,
            evento.notas || '',
            email,
            'NO',
            Utilities.getUuid()
        ]);

        Logger.log('✓ Evento guardado: ' + evento.titulo);
    } catch(err) {
        Logger.log('Error guardarEventoEnSheet: ' + err);
    }
}

// ===== VERIFICAR Y ENVIAR NOTIFICACIONES =====
function verificarNotificaciones() {
    try {
        let sheet = getOrCreateSheet(SHEET_NAME);
        let data = sheet.getDataRange().getValues();

        if(data.length <= 1) {
            Logger.log('No hay eventos para notificar');
            return;
        }

        const ahora = new Date();
        const margenMs = MARGEN_NOTIFICACION * 60 * 1000;

        for(let i = 1; i < data.length; i++) {
            const row = data[i];
            const titulo = row[1];
            const categoria = row[2];
            const fechaStr = row[3];
            const horaStr = row[4];
            const notas = row[5];
            const email = row[6];
            const notificado = row[7];
            const idEvento = row[8];

            if(notificado === 'SI') continue; // Ya notificado

            try {
                const eventoFecha = new Date(fechaStr + 'T' + horaStr);

                if(eventoFecha >= ahora && eventoFecha <= new Date(ahora.getTime() + margenMs)) {
                    // Usa la constante EMAIL_DESTINO, o el email de la fila si es diferente
                    const emailDestino = email || EMAIL_DESTINO;
                    enviarEmailNotificacion(titulo, categoria, eventoFecha, notas, emailDestino);

                    // Marcar como notificado
                    sheet.getRange(i + 1, 8).setValue('SI');
                    Logger.log('✓ Notificación enviada: ' + titulo + ' -> ' + email);
                }
            } catch(dateErr) {
                Logger.log('Error procesando fecha en fila ' + i + ': ' + dateErr);
            }
        }
    } catch(err) {
        Logger.log('Error verificarNotificaciones: ' + err);
    }
}

// ===== ENVIAR EMAIL CON GMAILAPP =====
function enviarEmailNotificacion(titulo, categoria, fecha, notas, emailDestino) {
    try {
        const asunto = `🔔 RECORDATORIO: ${titulo}`;
        const cuerpo = `
📅 AVISO AUTOMÁTICO DE AGENDA

Evento: ${titulo}
Categoría: ${categoria}
Fecha/Hora: ${fecha.toLocaleString('es-ES')}
${notas ? 'Notas: ' + notas : ''}

---
Este es un recordatorio automático de tu Agenda Híbrida Inteligente.
`;

        GmailApp.sendEmail(emailDestino, asunto, cuerpo);
        Logger.log('📧 Email enviado a: ' + emailDestino);
    } catch(err) {
        Logger.log('Error enviarEmailNotificacion: ' + err);
    }
}

// ===== UTILIDADES =====
function getOrCreateSheet(name) {
    let sheet = ss.getSheetByName(name);
    if(!sheet) {
        sheet = ss.insertSheet(name);
    }
    return sheet;
}

function crearTriggers() {
    // Eliminar triggers antiguos
    const triggers = ScriptApp.getProjectTriggers();
    triggers.forEach(t => ScriptApp.deleteTrigger(t));

    // Crear nuevo trigger cada 10 minutos
    ScriptApp.newTrigger('verificarNotificaciones')
        .timeBased()
        .everyMinutes(10)
        .create();

    SpreadsheetApp.getUi().alert('✓ Triggers configurados. Verificaciones cada 10 minutos.');
}

function mostrarEstadisticas() {
    let sheet = getOrCreateSheet(SHEET_NAME);
    let data = sheet.getDataRange().getValues();

    const totalEventos = data.length - 1;
    const notificados = data.slice(1).filter(row => row[7] === 'SI').length;
    const pendientes = totalEventos - notificados;

    const msg = `
📊 ESTADÍSTICAS DE AGENDA

Total de eventos: ${totalEventos}
Notificaciones enviadas: ${notificados}
Pendientes: ${pendientes}

Próxima verificación automática: cada 10 minutos
`;

    SpreadsheetApp.getUi().alert(msg);
}

// Función auxiliar para depuración
function probarEnvio() {
    const correoTest = EMAIL_DESTINO || Session.getActiveUser().getEmail();
    enviarEmailNotificacion('Test Evento', 'Prueba', new Date(), 'Este es un email de prueba', correoTest);
    Logger.log('✓ Email de prueba enviado a: ' + correoTest);
}
