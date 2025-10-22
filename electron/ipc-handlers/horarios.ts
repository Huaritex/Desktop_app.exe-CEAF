import { ipcMain } from 'electron';
import * as HorariosService from '../services/horarios';

export function registerHorariosHandlers() {
  ipcMain.handle('handle-crear-asignacion', async (_event, asignacion) => {
    try {
      const resultado = await HorariosService.crearAsignacion(asignacion);
      return resultado;
    } catch (error) {
      console.error('Error al crear asignación:', error);
      return {
        success: false,
        error: {
          error: true,
          type: 'ERROR_SISTEMA',
          message:
            error instanceof Error ? error.message : 'Error desconocido'
        }
      };
    }
  });

  ipcMain.handle(
    'handle-actualizar-asignacion',
    async (_event, { asignacion_id, cambios, aplicar_a_serie }) => {
      try {
        const resultado = await HorariosService.actualizarAsignacion(
          asignacion_id,
          cambios,
          aplicar_a_serie
        );
        return resultado;
      } catch (error) {
        console.error('Error al actualizar asignación:', error);
        return {
          success: false,
          error: {
            error: true,
            type: 'ERROR_SISTEMA',
            message:
              error instanceof Error ? error.message : 'Error desconocido'
          }
        };
      }
    }
  );

  ipcMain.handle(
    'handle-eliminar-asignacion',
    async (_event, { asignacion_id, eliminar_serie }) => {
      try {
        const resultado = await HorariosService.eliminarAsignacion(
          asignacion_id,
          eliminar_serie
        );
        return { ...resultado };
      } catch (error) {
        console.error('Error al eliminar asignación:', error);
        return {
          success: false,
          message:
            error instanceof Error ? error.message : 'Error desconocido'
        };
      }
    }
  );

  ipcMain.handle(
    'handle-validar-asignacion',
    async (_event, asignacion) => {
      try {
        const validacion = await HorariosService.validarAsignacion(
          asignacion
        );
        return { success: true, validacion };
      } catch (error) {
        console.error('Error al validar asignación:', error);
        return {
          success: false,
          message:
            error instanceof Error ? error.message : 'Error desconocido'
        };
      }
    }
  );

  ipcMain.handle(
    'handle-validar-carga-horaria',
    async (_event, { pensum_materia_id, paralelo, gestion }) => {
      try {
        const resultado = await HorariosService.validarCargaHoraria(
          pensum_materia_id,
          paralelo,
          gestion
        );
        return { success: true, data: resultado };
      } catch (error) {
        console.error('Error al validar carga horaria:', error);
        return {
          success: false,
          message:
            error instanceof Error ? error.message : 'Error desconocido'
        };
      }
    }
  );

  ipcMain.handle(
    'handle-replicar-asignacion',
    async (_event, asignacion) => {
      try {
        const resultado = await HorariosService.replicarAsignacion(
          asignacion
        );
        return { success: true, data: resultado };
      } catch (error) {
        console.error('Error al replicar asignación:', error);
        return {
          success: false,
          message:
            error instanceof Error ? error.message : 'Error desconocido'
        };
      }
    }
  );

  ipcMain.handle('handle-obtener-asignaciones', async (_event, filtros) => {
    try {
      const asignaciones = await HorariosService.obtenerAsignaciones(
        filtros
      );
      return { success: true, data: asignaciones };
    } catch (error) {
      console.error('Error al obtener asignaciones:', error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : 'Error desconocido',
        data: []
      };
    }
  });

  ipcMain.handle(
    'handle-obtener-carga-docente',
    async (_event, { docente_id, gestion }) => {
      try {
        const carga = await HorariosService.obtenerCargaDocente(
          docente_id,
          gestion
        );
        return { success: true, data: carga };
      } catch (error) {
        console.error('Error al obtener carga de docente:', error);
        return {
          success: false,
          message:
            error instanceof Error ? error.message : 'Error desconocido'
        };
      }
    }
  );

  ipcMain.handle('handle-obtener-conflictos-pendientes', async () => {
    try {
      const conflictos =
        await HorariosService.obtenerConflictosPendientes();
      return { success: true, data: conflictos };
    } catch (error) {
      console.error('Error al obtener conflictos:', error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : 'Error desconocido',
        data: []
      };
    }
  });

  ipcMain.handle(
    'handle-resolver-conflicto',
    async (_event, { conflicto_id, resolucion }) => {
      try {
        await HorariosService.resolverConflicto(conflicto_id, resolucion);
        return { success: true };
      } catch (error) {
        console.error('Error al resolver conflicto:', error);
        return {
          success: false,
          message:
            error instanceof Error ? error.message : 'Error desconocido'
        };
      }
    }
  );
}
