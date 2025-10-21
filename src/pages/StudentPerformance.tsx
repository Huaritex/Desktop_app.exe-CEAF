const StudentPerformance = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Rendimiento Estudiantil</h1>
        <p className="text-muted-foreground">
          Análisis detallado del desempeño académico de los estudiantes
        </p>
      </div>

      <div className="dashboard-card">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Módulo en construcción
        </h3>
        <p className="text-muted-foreground">
          Este módulo mostrará métricas de rendimiento académico, tasas de aprobación,
          promedios por carrera y análisis de estudiantes en riesgo.
        </p>
      </div>
    </div>
  );
};

export default StudentPerformance;
