/**
 * Servicio de Gestión de Horarios
 * 
 * Este módulo contiene toda la lógica de negocio para la gestión
 * inteligente de horarios académicos, incluyendo:
 * - Validación de conflictos (docentes, aulas, paralelos)
 * - Replicación inteligente de asignaciones
 * - Validación de carga horaria
 * - Operaciones CRUD con reglas de negocio
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseClient } from './database';
import { v4 as uuidv4 } from 'uuid';

// ============================================
// TIPOS Y INTERFACES
// ============================================

export interface Asignacion {
  id?: number;
  pensum_materia_id: number;
  docente_id: number;
  aula_id: number;
  dia_semana: number; // 1=Lunes, 6=Sábado
  hora_inicio: string; // 'HH:MM'
  hora_fin: string; // 'HH:MM'
  paralelo: number;
  serie_id?: string;
  gestion: string; // '2025-1'
  tipo_clase?: string;
  modalidad?: string;
  observaciones?: string;
}

export interface ConflictoDetalle {
  error: boolean;
  type: 'CONFLICTO_DOCENTE' | 'CONFLICTO_AULA' | 'CONFLICTO_PARALELO' | 'CARGA_HORARIA_INVALIDA';
  message: string;
  details?: any;
}

export interface ResultadoValidacion {
  valido: boolean;
  conflictos: ConflictoDetalle[];
}

export interface ResultadoReplicacion {
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

// ============================================
// MOTOR DE VALIDACIÓN DE CONFLICTOS
// ============================================

/**
 * Valida todos los posibles conflictos de una asignación
 */
export async function validarAsignacion(
  asignacion: Asignacion,
  asignacion_id?: number
): Promise<ResultadoValidacion> {
  const conflictos: ConflictoDetalle[] = [];
  const supabase = getSupabaseClient();

  try {
    // 1. Validar conflicto de docente
    const conflictoDocente = await validarConflictoDocente(
      supabase,
      asignacion.docente_id,
      asignacion.dia_semana,
      asignacion.hora_inicio,
      asignacion.hora_fin,
      asignacion.gestion,
      asignacion_id
    );

    if (conflictoDocente.tiene_conflicto) {
      conflictos.push({
        error: true,
        type: 'CONFLICTO_DOCENTE',
        message: 'El docente ya tiene clases asignadas en este horario',
        details: conflictoDocente.asignaciones_conflicto,
      });
    }

    // 2. Validar conflicto de aula
    const conflictoAula = await validarConflictoAula(
      supabase,
      asignacion.aula_id,
      asignacion.dia_semana,
      asignacion.hora_inicio,
      asignacion.hora_fin,
      asignacion.gestion,
      asignacion_id
    );

    if (conflictoAula.tiene_conflicto) {
      conflictos.push({
        error: true,
        type: 'CONFLICTO_AULA',
        message: 'El aula ya está ocupada en este horario',
        details: conflictoAula.asignaciones_conflicto,
      });
    }

    // 3. Validar conflicto de paralelo (mismo grupo no puede tener 2 materias al mismo tiempo)
    const conflictoParalelo = await validarConflictoParalelo(
      supabase,
      asignacion.pensum_materia_id,
      asignacion.paralelo,
      asignacion.dia_semana,
      asignacion.hora_inicio,
      asignacion.hora_fin,
      asignacion.gestion,
      asignacion_id
    );

    if (conflictoParalelo.tiene_conflicto) {
      conflictos.push({
        error: true,
        type: 'CONFLICTO_PARALELO',
        message: 'El paralelo ya tiene otra materia asignada en este horario',
        details: conflictoParalelo.asignaciones_conflicto,
      });
    }

    return {
      valido: conflictos.length === 0,
      conflictos,
    };
  } catch (error) {
    console.error('Error en validación de asignación:', error);
    throw error;
  }
}

/**
 * Valida conflicto de docente usando la función de la base de datos
 */
async function validarConflictoDocente(
  supabase: SupabaseClient,
  docente_id: number,
  dia_semana: number,
  hora_inicio: string,
  hora_fin: string,
  gestion: string,
  asignacion_id?: number
): Promise<{ tiene_conflicto: boolean; asignaciones_conflicto: any }> {
  const { data, error } = await supabase.rpc('validar_conflicto_docente', {
    p_docente_id: docente_id,
    p_dia_semana: dia_semana,
    p_hora_inicio: hora_inicio,
    p_hora_fin: hora_fin,
    p_gestion: gestion,
    p_asignacion_id: asignacion_id || null,
  });

  if (error) throw error;

  return {
    tiene_conflicto: data[0]?.tiene_conflicto || false,
    asignaciones_conflicto: data[0]?.asignaciones_conflicto || null,
  };
}

