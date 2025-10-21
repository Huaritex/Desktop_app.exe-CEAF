import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

/**
 * Preload Script - Puente Seguro
 * 
 * Este script expone una API controlada y segura al proceso de renderizado.
 * NUNCA expone directamente Node.js ni las claves de API.
 * 
 * Todas las operaciones sensibles pasan por el proceso principal.
 */

// Definición de tipos para la API
export interface FileData {
  fileName: string;
  fileExtension: string;
  content: string;
  size: number;
}

export interface ImportResult {
  success: boolean;
  message?: string;
  data?: {
    recordsProcessed: number;
    programCodes: string[];
  };
}

export interface DashboardDataResult {
  success: boolean;
  data: any[] | null;
  message?: string;
}

export interface ConnectivityResult {
  success: boolean;
  online: boolean;
  message?: string;
}

export interface AppInfo {
  version: string;
  name: string;
  platform: string;
  arch: string;
}

// API expuesta al renderer
const api = {
  // === Operaciones de Archivos ===
  
  /**
   * Abre el diálogo nativo para seleccionar un archivo
   * @returns Promise con los datos del archivo o error
   */
  openFile: (): Promise<{ success: boolean; data?: FileData; message?: string }> => {
    return ipcRenderer.invoke('handle-file-open');
  },

  /**
   * Importa datos desde un archivo a la base de datos
   * Operación destructiva - elimina e inserta registros
   */
  importData: (params: {
    content: string;
    fileName: string;
    fileExtension: string;
    tableName: string;
    programCodes?: string[];
  }): Promise<ImportResult> => {
    return ipcRenderer.invoke('handle-import-data', params);
  },

  // === Operaciones de Base de Datos ===

  /**
   * Obtiene datos de un dashboard específico con filtros
   */
  fetchDashboardData: (params: {
    tableName: string;
    filters?: Record<string, any>;
    select?: string;
  }): Promise<DashboardDataResult> => {
    return ipcRenderer.invoke('handle-fetch-dashboard-data', params);
  },

  /**
   * Verifica la conectividad con el servidor
   */
  checkConnectivity: (): Promise<ConnectivityResult> => {
    return ipcRenderer.invoke('handle-check-connectivity');
  },

  // === Información de la Aplicación ===

  /**
   * Obtiene información de la aplicación
   */
  getAppInfo: (): Promise<AppInfo> => {
    return ipcRenderer.invoke('handle-get-app-info');
  },

  // === Gestión de Horarios ===

  /**
   * Crea una nueva asignación con validación completa
   */
  crearAsignacion: (asignacion: any): Promise<{
    success: boolean;
    data?: any;
    error?: {
      error: boolean;
      type: string;
      message: string;
      details?: any;
    };
  }> => {
    return ipcRenderer.invoke('handle-crear-asignacion', asignacion);
  },

  /**
   * Actualiza una asignación existente
   */
  actualizarAsignacion: (params: {
    asignacion_id: number;
    cambios: any;
    aplicar_a_serie: boolean;
  }): Promise<{
    success: boolean;
    data?: any;
    error?: any;
  }> => {
    return ipcRenderer.invoke('handle-actualizar-asignacion', params);
  },

  /**
   * Elimina una asignación
   */
  eliminarAsignacion: (params: {
    asignacion_id: number;
    eliminar_serie: boolean;
  }): Promise<{
    success: boolean;
    eliminadas?: number;
    message?: string;
  }> => {
    return ipcRenderer.invoke('handle-eliminar-asignacion', params);
  },

  /**
   * Valida una asignación sin guardarla
   */
  validarAsignacion: (asignacion: any): Promise<{
    success: boolean;
    validacion?: {
      valido: boolean;
      conflictos: Array<{
        error: boolean;
        type: string;
        message: string;
        details?: any;
      }>;
    };
    message?: string;
  }> => {
    return ipcRenderer.invoke('handle-validar-asignacion', asignacion);
  },

  /**
   * Valida la carga horaria de una materia
   */
  validarCargaHoraria: (params: {
    pensum_materia_id: number;
    paralelo: number;
    gestion: string;
  }): Promise<{
    success: boolean;
    data?: {
      es_valido: boolean;
      horas_asignadas: number;
      horas_min: number;
      horas_max: number;
      mensaje: string;
    };
    message?: string;
  }> => {
    return ipcRenderer.invoke('handle-validar-carga-horaria', params);
  },

  /**
   * Replica una asignación a todas las carreras/pensums equivalentes
   */
  replicarAsignacion: (asignacion: any): Promise<{
    success: boolean;
    data?: {
      exitoso: boolean;
      asignaciones_creadas: number;
      asignaciones_fallidas: number;
      detalles: Array<{
        carrera: string;
        pensum: string;
        exito: boolean;
        error?: string;
      }>;
    };
    message?: string;
  }> => {
    return ipcRenderer.invoke('handle-replicar-asignacion', asignacion);
  },

  /**
   * Obtiene asignaciones con filtros
   */
  obtenerAsignaciones: (filtros: {
    gestion: string;
    carrera_id?: number;
    pensum_id?: number;
    semestre?: number;
    docente_id?: number;
    aula_id?: number;
    dia_semana?: number;
  }): Promise<{
    success: boolean;
    data: any[];
    message?: string;
  }> => {
    return ipcRenderer.invoke('handle-obtener-asignaciones', filtros);
  },

  /**
   * Obtiene la carga horaria de un docente
   */
  obtenerCargaDocente: (params: {
    docente_id: number;
    gestion: string;
  }): Promise<{
    success: boolean;
    data?: any;
    message?: string;
  }> => {
    return ipcRenderer.invoke('handle-obtener-carga-docente', params);
  },

  /**
   * Obtiene conflictos pendientes
   */
  obtenerConflictosPendientes: (): Promise<{
    success: boolean;
    data: any[];
    message?: string;
  }> => {
    return ipcRenderer.invoke('handle-obtener-conflictos-pendientes');
  },

  /**
   * Marca un conflicto como resuelto
   */
  resolverConflicto: (params: {
    conflicto_id: number;
    resolucion: string;
  }): Promise<{
    success: boolean;
    message?: string;
  }> => {
    return ipcRenderer.invoke('handle-resolver-conflicto', params);
  },

  // === Sistema de Actualizaciones ===

  /**
   * Descarga una actualización disponible
   */
  downloadUpdate: (): Promise<{ success: boolean; message?: string }> => {
    return ipcRenderer.invoke('handle-download-update');
  },

  /**
   * Instala la actualización descargada y reinicia la app
   */
  installUpdate: (): Promise<void> => {
    return ipcRenderer.invoke('handle-install-update');
  },

  /**
   * Escucha eventos de actualización
   */
  onUpdateAvailable: (callback: (info: any) => void) => {
    const subscription = (_event: IpcRendererEvent, info: any) => callback(info);
    ipcRenderer.on('update-available', subscription);
    return () => ipcRenderer.removeListener('update-available', subscription);
  },

  onUpdateNotAvailable: (callback: () => void) => {
    const subscription = () => callback();
    ipcRenderer.on('update-not-available', subscription);
    return () => ipcRenderer.removeListener('update-not-available', subscription);
  },

  onDownloadProgress: (callback: (progress: any) => void) => {
    const subscription = (_event: IpcRendererEvent, progress: any) => callback(progress);
    ipcRenderer.on('download-progress', subscription);
    return () => ipcRenderer.removeListener('download-progress', subscription);
  },

  onUpdateDownloaded: (callback: (info: any) => void) => {
    const subscription = (_event: IpcRendererEvent, info: any) => callback(info);
    ipcRenderer.on('update-downloaded', subscription);
    return () => ipcRenderer.removeListener('update-downloaded', subscription);
  }
};

// Exponer la API de forma segura
contextBridge.exposeInMainWorld('api', api);

// Declaración de tipos para TypeScript en el renderer
declare global {
  interface Window {
    api: typeof api;
  }
}
