import { useApp } from '../../contexts/AppContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const GlobalHeader = () => {
  const { appInfo, globalFilters, setGlobalFilters } = useApp();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Logo y título */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">C</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">CEAF Dashboard UCB</h1>
            {appInfo && (
              <p className="text-xs text-muted-foreground">v{appInfo.version}</p>
            )}
          </div>
        </div>

        {/* Filtros globales */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-foreground">Semestre:</label>
            <select
              value={globalFilters.semester}
              onChange={(e) => setGlobalFilters({ semester: e.target.value })}
              className="px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Todos</option>
              <option value="2024-1">2024-1</option>
              <option value="2024-2">2024-2</option>
              <option value="2025-1">2025-1</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-foreground">Departamento:</label>
            <select
              value={globalFilters.department}
              onChange={(e) => setGlobalFilters({ department: e.target.value })}
              className="px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Todos</option>
              <option value="sistemas">Sistemas</option>
              <option value="industrial">Industrial</option>
              <option value="civil">Civil</option>
              <option value="electronica">Electrónica</option>
            </select>
          </div>

          {/* Toggle de tema */}
          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-secondary rounded-md transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? (
              <Moon className="w-5 h-5 text-foreground" />
            ) : (
              <Sun className="w-5 h-5 text-foreground" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default GlobalHeader;