/**
 * Valida conflicto de aula usando la función de la base de datos
 */
async function validarConflictoAula(
  supabase: SupabaseClient,
  aula_id: number,
  dia_semana: number,
  hora_inicio: string,
  hora_fin: string,
  gestion: string,
  asignacion_id?: number
): Promise<{ tiene_conflicto: boolean; asignaciones_conflicto: any }> {
  const { data, error } = await supabase.rpc('validar_conflicto_aula', {
    p_aula_id: aula_id,
    p_dia_semana: dia_semana,
    p_hora_inicio: hora_inicio,
    p_hora_fin: hora_fin,
    p_gestion: gestion,
    p_asignacion_id: asignacion_id || null,
  });

  if (error) throw error;

  return {
    tiene_conflicto: data[0]?.tiene_conflicto || false,
    asignaciones_conflicto: data[0]?.asignaciones_conflicto || null,
  };
}

/**
 * Valida conflicto de paralelo (mismo grupo con otra materia al mismo tiempo)
 */
async function validarConflictoParalelo(
  supabase: SupabaseClient,
  pensum_materia_id: number,
  paralelo: number,
  dia_semana: number,
  hora_inicio: string,
  hora_fin: string,
  gestion: string,
  asignacion_id?: number
): Promise<{ tiene_conflicto: boolean; asignaciones_conflicto: any }> {
  // Obtener el pensum_id de la materia actual
  const { data: pensumMateria, error: errorPensum } = await supabase
    .from('pensum_materias')
    .select('pensum_id, semestre')
    .eq('id', pensum_materia_id)
    .single();

  if (errorPensum) throw errorPensum;

  // Buscar otras asignaciones del mismo paralelo, mismo pensum, mismo semestre
  // que se solapen en el horario
  const { data, error } = await supabase
    .from('asignaciones')
    .select(`
      id,
      paralelo,
      dia_semana,
      hora_inicio,
      hora_fin,
      pensum_materias!inner (
        pensum_id,
        semestre,
        materia_sigla,
        materias (
          nombre
        )
      )
    `)
    .eq('pensum_materias.pensum_id', pensumMateria.pensum_id)
    .eq('pensum_materias.semestre', pensumMateria.semestre)
    .eq('paralelo', paralelo)
    .eq('dia_semana', dia_semana)
    .eq('gestion', gestion)
    .neq('id', asignacion_id || -1);

  if (error) throw error;

  // Filtrar los que se solapan en horario
  const conflictos = data?.filter((a: any) => {
    return (
      (hora_inicio >= a.hora_inicio && hora_inicio < a.hora_fin) ||
      (hora_fin > a.hora_inicio && hora_fin <= a.hora_fin) ||
      (hora_inicio <= a.hora_inicio && hora_fin >= a.hora_fin)
    );
  });

  return {
    tiene_conflicto: conflictos && conflictos.length > 0,
    asignaciones_conflicto:
      conflictos && conflictos.length > 0 ? conflictos : null,
  };
}

/**
 * Valida la carga horaria de una materia
 */
export async function validarCargaHoraria(
  pensum_materia_id: number,
  paralelo: number,
  gestion: string
): Promise<{
  es_valido: boolean;
  horas_asignadas: number;
  horas_min: number;
  horas_max: number;
  mensaje: string;
}> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase.rpc('validar_carga_horaria_materia', {
    p_pensum_materia_id: pensum_materia_id,
    p_paralelo: paralelo,
    p_gestion: gestion,
  });

  if (error) throw error;

  return data[0];
}

// ============================================
// OPERACIONES CRUD CON VALIDACIÓN
// ============================================

/**
 * Crea una nueva asignación con validación completa
 */
export async function crearAsignacion(
  asignacion: Asignacion
): Promise<{ success: boolean; data?: any; error?: ConflictoDetalle }> {
  const supabase = getSupabaseClient();

  try {
    // 1. Validar la asignación
    const validacion = await validarAsignacion(asignacion);

    if (!validacion.valido) {
      // Registrar el conflicto en el log
      await registrarConflicto(validacion.conflictos[0], null);

      return {
        success: false,
        error: validacion.conflictos[0],
      };
    }

    // 2. Generar serie_id si no existe
    if (!asignacion.serie_id) {
      asignacion.serie_id = uuidv4();
    }

    // 3. Insertar la asignación
    const { data, error } = await supabase
      .from('asignaciones')
      .insert(asignacion)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('Error al crear asignación:', error);
    throw error;
  }
}

