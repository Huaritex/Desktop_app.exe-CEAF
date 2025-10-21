import { Outlet } from 'react-router-dom';
import GlobalHeader from './ui/GlobalHeader';
import NavigationBar from './ui/NavigationBar';
import { useApp } from '../contexts/AppContext';
import UpdateNotification from './UpdateNotification';

const Layout = () => {
  const { isOnline, updateAvailable } = useApp();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Barra de estado de conectividad */}
      {!isOnline && (
        <div className="bg-destructive text-destructive-foreground px-4 py-2 text-sm text-center">
          <div className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
            </svg>
            Sin conexión a internet
          </div>
        </div>
      )}

      {/* Header global con filtros */}
      <GlobalHeader />

      {/* Navegación */}
      <NavigationBar />

      {/* Contenido principal */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>

      {/* Notificación de actualización */}
      {updateAvailable && <UpdateNotification />}
    </div>
  );
};

export default Layout;
