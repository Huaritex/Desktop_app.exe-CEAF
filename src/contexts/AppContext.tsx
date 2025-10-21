import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface AppContextType {
  isOnline: boolean;
  appInfo: {
    version: string;
    name: string;
    platform: string;
  } | null;
  globalFilters: {
    semester: string;
    department: string;
  };
  setGlobalFilters: (filters: Partial<AppContextType['globalFilters']>) => void;
  checkConnectivity: () => Promise<void>;
  updateAvailable: boolean;
  setUpdateAvailable: (available: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(true);
  const [appInfo, setAppInfo] = useState<AppContextType['appInfo']>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [globalFilters, setGlobalFiltersState] = useState({
    semester: '',
    department: ''
  });

  // Verificar conectividad
  const checkConnectivity = useCallback(async () => {
    try {
      const result = await window.api.checkConnectivity();
      setIsOnline(result.online);
    } catch (error) {
      console.error('Error checking connectivity:', error);
      setIsOnline(false);
    }
  }, []);

  // Obtener información de la aplicación
  useEffect(() => {
    const fetchAppInfo = async () => {
      try {
        const info = await window.api.getAppInfo();
        setAppInfo(info);
      } catch (error) {
        console.error('Error fetching app info:', error);
      }
    };

    fetchAppInfo();
  }, []);

  // Verificar conectividad periódicamente
  useEffect(() => {
    checkConnectivity();
    const interval = setInterval(checkConnectivity, 30000); // Cada 30 segundos
    return () => clearInterval(interval);
  }, [checkConnectivity]);

  // Escuchar eventos de actualización
  useEffect(() => {
    const unsubscribe = window.api.onUpdateAvailable(() => {
      setUpdateAvailable(true);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const setGlobalFilters = (filters: Partial<AppContextType['globalFilters']>) => {
    setGlobalFiltersState(prev => ({ ...prev, ...filters }));
  };

  return (
    <AppContext.Provider
      value={{
        isOnline,
        appInfo,
        globalFilters,
        setGlobalFilters,
        checkConnectivity,
        updateAvailable,
        setUpdateAvailable
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