/**
 * Actualiza una asignación existente con validación
 */
export async function actualizarAsignacion(
  asignacion_id: number,
  cambios: Partial<Asignacion>,
  aplicar_a_serie: boolean = false
): Promise<{ success: boolean; data?: any; error?: ConflictoDetalle }> {
  const supabase = getSupabaseClient();

  try {
    // 1. Obtener la asignación actual
    const { data: asignacionActual, error: errorActual } = await supabase
      .from('asignaciones')
      .select('*')
      .eq('id', asignacion_id)
      .single();

    if (errorActual) throw errorActual;

    // 2. Combinar con los cambios
    const asignacionNueva = { ...asignacionActual, ...cambios };

    // 3. Validar la nueva asignación
    const validacion = await validarAsignacion(asignacionNueva, asignacion_id);

    if (!validacion.valido) {
      await registrarConflicto(validacion.conflictos[0], asignacion_id);

      return {
        success: false,
        error: validacion.conflictos[0],
      };
    }

    // 4. Aplicar cambios
    if (aplicar_a_serie && asignacionActual.serie_id) {
      // Actualizar todas las asignaciones de la serie
      const { data, error } = await supabase
        .from('asignaciones')
        .update(cambios)
        .eq('serie_id', asignacionActual.serie_id)
        .select();

      if (error) throw error;

      return {
        success: true,
        data,
      };
    } else {
      // Actualizar solo esta asignación
      const { data, error } = await supabase
        .from('asignaciones')
        .update(cambios)
        .eq('id', asignacion_id)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data,
      };
    }
  } catch (error) {
    console.error('Error al actualizar asignación:', error);
    throw error;
  }
}

/**
 * Elimina una asignación (con opción de eliminar toda la serie)
 */
export async function eliminarAsignacion(
  asignacion_id: number,
  eliminar_serie: boolean = false
): Promise<{ success: boolean; eliminadas: number }> {
  const supabase = getSupabaseClient();

  try {
    if (eliminar_serie) {
      // Obtener serie_id
      const { data: asignacion, error: errorAsig } = await supabase
        .from('asignaciones')
        .select('serie_id')
        .eq('id', asignacion_id)
        .single();

      if (errorAsig) throw errorAsig;

      if (asignacion.serie_id) {
        // Eliminar toda la serie
        const { error } = await supabase
          .from('asignaciones')
          .delete()
          .eq('serie_id', asignacion.serie_id);

        if (error) throw error;

        return {
          success: true,
          eliminadas: 1, // Devolver count si es necesario
        };
      }
    }

    // Eliminar solo esta asignación
    const { error } = await supabase
      .from('asignaciones')
      .delete()
      .eq('id', asignacion_id);

    if (error) throw error;

    return {
      success: true,
      eliminadas: 1,
    };
  } catch (error) {
    console.error('Error al eliminar asignación:', error);
    throw error;
  }
}

// ============================================
// REPLICACIÓN INTELIGENTE
// ============================================

/**
 * Replica una asignación a todas las carreras/pensums equivalentes
 */
