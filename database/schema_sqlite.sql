-- ============================================
-- CEAF Dashboard UCB - Schema SQLite
-- Sistema Completo de Gestión Académica
-- ============================================
-- Convertido de PostgreSQL a SQLite
-- Compatible con better-sqlite3
-- ============================================

-- ============================================
-- MÓDULO 1: ESTRUCTURA ACADÉMICA
-- ============================================

-- TABLA: carreras
CREATE TABLE IF NOT EXISTS carreras (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  codigo TEXT UNIQUE NOT NULL,
  nombre TEXT NOT NULL,
  facultad TEXT NOT NULL,
  departamento TEXT,
  nivel_academico TEXT,
  duracion_semestres INTEGER,
  creditos_totales INTEGER,
  activo INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- TABLA: materias
CREATE TABLE IF NOT EXISTS materias (
  sigla TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  creditos INTEGER NOT NULL CHECK (creditos > 0),
  horas_semana_min INTEGER NOT NULL CHECK (horas_semana_min > 0),
  horas_semana_max INTEGER NOT NULL CHECK (horas_semana_max >= horas_semana_min),
  tipo TEXT,
  departamento TEXT,
  descripcion TEXT,
  activo INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- TABLA: pensums
CREATE TABLE IF NOT EXISTS pensums (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  carrera_id INTEGER NOT NULL REFERENCES carreras(id) ON DELETE CASCADE,
  fecha_vigencia TEXT NOT NULL,
  fecha_fin_vigencia TEXT,
  activo INTEGER DEFAULT 1,
  descripcion TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  UNIQUE(carrera_id, nombre)
);

-- TABLA: pensum_materias
CREATE TABLE IF NOT EXISTS pensum_materias (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pensum_id INTEGER NOT NULL REFERENCES pensums(id) ON DELETE CASCADE,
  materia_sigla TEXT NOT NULL REFERENCES materias(sigla) ON DELETE CASCADE,
  semestre INTEGER NOT NULL CHECK (semestre > 0 AND semestre <= 12),
  es_obligatoria INTEGER DEFAULT 1,
  prerequisitos TEXT,  -- JSON array como string
  correquisitos TEXT,  -- JSON array como string
  orden_sugerido INTEGER,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  UNIQUE(pensum_id, materia_sigla, semestre)
);

-- TABLA: equivalencias_materias
CREATE TABLE IF NOT EXISTS equivalencias_materias (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sigla_canonica TEXT NOT NULL REFERENCES materias(sigla) ON DELETE CASCADE,
  codigo_fuente TEXT NOT NULL,
  pensum_id INTEGER REFERENCES pensums(id) ON DELETE CASCADE,
  tipo_equivalencia TEXT,
  descripcion TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(sigla_canonica, codigo_fuente, pensum_id)
);

-- ============================================
-- MÓDULO 2: PERSONAS
-- ============================================

-- TABLA: estudiantes
CREATE TABLE IF NOT EXISTS estudiantes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  codigo_estudiante TEXT UNIQUE NOT NULL,
  nombres TEXT NOT NULL,
  apellidos TEXT NOT NULL,
  email TEXT UNIQUE,
  telefono TEXT,
  carrera_id INTEGER REFERENCES carreras(id),
  pensum_id INTEGER REFERENCES pensums(id),
  fecha_ingreso TEXT,
  semestre_actual INTEGER,
  estado TEXT,
  promedio_general REAL,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- TABLA: docentes
CREATE TABLE IF NOT EXISTS docentes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  codigo_docente TEXT UNIQUE NOT NULL,
  nombres TEXT NOT NULL,
  apellidos TEXT NOT NULL,
  email TEXT UNIQUE,
  telefono TEXT,
  especialidad TEXT,
  grado_academico TEXT,
  departamento TEXT,
  tipo_contrato TEXT,
  horas_disponibles_semana INTEGER,
  activo INTEGER DEFAULT 1,
  observaciones TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- ============================================
-- MÓDULO 3: INFRAESTRUCTURA
-- ============================================

-- TABLA: aulas
CREATE TABLE IF NOT EXISTS aulas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL UNIQUE,
  edificio TEXT,
  piso INTEGER,
  capacidad INTEGER NOT NULL CHECK (capacidad > 0),
  tipo TEXT,
  equipamiento TEXT,  -- JSON array como string
  activo INTEGER DEFAULT 1,
  observaciones TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- ============================================
-- MÓDULO 4: GESTIÓN DE HORARIOS
-- ============================================

-- TABLA: asignaciones
CREATE TABLE IF NOT EXISTS asignaciones (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pensum_materia_id INTEGER NOT NULL REFERENCES pensum_materias(id) ON DELETE CASCADE,
  docente_id INTEGER NOT NULL REFERENCES docentes(id) ON DELETE CASCADE,
  aula_id INTEGER NOT NULL REFERENCES aulas(id) ON DELETE CASCADE,
  dia_semana INTEGER NOT NULL CHECK (dia_semana BETWEEN 1 AND 6),
  hora_inicio TEXT NOT NULL,
  hora_fin TEXT NOT NULL,
  paralelo INTEGER NOT NULL CHECK (paralelo > 0),
  serie_id TEXT,
  gestion TEXT NOT NULL,
  tipo_clase TEXT DEFAULT 'Regular',
  modalidad TEXT DEFAULT 'Presencial',
  observaciones TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  CHECK (hora_fin > hora_inicio)
);

-- TABLA: materias_externas
CREATE TABLE IF NOT EXISTS materias_externas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  tipo TEXT,
  descripcion TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- TABLA: horarios_externos
CREATE TABLE IF NOT EXISTS horarios_externos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  materia_externa_id INTEGER NOT NULL REFERENCES materias_externas(id) ON DELETE CASCADE,
  carrera_id INTEGER REFERENCES carreras(id) ON DELETE CASCADE,
  semestre INTEGER,
  dia_semana INTEGER NOT NULL CHECK (dia_semana BETWEEN 1 AND 6),
  hora_inicio TEXT NOT NULL,
  hora_fin TEXT NOT NULL,
  aula TEXT,
  observaciones TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  CHECK (hora_fin > hora_inicio)
);

-- TABLA: conflictos_log
CREATE TABLE IF NOT EXISTS conflictos_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tipo_conflicto TEXT NOT NULL,
  asignacion_id INTEGER REFERENCES asignaciones(id) ON DELETE SET NULL,
  descripcion TEXT NOT NULL,
  detalles TEXT,  -- JSON como string
  fecha_deteccion TEXT DEFAULT (datetime('now')),
  resuelto INTEGER DEFAULT 0,
  fecha_resolucion TEXT,
  resolucion_aplicada TEXT
);

