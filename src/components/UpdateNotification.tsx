import { useState, useEffect } from 'react';

const UpdateNotification = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloaded, setIsDownloaded] = useState(false);

  useEffect(() => {
    // Escuchar progreso de descarga
    const unsubscribeProgress = window.api.onDownloadProgress((progress) => {
      setDownloadProgress(Math.round(progress.percent || 0));
    });

    // Escuchar descarga completada
    const unsubscribeDownloaded = window.api.onUpdateDownloaded(() => {
      setIsDownloading(false);
      setIsDownloaded(true);
    });

    return () => {
      unsubscribeProgress();
      unsubscribeDownloaded();
    };
  }, []);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await window.api.downloadUpdate();
    } catch (error) {
      console.error('Error downloading update:', error);
      setIsDownloading(false);
    }
  };

  const handleInstall = async () => {
    await window.api.installUpdate();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-card border border-border rounded-lg shadow-xl p-4 animate-slide-up z-50">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        
        <div className="flex-1">
          <h3 className="font-semibold text-foreground mb-1">
            {isDownloaded ? 'Actualización Lista' : 'Nueva Actualización Disponible'}
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            {isDownloaded 
              ? 'La actualización ha sido descargada. Reinicia la aplicación para instalarla.'
              : 'Hay una nueva versión de CEAF Dashboard disponible.'
            }
          </p>

          {isDownloading && (
            <div className="mb-3">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Descargando...</span>
                <span>{downloadProgress}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${downloadProgress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex gap-2">
            {!isDownloaded && !isDownloading && (
              <>
                <button
                  onClick={handleDownload}
                  className="flex-1 bg-primary text-primary-foreground px-3 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  Descargar
                </button>
                <button
                  onClick={() => setIsVisible(false)}
                  className="px-3 py-2 border border-border rounded-md text-sm hover:bg-secondary transition-colors"
                >
                  Después
                </button>
              </>
            )}

            {isDownloaded && (
              <>
                <button
                  onClick={handleInstall}
                  className="flex-1 bg-primary text-primary-foreground px-3 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  Reiniciar e Instalar
                </button>
                <button
                  onClick={() => setIsVisible(false)}
                  className="px-3 py-2 border border-border rounded-md text-sm hover:bg-secondary transition-colors"
                >
                  Más tarde
                </button>
              </>
            )}

            {isDownloading && (
              <button
                disabled
                className="flex-1 bg-secondary text-muted-foreground px-3 py-2 rounded-md text-sm font-medium cursor-not-allowed"
              >
                Descargando...
              </button>
            )}
          </div>
        </div>

        <button
          onClick={() => setIsVisible(false)}
          className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default UpdateNotification;
