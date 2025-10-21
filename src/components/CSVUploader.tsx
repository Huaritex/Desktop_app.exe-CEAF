import { useState } from 'react';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2 } from 'lucide-react';
import Button from './ui/Button';

const CSVUploader = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const handleFileSelect = async () => {
    try {
      const result = await window.api.openFile();
      
      if (!result.success) {
        setUploadStatus({
          type: 'error',
          message: result.message || 'No se pudo abrir el archivo'
        });
        return;
      }

      if (result.data) {
        setSelectedFile(result.data.fileName);
        setUploadStatus({ type: null, message: '' });
      }
    } catch (error) {
      console.error('Error al seleccionar archivo:', error);
      setUploadStatus({
        type: 'error',
        message: 'Error al seleccionar el archivo'
      });
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      setUploadStatus({
        type: 'error',
        message: 'Por favor selecciona un archivo primero'
      });
      return;
    }

    setIsUploading(true);
    setUploadStatus({ type: null, message: '' });

    try {
      // Abrir el archivo nuevamente para obtener su contenido
      const fileResult = await window.api.openFile();
      
      if (!fileResult.success || !fileResult.data) {
        throw new Error('No se pudo leer el archivo');
      }

      const { content, fileName, fileExtension } = fileResult.data;

      // Llamar al manejador de importación en el proceso principal
      const importResult = await window.api.importData({
        content,
        fileName,
        fileExtension,
        tableName: 'carreras', // Tabla de ejemplo - usar tablas del schema unificado
        programCodes: [] // Se extraerán del archivo
      });

      if (importResult.success) {
        setUploadStatus({
          type: 'success',
          message: importResult.message || 'Datos importados exitosamente'
        });
        setSelectedFile(null);
      } else {
        throw new Error(importResult.message || 'Error en la importación');
      }
    } catch (error) {
      console.error('Error en importación:', error);
      setUploadStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Error desconocido'
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="dashboard-card">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-1">
            Importación de Datos
          </h3>
          <p className="text-sm text-muted-foreground">
            Importa datos desde archivos CSV o Excel. Esta operación reemplazará los datos existentes.
          </p>
        </div>
        <FileSpreadsheet className="w-8 h-8 text-primary" />
      </div>

      {/* Estado de archivo seleccionado */}
      {selectedFile && (
        <div className="bg-secondary p-3 rounded-md mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-foreground">{selectedFile}</span>
          </div>
          <button
            onClick={() => setSelectedFile(null)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Mensajes de estado */}
      {uploadStatus.type && (
        <div
          className={`p-4 rounded-md mb-4 flex items-start gap-3 ${
            uploadStatus.type === 'success'
              ? 'bg-green-50 dark:bg-green-950 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-950 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800'
          }`}
        >
          {uploadStatus.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <p className="text-sm font-medium">{uploadStatus.message}</p>
          </div>
        </div>
      )}

      {/* Botones de acción */}
      <div className="flex gap-3">
        <Button
          onClick={handleFileSelect}
          variant="outline"
          disabled={isUploading}
          className="flex-1"
        >
          <Upload className="w-4 h-4 mr-2" />
          Seleccionar Archivo
        </Button>

        <Button
          onClick={handleImport}
          disabled={!selectedFile || isUploading}
          className="flex-1"
        >
          {isUploading ? (
            <>
              <svg className="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Importando...
            </>
          ) : (
            <>
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Importar Datos
            </>
          )}
        </Button>
      </div>

      {/* Advertencia */}
      <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-md">
        <div className="flex gap-2">
          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
          <p className="text-xs text-amber-800 dark:text-amber-200">
            <strong>Advertencia:</strong> La importación reemplazará los datos existentes de forma permanente.
            Asegúrate de tener respaldo antes de proceder.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CSVUploader;
