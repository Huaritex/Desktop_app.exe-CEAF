import CSVUploader from '../components/CSVUploader';

const FacultyManagement = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Gestión Docente</h1>
        <p className="text-muted-foreground">
          Administración y análisis de recursos docentes
        </p>
      </div>

      {/* Componente de importación de datos */}
      <div className="mb-6">
        <CSVUploader />
      </div>

      <div className="dashboard-card">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Información de Docentes
        </h3>
        <p className="text-muted-foreground">
          Este módulo mostrará carga horaria, evaluaciones, especialidades
          y asignaciones por departamento.
        </p>
      </div>
    </div>
  );
};

export default FacultyManagement;
