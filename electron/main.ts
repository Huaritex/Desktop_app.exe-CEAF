import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import { autoUpdater } from 'electron-updater';
import path from 'path';
import fs from 'fs/promises';
import * as DatabaseService from './services/database';

let mainWindow: BrowserWindow | null = null;

// Configuración de auto-actualizador
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    title: 'CEAF Dashboard UCB',
    icon: path.join(__dirname, '../resources/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false, // Seguridad: deshabilitar node en renderer
      contextIsolation: true, // Seguridad: aislar contextos
      sandbox: true, // Seguridad: sandbox activado
      webSecurity: true
    },
    backgroundColor: '#ffffff',
    show: false // No mostrar hasta que esté listo
  });

  // Cargar la aplicación
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Mostrar ventana cuando esté lista
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Verificar actualizaciones al iniciar
  if (process.env.NODE_ENV !== 'development') {
    checkForUpdates();
  }
}

// Verificar actualizaciones
function checkForUpdates() {
  autoUpdater.checkForUpdates().catch(err => {
    console.error('Error al verificar actualizaciones:', err);
  });
}

// === Manejadores IPC ===

/**
 * Manejador: Abrir diálogo de archivo nativo
 * Permite seleccionar archivos CSV o XLSX del sistema
 */
ipcMain.handle('handle-file-open', async () => {
  try {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [
        { name: 'Archivos de datos', extensions: ['csv', 'xlsx', 'xls'] },
        { name: 'CSV', extensions: ['csv'] },
        { name: 'Excel', extensions: ['xlsx', 'xls'] },
        { name: 'Todos', extensions: ['*'] }
      ]
    });

    if (result.canceled || result.filePaths.length === 0) {
      return { success: false, message: 'Operación cancelada' };
    }

    const filePath = result.filePaths[0];
    const fileContent = await fs.readFile(filePath);
    const fileName = path.basename(filePath);
    const fileExtension = path.extname(filePath).toLowerCase();

    return {
      success: true,
      data: {
        fileName,
        fileExtension,
        content: fileContent.toString('base64'), // Enviar como base64
        size: fileContent.length
      }
    };
  } catch (error) {
    console.error('Error al abrir archivo:', error);
    return {
      success: false,
      message: `Error al abrir archivo: ${error instanceof Error ? error.message : 'Error desconocido'}`
    };
  }
});

/**
 * Manejador: Importación de datos (operación destructiva)
 * Procesa archivos CSV/XLSX y actualiza la base de datos de forma transaccional
 */
ipcMain.handle('handle-import-data', async (_event: any, { content, fileName, fileExtension, tableName, programCodes }: any) => {
  try {
    // Decodificar contenido
    const buffer = Buffer.from(content, 'base64');
    const fileContent = buffer.toString('utf-8');

    // Parsear datos según el formato
    let parsedData: any[] = [];
    
    if (fileExtension === '.csv') {
      const Papa = require('papaparse');
      const result = Papa.parse(fileContent, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true
      });
      parsedData = result.data;
    } else if (fileExtension === '.xlsx' || fileExtension === '.xls') {
      const XLSX = require('xlsx');
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      parsedData = XLSX.utils.sheet_to_json(worksheet);
    }

    if (!parsedData || parsedData.length === 0) {
      return {
        success: false,
        message: 'No se encontraron datos en el archivo'
      };
    }

    // Usar el servicio de base de datos
    const dataToImport: any = {};
    
    // Mapear tableName a la estructura esperada por importData
    if (tableName === 'estudiantes' || tableName === 'students') {
      dataToImport.students = parsedData;
    } else if (tableName === 'docentes' || tableName === 'faculty') {
      dataToImport.faculty = parsedData;
    } else if (tableName === 'materias' || tableName === 'courses') {
      dataToImport.courses = parsedData;
    } else if (tableName === 'carreras' || tableName === 'academic_programs') {
      dataToImport.programs = parsedData;
    } else if (tableName === 'asignaciones' || tableName === 'course_sections') {
      dataToImport.sections = parsedData;
    } else if (tableName === 'inscripciones' || tableName === 'enrollments') {
      dataToImport.enrollments = parsedData;
    }

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
      message: `Error en importación: ${error instanceof Error ? error.message : 'Error desconocido'}`
    };
  }
});

