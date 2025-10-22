import { ipcMain } from 'electron';
import * as DatabaseService from '../services/database';
import * as ParserService from '../services/parser';

export function registerDatabaseHandlers() {
  ipcMain.handle(
    'handle-import-data',
    async (
      _event,
      {
        content,
        fileExtension,
        tableName
      }: {
        content: string;
        fileName: string;
        fileExtension: string;
        tableName: string;
      }
    ) => {
      try {
        const parsedData = await ParserService.parseFile(
          content,
          fileExtension
        );

        if (!parsedData || parsedData.length === 0) {
          return {
            success: false,
            message: 'No se encontraron datos en el archivo'
          };
        }

        const dataToImport: { [key: string]: unknown[] } = {};
        const mappedTableName = mapTableName(tableName);
        dataToImport[mappedTableName] = parsedData;

        const results = await DatabaseService.importData(dataToImport);

        return {
          success: true,
          message: `Importación exitosa: ${parsedData.length} registros procesados`,
          data: {
            recordsProcessed: parsedData.length,
            results
          }
        };
      } catch (error) {
        console.error('Error en importación de datos:', error);
        return {
          success: false,
          message: `Error en importación: ${
            error instanceof Error ? error.message : 'Error desconocido'
          }`
        };
      }
    }
  );

  ipcMain.handle(
    'handle-fetch-dashboard-data',
    async (
      _event,
      filters?: { semester?: string; department?: string }
    ) => {
      try {
        const data = await DatabaseService.fetchDashboardData(filters);
        return { success: true, data };
      } catch (error) {
        console.error('Error al obtener datos de dashboard:', error);
        return {
          success: false,
          message: `Error: ${
            error instanceof Error ? error.message : 'Error desconocido'
          }`,
          data: null
        };
      }
    }
  );

  ipcMain.handle('handle-check-connectivity', async () => {
    try {
      const online = await DatabaseService.checkDatabaseConnectivity();
      return { success: true, online };
    } catch (error) {
      return {
        success: false,
        online: false,
        message: 'Sin conexión a internet'
      };
    }
  });
}

function mapTableName(tableName: string): string {
  const tableMap: { [key: string]: string } = {
    estudiantes: 'students',
    students: 'students',
    docentes: 'faculty',
    faculty: 'faculty',
    materias: 'courses',
    courses: 'courses',
    carreras: 'programs',
    academic_programs: 'programs',
    asignaciones: 'sections',
    course_sections: 'sections',
    inscripciones: 'enrollments',
    enrollments: 'enrollments'
  };
  return tableMap[tableName] || tableName;
}
