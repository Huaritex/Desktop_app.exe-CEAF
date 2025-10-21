-- ============================================
-- CEAF Dashboard UCB - Schema Unificado
-- Sistema Completo de Gestión Académica
-- ============================================
-- Este esquema unifica:
-- - Gestión académica general (estudiantes, rendimiento)
-- - Sistema inteligente de horarios
-- - Elimina redundancia entre schemas
-- ============================================

-- ============================================
-- MÓDULO 1: ESTRUCTURA ACADÉMICA
-- ============================================

-- TABLA: carreras (unifica academic_programs)
CREATE TABLE IF NOT EXISTS carreras (
  id SERIAL PRIMARY KEY,
  codigo VARCHAR(50) UNIQUE NOT NULL,           -- 'IS', 'II', 'IC'
  nombre VARCHAR(200) NOT NULL,                 -- 'Ingeniería de Sistemas'
  facultad VARCHAR(100) NOT NULL,               -- 'Ingeniería y Arquitectura'
  departamento VARCHAR(100),
  nivel_academico VARCHAR(50),                  -- 'Licenciatura', 'Maestría'
  duracion_semestres INTEGER,
  creditos_totales INTEGER,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- TABLA: materias (catálogo universal)
CREATE TABLE IF NOT EXISTS materias (
  sigla VARCHAR(20) PRIMARY KEY,                -- 'MAT101', 'PRG201'
  nombre VARCHAR(200) NOT NULL,                 -- 'Cálculo I'
  creditos INTEGER NOT NULL CHECK (creditos > 0),
  horas_semana_min INTEGER NOT NULL CHECK (horas_semana_min > 0),
  horas_semana_max INTEGER NOT NULL CHECK (horas_semana_max >= horas_semana_min),
  tipo VARCHAR(50),                             -- 'Teorica', 'Practica', 'Laboratorio'
  departamento VARCHAR(100),
  descripcion TEXT,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- TABLA: pensums (planes de estudio)
CREATE TABLE IF NOT EXISTS pensums (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,                 -- 'Pensum 2017', 'Pensum 2023'
  carrera_id INTEGER NOT NULL REFERENCES carreras(id) ON DELETE CASCADE,
  fecha_vigencia DATE NOT NULL,
  fecha_fin_vigencia DATE,
  activo BOOLEAN DEFAULT TRUE,
  descripcion TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(carrera_id, nombre)
);

-- TABLA: pensum_materias (malla curricular)
CREATE TABLE IF NOT EXISTS pensum_materias (
  id SERIAL PRIMARY KEY,
  pensum_id INTEGER NOT NULL REFERENCES pensums(id) ON DELETE CASCADE,
  materia_sigla VARCHAR(20) NOT NULL REFERENCES materias(sigla) ON DELETE CASCADE,
  semestre INTEGER NOT NULL CHECK (semestre > 0 AND semestre <= 12),
  es_obligatoria BOOLEAN DEFAULT TRUE,
  prerequisitos TEXT[],                         -- Array de siglas prerequisito
  correquisitos TEXT[],                         -- Array de siglas correquisito
  orden_sugerido INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(pensum_id, materia_sigla, semestre)
);

-- TABLA: equivalencias_materias (para replicación inteligente)
CREATE TABLE IF NOT EXISTS equivalencias_materias (
  id SERIAL PRIMARY KEY,
  sigla_canonica VARCHAR(20) NOT NULL REFERENCES materias(sigla) ON DELETE CASCADE,
  codigo_fuente VARCHAR(50) NOT NULL,          -- Código alternativo
  pensum_id INTEGER REFERENCES pensums(id) ON DELETE CASCADE,
  tipo_equivalencia VARCHAR(50),               -- 'Codigo_Alternativo', 'Equivalente'
  descripcion TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(sigla_canonica, codigo_fuente, pensum_id)
);

-- ============================================
-- MÓDULO 2: PERSONAS (Estudiantes y Docentes)
-- ============================================

-- TABLA: estudiantes
CREATE TABLE IF NOT EXISTS estudiantes (
  id SERIAL PRIMARY KEY,
  codigo_estudiante VARCHAR(50) UNIQUE NOT NULL,
  nombres VARCHAR(100) NOT NULL,
  apellidos VARCHAR(100) NOT NULL,
  email VARCHAR(200) UNIQUE,
  telefono VARCHAR(50),
  carrera_id INTEGER REFERENCES carreras(id),
  pensum_id INTEGER REFERENCES pensums(id),
  fecha_ingreso DATE,
  semestre_actual INTEGER,
  estado VARCHAR(50),                          -- 'Activo', 'Egresado', 'Retirado'
  promedio_general DECIMAL(3,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- TABLA: docentes
CREATE TABLE IF NOT EXISTS docentes (
  id SERIAL PRIMARY KEY,
  codigo_docente VARCHAR(50) UNIQUE NOT NULL,
  nombres VARCHAR(100) NOT NULL,
  apellidos VARCHAR(100) NOT NULL,
  email VARCHAR(200) UNIQUE,
  telefono VARCHAR(50),
  especialidad VARCHAR(200),
  grado_academico VARCHAR(100),                -- 'Licenciatura', 'Maestría', 'Doctorado'
  departamento VARCHAR(100),
  tipo_contrato VARCHAR(50),                   -- 'Tiempo Completo', 'Tiempo Parcial'
  horas_disponibles_semana INTEGER,
  activo BOOLEAN DEFAULT TRUE,
  observaciones TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- ============================================
-- MÓDULO 3: INFRAESTRUCTURA
-- ============================================

-- TABLA: aulas
CREATE TABLE IF NOT EXISTS aulas (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE,         -- 'Aula 501', 'Lab B'
  edificio VARCHAR(100),
  piso INTEGER,
  capacidad INTEGER NOT NULL CHECK (capacidad > 0),
  tipo VARCHAR(50),                            -- 'Aula', 'Laboratorio', 'Auditorio'
  equipamiento TEXT[],                         -- Array de equipamiento
  activo BOOLEAN DEFAULT TRUE,
  observaciones TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- ============================================
-- MÓDULO 4: GESTIÓN DE HORARIOS (CORAZÓN DEL SISTEMA)
-- ============================================

-- TABLA: asignaciones (TABLA DE HECHOS - cada clase programada)
CREATE TABLE IF NOT EXISTS asignaciones (
  id SERIAL PRIMARY KEY,
  pensum_materia_id INTEGER NOT NULL REFERENCES pensum_materias(id) ON DELETE CASCADE,
  docente_id INTEGER NOT NULL REFERENCES docentes(id) ON DELETE CASCADE,
  aula_id INTEGER NOT NULL REFERENCES aulas(id) ON DELETE CASCADE,
  dia_semana INTEGER NOT NULL CHECK (dia_semana BETWEEN 1 AND 6),
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  paralelo INTEGER NOT NULL CHECK (paralelo > 0),
  serie_id UUID,                               -- Para agrupar eventos recurrentes
  gestion VARCHAR(10) NOT NULL,                -- '2025-1', '2025-2'
  tipo_clase VARCHAR(50) DEFAULT 'Regular',
  modalidad VARCHAR(50) DEFAULT 'Presencial',  -- 'Presencial', 'Virtual', 'Híbrido'
  observaciones TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  CHECK (hora_fin > hora_inicio)
);

-- TABLA: materias_externas (Inglés, Pastoral, etc.)
CREATE TABLE IF NOT EXISTS materias_externas (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(200) NOT NULL,
  tipo VARCHAR(50),                            -- 'Ingles', 'Pastoral', 'Deportes'
  descripcion TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- TABLA: horarios_externos (referencia visual)
CREATE TABLE IF NOT EXISTS horarios_externos (
  id SERIAL PRIMARY KEY,
  materia_externa_id INTEGER NOT NULL REFERENCES materias_externas(id) ON DELETE CASCADE,
  carrera_id INTEGER REFERENCES carreras(id) ON DELETE CASCADE,
  semestre INTEGER,
  dia_semana INTEGER NOT NULL CHECK (dia_semana BETWEEN 1 AND 6),
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  aula VARCHAR(100),
  observaciones TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  CHECK (hora_fin > hora_inicio)
);

-- TABLA: conflictos_log (auditoría)
CREATE TABLE IF NOT EXISTS conflictos_log (
  id SERIAL PRIMARY KEY,
  tipo_conflicto VARCHAR(50) NOT NULL,         -- 'DOCENTE', 'AULA', 'PARALELO'
  asignacion_id INTEGER REFERENCES asignaciones(id) ON DELETE SET NULL,
  descripcion TEXT NOT NULL,
  detalles JSONB,
  fecha_deteccion TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  resuelto BOOLEAN DEFAULT FALSE,
  fecha_resolucion TIMESTAMP WITH TIME ZONE,
  resolucion_aplicada TEXT
);

-- TABLA: preferencias_horario (restricciones de docentes)
CREATE TABLE IF NOT EXISTS preferencias_horario (
  id SERIAL PRIMARY KEY,
  docente_id INTEGER NOT NULL REFERENCES docentes(id) ON DELETE CASCADE,
  dia_semana INTEGER CHECK (dia_semana BETWEEN 1 AND 6),
  hora_inicio TIME,
  hora_fin TIME,
  tipo_preferencia VARCHAR(50) NOT NULL,      -- 'DISPONIBLE', 'NO_DISPONIBLE'
  prioridad INTEGER DEFAULT 1,
  observaciones TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- ============================================
-- MÓDULO 5: INSCRIPCIONES Y RENDIMIENTO
-- ============================================

-- TABLA: inscripciones
CREATE TABLE IF NOT EXISTS inscripciones (
  id SERIAL PRIMARY KEY,
  estudiante_id INTEGER NOT NULL REFERENCES estudiantes(id) ON DELETE CASCADE,
  asignacion_id INTEGER NOT NULL REFERENCES asignaciones(id) ON DELETE CASCADE,
  gestion VARCHAR(10) NOT NULL,
  fecha_inscripcion DATE DEFAULT CURRENT_DATE,
  estado VARCHAR(50) DEFAULT 'Inscrito',       -- 'Inscrito', 'Aprobado', 'Reprobado'
  nota_final DECIMAL(5,2),
  nota_literal VARCHAR(5),                     -- 'A', 'B', 'C', etc.
  asistencias INTEGER,
  faltas INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(estudiante_id, asignacion_id, gestion)
);

-- TABLA: rendimiento_academico (agregado por carrera)
CREATE TABLE IF NOT EXISTS rendimiento_academico (
  id SERIAL PRIMARY KEY,
  carrera_id INTEGER REFERENCES carreras(id) ON DELETE CASCADE,
  pensum_id INTEGER REFERENCES pensums(id) ON DELETE CASCADE,
  gestion VARCHAR(10) NOT NULL,
  semestre INTEGER,
  total_estudiantes INTEGER,
  estudiantes_aprobados INTEGER,
  estudiantes_reprobados INTEGER,
  promedio_general DECIMAL(3,2),
  tasa_desercion DECIMAL(5,2),
  tasa_graduacion DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(carrera_id, pensum_id, gestion, semestre)
);

-- ============================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- ============================================

-- Índices de búsqueda
CREATE INDEX idx_materias_nombre ON materias(nombre);
CREATE INDEX idx_materias_departamento ON materias(departamento);
CREATE INDEX idx_estudiantes_carrera ON estudiantes(carrera_id);
CREATE INDEX idx_estudiantes_estado ON estudiantes(estado);
CREATE INDEX idx_docentes_departamento ON docentes(departamento);
CREATE INDEX idx_docentes_activo ON docentes(activo);
CREATE INDEX idx_aulas_edificio ON aulas(edificio);
CREATE INDEX idx_aulas_tipo ON aulas(tipo);

-- Índices críticos para validación de conflictos
CREATE INDEX idx_asignaciones_docente_horario 
  ON asignaciones(docente_id, dia_semana, hora_inicio, hora_fin);
CREATE INDEX idx_asignaciones_aula_horario 
  ON asignaciones(aula_id, dia_semana, hora_inicio, hora_fin);
CREATE INDEX idx_asignaciones_pensum_materia 
  ON asignaciones(pensum_materia_id);
CREATE INDEX idx_asignaciones_serie 
  ON asignaciones(serie_id);
CREATE INDEX idx_asignaciones_gestion 
  ON asignaciones(gestion);
CREATE INDEX idx_asignaciones_paralelo 
  ON asignaciones(pensum_materia_id, paralelo, gestion);

-- Índices para inscripciones
CREATE INDEX idx_inscripciones_estudiante ON inscripciones(estudiante_id);
CREATE INDEX idx_inscripciones_asignacion ON inscripciones(asignacion_id);
CREATE INDEX idx_inscripciones_gestion ON inscripciones(gestion);

-- ============================================
-- FUNCIONES Y TRIGGERS
-- ============================================

-- Función para auto-actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_carreras_updated_at BEFORE UPDATE ON carreras
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_materias_updated_at BEFORE UPDATE ON materias
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pensums_updated_at BEFORE UPDATE ON pensums
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pensum_materias_updated_at BEFORE UPDATE ON pensum_materias
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_estudiantes_updated_at BEFORE UPDATE ON estudiantes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_docentes_updated_at BEFORE UPDATE ON docentes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_aulas_updated_at BEFORE UPDATE ON aulas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_asignaciones_updated_at BEFORE UPDATE ON asignaciones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inscripciones_updated_at BEFORE UPDATE ON inscripciones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rendimiento_updated_at BEFORE UPDATE ON rendimiento_academico
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNCIONES DE VALIDACIÓN
-- ============================================

-- FUNCIÓN: Validar Conflicto de Docente
CREATE OR REPLACE FUNCTION validar_conflicto_docente(
  p_docente_id INTEGER,
  p_dia_semana INTEGER,
  p_hora_inicio TIME,
  p_hora_fin TIME,
  p_gestion VARCHAR(10),
  p_asignacion_id INTEGER DEFAULT NULL
)
RETURNS TABLE(
  tiene_conflicto BOOLEAN,
  mensaje TEXT,
  asignaciones_conflicto JSONB
) AS $$
DECLARE
  v_conflictos JSONB;
BEGIN
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', a.id,
      'materia', m.nombre,
      'paralelo', a.paralelo,
      'hora_inicio', a.hora_inicio,
      'hora_fin', a.hora_fin,
      'aula', au.nombre
    )
  ) INTO v_conflictos
  FROM asignaciones a
  JOIN pensum_materias pm ON a.pensum_materia_id = pm.id
  JOIN materias m ON pm.materia_sigla = m.sigla
  JOIN aulas au ON a.aula_id = au.id
  WHERE a.docente_id = p_docente_id
    AND a.dia_semana = p_dia_semana
    AND a.gestion = p_gestion
    AND (p_asignacion_id IS NULL OR a.id != p_asignacion_id)
    AND (
      (p_hora_inicio >= a.hora_inicio AND p_hora_inicio < a.hora_fin)
      OR (p_hora_fin > a.hora_inicio AND p_hora_fin <= a.hora_fin)
      OR (p_hora_inicio <= a.hora_inicio AND p_hora_fin >= a.hora_fin)
    );

  IF v_conflictos IS NOT NULL THEN
    RETURN QUERY SELECT 
      TRUE,
      'El docente ya tiene clases asignadas en este horario',
      v_conflictos;
  ELSE
    RETURN QUERY SELECT 
      FALSE,
      'Sin conflictos',
      NULL::JSONB;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- FUNCIÓN: Validar Conflicto de Aula
CREATE OR REPLACE FUNCTION validar_conflicto_aula(
  p_aula_id INTEGER,
  p_dia_semana INTEGER,
  p_hora_inicio TIME,
  p_hora_fin TIME,
  p_gestion VARCHAR(10),
  p_asignacion_id INTEGER DEFAULT NULL
)
RETURNS TABLE(
  tiene_conflicto BOOLEAN,
  mensaje TEXT,
  asignaciones_conflicto JSONB
) AS $$
DECLARE
  v_conflictos JSONB;
BEGIN
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', a.id,
      'materia', m.nombre,
      'paralelo', a.paralelo,
      'docente', d.nombres || ' ' || d.apellidos,
      'hora_inicio', a.hora_inicio,
      'hora_fin', a.hora_fin
    )
  ) INTO v_conflictos
  FROM asignaciones a
  JOIN pensum_materias pm ON a.pensum_materia_id = pm.id
  JOIN materias m ON pm.materia_sigla = m.sigla
  JOIN docentes d ON a.docente_id = d.id
  WHERE a.aula_id = p_aula_id
    AND a.dia_semana = p_dia_semana
    AND a.gestion = p_gestion
    AND (p_asignacion_id IS NULL OR a.id != p_asignacion_id)
    AND (
      (p_hora_inicio >= a.hora_inicio AND p_hora_inicio < a.hora_fin)
      OR (p_hora_fin > a.hora_inicio AND p_hora_fin <= a.hora_fin)
      OR (p_hora_inicio <= a.hora_inicio AND p_hora_fin >= a.hora_fin)
    );

  IF v_conflictos IS NOT NULL THEN
    RETURN QUERY SELECT 
      TRUE,
      'El aula ya está ocupada en este horario',
      v_conflictos;
  ELSE
    RETURN QUERY SELECT 
      FALSE,
      'Sin conflictos',
      NULL::JSONB;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- FUNCIÓN: Validar Carga Horaria de Materia
CREATE OR REPLACE FUNCTION validar_carga_horaria_materia(
  p_pensum_materia_id INTEGER,
  p_paralelo INTEGER,
  p_gestion VARCHAR(10)
)
RETURNS TABLE(
  es_valido BOOLEAN,
  horas_asignadas INTEGER,
  horas_min INTEGER,
  horas_max INTEGER,
  mensaje TEXT
) AS $$
DECLARE
  v_horas_asignadas INTEGER;
  v_horas_min INTEGER;
  v_horas_max INTEGER;
BEGIN
  SELECT 
    COALESCE(SUM(EXTRACT(EPOCH FROM (a.hora_fin - a.hora_inicio)) / 3600), 0)::INTEGER,
    m.horas_semana_min,
    m.horas_semana_max
  INTO v_horas_asignadas, v_horas_min, v_horas_max
  FROM asignaciones a
  JOIN pensum_materias pm ON a.pensum_materia_id = pm.id
  JOIN materias m ON pm.materia_sigla = m.sigla
  WHERE a.pensum_materia_id = p_pensum_materia_id
    AND a.paralelo = p_paralelo
    AND a.gestion = p_gestion
  GROUP BY m.horas_semana_min, m.horas_semana_max;

  IF v_horas_asignadas IS NULL THEN
    SELECT horas_semana_min, horas_semana_max
    INTO v_horas_min, v_horas_max
    FROM materias m
    JOIN pensum_materias pm ON m.sigla = pm.materia_sigla
    WHERE pm.id = p_pensum_materia_id;
    
    v_horas_asignadas := 0;
  END IF;

  IF v_horas_asignadas < v_horas_min THEN
    RETURN QUERY SELECT 
      FALSE,
      v_horas_asignadas,
      v_horas_min,
      v_horas_max,
      format('Faltan %s horas para cumplir el mínimo', v_horas_min - v_horas_asignadas);
  ELSIF v_horas_asignadas > v_horas_max THEN
    RETURN QUERY SELECT 
      FALSE,
      v_horas_asignadas,
      v_horas_min,
      v_horas_max,
      format('Excede el máximo en %s horas', v_horas_asignadas - v_horas_max);
  ELSE
    RETURN QUERY SELECT 
      TRUE,
      v_horas_asignadas,
      v_horas_min,
      v_horas_max,
      'Carga horaria válida';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- VISTAS MATERIALIZADAS
-- ============================================

-- Vista: Asignaciones Completas
CREATE OR REPLACE VIEW vista_asignaciones_completas AS
SELECT 
  a.id,
  a.serie_id,
  c.nombre AS carrera,
  p.nombre AS pensum,
  pm.semestre,
  m.sigla AS materia_sigla,
  m.nombre AS materia_nombre,
  m.creditos,
  a.paralelo,
  d.nombres || ' ' || d.apellidos AS docente,
  au.nombre AS aula,
  au.edificio,
  CASE a.dia_semana
    WHEN 1 THEN 'Lunes'
    WHEN 2 THEN 'Martes'
    WHEN 3 THEN 'Miércoles'
    WHEN 4 THEN 'Jueves'
    WHEN 5 THEN 'Viernes'
    WHEN 6 THEN 'Sábado'
  END AS dia_nombre,
  a.dia_semana,
  a.hora_inicio,
  a.hora_fin,
  a.gestion,
  a.modalidad,
  a.tipo_clase
FROM asignaciones a
JOIN pensum_materias pm ON a.pensum_materia_id = pm.id
JOIN pensums p ON pm.pensum_id = p.id
JOIN carreras c ON p.carrera_id = c.id
JOIN materias m ON pm.materia_sigla = m.sigla
JOIN docentes d ON a.docente_id = d.id
JOIN aulas au ON a.aula_id = au.id;

-- Vista: Carga Docentes
CREATE OR REPLACE VIEW vista_carga_docentes AS
SELECT 
  d.id AS docente_id,
  d.nombres || ' ' || d.apellidos AS docente,
  d.departamento,
  a.gestion,
  COUNT(DISTINCT a.id) AS total_bloques,
  SUM(EXTRACT(EPOCH FROM (a.hora_fin - a.hora_inicio)) / 3600)::DECIMAL(5,2) AS horas_semana,
  d.horas_disponibles_semana,
  COUNT(DISTINCT pm.materia_sigla) AS materias_distintas
FROM docentes d
LEFT JOIN asignaciones a ON d.id = a.docente_id
LEFT JOIN pensum_materias pm ON a.pensum_materia_id = pm.id
WHERE d.activo = TRUE
GROUP BY d.id, d.nombres, d.apellidos, d.departamento, a.gestion, d.horas_disponibles_semana;

-- Vista: Ocupación Aulas
CREATE OR REPLACE VIEW vista_ocupacion_aulas AS
SELECT 
  au.id AS aula_id,
  au.nombre AS aula,
  au.edificio,
  au.capacidad,
  au.tipo,
  a.gestion,
  COUNT(DISTINCT a.id) AS bloques_asignados,
  SUM(EXTRACT(EPOCH FROM (a.hora_fin - a.hora_inicio)) / 3600)::DECIMAL(5,2) AS horas_ocupadas
FROM aulas au
LEFT JOIN asignaciones a ON au.id = a.aula_id
WHERE au.activo = TRUE
GROUP BY au.id, au.nombre, au.edificio, au.capacidad, au.tipo, a.gestion;

-- ============================================
-- DATOS DE EJEMPLO
-- ============================================

-- Carreras
INSERT INTO carreras (codigo, nombre, facultad, departamento, nivel_academico, duracion_semestres, creditos_totales) VALUES
  ('IS', 'Ingeniería de Sistemas', 'Ingeniería y Arquitectura', 'Sistemas', 'Licenciatura', 10, 280),
  ('II', 'Ingeniería Industrial', 'Ingeniería y Arquitectura', 'Industrial', 'Licenciatura', 10, 280),
  ('IC', 'Ingeniería Civil', 'Ingeniería y Arquitectura', 'Civil', 'Licenciatura', 10, 280)
ON CONFLICT (codigo) DO NOTHING;

-- Materias
INSERT INTO materias (sigla, nombre, creditos, horas_semana_min, horas_semana_max, tipo, departamento) VALUES
  ('MAT101', 'Cálculo I', 4, 4, 6, 'Teorica', 'Matemáticas'),
  ('PRG101', 'Programación I', 4, 4, 8, 'Practica', 'Sistemas'),
  ('FIS101', 'Física I', 4, 4, 6, 'Teorica', 'Física')
ON CONFLICT (sigla) DO NOTHING;

-- Docentes
INSERT INTO docentes (codigo_docente, nombres, apellidos, email, especialidad, grado_academico, departamento, tipo_contrato, horas_disponibles_semana) VALUES
  ('DOC001', 'Juan', 'Pérez García', 'juan.perez@ucb.edu.bo', 'Programación', 'Doctorado', 'Sistemas', 'Tiempo Completo', 40),
  ('DOC002', 'María', 'López Fernández', 'maria.lopez@ucb.edu.bo', 'Matemáticas', 'Maestría', 'Matemáticas', 'Tiempo Completo', 40)
ON CONFLICT (codigo_docente) DO NOTHING;

-- Aulas
INSERT INTO aulas (nombre, edificio, piso, capacidad, tipo, equipamiento) VALUES
  ('Aula 501', 'Edificio A', 5, 35, 'Aula', ARRAY['Proyector', 'Pizarra Digital']),
  ('Lab A', 'Edificio B', 3, 30, 'Laboratorio', ARRAY['30 Computadoras', 'Proyector'])
ON CONFLICT (nombre) DO NOTHING;

-- ============================================
-- COMENTARIOS FINALES
-- ============================================

COMMENT ON TABLE carreras IS 'Catálogo de carreras ofrecidas por la universidad';
COMMENT ON TABLE materias IS 'Catálogo universal de materias identificadas por sigla única';
COMMENT ON TABLE pensums IS 'Diferentes planes de estudio (pensums) por carrera';
COMMENT ON TABLE pensum_materias IS 'Malla curricular: relaciona materias con pensums y semestres';
COMMENT ON TABLE asignaciones IS 'TABLA DE HECHOS: cada fila es un bloque de clase programado';
COMMENT ON TABLE equivalencias_materias IS 'Mapeo para replicación inteligente de horarios';
COMMENT ON TABLE estudiantes IS 'Registro de estudiantes matriculados';
COMMENT ON TABLE docentes IS 'Catálogo de profesores';
COMMENT ON TABLE aulas IS 'Espacios físicos disponibles';
COMMENT ON TABLE inscripciones IS 'Relación estudiante-materia por gestión';
COMMENT ON TABLE rendimiento_academico IS 'Métricas agregadas de rendimiento por carrera';
COMMENT ON TABLE conflictos_log IS 'Auditoría de conflictos detectados';

-- ============================================
-- FIN DEL SCHEMA UNIFICADO
-- ============================================