/**
 * Manejador: Obtener datos de dashboard
 * Realiza consultas a Supabase con filtros aplicados
 */
ipcMain.handle('handle-fetch-dashboard-data', async (_event: any, filters?: { semester?: string; department?: string }) => {
  try {
    const data = await DatabaseService.fetchDashboardData(filters);

    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Error al obtener datos de dashboard:', error);
    return {
      success: false,
      message: `Error: ${error instanceof Error ? error.message : 'Error desconocido'}`,
      data: null
    };
  }
});

/**
 * Manejador: Verificar conectividad
 */
ipcMain.handle('handle-check-connectivity', async () => {
  try {
    const online = await DatabaseService.checkConnectivity();

    return {
      success: true,
      online
    };
  } catch (error) {
    return {
      success: false,
      online: false,
      message: 'Sin conexión a internet'
    };
  }
});

/**
 * Manejador: Obtener información de la aplicación
 */
ipcMain.handle('handle-get-app-info', async () => {
  return {
    version: app.getVersion(),
    name: app.getName(),
    platform: process.platform,
    arch: process.arch
  };
});

// ============================================
// === HANDLERS IPC PARA GESTIÓN DE HORARIOS ===
// ============================================

/**
 * Manejador: Crear asignación con validación completa
 */
ipcMain.handle('handle-crear-asignacion', async (_event: any, asignacion: any) => {
  try {
    const HorariosService = require('./services/horarios');
    const resultado = await HorariosService.crearAsignacion(asignacion);

    if (!resultado.success) {
      // Devolver error detallado
      return {
        success: false,
        error: resultado.error
      };
    }

    return {
      success: true,
      data: resultado.data
    };
  } catch (error) {
    console.error('Error al crear asignación:', error);
    return {
      success: false,
      error: {
        error: true,
        type: 'ERROR_SISTEMA',
        message: error instanceof Error ? error.message : 'Error desconocido'
      }
    };
  }
});

/**
 * Manejador: Actualizar asignación (con opción de aplicar a toda la serie)
 */
ipcMain.handle('handle-actualizar-asignacion', async (
  _event: any,
  { asignacion_id, cambios, aplicar_a_serie }: any
) => {
  try {
    const HorariosService = require('./services/horarios');
    const resultado = await HorariosService.actualizarAsignacion(
      asignacion_id,
      cambios,
      aplicar_a_serie
    );

    if (!resultado.success) {
      return {
        success: false,
        error: resultado.error
      };
    }

    return {
      success: true,
      data: resultado.data
    };
  } catch (error) {
    console.error('Error al actualizar asignación:', error);
    return {
      success: false,
      error: {
        error: true,
        type: 'ERROR_SISTEMA',
        message: error instanceof Error ? error.message : 'Error desconocido'
      }
    };
  }
});

/**
 * Manejador: Eliminar asignación (con opción de eliminar toda la serie)
 */
