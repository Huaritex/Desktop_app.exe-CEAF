// Tipos globales para la API expuesta por Electron

export interface FileData {
  fileName: string;
  fileExtension: string;
  content: string; // Base64 encoded
  size: number;
}

export interface ImportParams {
  content: string;
  fileName: string;
  fileExtension: string;
  tableName: string;
  programCodes?: string[];
}

export interface ImportResult {
  success: boolean;
  message?: string;
  data?: {
    recordsProcessed: number;
    programCodes: string[];
  };
}

export interface DashboardDataParams {
  tableName: string;
  filters?: Record<string, unknown>;
  select?: string;
}

export interface DashboardDataResult {
  success: boolean;
  data: unknown[] | null;
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

export interface UpdateInfo {
  version: string;
  releaseDate: string;
  releaseName?: string;
}

export interface DownloadProgress {
  percent: number;
  transferred: number;
  total: number;
}

// Declaración global de window.api
declare global {
  interface Window {
    api: {
      // File operations
      openFile: () => Promise<{ success: boolean; data?: FileData; message?: string }>;
      importData: (params: ImportParams) => Promise<ImportResult>;

      // Database operations
      fetchDashboardData: (params: DashboardDataParams) => Promise<DashboardDataResult>;
      checkConnectivity: () => Promise<ConnectivityResult>;

      // App info
      getAppInfo: () => Promise<AppInfo>;

      // Update system
      downloadUpdate: () => Promise<{ success: boolean; message?: string }>;
      installUpdate: () => Promise<void>;
      onUpdateAvailable: (callback: (info: UpdateInfo) => void) => () => void;
      onUpdateNotAvailable: (callback: () => void) => () => void;
      onDownloadProgress: (callback: (progress: DownloadProgress) => void) => () => void;
      onUpdateDownloaded: (callback: (info: UpdateInfo) => void) => () => void;

      // Horarios
      crearAsignacion: (asignacion: unknown) => Promise<unknown>;
      actualizarAsignacion: (params: unknown) => Promise<unknown>;
      eliminarAsignacion: (params: unknown) => Promise<unknown>;
      validarAsignacion: (asignacion: unknown) => Promise<unknown>;
      validarCargaHoraria: (params: unknown) => Promise<unknown>;
      replicarAsignacion: (asignacion: unknown) => Promise<unknown>;
      obtenerAsignaciones: (filtros: unknown) => Promise<unknown>;
      obtenerCargaDocente: (params: unknown) => Promise<unknown>;
      obtenerConflictosPendientes: () => Promise<unknown>;
      resolverConflicto: (params: unknown) => Promise<unknown>;
    };
  }
}

export {};
