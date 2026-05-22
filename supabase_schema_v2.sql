-- Agenda Inteligente v2 — Schema Supabase PostgreSQL
-- Actualizado: 2026-05-22

-- =====================================================
-- 0. FUNCIONES HELPER (PRIMERO)
-- =====================================================

CREATE OR REPLACE FUNCTION current_user_email() RETURNS TEXT AS $$
  SELECT auth.jwt() ->> 'email'
$$ LANGUAGE SQL STABLE;

-- =====================================================
-- 1. TABLA: categorias (Nueva - tipos dinámicos)
-- =====================================================
CREATE TABLE IF NOT EXISTS categorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_usuario TEXT NOT NULL,
  nombre TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#3b82f6', -- Hex color
  icono TEXT DEFAULT '📌',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  UNIQUE(email_usuario, nombre)
);

CREATE INDEX IF NOT EXISTS idx_categorias_email ON categorias(email_usuario);

-- =====================================================
-- 2. TABLA: eventos (ACTUALIZADA)
-- =====================================================
CREATE TABLE IF NOT EXISTS eventos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Datos del evento
  titulo TEXT NOT NULL,
  categoria TEXT NOT NULL, -- Reemplaza 'tipo'
  fecha TIMESTAMP WITH TIME ZONE NOT NULL,
  notas TEXT,

  -- Información del usuario (RLS)
  email_usuario TEXT NOT NULL,

  -- Estado de notificación
  notificado BOOLEAN DEFAULT false,
  notificado_at TIMESTAMP WITH TIME ZONE,

  -- Auditoría
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  UNIQUE(id)
);

CREATE INDEX IF NOT EXISTS idx_eventos_email ON eventos(email_usuario);
CREATE INDEX IF NOT EXISTS idx_eventos_fecha ON eventos(fecha);
CREATE INDEX IF NOT EXISTS idx_eventos_categoria ON eventos(categoria);
CREATE INDEX IF NOT EXISTS idx_eventos_notificado ON eventos(notificado);

-- =====================================================
-- 3. TABLA: notificaciones_log
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

CREATE INDEX IF NOT EXISTS idx_notificaciones_evento ON notificaciones_log(evento_id);
CREATE INDEX IF NOT EXISTS idx_notificaciones_enviado ON notificaciones_log(enviado);

-- =====================================================
-- 4. TABLA: configuracion
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
-- 5. ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificaciones_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracion ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;

-- Políticas para eventos
CREATE POLICY "Usuarios ven sus propios eventos"
  ON eventos FOR SELECT USING (email_usuario = current_user_email());

CREATE POLICY "Usuarios insertan sus propios eventos"
  ON eventos FOR INSERT WITH CHECK (email_usuario = current_user_email());

CREATE POLICY "Usuarios actualizan sus propios eventos"
  ON eventos FOR UPDATE USING (email_usuario = current_user_email());

CREATE POLICY "Usuarios eliminan sus propios eventos"
  ON eventos FOR DELETE USING (email_usuario = current_user_email());

-- Políticas para categorías
CREATE POLICY "Usuarios ven sus propias categorías"
  ON categorias FOR SELECT USING (email_usuario = current_user_email());

CREATE POLICY "Usuarios crean sus propias categorías"
  ON categorias FOR INSERT WITH CHECK (email_usuario = current_user_email());

CREATE POLICY "Usuarios actualizan sus propias categorías"
  ON categorias FOR UPDATE USING (email_usuario = current_user_email());

CREATE POLICY "Usuarios eliminan sus propias categorías"
  ON categorias FOR DELETE USING (email_usuario = current_user_email());

-- =====================================================
-- 6. FUNCIONES HELPER
-- =====================================================

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
-- 7. VISTAS ÚTILES
-- =====================================================

CREATE OR REPLACE VIEW proximas_notificaciones AS
SELECT
  e.id,
  e.titulo,
  e.categoria,
  e.fecha,
  e.notas,
  e.email_usuario,
  c.recordatorio_minutos,
  cat.color,
  cat.icono
FROM eventos e
LEFT JOIN configuracion c ON e.email_usuario = c.email_usuario
LEFT JOIN categorias cat ON e.email_usuario = cat.email_usuario AND e.categoria = cat.nombre
WHERE e.notificado = false
  AND e.fecha >= now()
  AND e.fecha <= now() + INTERVAL '2 hours'
ORDER BY e.fecha;

CREATE OR REPLACE VIEW eventos_hoy AS
SELECT e.*, cat.color, cat.icono
FROM eventos e
LEFT JOIN categorias cat ON e.email_usuario = cat.email_usuario AND e.categoria = cat.nombre
WHERE DATE(e.fecha AT TIME ZONE 'America/Santiago') = CURRENT_DATE AT TIME ZONE 'America/Santiago'
ORDER BY e.fecha;

CREATE OR REPLACE VIEW eventos_semana AS
SELECT e.*, cat.color, cat.icono
FROM eventos e
LEFT JOIN categorias cat ON e.email_usuario = cat.email_usuario AND e.categoria = cat.nombre
WHERE e.fecha >= now() AT TIME ZONE 'America/Santiago'
  AND e.fecha < (now() AT TIME ZONE 'America/Santiago' + INTERVAL '7 days')
ORDER BY e.fecha;

-- =====================================================
-- 8. TRIGGERS (Auditoría)
-- =====================================================

CREATE OR REPLACE FUNCTION actualizar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_eventos_updated_at ON eventos;
CREATE TRIGGER trigger_eventos_updated_at
  BEFORE UPDATE ON eventos FOR EACH ROW
  EXECUTE FUNCTION actualizar_updated_at();

DROP TRIGGER IF EXISTS trigger_configuracion_updated_at ON configuracion;
CREATE TRIGGER trigger_configuracion_updated_at
  BEFORE UPDATE ON configuracion FOR EACH ROW
  EXECUTE FUNCTION actualizar_updated_at();

-- =====================================================
-- 9. CATEGORÍAS PREDEFINIDAS (Opcional - descomentar)
-- =====================================================

-- INSERT INTO categorias (email_usuario, nombre, color, icono) VALUES
-- ('j.castillo.bozo@gmail.com', 'Laboral', '#3b82f6', '💼'),
-- ('j.castillo.bozo@gmail.com', 'Colegio', '#a855f7', '🏫'),
-- ('j.castillo.bozo@gmail.com', 'Cumpleaños', '#ec4899', '🎂'),
-- ('j.castillo.bozo@gmail.com', 'Personal', '#10b981', '🏠'),
-- ('j.castillo.bozo@gmail.com', 'Karate', '#f59e0b', '🥋'),
-- ('j.castillo.bozo@gmail.com', 'Medicinas', '#ef4444', '💊'),
-- ('j.castillo.bozo@gmail.com', 'Horas Médicas', '#06b6d4', '⚕️'),
-- ('j.castillo.bozo@gmail.com', 'Ejercicio', '#84cc16', '💪');
