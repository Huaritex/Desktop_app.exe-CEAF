# CEAF Dashboard UCB - Desktop Edition

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![Platform](https://img.shields.io/badge/platform-Windows%2010%2F11-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 📋 Descripción

CEAF Dashboard UCB Desktop Edition es una aplicación de escritorio nativa para Windows, diseñada para proporcionar a los gestores académicos de la Universidad Católica Boliviana herramientas avanzadas de análisis y gestión de datos académicos. Esta aplicación ofrece todas las funcionalidades del proyecto web original, mejoradas con las ventajas de rendimiento, acceso al sistema de archivos y estabilidad de una aplicación de escritorio.

## 🆕 NUEVO: Sistema de Gestión Inteligente de Horarios

**Versión 2.0** incluye un sistema completo de gestión de horarios académicos con:

- ✅ **Validación Automática de Conflictos**: Detecta cruces de docentes, aulas y paralelos
- ✅ **Replicación Inteligente**: Aplica horarios automáticamente entre carreras/pensums equivalentes
- ✅ **Gestión de Series**: Modifica eventos recurrentes en masa
- ✅ **Calendario Interactivo**: Drag & drop para reorganizar horarios (próximamente)
- ✅ **Motor de Optimización**: Valida carga horaria automáticamente

📖 **Documentación completa:** [docs/HORARIOS_SISTEMA.md](docs/HORARIOS_SISTEMA.md)

## 🎯 Características Principales

### Módulos de Dashboard
- **Rendimiento Estudiantil**: Análisis detallado del desempeño académico
- **Operaciones Académicas**: Gestión de horarios y calendario académico
- **Análisis Curricular**: Optimización de planes de estudio
- **Gestión Docente**: Administración de recursos docentes
- **Optimización de Recursos**: Análisis de uso de instalaciones
- **🆕 Gestión de Horarios**: Sistema inteligente de asignación de horarios

### Funcionalidades Core
- ✅ **Interfaz Moderna**: UI responsive con tema oscuro/claro
- ✅ **Filtros Globales**: Filtrado por semestre y departamento
- ✅ **Importación de Datos**: Carga masiva desde CSV/XLSX
- ✅ **Sincronización en Tiempo Real**: Conexión segura con Supabase
- ✅ **Actualizaciones Automáticas**: Sistema de auto-actualización
- ✅ **Modo Offline**: Detección y manejo de conectividad
- ✅ **🆕 Validación de Conflictos**: Motor inteligente de detección
- ✅ **🆕 Replicación Automática**: Clona horarios entre carreras

## 🏗️ Arquitectura

### Stack Tecnológico

```
┌─────────────────────────────────────────────────────┐
│                 CEAF Dashboard Desktop              │
├─────────────────────────────────────────────────────┤
│  Proceso de Renderizado (Renderer - Frontend)       │
│  • React 18 + TypeScript                            │
│  • Vite (Build Tool)                                │
│  • Tailwind CSS (Estilos)                           │
│  • React Router (Navegación)                        │
│  • D3.js (Visualizaciones)                          │
│  • react-beautiful-dnd (Drag & Drop) 🆕             │
├─────────────────────────────────────────────────────┤
│  Preload Script (Puente Seguro)                     │
│  • contextBridge                                    │
│  • IPC API Exposure (17 endpoints) 🆕               │
├─────────────────────────────────────────────────────┤
│  Proceso Principal (Main - Backend)                 │
│  • Electron                                         │
│  • Node.js + TypeScript                             │
│  • Supabase Client (con SERVICE_KEY)                │
│  • 🆕 Motor de Validación de Conflictos             │
│  • 🆕 Sistema de Replicación Inteligente            │
├─────────────────────────────────────────────────────┤
│  Base de Datos (Supabase PostgreSQL) 🆕             │
│  • 15 tablas relacionales (schema unificado)        │
│  • 3 funciones almacenadas para validación         │
│  • 3 vistas materializadas para reporting          │
│  • Sin redundancia - diseño normalizado            │
└─────────────────────────────────────────────────────┘
```

### Arquitectura de Seguridad

```
┌──────────────────┐           ┌──────────────────┐
│  Renderer        │           │  Main Process    │
│  (UI - React)    │◄──IPC────►│  (Backend)       │
│                  │           │                  │
│  - No Node API   │           │  - Full Node API │
│  - No Secrets    │           │  - SERVICE_KEY   │
│  - Sandboxed     │           │  - File System   │
└──────────────────┘           └────────┬─────────┘
                                        │
                                        ▼
                               ┌──────────────────┐
                               │    Supabase      │
                               │   (PostgreSQL)   │
                               └──────────────────┘
```

## 🚀 Instalación y Configuración

### Requisitos Previos

- Node.js 18+ 
- npm o yarn
- Windows 10/11 (para desarrollo y pruebas)

### Paso 1: Instalación de Dependencias

```bash
cd "app desktop"
npm install
```

### Paso 2: Configuración de Base de Datos

1. Ve a [Supabase Dashboard](https://app.supabase.com/) y crea un nuevo proyecto
2. Ir a **SQL Editor** → **New Query**
3. Copiar el contenido de `database/schema_unificado.sql`
4. Ejecutar el script completo
5. Verificar que se crearon:
   - ✅ 15 tablas
   - ✅ 3 funciones (validar_conflicto_docente, validar_conflicto_aula, validar_carga_horaria_materia)
   - ✅ 3 vistas (vista_asignaciones_completas, vista_carga_docentes, vista_ocupacion_aulas)

### Paso 3: Configuración de Variables de Entorno

1. Copia el archivo de ejemplo:
```bash
cp .env.example .env
```

2. Edita `.env` con tus credenciales de Supabase:
```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui
SUPABASE_SERVICE_KEY=tu-service-key-aqui
```

⚠️ **IMPORTANTE**: 
- La `SUPABASE_SERVICE_KEY` **NUNCA** debe exponerse en el código del renderer
- Solo el proceso principal tiene acceso a esta clave
- No commites el archivo `.env` al repositorio

## 🛠️ Desarrollo

### Modo Desarrollo

```bash
npm run dev
```

Esto iniciará:
- Vite dev server en `http://localhost:5173`
- Electron en modo desarrollo con DevTools abierto
- Hot Module Replacement (HMR) para cambios en tiempo real

### Compilación TypeScript

```bash
npm run type-check
```

### Estructura del Proyecto

```
app desktop/
├── electron/                  # Proceso principal de Electron
│   ├── main.ts               # Punto de entrada principal
│   └── preload.ts            # Preload script (puente seguro)
├── src/                      # Código del renderer (React)
│   ├── components/           # Componentes React
│   │   ├── ui/              # Componentes UI reutilizables
│   │   ├── CSVUploader.tsx  # Importador de datos
│   │   ├── Layout.tsx       # Layout principal
│   │   └── ErrorBoundary.tsx
│   ├── contexts/            # React Contexts
│   │   ├── AppContext.tsx
│   │   └── ThemeContext.tsx
│   ├── pages/               # Páginas de la aplicación
│   │   ├── Dashboard.tsx
│   │   ├── StudentPerformance.tsx
│   │   └── ...
│   ├── styles/              # Estilos globales
│   │   └── index.css
│   ├── App.tsx              # Componente raíz
│   ├── Routes.tsx           # Configuración de rutas
│   └── main.tsx             # Punto de entrada React
├── resources/               # Recursos (iconos, assets)
├── dist/                    # Build del renderer
├── dist-electron/           # Build del proceso principal
├── release/                 # Instaladores generados
├── index.html               # HTML principal
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## 📦 Compilación y Distribución

### Build de Producción

```bash
npm run build
```

Esto:
1. Compila TypeScript
2. Construye el bundle de Vite
3. Genera el ejecutable de Electron
4. Crea el instalador de Windows

### Build Solo para Windows

```bash
npm run build:win
```

### Build de Directorio (Sin Instalador)

```bash
npm run build:dir
```

### Salida

Los archivos generados estarán en:
- `release/` - Instalador final `.exe`
- `dist/` - Aplicación web compilada
- `dist-electron/` - Proceso principal compilado

## 🔌 API IPC (Inter-Process Communication)

La aplicación expone una API segura a través del objeto `window.api`:

### Operaciones de Archivos

```typescript
// Abrir diálogo de archivo
const result = await window.api.openFile();
// Retorna: { success: boolean, data?: FileData, message?: string }

// Importar datos
const importResult = await window.api.importData({
  content: 'base64-content',
  fileName: 'data.csv',
  fileExtension: '.csv',
  tableName: 'academic_programs',
  programCodes: ['CS-101', 'CS-102']
});
```

### Operaciones de Base de Datos

```typescript
// Obtener datos con filtros
const data = await window.api.fetchDashboardData({
  tableName: 'students',
  filters: { semester: '2024-1', department: 'sistemas' },
  select: '*'
});
```

### Conectividad

```typescript
// Verificar conexión
const status = await window.api.checkConnectivity();
// Retorna: { success: boolean, online: boolean }
```

### Información de la Aplicación

```typescript
// Obtener info de la app
const info = await window.api.getAppInfo();
// Retorna: { version, name, platform, arch }
```

### Sistema de Actualizaciones

```typescript
// Descargar actualización
await window.api.downloadUpdate();

// Instalar y reiniciar
await window.api.installUpdate();

// Escuchar eventos
const unsubscribe = window.api.onUpdateAvailable((info) => {
  console.log('Nueva versión disponible:', info.version);
});
```

## 🔒 Seguridad

### Principios de Seguridad Implementados

1. **Context Isolation**: El renderer está completamente aislado
2. **Sandbox**: El renderer corre en un sandbox sin acceso a Node.js
3. **No Node Integration**: Node APIs no están disponibles en el renderer
4. **Secure IPC**: Toda comunicación pasa por el preload script
5. **Credenciales Protegidas**: La SERVICE_KEY solo está en el main process

### Mejores Prácticas

- ❌ **NUNCA** uses `nodeIntegration: true`
- ❌ **NUNCA** deshabilites `contextIsolation`
- ❌ **NUNCA** expongas credenciales en el renderer
- ✅ **SIEMPRE** usa `contextBridge` para exponer APIs
- ✅ **SIEMPRE** valida inputs del renderer en el main process
- ✅ **SIEMPRE** usa el principio de mínimo privilegio

## 🔄 Sistema de Actualizaciones

La aplicación usa `electron-updater` para actualizaciones automáticas:

### Configuración

En `package.json`:
```json
{
  "build": {
    "publish": {
      "provider": "github",
      "owner": "Huaritex",
      "repo": "CEAF-Dashboard-UCB"
    }
  }
}
```

### Publicación de Actualizaciones

1. Crea un nuevo release en GitHub:
```bash
git tag v1.0.1
git push origin v1.0.1
```

2. Compila y sube el instalador:
```bash
npm run build
```

3. Sube el `.exe` generado al release en GitHub

4. La aplicación detectará y descargará automáticamente

## 📊 Importación de Datos

### Formato de Archivos Soportados

- **CSV**: Separado por comas
- **XLSX**: Excel moderno
- **XLS**: Excel legacy

### Estructura de Datos

El archivo debe contener una columna `program_code` para identificar carreras:

```csv
program_code,student_name,semester,grade
CS-101,Juan Pérez,2024-1,85
CS-102,María García,2024-1,92
```

### Proceso de Importación

1. **Selección**: Usuario selecciona archivo desde el sistema
2. **Validación**: Se valida el formato y estructura
3. **Transacción**: Se eliminan registros existentes por `program_code`
4. **Inserción**: Se insertan los nuevos registros
5. **Confirmación**: Se notifica el resultado al usuario

⚠️ **Esta operación es DESTRUCTIVA y no puede revertirse**

## 🐛 Debugging

### DevTools

En desarrollo, las DevTools están abiertas por defecto. Para producción:

```typescript
// En main.ts
if (process.env.NODE_ENV === 'development') {
  mainWindow.webContents.openDevTools();
}
```

### Logs

Los logs se pueden ver en:
- **Renderer**: DevTools Console
- **Main Process**: Terminal donde se ejecutó la app

### Errores Comunes

1. **Error de conexión a Supabase**: Verifica las variables de entorno
2. **Error de IPC**: Asegúrate de que el preload script esté cargado
3. **Error de compilación**: Ejecuta `npm install` de nuevo

## 🧪 Testing

```bash
# Ejecutar tests (a implementar)
npm test

# Coverage
npm run test:coverage
```

## 👥 Contribución

1. Fork el proyecto
2. Crea tu feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📧 Soporte

Para soporte y consultas:
- Email: huaritex@gmail.com
- GitHub Issues: [github.com/Huaritex/CEAF-Dashboard-UCB/issues](https://github.com/Huaritex/CEAF-Dashboard-UCB/issues)

## 🗺️ Roadmap

- [ ] Implementación completa de todos los dashboards
- [ ] Exportación de reportes a PDF
- [ ] Modo offline completo con sincronización
- [ ] Notificaciones push
- [ ] Soporte para múltiples idiomas
- [ ] Integración con sistemas externos
- [ ] Dashboard personalizable por usuario

## 📚 Recursos Adicionales

- [Documentación de Electron](https://www.electronjs.org/docs)
- [Guía de Seguridad de Electron](https://www.electronjs.org/docs/latest/tutorial/security)
- [Documentación de Supabase](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React Router](https://reactrouter.com/)

---

**Desarrollado por Huaritex**
