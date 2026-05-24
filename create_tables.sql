-- ===== FASE 1: CREAR NUEVAS TABLAS CON RLS =====
-- Execute this SQL in Supabase Console → SQL Editor

-- TABLE 1: COMPRAS (Shopping List)
CREATE TABLE compras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo VARCHAR(255) NOT NULL,
  cantidad INTEGER DEFAULT 1,
  completada BOOLEAN DEFAULT false,
  email_usuario VARCHAR(255) NOT NULL,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notas TEXT
);

-- Enable RLS on compras
ALTER TABLE compras ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can see only their own shopping items
CREATE POLICY "Users can view their own shopping items" ON compras
FOR SELECT USING (auth.jwt()->'claims'->>'email' = email_usuario);

-- RLS Policy: Users can insert their own shopping items
CREATE POLICY "Users can insert their own shopping items" ON compras
FOR INSERT WITH CHECK (auth.jwt()->'claims'->>'email' = email_usuario);

-- RLS Policy: Users can update their own shopping items
CREATE POLICY "Users can update their own shopping items" ON compras
FOR UPDATE USING (auth.jwt()->'claims'->>'email' = email_usuario)
WITH CHECK (auth.jwt()->'claims'->>'email' = email_usuario);

-- RLS Policy: Users can delete their own shopping items
CREATE POLICY "Users can delete their own shopping items" ON compras
FOR DELETE USING (auth.jwt()->'claims'->>'email' = email_usuario);


-- TABLE 2: TAREAS (Tasks/Todo with Google Calendar sync)
CREATE TABLE tareas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  descripcion VARCHAR(500) NOT NULL,
  completada BOOLEAN DEFAULT false,
  fecha_vencimiento TIMESTAMP,
  prioridad VARCHAR(20) DEFAULT 'media' CHECK (prioridad IN ('alta', 'media', 'baja')),
  email_usuario VARCHAR(255) NOT NULL,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  calendar_event_id VARCHAR(255)
);

-- Enable RLS on tareas
ALTER TABLE tareas ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can see only their own tasks
CREATE POLICY "Users can view their own tasks" ON tareas
FOR SELECT USING (auth.jwt()->'claims'->>'email' = email_usuario);

-- RLS Policy: Users can insert their own tasks
CREATE POLICY "Users can insert their own tasks" ON tareas
FOR INSERT WITH CHECK (auth.jwt()->'claims'->>'email' = email_usuario);

-- RLS Policy: Users can update their own tasks
CREATE POLICY "Users can update their own tasks" ON tareas
FOR UPDATE USING (auth.jwt()->'claims'->>'email' = email_usuario)
WITH CHECK (auth.jwt()->'claims'->>'email' = email_usuario);

-- RLS Policy: Users can delete their own tasks
CREATE POLICY "Users can delete their own tasks" ON tareas
FOR DELETE USING (auth.jwt()->'claims'->>'email' = email_usuario);


-- TABLE 3: GASTOS (Expenses with categories)
CREATE TABLE gastos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  descripcion VARCHAR(500) NOT NULL,
  monto NUMERIC(12, 2) NOT NULL,
  categoria_gasto VARCHAR(50) NOT NULL,
  email_usuario VARCHAR(255) NOT NULL,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notas TEXT
);

-- Enable RLS on gastos
ALTER TABLE gastos ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can see only their own expenses
CREATE POLICY "Users can view their own expenses" ON gastos
FOR SELECT USING (auth.jwt()->'claims'->>'email' = email_usuario);

-- RLS Policy: Users can insert their own expenses
CREATE POLICY "Users can insert their own expenses" ON gastos
FOR INSERT WITH CHECK (auth.jwt()->'claims'->>'email' = email_usuario);

-- RLS Policy: Users can update their own expenses
CREATE POLICY "Users can update their own expenses" ON gastos
FOR UPDATE USING (auth.jwt()->'claims'->>'email' = email_usuario)
WITH CHECK (auth.jwt()->'claims'->>'email' = email_usuario);

-- RLS Policy: Users can delete their own expenses
CREATE POLICY "Users can delete their own expenses" ON gastos
FOR DELETE USING (auth.jwt()->'claims'->>'email' = email_usuario);


-- ===== VERIFICATION QUERIES (Optional - run after tables are created) =====
-- Check if tables exist:
-- SELECT tablename FROM pg_tables WHERE tablename IN ('compras', 'tareas', 'gastos');

-- Check RLS policies:
-- SELECT tablename, policyname FROM pg_policies WHERE tablename IN ('compras', 'tareas', 'gastos');

-- Test inserting a row (replace email):
-- INSERT INTO compras (titulo, email_usuario) VALUES ('Leche', 'test@example.com');
