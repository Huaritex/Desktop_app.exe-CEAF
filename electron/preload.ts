import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import {
  AppInfo,
  DashboardDataResult,
  DownloadProgress,
  UpdateInfo
} from '../../src/types/electron';

const api = {
  openFile: (): Promise<{
    success: boolean;
    data?: FileData;
    message?: string;
  }> => {
    return ipcRenderer.invoke('handle-file-open');
  },

  importData: (params: {
    content: string;
    fileName: string;
    fileExtension: string;
    tableName: string;
    programCodes?: string[];
  }): Promise<ImportResult> => {
    return ipcRenderer.invoke('handle-import-data', params);
  },

  fetchDashboardData: (params: {
    tableName: string;
    filters?: Record<string, unknown>;
    select?: string;
  }): Promise<DashboardDataResult> => {
    return ipcRenderer.invoke('handle-fetch-dashboard-data', params);
  },

  checkConnectivity: (): Promise<ConnectivityResult> => {
    return ipcRenderer.invoke('handle-check-connectivity');
  },

  getAppInfo: (): Promise<AppInfo> => {
    return ipcRenderer.invoke('handle-get-app-info');
  },

  crearAsignacion: (
    asignacion: unknown
  ): Promise<{
    success: boolean;
    data?: unknown;
    error?: {
      error: boolean;
      type: string;
      message: string;
      details?: unknown;
    };
  }> => {
    return ipcRenderer.invoke('handle-crear-asignacion', asignacion);
  },

  actualizarAsignacion: (params: {
    asignacion_id: number;
    cambios: unknown;
    aplicar_a_serie: boolean;
  }): Promise<{
    success: boolean;
    data?: unknown;
    error?: unknown;
  }> => {
    return ipcRenderer.invoke('handle-actualizar-asignacion', params);
  },

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

  validarAsignacion: (
    asignacion: unknown
  ): Promise<{
    success: boolean;
    validacion?: {
      valido: boolean;
      conflictos: Array<{
        error: boolean;
        type: string;
        message: string;
        details?: unknown;
      }>;
    };
    message?: string;
  }> => {
    return ipcRenderer.invoke('handle-validar-asignacion', asignacion);
  },

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

  replicarAsignacion: (
    asignacion: unknown
  ): Promise<{
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
    data: unknown[];
    message?: string;
  }> => {
    return ipcRenderer.invoke('handle-obtener-asignaciones', filtros);
  },

  obtenerCargaDocente: (params: {
    docente_id: number;
    gestion: string;
  }): Promise<{
    success: boolean;
    data?: unknown;
    message?: string;
  }> => {
    return ipcRenderer.invoke('handle-obtener-carga-docente', params);
  },

  obtenerConflictosPendientes: (): Promise<{
    success: boolean;
    data: unknown[];
    message?: string;
  }> => {
    return ipcRenderer.invoke('handle-obtener-conflictos-pendientes');
  },

  resolverConflicto: (params: {
    conflicto_id: number;
    resolucion: string;
  }): Promise<{
    success: boolean;
    message?: string;
  }> => {
    return ipcRenderer.invoke('handle-resolver-conflicto', params);
  },

  downloadUpdate: (): Promise<{ success: boolean; message?: string }> => {
    return ipcRenderer.invoke('handle-download-update');
  },

  installUpdate: (): Promise<void> => {
    return ipcRenderer.invoke('handle-install-update');
  },

  onUpdateAvailable: (callback: (info: UpdateInfo) => void) => {
    const subscription = (_event: IpcRendererEvent, info: UpdateInfo) =>
      callback(info);
    ipcRenderer.on('update-available', subscription);
    return () => ipcRenderer.removeListener('update-available', subscription);
  },

  onUpdateNotAvailable: (callback: () => void) => {
    const subscription = () => callback();
    ipcRenderer.on('update-not-available', subscription);
    return () =>
      ipcRenderer.removeListener('update-not-available', subscription);
  },

  onDownloadProgress: (callback: (progress: DownloadProgress) => void) => {
    const subscription = (
      _event: IpcRendererEvent,
      progress: DownloadProgress
    ) => callback(progress);
    ipcRenderer.on('download-progress', subscription);
    return () => ipcRenderer.removeListener('download-progress', subscription);
  },

  onUpdateDownloaded: (callback: (info: UpdateInfo) => void) => {
    const subscription = (_event: IpcRendererEvent, info: UpdateInfo) =>
      callback(info);
    ipcRenderer.on('update-downloaded', subscription);
    return () => ipcRenderer.removeListener('update-downloaded', subscription);
  }
};

contextBridge.exposeInMainWorld('api', api);
