# Changelog

Todos los cambios notables de este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

## [Unreleased]

### Por Añadir
- Implementación completa de todos los módulos de dashboard
- Exportación de reportes a PDF
- Modo offline completo con sincronización
- Sistema de notificaciones push
- Soporte multiidioma (ES/EN)
- Integración con sistemas externos

## [1.0.0] - 2025-10-18

### ✨ Añadido
- Arquitectura completa Electron + Vite + React + TypeScript
- Sistema IPC seguro con contextBridge
- 5 módulos de dashboard:
  - Rendimiento Estudiantil
  - Operaciones Académicas
  - Análisis Curricular
  - Gestión Docente
  - Optimización de Recursos
- Importación masiva de datos desde CSV/XLSX
- Sistema de actualizaciones automáticas con electron-updater
- Tema oscuro y claro con toggle
- Filtros globales por semestre y departamento
- Detección de conectividad online/offline
- Componentes UI reutilizables (Button, GlobalHeader, NavigationBar)
- Manejo robusto de errores con ErrorBoundary
- Documentación completa:
  - README.md
  - ARCHITECTURE.md (IPC)
  - INSTALLATION.md
- Configuración de electron-builder para Windows
- Scripts de desarrollo y compilación
- Validación y sanitización de inputs
- Manejo seguro de credenciales (SERVICE_KEY solo en main process)

### 🔒 Seguridad
- Context Isolation habilitado
- Node Integration deshabilitado
- Sandbox activado
- Web Security activado
- Credenciales de Supabase protegidas
- Validación de inputs en Main Process

### 🎨 UI/UX
- Interfaz moderna con Tailwind CSS
- Navegación fluida con React Router
- Animaciones suaves
- Feedback visual de carga
- Notificaciones de actualización
- Indicador de estado de conexión

### 📦 Infraestructura
- Configuración de Vite optimizada
- Build optimizado con code splitting
- Hot Module Replacement en desarrollo
- TypeScript estricto
- ESLint configurado
- PostCSS con Tailwind

### 🗄️ Base de Datos
- Integración con Supabase
- Cliente con privilegios de servicio en Main Process
- Operaciones transaccionales destructivas
- Soporte para múltiples tablas

### 🔧 Desarrollo
- Modo desarrollo con DevTools
- Type checking con TypeScript
- Estructura de carpetas clara
- Separación de concerns (Main/Preload/Renderer)

---

## Guía de Versionado

### Formato: `MAJOR.MINOR.PATCH`

- **MAJOR**: Cambios incompatibles con versiones anteriores
- **MINOR**: Nueva funcionalidad compatible con versiones anteriores
- **PATCH**: Correcciones de bugs compatibles con versiones anteriores

### Ejemplos:
- `1.0.0` → Primera versión estable
- `1.1.0` → Nueva funcionalidad (ej. nuevo módulo)
- `1.1.1` → Corrección de bug
- `2.0.0` → Cambio mayor (ej. nueva arquitectura)

### Tipos de Cambios:
- **Añadido**: Nueva funcionalidad
- **Cambiado**: Cambios en funcionalidad existente
- **Deprecado**: Funcionalidad que será removida
- **Removido**: Funcionalidad removida
- **Corregido**: Corrección de bugs
- **Seguridad**: Correcciones de seguridad

---

## [0.1.0] - 2025-10-10 (Alpha)

### ✨ Añadido
- Prototipo inicial
- Estructura básica del proyecto
- Configuración de Electron

---

**Nota:** Las fechas en este changelog son ficticias para propósitos de ejemplo. Actualiza las fechas según los releases reales del proyecto.