-- TABLA: preferencias_horario
CREATE TABLE IF NOT EXISTS preferencias_horario (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  docente_id INTEGER NOT NULL REFERENCES docentes(id) ON DELETE CASCADE,
  dia_semana INTEGER CHECK (dia_semana BETWEEN 1 AND 6),
  hora_inicio TEXT,
  hora_fin TEXT,
  tipo_preferencia TEXT NOT NULL,
  prioridad INTEGER DEFAULT 1,
  observaciones TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- ============================================
-- MÓDULO 5: INSCRIPCIONES Y RENDIMIENTO
-- ============================================

-- TABLA: inscripciones
CREATE TABLE IF NOT EXISTS inscripciones (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  estudiante_id INTEGER NOT NULL REFERENCES estudiantes(id) ON DELETE CASCADE,
  asignacion_id INTEGER NOT NULL REFERENCES asignaciones(id) ON DELETE CASCADE,
  gestion TEXT NOT NULL,
  fecha_inscripcion TEXT DEFAULT (date('now')),
  estado TEXT DEFAULT 'Inscrito',
  nota_final REAL,
  nota_literal TEXT,
  asistencias INTEGER,
  faltas INTEGER,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  UNIQUE(estudiante_id, asignacion_id, gestion)
);

-- TABLA: rendimiento_academico
CREATE TABLE IF NOT EXISTS rendimiento_academico (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  carrera_id INTEGER REFERENCES carreras(id) ON DELETE CASCADE,
  pensum_id INTEGER REFERENCES pensums(id) ON DELETE CASCADE,
  gestion TEXT NOT NULL,
  semestre INTEGER,
  total_estudiantes INTEGER,
  estudiantes_aprobados INTEGER,
  estudiantes_reprobados INTEGER,
  promedio_general REAL,
  tasa_desercion REAL,
  tasa_graduacion REAL,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  UNIQUE(carrera_id, pensum_id, gestion, semestre)
);

-- ============================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- ============================================

CREATE INDEX IF NOT EXISTS idx_materias_nombre ON materias(nombre);
CREATE INDEX IF NOT EXISTS idx_materias_departamento ON materias(departamento);
CREATE INDEX IF NOT EXISTS idx_estudiantes_carrera ON estudiantes(carrera_id);
CREATE INDEX IF NOT EXISTS idx_estudiantes_estado ON estudiantes(estado);
CREATE INDEX IF NOT EXISTS idx_docentes_departamento ON docentes(departamento);
CREATE INDEX IF NOT EXISTS idx_docentes_activo ON docentes(activo);
CREATE INDEX IF NOT EXISTS idx_aulas_edificio ON aulas(edificio);
CREATE INDEX IF NOT EXISTS idx_aulas_tipo ON aulas(tipo);

-- Índices críticos para horarios
CREATE INDEX IF NOT EXISTS idx_asignaciones_docente_horario 
  ON asignaciones(docente_id, dia_semana, hora_inicio, hora_fin);
CREATE INDEX IF NOT EXISTS idx_asignaciones_aula_horario 
  ON asignaciones(aula_id, dia_semana, hora_inicio, hora_fin);
CREATE INDEX IF NOT EXISTS idx_asignaciones_pensum_materia 
  ON asignaciones(pensum_materia_id);
CREATE INDEX IF NOT EXISTS idx_asignaciones_serie 
  ON asignaciones(serie_id);
CREATE INDEX IF NOT EXISTS idx_asignaciones_gestion 
  ON asignaciones(gestion);
CREATE INDEX IF NOT EXISTS idx_asignaciones_paralelo 
  ON asignaciones(pensum_materia_id, paralelo, gestion);

-- Índices para inscripciones
CREATE INDEX IF NOT EXISTS idx_inscripciones_estudiante ON inscripciones(estudiante_id);
CREATE INDEX IF NOT EXISTS idx_inscripciones_asignacion ON inscripciones(asignacion_id);
CREATE INDEX IF NOT EXISTS idx_inscripciones_gestion ON inscripciones(gestion);

-- ============================================
-- TRIGGERS PARA AUTO-UPDATE
-- ============================================

CREATE TRIGGER IF NOT EXISTS update_carreras_timestamp 
AFTER UPDATE ON carreras
BEGIN
  UPDATE carreras SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_materias_timestamp 
AFTER UPDATE ON materias
BEGIN
  UPDATE materias SET updated_at = datetime('now') WHERE sigla = NEW.sigla;
END;

CREATE TRIGGER IF NOT EXISTS update_pensums_timestamp 
AFTER UPDATE ON pensums
BEGIN
  UPDATE pensums SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_pensum_materias_timestamp 
AFTER UPDATE ON pensum_materias
BEGIN
  UPDATE pensum_materias SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_estudiantes_timestamp 
AFTER UPDATE ON estudiantes
BEGIN
  UPDATE estudiantes SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_docentes_timestamp 
AFTER UPDATE ON docentes
BEGIN
  UPDATE docentes SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_aulas_timestamp 
AFTER UPDATE ON aulas
BEGIN
  UPDATE aulas SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_asignaciones_timestamp 
AFTER UPDATE ON asignaciones
BEGIN
  UPDATE asignaciones SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_inscripciones_timestamp 
AFTER UPDATE ON inscripciones
BEGIN
  UPDATE inscripciones SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_rendimiento_timestamp 
AFTER UPDATE ON rendimiento_academico
BEGIN
  UPDATE rendimiento_academico SET updated_at = datetime('now') WHERE id = NEW.id;
END;

-- ============================================
-- VISTAS
-- ============================================

CREATE VIEW IF NOT EXISTS vista_asignaciones_completas AS
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

-- ============================================
-- DATOS DE EJEMPLO
-- ============================================

INSERT OR IGNORE INTO carreras (codigo, nombre, facultad, departamento, nivel_academico, duracion_semestres, creditos_totales) VALUES
  ('IS', 'Ingeniería de Sistemas', 'Ingeniería y Arquitectura', 'Sistemas', 'Licenciatura', 10, 280),
  ('II', 'Ingeniería Industrial', 'Ingeniería y Arquitectura', 'Industrial', 'Licenciatura', 10, 280),
  ('IC', 'Ingeniería Civil', 'Ingeniería y Arquitectura', 'Civil', 'Licenciatura', 10, 280);

INSERT OR IGNORE INTO materias (sigla, nombre, creditos, horas_semana_min, horas_semana_max, tipo, departamento) VALUES
  ('MAT101', 'Cálculo I', 4, 4, 6, 'Teorica', 'Matemáticas'),
  ('PRG101', 'Programación I', 4, 4, 8, 'Practica', 'Sistemas'),
  ('FIS101', 'Física I', 4, 4, 6, 'Teorica', 'Física');

INSERT OR IGNORE INTO docentes (codigo_docente, nombres, apellidos, email, especialidad, grado_academico, departamento, tipo_contrato, horas_disponibles_semana) VALUES
  ('DOC001', 'Juan', 'Pérez García', 'juan.perez@ucb.edu.bo', 'Programación', 'Doctorado', 'Sistemas', 'Tiempo Completo', 40),
  ('DOC002', 'María', 'López Fernández', 'maria.lopez@ucb.edu.bo', 'Matemáticas', 'Maestría', 'Matemáticas', 'Tiempo Completo', 40);

INSERT OR IGNORE INTO aulas (nombre, edificio, piso, capacidad, tipo, equipamiento) VALUES
  ('Aula 501', 'Edificio A', 5, 35, 'Aula', '["Proyector", "Pizarra Digital"]'),
  ('Lab A', 'Edificio B', 3, 30, 'Laboratorio', '["30 Computadoras", "Proyector"]');
