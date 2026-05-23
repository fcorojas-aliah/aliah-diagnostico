-- ═══════════════════════════════════════════════════════════════════
-- ALIAH DEVELOPMENTS — Diagnóstico Organizacional
-- Schema de Supabase — ejecutar en SQL Editor
-- ═══════════════════════════════════════════════════════════════════

-- 1. Crear la tabla principal
CREATE TABLE IF NOT EXISTS diagnostico_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Datos laborales
  nombre TEXT NOT NULL,
  area TEXT NOT NULL,
  puesto TEXT NOT NULL,
  ubicacion TEXT,
  ubicacion_custom TEXT,
  rol_descripcion TEXT,
  fecha_ingreso DATE,

  -- Datos personales (confidencial)
  direccion TEXT,
  telefono_personal TEXT,
  email_personal TEXT,
  cumpleanos DATE,
  aniversario DATE,

  -- Familia
  conyuge TEXT,
  hijos JSONB DEFAULT '[]',
  padres TEXT,
  otros_familiares TEXT,

  -- Contactos de emergencia
  contacto_emergencia_1_nombre TEXT,
  contacto_emergencia_1_tel TEXT,
  contacto_emergencia_1_relacion TEXT,
  contacto_emergencia_2_nombre TEXT,
  contacto_emergencia_2_tel TEXT,
  contacto_emergencia_2_relacion TEXT,

  -- Preferencias personales
  hobbies TEXT,
  preferencias_generales TEXT,
  alergias_restricciones TEXT,
  talla_camisa TEXT,

  -- Respuestas del diagnóstico (JSON)
  respuestas JSONB DEFAULT '{}',
  ranked JSONB DEFAULT '{}',
  detalles JSONB DEFAULT '{}'
);

-- 2. Índices para búsquedas frecuentes
CREATE INDEX IF NOT EXISTS idx_responses_area ON diagnostico_responses(area);
CREATE INDEX IF NOT EXISTS idx_responses_created ON diagnostico_responses(created_at DESC);

-- 3. Trigger para updated_at automático
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at ON diagnostico_responses;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON diagnostico_responses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. Row Level Security
ALTER TABLE diagnostico_responses ENABLE ROW LEVEL SECURITY;

-- Permitir INSERT a cualquiera (para que los colaboradores puedan enviar)
DROP POLICY IF EXISTS "allow_insert" ON diagnostico_responses;
CREATE POLICY "allow_insert" ON diagnostico_responses
  FOR INSERT WITH CHECK (true);

-- Permitir SELECT a cualquiera (para el dashboard)
-- OPCIÓN SEGURA: cambia esto después para requerir autenticación
DROP POLICY IF EXISTS "allow_select" ON diagnostico_responses;
CREATE POLICY "allow_select" ON diagnostico_responses
  FOR SELECT USING (true);

-- 5. Habilitar Realtime (actualizaciones en vivo)
ALTER PUBLICATION supabase_realtime ADD TABLE diagnostico_responses;

-- ── VERIFICACIÓN ──
-- Ejecuta esto para confirmar que todo quedó bien:
SELECT
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'diagnostico_responses';

-- Deberías ver: diagnostico_responses | t (t = RLS habilitado)
