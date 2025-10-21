import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  TrendingUp,
  Calendar,
  BookOpen,
  Users,
  Settings
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Rendimiento Estudiantil', path: '/student-performance', icon: TrendingUp },
  { name: 'Operaciones Académicas', path: '/academic-operations', icon: Calendar },
  { name: 'Análisis Curricular', path: '/curriculum-analysis', icon: BookOpen },
  { name: 'Gestión Docente', path: '/faculty-management', icon: Users },
  { name: 'Optimización de Recursos', path: '/resource-optimization', icon: Settings }
];

const NavigationBar = () => {
  return (
    <nav className="bg-card border-b border-border px-6">
      <div className="flex items-center gap-1 overflow-x-auto">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                  isActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default NavigationBar;