ipcMain.handle('handle-eliminar-asignacion', async (
  _event: any,
  { asignacion_id, eliminar_serie }: any
) => {
  try {
    const HorariosService = require('./services/horarios');
    const resultado = await HorariosService.eliminarAsignacion(
      asignacion_id,
      eliminar_serie
    );

    return {
      success: true,
      eliminadas: resultado.eliminadas
    };
  } catch (error) {
    console.error('Error al eliminar asignación:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
});

/**
 * Manejador: Validar asignación sin guardarla
 */
ipcMain.handle('handle-validar-asignacion', async (_event: any, asignacion: any) => {
  try {
    const HorariosService = require('./services/horarios');
    const validacion = await HorariosService.validarAsignacion(asignacion);

    return {
      success: true,
      validacion
    };
  } catch (error) {
    console.error('Error al validar asignación:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
});

/**
 * Manejador: Validar carga horaria de una materia
 */
ipcMain.handle('handle-validar-carga-horaria', async (
  _event: any,
  { pensum_materia_id, paralelo, gestion }: any
) => {
  try {
    const HorariosService = require('./services/horarios');
    const resultado = await HorariosService.validarCargaHoraria(
      pensum_materia_id,
      paralelo,
      gestion
    );

    return {
      success: true,
      data: resultado
    };
  } catch (error) {
    console.error('Error al validar carga horaria:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
});

/**
 * Manejador: Replicar asignación a todas las carreras/pensums equivalentes
 */
ipcMain.handle('handle-replicar-asignacion', async (_event: any, asignacion: any) => {
  try {
    const HorariosService = require('./services/horarios');
    const resultado = await HorariosService.replicarAsignacion(asignacion);

    return {
      success: true,
      data: resultado
    };
  } catch (error) {
    console.error('Error al replicar asignación:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
});

/**
 * Manejador: Obtener asignaciones con filtros
 */
ipcMain.handle('handle-obtener-asignaciones', async (_event: any, filtros: any) => {
  try {
    const HorariosService = require('./services/horarios');
    const asignaciones = await HorariosService.obtenerAsignaciones(filtros);

    return {
      success: true,
      data: asignaciones
    };
  } catch (error) {
    console.error('Error al obtener asignaciones:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error desconocido',
      data: []
    };
  }
});

/**
 * Manejador: Obtener carga horaria de un docente
 */
ipcMain.handle('handle-obtener-carga-docente', async (
  _event: any,
  { docente_id, gestion }: any
) => {
  try {
    const HorariosService = require('./services/horarios');
    const carga = await HorariosService.obtenerCargaDocente(docente_id, gestion);

    return {
      success: true,
      data: carga
    };
  } catch (error) {
    console.error('Error al obtener carga de docente:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
});

/**
 * Manejador: Obtener conflictos pendientes
 */
ipcMain.handle('handle-obtener-conflictos-pendientes', async () => {
  try {
    const HorariosService = require('./services/horarios');
    const conflictos = await HorariosService.obtenerConflictosPendientes();

    return {
      success: true,
      data: conflictos
    };
  } catch (error) {
    console.error('Error al obtener conflictos:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error desconocido',
      data: []
    };
  }
});

/**
 * Manejador: Resolver conflicto
 */
ipcMain.handle('handle-resolver-conflicto', async (
  _event: any,
  { conflicto_id, resolucion }: any
) => {
  try {
    const HorariosService = require('./services/horarios');
    await HorariosService.resolverConflicto(conflicto_id, resolucion);

    return {
      success: true
    };
  } catch (error) {
    console.error('Error al resolver conflicto:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
});

// === Eventos de Auto-Actualización ===

autoUpdater.on('update-available', (info) => {
  mainWindow?.webContents.send('update-available', info);
});

autoUpdater.on('update-not-available', () => {
  mainWindow?.webContents.send('update-not-available');
});

autoUpdater.on('download-progress', (progress) => {
  mainWindow?.webContents.send('download-progress', progress);
});

autoUpdater.on('update-downloaded', (info) => {
  mainWindow?.webContents.send('update-downloaded', info);
});

ipcMain.handle('handle-download-update', async () => {
  try {
    await autoUpdater.downloadUpdate();
    return { success: true };
  } catch (error) {
    return { success: false, message: String(error) };
  }
});

ipcMain.handle('handle-install-update', () => {
  autoUpdater.quitAndInstall();
});

// === Ciclo de vida de la aplicación ===

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
  console.error('Error no capturado:', error);
  dialog.showErrorBox('Error', `Ha ocurrido un error inesperado: ${error.message}`);
});