export async function replicarAsignacion(
  asignacion_base: Asignacion
): Promise<ResultadoReplicacion> {
  const supabase = getSupabaseClient();

  try {
    // 1. Obtener la materia de la asignación base
    const { data: pensumMateria, error: errorPM } = await supabase
      .from('pensum_materias')
      .select(`
        materia_sigla,
        semestre,
        pensums (
          id,
          nombre,
          carreras (
            nombre
          )
        )
      `)
      .eq('id', asignacion_base.pensum_materia_id)
      .single();

    if (errorPM) throw errorPM;

    // 2. Buscar equivalencias de esta materia
    const { data: equivalencias, error: errorEquiv } = await supabase
      .from('equivalencias_materias')
      .select('sigla_canonica, pensum_id')
      .eq('sigla_canonica', pensumMateria.materia_sigla);

    if (errorEquiv) throw errorEquiv;

    // 3. Para cada equivalencia, buscar el pensum_materia_id correspondiente
    const resultados = [];
    let exitosas = 0;
    let fallidas = 0;

    for (const equiv of equivalencias || []) {
      try {
        // Buscar la materia en el pensum destino con el mismo semestre
        const { data: pensumMateriaDestino, error: errorDest } = await supabase
          .from('pensum_materias')
          .select(`
            id,
            pensums (
              nombre,
              carreras (
                nombre
              )
            )
          `)
          .eq('pensum_id', equiv.pensum_id)
          .eq('materia_sigla', equiv.sigla_canonica)
          .eq('semestre', pensumMateria.semestre)
          .single();

        if (errorDest) {
          resultados.push({
            carrera: 'Desconocida',
            pensum: 'Desconocido',
            exito: false,
            error: 'No se encontró materia equivalente en el pensum destino',
          });
          fallidas++;
          continue;
        }

        // Crear la asignación replicada
        const asignacionReplicada: Asignacion = {
          ...asignacion_base,
          pensum_materia_id: pensumMateriaDestino.id,
          serie_id: asignacion_base.serie_id || uuidv4(), // Usar mismo serie_id
        };

        const resultado = await crearAsignacion(asignacionReplicada);

        if (resultado.success) {
          exitosas++;
          resultados.push({
            carrera: pensumMateriaDestino.pensums.carreras.nombre,
            pensum: pensumMateriaDestino.pensums.nombre,
            exito: true,
          });
        } else {
          fallidas++;
          resultados.push({
            carrera: pensumMateriaDestino.pensums.carreras.nombre,
            pensum: pensumMateriaDestino.pensums.nombre,
            exito: false,
            error: resultado.error?.message || 'Error desconocido',
          });
        }
      } catch (error) {
        fallidas++;
        resultados.push({
          carrera: 'Desconocida',
          pensum: 'Desconocido',
          exito: false,
          error: error instanceof Error ? error.message : 'Error desconocido',
        });
      }
    }

    return {
      exitoso: fallidas === 0,
      asignaciones_creadas: exitosas,
      asignaciones_fallidas: fallidas,
      detalles: resultados,
    };
  } catch (error) {
    console.error('Error en replicación inteligente:', error);
    throw error;
  }
}

// ============================================
// REGISTRO DE CONFLICTOS
// ============================================

/**
 * Registra un conflicto detectado en el log
 */
async function registrarConflicto(
  conflicto: ConflictoDetalle,
  asignacion_id: number | null
): Promise<void> {
  const supabase = getSupabaseClient();

  try {
    await supabase.from('conflictos_log').insert({
      tipo_conflicto: conflicto.type.replace('CONFLICTO_', ''),
      asignacion_id,
      descripcion: conflicto.message,
      detalles: conflicto.details,
      resuelto: false,
    });
  } catch (error) {
    console.error('Error al registrar conflicto:', error);
    // No lanzar error, solo logging
  }
}

// ============================================
// CONSULTAS ÚTILES
// ============================================

/**
 * Obtiene todas las asignaciones de una gestión con filtros opcionales
 */
export async function obtenerAsignaciones(filtros: {
  gestion: string;
  carrera_id?: number;
  pensum_id?: number;
  semestre?: number;
  docente_id?: number;
  aula_id?: number;
  dia_semana?: number;
}): Promise<any[]> {
  const supabase = getSupabaseClient();

  let query = supabase
    .from('vista_asignaciones_completas')
    .select('*')
    .eq('gestion', filtros.gestion);

  if (filtros.docente_id) {
    // Necesitaríamos join adicional o vista modificada
  }

  if (filtros.aula_id) {
    // Necesitaríamos join adicional o vista modificada
  }

  if (filtros.dia_semana) {
    query = query.eq('dia_semana', filtros.dia_semana);
  }

  const { data, error } = await query;

  if (error) throw error;

  return data || [];
}

/**
 * Obtiene la carga horaria de un docente
 */
export async function obtenerCargaDocente(
  docente_id: number,
  gestion: string
): Promise<any> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('vista_carga_docentes')
    .select('*')
    .eq('docente_id', docente_id)
    .eq('gestion', gestion)
    .single();

  if (error) throw error;

  return data;
}

/**
 * Obtiene conflictos sin resolver
 */
export async function obtenerConflictosPendientes(): Promise<any[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('conflictos_log')
    .select('*')
    .eq('resuelto', false)
    .order('fecha_deteccion', { ascending: false });

  if (error) throw error;

  return data || [];
}

/**
 * Marca un conflicto como resuelto
 */
export async function resolverConflicto(
  conflicto_id: number,
  resolucion: string
): Promise<void> {
  const supabase = getSupabaseClient();

  await supabase
    .from('conflictos_log')
    .update({
      resuelto: true,
      fecha_resolucion: new Date().toISOString(),
      resolucion_aplicada: resolucion,
    })
    .eq('id', conflicto_id);
}
