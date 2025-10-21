import { ipcMain, dialog } from 'electron';
import path from 'path';
import fs from 'fs/promises';

export function registerFileHandlers() {
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
          content: fileContent.toString('base64'),
          size: fileContent.length
        }
      };
    } catch (error) {
      console.error('Error al abrir archivo:', error);
      return {
        success: false,
        message: `Error al abrir archivo: ${
          error instanceof Error ? error.message : 'Error desconocido'
        }`
      };
    }
  });
}
