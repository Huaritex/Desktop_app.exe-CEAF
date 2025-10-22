import { app, BrowserWindow, dialog } from 'electron';
import { autoUpdater } from 'electron-updater';
import path from 'path';
import { registerAppHandlers } from './ipc-handlers/app';
import { registerDatabaseHandlers } from './ipc-handlers/database';
import { registerFileHandlers } from './ipc-handlers/files';
import { registerHorariosHandlers } from './ipc-handlers/horarios';

let mainWindow: BrowserWindow | null = null;

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
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true
    },
    backgroundColor: '#ffffff',
    show: false
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  if (process.env.NODE_ENV !== 'development') {
    checkForUpdates();
  }
}

function checkForUpdates() {
  autoUpdater.checkForUpdates().catch(err => {
    console.error('Error al verificar actualizaciones:', err);
  });
}

function registerIpcHandlers() {
  registerAppHandlers();
  registerDatabaseHandlers();
  registerFileHandlers();
  registerHorariosHandlers();
}

autoUpdater.on('update-available', info => {
  mainWindow?.webContents.send('update-available', info);
});

autoUpdater.on('update-not-available', () => {
  mainWindow?.webContents.send('update-not-available');
});

autoUpdater.on('download-progress', progress => {
  mainWindow?.webContents.send('download-progress', progress);
});

autoUpdater.on('update-downloaded', info => {
  mainWindow?.webContents.send('update-downloaded', info);
});

app.whenReady().then(() => {
  createWindow();
  registerIpcHandlers();

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

process.on('uncaughtException', error => {
  console.error('Error no capturado:', error);
  dialog.showErrorBox(
    'Error',
    `Ha ocurrido un error inesperado: ${error.message}`
  );
});
