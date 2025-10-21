import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode
} from 'react';

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
  setGlobalFilters: (
    filters: Partial<AppContextType['globalFilters']>
  ) => void;
  checkConnectivity: () => Promise<void>;
  updateAvailable: boolean;
  setUpdateAvailable: (available: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({
  children
}) => {
  const [isOnline, setIsOnline] = useState(true);
  const [appInfo, setAppInfo] = useState<AppContextType['appInfo']>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [globalFilters, setGlobalFiltersState] = useState({
    semester: '',
    department: ''
  });

  const checkConnectivity = useCallback(async () => {
    try {
      const result = await window.api.checkConnectivity();
      setIsOnline(result.online);
    } catch (error) {
      console.error('Error checking connectivity:', error);
      setIsOnline(false);
    }
  }, []);

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

  useEffect(() => {
    let isMounted = true;
    const performInitialCheck = async () => {
      if (isMounted) {
        await checkConnectivity();
      }
    };
    performInitialCheck();
    const intervalId = setInterval(() => {
      if (isMounted) {
        checkConnectivity();
      }
    }, 30000);
    return () => {
      isMounted = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [checkConnectivity]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      checkConnectivity();
    };
    const handleOffline = () => {
      setIsOnline(false);
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [checkConnectivity]);

  useEffect(() => {
    const unsubscribe = window.api.onUpdateAvailable(() => {
      setUpdateAvailable(true);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const setGlobalFilters = (
    filters: Partial<AppContextType['globalFilters']>
  ) => {
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
