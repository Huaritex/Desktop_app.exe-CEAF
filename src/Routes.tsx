import { Routes as RouterRoutes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';

// Páginas
import Dashboard from './pages/Dashboard';
import StudentPerformance from './pages/StudentPerformance';
import AcademicOperations from './pages/AcademicOperations';
import CurriculumAnalysis from './pages/CurriculumAnalysis';
import FacultyManagement from './pages/FacultyManagement';
import ResourceOptimization from './pages/ResourceOptimization';
import NotFound from './pages/NotFound';

const Routes = () => {
  return (
    <RouterRoutes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="student-performance" element={<StudentPerformance />} />
        <Route path="academic-operations" element={<AcademicOperations />} />
        <Route path="curriculum-analysis" element={<CurriculumAnalysis />} />
        <Route path="faculty-management" element={<FacultyManagement />} />
        <Route path="resource-optimization" element={<ResourceOptimization />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </RouterRoutes>
  );
};

export default Routes;
