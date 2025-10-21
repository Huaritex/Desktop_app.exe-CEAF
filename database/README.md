# Database - CEAF Dashboard UCB

Este directorio contiene el esquema de base de datos unificado para el proyecto CEAF Dashboard UCB.

## 📋 Archivo Principal

### `schema_unificado.sql`

**Schema completo sin redundancia** que incluye:

- ✅ **Gestión Académica Completa:** Estudiantes, carreras, rendimiento
- ✅ **Sistema Inteligente de Horarios:** Validación, replicación, gestión de series
- ✅ **Sin Redundancia:** Cada concepto existe una sola vez
- ✅ **15 Tablas Relacionales** organizadas en 5 módulos funcionales
- ✅ **3 Funciones de Validación** en PostgreSQL para máximo performance
- ✅ **3 Vistas Materializadas** para reporting y análisis

---

## 🏗️ Arquitectura del Schema

### Módulo 1: Estructura Académica (5 tablas)
```
carreras → pensums → pensum_materias → asignaciones
                          ↓
                      materias
                          ↓
              equivalencias_materias
```

- **`carreras`** - Programas académicos (IS, II, IC, etc.)
- **`materias`** - Catálogo universal de materias (PK: sigla)
- **`pensums`** - Planes de estudio por carrera (Pensum 2017, 2023, etc.)
- **`pensum_materias`** - Malla curricular (junction table: pensum ↔ materia)
- **`equivalencias_materias`** - Mapeo para replicación inteligente entre carreras

### Módulo 2: Personas (2 tablas)

- **`estudiantes`** - Registro completo de alumnos matriculados
- **`docentes`** - Catálogo de profesores con especialidades y disponibilidad

### Módulo 3: Infraestructura (1 tabla)

- **`aulas`** - Espacios físicos (capacidad, tipo, equipamiento)

### Módulo 4: Gestión de Horarios ⭐ (5 tablas - Corazón del Sistema)

- **`asignaciones`** - **TABLA DE HECHOS** (cada clase programada)
  - Incluye: docente, aula, horario, paralelo, serie_id para agrupar eventos
- **`materias_externas`** - Inglés, Pastoral, Deportes, etc.
- **`horarios_externos`** - Referencias visuales de materias no del sistema
- **`conflictos_log`** - Auditoría de conflictos detectados y resoluciones
- **`preferencias_horario`** - Restricciones y disponibilidad de docentes

### Módulo 5: Inscripciones y Rendimiento (2 tablas)

- **`inscripciones`** - Relación estudiante ↔ asignación por gestión
- **`rendimiento_academico`** - Métricas agregadas por carrera

---

## 🚀 Instalación

### 1. Crear Proyecto en Supabase

