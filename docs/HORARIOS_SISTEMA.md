# 📅 Sistema de Gestión Inteligente de Horarios

## Documentación Técnica Completa

**Versión:** 2.0  
**Fecha:** Octubre 2025  
**Estado:** ✅ Implementado

---

## 📋 Tabla de Contenidos

1. [Visión General](#visión-general)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Modelo de Datos](#modelo-de-datos)
4. [API Backend](#api-backend)
5. [Interfaz de Usuario](#interfaz-de-usuario)
6. [Flujos de Trabajo](#flujos-de-trabajo)
7. [Guía de Implementación](#guía-de-implementación)

---

## 🎯 Visión General

### Objetivo

Desarrollar un sistema robusto y escalable para la gestión académica de horarios que permita:

- ✅ **Validación automática de conflictos** (docentes, aulas, paralelos)
- ✅ **Replicación inteligente** de horarios entre carreras y pensums
- ✅ **Gestión de series** de eventos recurrentes
- ✅ **Interfaz drag & drop** intuitiva
- ✅ **Validación de carga horaria** por materia
- ✅ **Registro y seguimiento de conflictos**

### Características Principales

#### 1. Motor de Validación de Conflictos

El sistema valida automáticamente:

- **Conflictos de Docente**: Un docente no puede estar en dos lugares al mismo tiempo
- **Conflictos de Aula**: Un aula no puede tener dos clases simultáneas
- **Conflictos de Paralelo**: Un grupo de estudiantes no puede tener dos materias al mismo tiempo
- **Carga Horaria**: Las horas asignadas deben estar dentro del rango permitido

#### 2. Replicación Inteligente

Permite replicar horarios automáticamente:

- Entre diferentes pensums (ej: Pensum 2017 y Pensum 2023)
- Entre carreras que comparten materias (ej: Cálculo I en Sistemas e Industrial)
- Usando tabla de equivalencias para mapeo automático

#### 3. Gestión de Series

- Agrupa eventos recurrentes con un `serie_id` único (UUID)
- Permite aplicar cambios a toda una serie o solo a un evento específico
- Facilita la reorganización masiva de horarios

---

## 🏗️ Arquitectura del Sistema

### Capas del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│ CAPA DE PRESENTACIÓN (React + TypeScript)                   │
│ - Calendario interactivo con drag & drop                    │
│ - Formularios dinámicos de asignación                       │
│ - Panel de conflictos y alertas                             │
│ - Modales de confirmación para series                       │
└─────────────────────────────────────────────────────────────┘
                            ↕ IPC
┌─────────────────────────────────────────────────────────────┐
│ PRELOAD SCRIPT (Puente Seguro)                              │
│ - API de horarios expuesta vía contextBridge                │
│ - Validación de parámetros antes de enviar                  │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│ CAPA DE LÓGICA DE NEGOCIO (Node.js/Electron Main Process)   │
│ - electron/services/horarios.ts                             │
│ - Motor de validación de conflictos                         │
│ - Algoritmo de replicación inteligente                      │
│ - Validación de carga horaria                               │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│ CAPA DE DATOS (Supabase PostgreSQL)                         │
│ - 12 tablas relacionales                                    │
│ - Funciones almacenadas para validación                     │
│ - Triggers para auditoría                                   │
│ - Vistas materializadas para reporting                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Modelo de Datos

### Diagrama de Relaciones

```
carreras ──┬─── pensums ──┬─── pensum_materias ─── asignaciones
           │              │                              │
           │              └─── equivalencias_materias    │
           │                                             │
           └─── horarios_externos                        │
                                                         │
materias ────────────────────── pensum_materias ────────┘
                                                         │
docentes ────────────────────────────────────────────────┤
                                                         │
aulas ───────────────────────────────────────────────────┘
```

### Tablas Esenciales

#### 1. `materias` (Catálogo Universal)

**Propósito:** Almacena todas las materias de la universidad, identificadas únicamente por su sigla.

```sql
CREATE TABLE materias (
  sigla VARCHAR(20) PRIMARY KEY,  -- Identificador único
  nombre VARCHAR(200) NOT NULL,
  creditos INTEGER NOT NULL,
  horas_semana_min INTEGER NOT NULL,
  horas_semana_max INTEGER NOT NULL,
  tipo VARCHAR(50),              -- 'Teorica', 'Practica', etc.
  departamento VARCHAR(100),
  activo BOOLEAN DEFAULT TRUE
);
```

**Ejemplo:**
```sql
INSERT INTO materias VALUES 
  ('MAT101', 'Cálculo I', 4, 4, 6, 'Teorica', 'Matemáticas'),
  ('PRG101', 'Programación I', 4, 4, 8, 'Practica', 'Sistemas');
```

#### 2. `pensums` (Planes de Estudio)

**Propósito:** Define los diferentes planes de estudio por carrera y año.

```sql
CREATE TABLE pensums (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,    -- 'Pensum 2017', 'Pensum 2023'
  carrera_id INTEGER REFERENCES carreras(id),
  fecha_vigencia DATE NOT NULL,
  activo BOOLEAN DEFAULT TRUE
);
```

#### 3. `pensum_materias` (Tabla de Unión)

**Propósito:** Relaciona materias con pensums específicos y semestres.

```sql
CREATE TABLE pensum_materias (
  id SERIAL PRIMARY KEY,
  pensum_id INTEGER REFERENCES pensums(id),
  materia_sigla VARCHAR(20) REFERENCES materias(sigla),
  semestre INTEGER NOT NULL,       -- 1, 2, 3...
  es_obligatoria BOOLEAN DEFAULT TRUE,
  prerequisitos TEXT[],            -- Array de siglas
  UNIQUE(pensum_id, materia_sigla, semestre)
);
```

#### 4. `asignaciones` ⭐ (TABLA DE HECHOS)

**Propósito:** Cada fila es un bloque de clase programado. El corazón del sistema.

```sql
CREATE TABLE asignaciones (
  id SERIAL PRIMARY KEY,
  pensum_materia_id INTEGER REFERENCES pensum_materias(id),
  docente_id INTEGER REFERENCES docentes(id),
  aula_id INTEGER REFERENCES aulas(id),
  dia_semana INTEGER CHECK (dia_semana BETWEEN 1 AND 6),
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  paralelo INTEGER NOT NULL,
  serie_id UUID,                   -- Para agrupar eventos recurrentes
  gestion VARCHAR(10) NOT NULL,    -- '2025-1'
  tipo_clase VARCHAR(50),
  modalidad VARCHAR(50),
  CHECK (hora_fin > hora_inicio)
);
```

**Índices Críticos:**
```sql
-- Para validación de conflictos rápida
CREATE INDEX idx_asignaciones_docente_horario 
  ON asignaciones(docente_id, dia_semana, hora_inicio, hora_fin);

CREATE INDEX idx_asignaciones_aula_horario 
  ON asignaciones(aula_id, dia_semana, hora_inicio, hora_fin);

CREATE INDEX idx_asignaciones_serie 
  ON asignaciones(serie_id);
```

#### 5. `equivalencias_materias` (Replicación Inteligente)

**Propósito:** Mapea códigos alternativos y equivalencias para replicación automática.

```sql
CREATE TABLE equivalencias_materias (
  id SERIAL PRIMARY KEY,
  sigla_canonica VARCHAR(20) REFERENCES materias(sigla),
  codigo_fuente VARCHAR(50),       -- Código alternativo
  pensum_id INTEGER REFERENCES pensums(id),
  tipo_equivalencia VARCHAR(50)
);
```

**Ejemplo:**
```sql
-- CPA 208 en Pensum 2017 es equivalente a MAT101 (Cálculo I)
INSERT INTO equivalencias_materias VALUES 
  (DEFAULT, 'MAT101', 'CPA 208', 1, 'Codigo_Alternativo');
```

#### 6. `conflictos_log` (Registro de Conflictos)

**Propósito:** Auditoría de todos los conflictos detectados y su resolución.

```sql
CREATE TABLE conflictos_log (
  id SERIAL PRIMARY KEY,
  tipo_conflicto VARCHAR(50),      -- 'DOCENTE', 'AULA', 'PARALELO'
  asignacion_id INTEGER REFERENCES asignaciones(id),
  descripcion TEXT NOT NULL,
  detalles JSONB,
  fecha_deteccion TIMESTAMP DEFAULT NOW(),
  resuelto BOOLEAN DEFAULT FALSE
);
```

### Funciones Almacenadas

#### `validar_conflicto_docente()`

```sql
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
)
```

**Lógica:**
1. Busca asignaciones del mismo docente
2. En el mismo día de la semana y gestión
3. Que se solapen en horario
4. Excluye la asignación actual (si es una edición)
5. Devuelve detalles completos de los conflictos encontrados

#### `validar_carga_horaria_materia()`

```sql
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
)
```

**Lógica:**
1. Suma todas las horas asignadas para esa materia y paralelo
2. Compara con `horas_semana_min` y `horas_semana_max` de la tabla `materias`
3. Devuelve si es válido y cuántas horas faltan o sobran

---

## 🔌 API Backend

### Servicio: `electron/services/horarios.ts`

#### Métodos Principales

##### 1. `crearAsignacion(asignacion)`

Crea una nueva asignación con validación completa.

**Parámetros:**
```typescript
{
  pensum_materia_id: number;
  docente_id: number;
  aula_id: number;
  dia_semana: number;          // 1=Lunes, 6=Sábado
  hora_inicio: string;          // 'HH:MM'
  hora_fin: string;
  paralelo: number;
  gestion: string;              // '2025-1'
  serie_id?: string;            // UUID (se genera automáticamente)
}
```

**Retorna:**
```typescript
{
  success: boolean;
  data?: any;                   // Asignación creada
  error?: ConflictoDetalle;     // Detalles del conflicto si hay
}
```

**Flujo:**
1. Valida conflictos (docente, aula, paralelo)
2. Si hay conflictos, registra en `conflictos_log` y retorna error detallado
3. Si no hay conflictos, genera `serie_id` si no existe
4. Inserta la asignación
5. Retorna éxito con los datos creados

##### 2. `actualizarAsignacion(asignacion_id, cambios, aplicar_a_serie)`

Actualiza una asignación existente.

**Parámetros:**
```typescript
{
  asignacion_id: number;
  cambios: Partial<Asignacion>;
  aplicar_a_serie: boolean;     // ¿Aplicar a toda la serie?
}
```

**Retorna:**
```typescript
{
  success: boolean;
  data?: any;                   // Asignación(es) actualizada(s)
  error?: ConflictoDetalle;
}
```

**Flujo:**
1. Obtiene asignación actual
2. Combina con cambios
3. Valida nueva asignación
4. Si `aplicar_a_serie` es true, actualiza todas las asignaciones con el mismo `serie_id`
5. Si es false, actualiza solo esa asignación

##### 3. `replicarAsignacion(asignacion_base)`

Replica automáticamente una asignación a carreras/pensums equivalentes.

**Parámetros:**
```typescript
{
  // Mismos campos que crearAsignacion
}
```

**Retorna:**
```typescript
{
  exitoso: boolean;
  asignaciones_creadas: number;
  asignaciones_fallidas: number;
  detalles: Array<{
    carrera: string;
    pensum: string;
    exito: boolean;
    error?: string;
  }>;
}
```

**Flujo:**
1. Obtiene la materia de la asignación base
2. Busca en `equivalencias_materias` todas las equivalencias
3. Para cada equivalencia:
   - Encuentra el `pensum_materia_id` correspondiente
   - Crea una nueva asignación con los mismos datos
   - Usa el mismo `serie_id` para agruparlas
4. Devuelve resultado detallado con éxitos y fallos

##### 4. `validarAsignacion(asignacion)`

Valida sin guardar (útil para mostrar errores antes de confirmar).

**Retorna:**
```typescript
{
  valido: boolean;
  conflictos: ConflictoDetalle[];
}
```

### Handlers IPC (Main Process)

Todos expuestos en `electron/main.ts`:

```typescript
// Crear asignación
ipcMain.handle('handle-crear-asignacion', async (_event, asignacion) => {
  // Usa HorariosService.crearAsignacion()
});

// Actualizar asignación
ipcMain.handle('handle-actualizar-asignacion', async (
  _event, 
  { asignacion_id, cambios, aplicar_a_serie }
) => {
  // Usa HorariosService.actualizarAsignacion()
});

// Eliminar asignación
ipcMain.handle('handle-eliminar-asignacion', async (
  _event,
  { asignacion_id, eliminar_serie }
) => {
  // Usa HorariosService.eliminarAsignacion()
});

// Validar asignación
ipcMain.handle('handle-validar-asignacion', async (_event, asignacion) => {
  // Usa HorariosService.validarAsignacion()
});

// Validar carga horaria
ipcMain.handle('handle-validar-carga-horaria', async (
  _event,
  { pensum_materia_id, paralelo, gestion }
) => {
  // Usa HorariosService.validarCargaHoraria()
});

// Replicar asignación
ipcMain.handle('handle-replicar-asignacion', async (_event, asignacion) => {
  // Usa HorariosService.replicarAsignacion()
});

// Obtener asignaciones
ipcMain.handle('handle-obtener-asignaciones', async (_event, filtros) => {
  // Usa HorariosService.obtenerAsignaciones()
});

// Obtener carga de docente
ipcMain.handle('handle-obtener-carga-docente', async (
  _event,
  { docente_id, gestion }
) => {
  // Usa HorariosService.obtenerCargaDocente()
});

// Obtener conflictos pendientes
ipcMain.handle('handle-obtener-conflictos-pendientes', async () => {
  // Usa HorariosService.obtenerConflictosPendientes()
});

// Resolver conflicto
ipcMain.handle('handle-resolver-conflicto', async (
  _event,
  { conflicto_id, resolucion }
) => {
  // Usa HorariosService.resolverConflicto()
});
```

---

## 🎨 Interfaz de Usuario

### Componentes Clave a Implementar

#### 1. `CalendarioInteractivo.tsx`

Calendario semanal con drag & drop.

**Características:**
- Vista semanal (Lunes a Sábado)
- Franjas horarias configurable (7:00 - 21:00)
- Bloques arrastrables representando asignaciones
- Color-coded por carrera/tipo
- Tooltips con información detallada

**Librerías sugeridas:**
- `react-beautiful-dnd` (ya agregado a package.json)
- `@dnd-kit/core` (alternativa moderna)

**Estructura:**
```typescript
interface CalendarioProps {
  gestion: string;
  filtros: {
    carrera_id?: number;
    semestre?: number;
  };
  onAsignacionClick: (asignacion: any) => void;
  onAsignacionDrop: (asignacionId: number, nuevoDia: number, nuevaHora: string) => void;
}
```

#### 2. `ModalSerieEvento.tsx`

Modal que aparece al modificar/eliminar una asignación que pertenece a una serie.

**Opciones:**
- "Aplicar solo a este evento"
- "Aplicar a todos los eventos de la serie"

```typescript
interface ModalSerieProps {
  open: boolean;
  tipoAccion: 'modificar' | 'eliminar';
  onConfirm: (aplicarASerie: boolean) => void;
  onCancel: () => void;
}
```

#### 3. `FormularioAsignacion.tsx`

Formulario inteligente para crear/editar asignaciones.

**Flujo dinámico:**
1. Seleccionar Carrera → Actualiza select de Pensum
2. Seleccionar Pensum → Actualiza select de Semestre
3. Seleccionar Semestre → Actualiza select de Materias
4. Mostrar información contextual:
   - Paralelos existentes
   - Horas ya asignadas
   - Docentes disponibles en ese horario

**Validación en tiempo real:**
- Al cambiar docente/aula/horario, validar conflictos
- Mostrar alertas visuales antes de guardar

#### 4. `PanelConflictos.tsx`

Barra lateral o panel que muestra conflictos pendientes.

**Información mostrada:**
- Tipo de conflicto
- Descripción detallada
- Opciones para resolver
- Fecha de detección

```typescript
interface ConflictoItem {
  id: number;
  tipo: 'DOCENTE' | 'AULA' | 'PARALELO';
  descripcion: string;
  detalles: any;
  fecha_deteccion: string;
  acciones: Array<{
    label: string;
    onClick: () => void;
  }>;
}
```

#### 5. `PanelMateriasExternas.tsx`

Referencia visual de horarios fijos (Inglés, Pastoral, etc.).

**Características:**
- Solo lectura
- Estilo visual diferenciado (ej: gris, patrón diagonal)
- Tooltip explicativo

---

## 🔄 Flujos de Trabajo

### Flujo 1: Crear Nueva Asignación

```
Usuario:
  1. Abre formulario de asignación
  2. Selecciona Carrera → Pensum → Semestre → Materia
  3. Selecciona Docente
  4. Selecciona Aula
  5. Selecciona Día y Horario
  6. Click "Guardar"

Sistema:
  7. Llama a window.api.validarAsignacion()
  8. Si hay conflictos:
     - Muestra diálogo con detalles del conflicto
     - Opciones: "Cancelar" o "Forzar guardar" (con permisos)
  9. Si no hay conflictos:
     - Pregunta: "¿Desea replicar a otras carreras?"
     - Si acepta: Llama a window.api.replicarAsignacion()
     - Si no: Llama a window.api.crearAsignacion()
  10. Actualiza calendario
  11. Muestra notificación de éxito
```

### Flujo 2: Mover Asignación con Drag & Drop

```
Usuario:
  1. Arrastra bloque de asignación
  2. Suelta en nuevo día/hora

Sistema:
  3. Identifica si pertenece a una serie
  4. Si serie_id existe:
     - Muestra ModalSerieEvento
     - Usuario elige: "Solo este" o "Toda la serie"
  5. Llama a window.api.validarAsignacion() con nuevos datos
  6. Si hay conflictos:
     - Muestra alerta
     - Revierte posición visual
  7. Si no hay conflictos:
     - Llama a window.api.actualizarAsignacion()
     - Actualiza calendario
  8. Muestra notificación
```

### Flujo 3: Replicación Inteligente

```
Usuario:
  1. Crea asignación para "Cálculo I" en "Ingeniería de Sistemas"
  2. Acepta replicar

Sistema:
  3. Busca en equivalencias_materias:
     - "MAT101" está en Pensum de Ing. Industrial
     - "MAT101" está en Pensum de Ing. Civil
  4. Para cada pensum encontrado:
     - Obtiene pensum_materia_id
     - Crea asignación idéntica (mismo docente, aula, horario)
     - Usa mismo serie_id para agrupar
  5. Muestra resultado:
     - "Replicado a 2 carreras"
     - "1 conflicto detectado en Ing. Civil"
  6. Usuario puede revisar y ajustar
```

---

## 🚀 Guía de Implementación

### Fase 1: Base de Datos (Semana 1-2)

**Tareas:**
- ✅ Ejecutar `database/schema_unificado.sql` en Supabase
- ✅ Verificar creación de tablas con queries de prueba
- ✅ Insertar datos de ejemplo (carreras, materias, docentes)
- ⏳ Probar funciones almacenadas manualmente

**Validación:**
```sql
-- Verificar que las funciones funcionan
SELECT * FROM validar_conflicto_docente(1, 1, '08:00', '10:00', '2025-1');
SELECT * FROM validar_carga_horaria_materia(1, 1, '2025-1');
```

### Fase 2: Backend/Servicios (Semana 2-3)

**Tareas:**
- ✅ Implementado `electron/services/horarios.ts`
- ⏳ Instalar dependencias: `npm install uuid @types/uuid`
- ⏳ Probar cada función de servicio con datos de prueba
- ⏳ Verificar manejo de errores

**Validación:**
```bash
# Después de npm install
npm run type-check
# No debería haber errores en horarios.ts
```

### Fase 3: Handlers IPC (Semana 3)

**Tareas:**
- ✅ Implementados handlers en `electron/main.ts`
- ✅ Actualizado `electron/preload.ts`
- ⏳ Probar cada endpoint con Postman/curl (si es posible)
- ⏳ Documentar respuestas esperadas

### Fase 4: UI - Calendario Básico (Semana 4-5)

**Tareas:**
- ⏳ Crear componente `CalendarioInteractivo.tsx`
- ⏳ Implementar vista semanal estática (sin drag & drop)
- ⏳ Conectar con `window.api.obtenerAsignaciones()`
- ⏳ Renderizar bloques de asignaciones
- ⏳ Implementar click para ver detalles

**Prototipo mínimo:**
```typescript
function CalendarioInteractivo() {
  const [asignaciones, setAsignaciones] = useState([]);

  useEffect(() => {
    window.api.obtenerAsignaciones({ gestion: '2025-1' })
      .then(result => {
        if (result.success) {
          setAsignaciones(result.data);
        }
      });
  }, []);

  return (
    <div className="grid grid-cols-7 gap-2">
      {/* Renderizar días de la semana */}
      {/* Renderizar bloques de asignaciones */}
    </div>
  );
}
```

### Fase 5: Drag & Drop (Semana 5-6)

**Tareas:**
- ⏳ Integrar `react-beautiful-dnd`
- ⏳ Hacer bloques arrastrables
- ⏳ Implementar `onDragEnd` handler
- ⏳ Validar con `window.api.validarAsignacion()` antes de soltar
- ⏳ Mostrar indicador visual de validación

**Ejemplo:**
```typescript
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

function onDragEnd(result) {
  if (!result.destination) return;

  const asignacionId = result.draggableId;
  const nuevoDia = result.destination.droppableId;
  const nuevaHora = calcularHoraDesdeIndex(result.destination.index);

  // Validar antes de aplicar
  window.api.validarAsignacion({
    ...asignacion,
    dia_semana: nuevoDia,
    hora_inicio: nuevaHora
  }).then(result => {
    if (result.validacion.valido) {
      // Actualizar
      window.api.actualizarAsignacion({...});
    } else {
      // Mostrar error
      mostrarAlerta(result.validacion.conflictos[0]);
    }
  });
}
```

### Fase 6: Formulario Inteligente (Semana 6-7)

**Tareas:**
- ⏳ Crear `FormularioAsignacion.tsx`
- ⏳ Implementar selects en cascada (Carrera → Pensum → Semestre → Materia)
- ⏳ Validación en tiempo real
- ⏳ Mostrar información contextual
- ⏳ Integrar con API de creación

### Fase 7: Gestión de Series (Semana 7)

**Tareas:**
- ⏳ Crear `ModalSerieEvento.tsx`
- ⏳ Detectar si asignación tiene `serie_id`
- ⏳ Mostrar modal al editar/eliminar
- ⏳ Implementar lógica para aplicar cambios a serie

### Fase 8: Replicación Inteligente (Semana 8)

**Tareas:**
- ⏳ Agregar botón "Replicar" en formulario
- ⏳ Integrar con `window.api.replicarAsignacion()`
- ⏳ Mostrar resultado detallado
- ⏳ Permitir ajustes manuales después

### Fase 9: Panel de Conflictos (Semana 9)

**Tareas:**
- ⏳ Crear `PanelConflictos.tsx`
- ⏳ Conectar con `window.api.obtenerConflictosPendientes()`
- ⏳ Implementar acciones de resolución
- ⏳ Actualizar en tiempo real

### Fase 10: Testing y Refinamiento (Semana 10)

**Tareas:**
- ⏳ Pruebas de usuario con casos reales
- ⏳ Optimización de rendimiento
- ⏳ Ajustes de UX
- ⏳ Documentación de usuario

---

## 📊 Métricas de Éxito

### KPIs Técnicos

- ⏱️ Tiempo de validación de conflictos: < 500ms
- 📦 Tamaño de bundle: < 5MB
- 🔄 Tiempo de replicación: < 2s para 10 carreras
- 💾 Consultas a BD: < 100ms promedio

### KPIs de Negocio

- ✅ Reducción de conflictos detectados post-implementación: > 90%
- 📉 Tiempo de creación de horario por carrera: < 2 horas
- 👥 Tasa de adopción por coordinadores: > 80%

---

## 📚 Referencias

### Archivos Implementados

1. `database/schema_unificado.sql` - ✅ Schema unificado completo
2. `electron/services/horarios.ts` - ✅ Lógica de negocio
3. `electron/main.ts` - ✅ Handlers IPC actualizados
4. `electron/preload.ts` - ✅ API expuesta al frontend
5. `package.json` - ✅ Dependencias actualizadas

### Próximos Pasos

1. ⏳ `npm install` para instalar dependencias
2. ⏳ Ejecutar schema en Supabase
3. ⏳ Empezar Fase 4 (UI Calendario)

---

**Documentación generada:** Octubre 2025  
**Versión del sistema:** 2.0  
**Estado:** Backend completo, Frontend pendiente
