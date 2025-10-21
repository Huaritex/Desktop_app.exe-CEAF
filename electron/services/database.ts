/**
 * Servicio de Base de Datos para Electron (Main Process)
 * 
 * IMPORTANTE: Este servicio SOLO debe ser utilizado en el Main Process.
 * Usa la SERVICE_KEY para operaciones administrativas.
 * Nunca expongas este módulo al Renderer Process.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseAdmin: SupabaseClient | null = null;

/**
 * Inicializa el cliente de Supabase con privilegios administrativos
 */
export function initializeSupabase(): SupabaseClient {
  if (supabaseAdmin) {
    return supabaseAdmin;
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      'Faltan credenciales de Supabase. Asegúrate de configurar VITE_SUPABASE_URL y SUPABASE_SERVICE_KEY en .env'
    );
  }

  supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return supabaseAdmin;
}

/**
 * Obtiene el cliente de Supabase (singleton)
 */
export function getSupabaseClient(): SupabaseClient {
  if (!supabaseAdmin) {
    return initializeSupabase();
  }
  return supabaseAdmin;
}

/**
 * Obtiene datos del dashboard con filtros opcionales
 */
export async function fetchDashboardData(filters?: {
  semester?: string;
  department?: string;
}) {
  const supabase = getSupabaseClient();

  try {
    // Obtener conteo de estudiantes
    let studentsQuery = supabase
      .from('students')
      .select('*', { count: 'exact' });

    if (filters?.semester) {
      studentsQuery = studentsQuery.eq('current_semester', filters.semester);
    }

    const { count: totalStudents, error: studentsError } = await studentsQuery;

    if (studentsError) throw studentsError;

    // Obtener conteo de docentes
    let facultyQuery = supabase
      .from('faculty')
      .select('*', { count: 'exact' });

    if (filters?.department) {
      facultyQuery = facultyQuery.eq('department', filters.department);
    }

    const { count: totalFaculty, error: facultyError } = await facultyQuery;

    if (facultyError) throw facultyError;

    // Obtener conteo de programas
    let programsQuery = supabase
      .from('academic_programs')
      .select('*', { count: 'exact' });

    if (filters?.department) {
      programsQuery = programsQuery.eq('department', filters.department);
    }

    const { count: totalPrograms, error: programsError } = await programsQuery;

    if (programsError) throw programsError;

    // Obtener rendimiento académico
    let performanceQuery = supabase
      .from('academic_performance')
      .select('*');

    if (filters?.semester) {
      performanceQuery = performanceQuery.eq('semester', filters.semester);
    }

    const { data: performanceData, error: performanceError } =
      await performanceQuery;

    if (performanceError) throw performanceError;

    // Calcular GPA promedio
    const avgGPA =
      performanceData?.reduce((sum, item) => sum + (item.average_gpa || 0), 0) /
        (performanceData?.length || 1) || 0;

    return {
      totalStudents: totalStudents || 0,
      totalFaculty: totalFaculty || 0,
      totalPrograms: totalPrograms || 0,
      averageGPA: avgGPA.toFixed(2),
      performanceData: performanceData || [],
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
}

/**
 * Importa datos desde CSV/XLSX
 * ADVERTENCIA: Esta operación es destructiva y reemplaza todos los datos
 */
export async function importData(data: {
  students?: any[];
  faculty?: any[];
  courses?: any[];
  programs?: any[];
  sections?: any[];
  enrollments?: any[];
}) {
  const supabase = getSupabaseClient();

  try {
    const results = {
      estudiantes: 0,
      docentes: 0,
      materias: 0,
      carreras: 0,
      asignaciones: 0,
      inscripciones: 0,
    };

    // Importar carreras primero (es clave foránea)
    if (data.programs && data.programs.length > 0) {
      // Eliminar datos existentes
      await supabase.from('carreras').delete().neq('id', 0);
      
      // Insertar nuevos datos
      const { error: programsError } = await supabase
        .from('carreras')
        .insert(data.programs);

      if (programsError) throw programsError;
      results.carreras = data.programs.length;
    }

    // Importar estudiantes
    if (data.students && data.students.length > 0) {
      await supabase.from('estudiantes').delete().neq('id', 0);
      
      const { error: studentsError } = await supabase
        .from('estudiantes')
        .insert(data.students);

      if (studentsError) throw studentsError;
      results.estudiantes = data.students.length;
    }

    // Importar docentes
    if (data.faculty && data.faculty.length > 0) {
      await supabase.from('docentes').delete().neq('id', 0);
      
      const { error: facultyError } = await supabase
        .from('docentes')
        .insert(data.faculty);

      if (facultyError) throw facultyError;
      results.docentes = data.faculty.length;
    }

    // Importar materias
    if (data.courses && data.courses.length > 0) {
      await supabase.from('materias').delete().neq('sigla', '');
      
      const { error: coursesError } = await supabase
        .from('materias')
        .insert(data.courses);

      if (coursesError) throw coursesError;
      results.materias = data.courses.length;
    }

    // Importar asignaciones
    if (data.sections && data.sections.length > 0) {
      await supabase.from('asignaciones').delete().neq('id', 0);
      
      const { error: sectionsError } = await supabase
        .from('asignaciones')
        .insert(data.sections);

      if (sectionsError) throw sectionsError;
      results.asignaciones = data.sections.length;
    }

    // Importar inscripciones
    if (data.enrollments && data.enrollments.length > 0) {
      await supabase.from('inscripciones').delete().neq('id', 0);
      
      const { error: enrollmentsError} = await supabase
        .from('inscripciones')
        .insert(data.enrollments);

      if (enrollmentsError) throw enrollmentsError;
      results.inscripciones = data.enrollments.length;
    }

    return results;
  } catch (error) {
    console.error('Error importing data:', error);
    throw error;
  }
}

/**
 * Verifica la conectividad con Supabase
 */
export async function checkDatabaseConnectivity(): Promise<boolean> {
  try {
    const supabase = getSupabaseClient();
    const { error } = await supabase.from('carreras').select('id').limit(1);
    return !error;
  } catch (error) {
    console.error('Error checking connectivity:', error);
    return false;
  }
}

/**
 * Obtiene estudiantes con filtros opcionales
 */
export async function getStudents(filters?: {
  carrera?: string;
  semestre?: string;
  estado?: string;
}) {
  const supabase = getSupabaseClient();
  
  let query = supabase
    .from('estudiantes')
    .select('*, carreras(nombre, departamento)');

  if (filters?.carrera) {
    query = query.eq('carrera_id', filters.carrera);
  }
  
  if (filters?.semestre) {
    query = query.eq('semestre_actual', filters.semestre);
  }
  
  if (filters?.estado) {
    query = query.eq('estado', filters.estado);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
}

/**
 * Obtiene docentes con filtros opcionales
 */
export async function getFaculty(filters?: {
  departamento?: string;
  especialidad?: string;
}) {
  const supabase = getSupabaseClient();
  
  let query = supabase.from('docentes').select('*');

  if (filters?.departamento) {
    query = query.eq('departamento', filters.departamento);
  }
  
  if (filters?.especialidad) {
    query = query.eq('especialidad', filters.especialidad);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
}

/**
 * Obtiene carreras (programas académicos)
 */
export async function getAcademicPrograms(departamento?: string) {
  const supabase = getSupabaseClient();
  
  let query = supabase.from('carreras').select('*');

  if (departamento) {
    query = query.eq('departamento', departamento);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
}