1. Ve a [Supabase Dashboard](https://app.supabase.com/)
2. Crea un nuevo proyecto
3. Guarda las credenciales:
   - **Project URL** (VITE_SUPABASE_URL)
   - **anon public key** (VITE_SUPABASE_ANON_KEY)
   - **service_role key** (SUPABASE_SERVICE_KEY)

### 2. Ejecutar el Schema Unificado

1. Ir a **Supabase Dashboard** → **SQL Editor** → **New Query**
2. Copiar **TODO** el contenido de `database/schema_unificado.sql`
3. Pegar en el SQL Editor y ejecutar (puede tomar 1-2 minutos)
4. Verificar en **Table Editor** que se crearon todas las tablas

---

## ✨ Características Clave del Schema

### 🔍 Validación Automática de Conflictos

El sistema incluye 3 funciones PostgreSQL para validación:

```sql
-- Valida conflictos de horario de docentes
validar_conflicto_docente(docente_id, dia_semana, hora_inicio, hora_fin, gestion)

-- Valida conflictos de ocupación de aulas
validar_conflicto_aula(aula_id, dia_semana, hora_inicio, hora_fin, gestion)

-- Valida que las horas asignadas estén dentro del rango permitido
validar_carga_horaria_materia(pensum_materia_id, paralelo, gestion)
```

### 🔄 Replicación Inteligente

Usa la tabla `equivalencias_materias` para mapear códigos alternativos:

```sql
-- Ejemplo: MAT101 tiene código alternativo MAT-I en Pensum 2017
INSERT INTO equivalencias_materias (sigla_canonica, codigo_fuente, pensum_id)
VALUES ('MAT101', 'MAT-I', 1);
```

Cuando replicas una asignación, el sistema:
1. Busca todas las equivalencias de la materia
2. Encuentra todos los pensums que incluyen esa materia
3. Crea asignaciones idénticas en cada pensum
4. Agrupa todas con el mismo `serie_id` UUID

### 📊 Vistas Materializadas para Reporting

```sql
-- Vista completa de todas las asignaciones con joins
vista_asignaciones_completas

-- Carga horaria por docente
vista_carga_docentes  

-- Ocupación de aulas por gestión
vista_ocupacion_aulas
```

### 🔐 Seguridad y Auditoría

- **Timestamps automáticos:** Todas las tablas tienen `created_at` y `updated_at`
- **Triggers:** Auto-actualización de `updated_at` en cada cambio
- **Logs de conflictos:** Tabla `conflictos_log` registra todos los conflictos detectados
- **RLS Ready:** Schema preparado para Row Level Security

---

## 📖 Guía de Uso

### Crear una Nueva Carrera y Pensum

```sql
-- 1. Crear la carrera
INSERT INTO carreras (codigo, nombre, facultad, departamento, nivel_academico, duracion_semestres, creditos_totales)
VALUES ('IS', 'Ingeniería de Sistemas', 'Ingeniería y Arquitectura', 'Sistemas', 'Licenciatura', 10, 280);

-- 2. Crear el pensum
INSERT INTO pensums (nombre, carrera_id, fecha_vigencia)
VALUES ('Pensum 2025', 1, '2025-01-01');

-- 3. Agregar materias al pensum
INSERT INTO pensum_materias (pensum_id, materia_sigla, semestre, es_obligatoria)
VALUES (1, 'MAT101', 1, TRUE);
```

### Crear una Asignación con Validación

```typescript
// Desde el frontend React
const nuevaAsignacion = {
  pensum_materia_id: 1,
  docente_id: 2,
  aula_id: 3,
  dia_semana: 1, // Lunes
  hora_inicio: '08:00',
  hora_fin: '10:00',
  paralelo: 1,
  gestion: '2025-1'
};

// El sistema automáticamente:
// 1. Valida conflictos de docente
// 2. Valida conflictos de aula
// 3. Genera un serie_id UUID
// 4. Registra en conflictos_log si hay problemas
const resultado = await window.api.crearAsignacion(nuevaAsignacion);
```

### Replicar a Otras Carreras

```typescript
// Replica una asignación existente a todas las carreras
// que tengan la misma materia en su pensum
const resultado = await window.api.replicarAsignacion({
  asignacion_id: 123
});

console.log(`Creadas: ${resultado.asignaciones_creadas}`);
console.log(`Fallidas: ${resultado.asignaciones_fallidas}`);
```

---

## 🔧 Mantenimiento

### Verificar Integridad

```sql
-- Ver todas las asignaciones con información completa
SELECT * FROM vista_asignaciones_completas
WHERE gestion = '2025-1'
ORDER BY dia_semana, hora_inicio;

-- Ver carga de docentes
SELECT * FROM vista_carga_docentes
WHERE gestion = '2025-1' AND horas_semana > horas_disponibles_semana;

-- Ver conflictos pendientes
SELECT * FROM conflictos_log
WHERE resuelto = FALSE
ORDER BY fecha_deteccion DESC;
```

### Backup y Restauración

```bash
# Backup (desde terminal)
pg_dump -h db.xxxxxxxxxxxx.supabase.co -U postgres -d postgres > backup.sql

# Restauración
psql -h db.xxxxxxxxxxxx.supabase.co -U postgres -d postgres < backup.sql
```

---

## 📚 Recursos Adicionales

- **Documentación Técnica:** `/docs/HORARIOS_SISTEMA.md`
- **Resumen de Implementación:** `/docs/IMPLEMENTACION_RESUMEN.md`
- **Servicio de Horarios:** `/electron/services/horarios.ts`
- **IPC Handlers:** `/electron/main.ts`

---

## 🆘 Solución de Problemas

### Error: "relation does not exist"

**Causa:** El schema no se ejecutó correctamente en Supabase.

**Solución:**
1. Ir a Supabase Dashboard → SQL Editor
2. Ejecutar: `DROP SCHEMA public CASCADE; CREATE SCHEMA public;`
3. Re-ejecutar `schema_unificado.sql` completo

### Error: "violates foreign key constraint"

**Causa:** Intentaste crear una asignación referenciando IDs que no existen.

**Solución:**
1. Verificar que existan: carrera → pensum → pensum_materia
2. Verificar que existan: docente, aula
3. Usar la vista para verificar datos existentes:
   ```sql
   SELECT * FROM vista_asignaciones_completas LIMIT 10;
   ```

### Rendimiento lento en validaciones

**Causa:** Falta ejecutar ANALYZE después de insertar muchos datos.

**Solución:**
```sql
ANALYZE asignaciones;
ANALYZE pensum_materias;
REFRESH MATERIALIZED VIEW vista_asignaciones_completas;
```

---

## 🎓 Conceptos Clave

### ¿Por qué `materias.sigla` como PK y no ID?

- **Siglas son únicas y significativas:** MAT101, PRG201
- **Facilita referencias cruzadas** entre pensums
- **Simplifica equivalencias** - mapeo directo de códigos
- **Mejor para replicación** - identificador natural

### ¿Cómo funciona la replicación?

1. Materia `MAT101` existe en pensum de IS, II, IC
2. Se crea asignación para MAT101 en IS
3. Sistema busca en `equivalencias_materias` si hay códigos alternativos
4. Encuentra todos los `pensum_materias` con sigla `MAT101` o equivalentes
5. Crea asignaciones idénticas en cada pensum
6. Agrupa todas con mismo `serie_id` UUID

### ¿Qué es una serie de eventos?

- **Concepto:** Grupo de asignaciones relacionadas (mismo horario, diferentes carreras/pensums)
- **Identificador:** Campo `serie_id` (UUID)
- **Ventaja:** Operaciones en lote (actualizar/eliminar todas a la vez)
- **Ejemplo:** Clase de Matemáticas I que se replica a 3 carreras → 3 asignaciones con mismo `serie_id`

---

## 📚 Referencias Adicionales

- **Documentación Completa:** Ver `/docs/HORARIOS_SISTEMA.md`
- **Resumen Ejecutivo:** Ver `/docs/IMPLEMENTACION_RESUMEN.md`
- **Guía de Migración:** Ver `/database/MIGRACION.md`
- **Código Backend:** Ver `/electron/services/horarios.ts`

---

## ✅ Checklist de Configuración

- [ ] Proyecto Supabase creado
- [ ] Credenciales guardadas (URL, anon_key, service_key)
- [ ] Schema ejecutado (15 tablas, 3 funciones, 3 vistas)
- [ ] Datos de ejemplo insertados (opcional)
- [ ] Variables de entorno configuradas en `.env`
- [ ] Conexión probada desde la aplicación

---

**✨ Schema Unificado Listo Para Producción**
