import { app, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';

export function registerAppHandlers() {
  ipcMain.handle('handle-get-app-info', async () => {
    return {
      version: app.getVersion(),
      name: app.getName(),
      platform: process.platform,
      arch: process.arch
    };
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
}
