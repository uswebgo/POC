-- Agenda Inteligente — Schema Supabase PostgreSQL
-- Ejecutar en: https://supabase.co → SQL Editor

-- =====================================================
-- 1. TABLA: eventos
-- =====================================================
CREATE TABLE IF NOT EXISTS eventos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Datos del evento
  titulo TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('Laboral', 'Colegio', 'Cumpleaños', 'Personal')),
  fecha TIMESTAMP WITH TIME ZONE NOT NULL,
  notas TEXT,

  -- Información del usuario
  email_usuario TEXT NOT NULL,

  -- Estado
  notificado BOOLEAN DEFAULT false,
  notificado_at TIMESTAMP WITH TIME ZONE,

  -- Auditoría
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  -- Índices
  UNIQUE(id)
);

CREATE INDEX idx_eventos_email ON eventos(email_usuario);
CREATE INDEX idx_eventos_fecha ON eventos(fecha);
CREATE INDEX idx_eventos_notificado ON eventos(notificado);

-- =====================================================
-- 2. TABLA: notificaciones_log
-- =====================================================
CREATE TABLE IF NOT EXISTS notificaciones_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  evento_id UUID NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
  email_destino TEXT NOT NULL,
  asunto TEXT NOT NULL,
  enviado BOOLEAN DEFAULT false,
  error TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  enviado_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_notificaciones_evento ON notificaciones_log(evento_id);
CREATE INDEX idx_notificaciones_enviado ON notificaciones_log(enviado);

-- =====================================================
-- 3. TABLA: configuracion
-- =====================================================
CREATE TABLE IF NOT EXISTS configuracion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_usuario TEXT UNIQUE NOT NULL,
  timezone TEXT DEFAULT 'America/Santiago',
  recordatorio_minutos INTEGER DEFAULT 15,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =====================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS
ALTER TABLE eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificaciones_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracion ENABLE ROW LEVEL SECURITY;

-- Política: Usuarios ven solo sus propios eventos
CREATE POLICY "Usuarios ven sus propios eventos"
  ON eventos
  FOR SELECT
  USING (email_usuario = current_user_email());

CREATE POLICY "Usuarios insertan sus propios eventos"
  ON eventos
  FOR INSERT
  WITH CHECK (email_usuario = current_user_email());

CREATE POLICY "Usuarios actualizan sus propios eventos"
  ON eventos
  FOR UPDATE
  USING (email_usuario = current_user_email());

CREATE POLICY "Usuarios eliminan sus propios eventos"
  ON eventos
  FOR DELETE
  USING (email_usuario = current_user_email());

-- Política: Apps Script (service role) puede leer todo para notificaciones
-- (No necesita RLS, usa service key)

-- =====================================================
-- 5. FUNCIONES HELPER
-- =====================================================

-- Obtener email del usuario actual (de JWT)
CREATE OR REPLACE FUNCTION current_user_email() RETURNS TEXT AS $$
  SELECT auth.jwt() ->> 'email'
$$ LANGUAGE SQL STABLE;

-- Función para marcar como notificado
CREATE OR REPLACE FUNCTION marcar_notificado(evento_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE eventos
  SET notificado = true, notificado_at = now()
  WHERE id = evento_id;

  UPDATE notificaciones_log
  SET enviado = true, enviado_at = now()
  WHERE evento_id = evento_id AND enviado = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 6. VISTAS ÚTILES
-- =====================================================

-- Próximas notificaciones (próximas 2 horas)
CREATE OR REPLACE VIEW proximas_notificaciones AS
SELECT
  e.id,
  e.titulo,
  e.tipo,
  e.fecha,
  e.notas,
  e.email_usuario,
  c.recordatorio_minutos
FROM eventos e
LEFT JOIN configuracion c ON e.email_usuario = c.email_usuario
WHERE
  e.notificado = false
  AND e.fecha >= now()
  AND e.fecha <= now() + INTERVAL '2 hours'
ORDER BY e.fecha;

-- Eventos de hoy
CREATE OR REPLACE VIEW eventos_hoy AS
SELECT *
FROM eventos
WHERE DATE(fecha AT TIME ZONE 'America/Santiago') = CURRENT_DATE AT TIME ZONE 'America/Santiago'
ORDER BY fecha;

-- =====================================================
-- 7. DATOS DE PRUEBA (Opcional)
-- =====================================================

-- INSERT INTO eventos (titulo, tipo, fecha, notas, email_usuario)
-- VALUES
--   ('Reunión de trabajo', 'Laboral', now() + INTERVAL '2 hours', 'Zoom call', 'j.castillo.bozo@gmail.com'),
--   ('Cumpleaños', 'Cumpleaños', now() + INTERVAL '5 days', 'María cumple 30 años', 'j.castillo.bozo@gmail.com');

-- =====================================================
-- 8. TRIGGERS (Opcional - para auditoría)
-- =====================================================

CREATE OR REPLACE FUNCTION actualizar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_eventos_updated_at
  BEFORE UPDATE ON eventos
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_updated_at();

CREATE TRIGGER trigger_configuracion_updated_at
  BEFORE UPDATE ON configuracion
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_updated_at();
