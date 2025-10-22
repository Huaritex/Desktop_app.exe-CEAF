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
      persistSession: false
    }
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
    let facultyQuery = supabase.from('faculty').select('*', { count: 'exact' });

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
    let performanceQuery = supabase.from('academic_performance').select('*');

    if (filters?.semester) {
      performanceQuery = performanceQuery.eq('semester', filters.semester);
    }

    const { data: performanceData, error: performanceError } =
      await performanceQuery;

    if (performanceError) throw performanceError;

    // Calcular GPA promedio
    const avgGPA =
      performanceData?.reduce(
        (sum, item) => sum + (item.average_gpa || 0),
        0
      ) /
        (performanceData?.length || 1) || 0;

    return {
      totalStudents: totalStudents || 0,
      totalFaculty: totalFaculty || 0,
      totalPrograms: totalPrograms || 0,
      averageGPA: avgGPA.toFixed(2),
      performanceData: performanceData || []
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
}

/**
 * Importa datos desde un objeto de datos ya parseado
 * ADVERTENCIA: Esta operación es destructiva y reemplaza todos los datos
 */
export async function importData(data: {
  students?: unknown[];
  faculty?: unknown[];
  courses?: unknown[];
  programs?: unknown[];
  sections?: unknown[];
  enrollments?: unknown[];
}) {
  const supabase = getSupabaseClient();
  const results = {
    students: 0,
    faculty: 0,
    courses: 0,
    programs: 0,
    sections: 0,
    enrollments: 0
  };

  try {
    if (data.programs && data.programs.length > 0) {
      await supabase.from('academic_programs').delete().neq('id', 0);
      const { error } = await supabase
        .from('academic_programs')
        .insert(data.programs);
      if (error) throw new Error(`Error importing programs: ${error.message}`);
      results.programs = data.programs.length;
    }

    if (data.students && data.students.length > 0) {
      await supabase.from('students').delete().neq('id', 0);
      const { error } = await supabase.from('students').insert(data.students);
      if (error) throw new Error(`Error importing students: ${error.message}`);
      results.students = data.students.length;
    }

    if (data.faculty && data.faculty.length > 0) {
      await supabase.from('faculty').delete().neq('id', 0);
      const { error } = await supabase.from('faculty').insert(data.faculty);
      if (error) throw new Error(`Error importing faculty: ${error.message}`);
      results.faculty = data.faculty.length;
    }

    if (data.courses && data.courses.length > 0) {
      await supabase.from('courses').delete().neq('id', 0);
      const { error } = await supabase.from('courses').insert(data.courses);
      if (error) throw new Error(`Error importing courses: ${error.message}`);
      results.courses = data.courses.length;
    }

    if (data.sections && data.sections.length > 0) {
      await supabase.from('course_sections').delete().neq('id', 0);
      const { error } = await supabase
        .from('course_sections')
        .insert(data.sections);
      if (error)
        throw new Error(`Error importing course_sections: ${error.message}`);
      results.sections = data.sections.length;
    }

    if (data.enrollments && data.enrollments.length > 0) {
      await supabase.from('enrollments').delete().neq('id', 0);
      const { error } = await supabase
        .from('enrollments')
        .insert(data.enrollments);
      if (error)
        throw new Error(`Error importing enrollments: ${error.message}`);
      results.enrollments = data.enrollments.length;
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
    const { error } = await supabase
      .from('academic_programs')
      .select('id')
      .limit(1);
    return !error;
  } catch (error) {
    console.error('Error checking connectivity:', error);
    return false;
  }
}
