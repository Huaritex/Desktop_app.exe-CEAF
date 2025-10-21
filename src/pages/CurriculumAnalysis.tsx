const CurriculumAnalysis = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Análisis Curricular</h1>
        <p className="text-muted-foreground">
          Análisis y optimización de planes de estudio
        </p>
      </div>

      <div className="dashboard-card">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Módulo en construcción
        </h3>
        <p className="text-muted-foreground">
          Este módulo permitirá analizar flujos curriculares, identificar cuellos de botella
          y optimizar secuencias de materias.
        </p>
      </div>
    </div>
  );
};

export default CurriculumAnalysis;
