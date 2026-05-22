-- Migration: Add duracion_minutos to eventos table
-- Date: 2026-05-22
-- Purpose: Support event duration/end time tracking

-- Add duracion_minutos column to eventos table
ALTER TABLE eventos ADD COLUMN IF NOT EXISTS duracion_minutos INTEGER DEFAULT NULL;

-- Add comment explaining the column
COMMENT ON COLUMN eventos.duracion_minutos IS 'Duración del evento en minutos. Ej: 480 = 8 horas. Nullable.';

-- Create index for queries filtering by duration (optional, for performance)
-- This helps when filtering events by duration range
CREATE INDEX IF NOT EXISTS idx_eventos_duracion ON eventos(duracion_minutos);

-- Display current structure (verification)
-- Run this to verify the migration was successful:
-- SELECT column_name, data_type, is_nullable FROM information_schema.columns
-- WHERE table_name = 'eventos' ORDER BY ordinal_position;
