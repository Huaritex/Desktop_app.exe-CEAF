# Arquitectura IPC - CEAF Dashboard Desktop

## Visión General

El sistema de comunicación entre procesos (IPC) de CEAF Dashboard Desktop está diseñado siguiendo las mejores prácticas de seguridad de Electron. Este documento describe la arquitectura completa del sistema de comunicación.

## Componentes del Sistema

### 1. Main Process (electron/main.ts)

El proceso principal es el backend de la aplicación y tiene acceso completo a:
- APIs de Node.js
- Sistema de archivos
- Credenciales sensibles (SERVICE_KEY)
- APIs de Electron

**Responsabilidades:**
- Crear y gestionar ventanas
- Manejar operaciones que requieren privilegios elevados
- Comunicarse directamente con Supabase
- Gestionar actualizaciones
- Procesar archivos del sistema

### 2. Preload Script (electron/preload.ts)

El script de precarga actúa como un **puente seguro** entre Main y Renderer.

**Características:**
- Se ejecuta en un contexto con acceso a Node.js
- Puede exponer APIs selectivamente usando `contextBridge`
- Define la interfaz `window.api` disponible en el renderer

**Ejemplo de Exposición:**
```typescript
contextBridge.exposeInMainWorld('api', {
  openFile: () => ipcRenderer.invoke('handle-file-open'),
  importData: (params) => ipcRenderer.invoke('handle-import-data', params),
  // ... más funciones
});
```

### 3. Renderer Process (src/)

El proceso de renderizado es el frontend (React) y está **completamente sandboxed**.

**Restricciones de Seguridad:**
- ❌ NO tiene acceso a Node.js APIs
- ❌ NO puede acceder al sistema de archivos
- ❌ NO conoce credenciales sensibles
- ✅ Solo puede comunicarse via `window.api`

## Flujo de Comunicación

```
┌─────────────────────────────────────────────────────────┐
│                      FLUJO IPC                          │
└─────────────────────────────────────────────────────────┘

Renderer Process              Preload              Main Process
(React App)                  (Bridge)             (Node.js)
     │                          │                      │
     │  window.api.openFile()   │                      │
     ├─────────────────────────►│                      │
     │                          │  ipcRenderer.invoke  │
     │                          ├─────────────────────►│
     │                          │                      │
     │                          │   'handle-file-open' │
     │                          │                      │
     │                          │      dialog.show     │
     │                          │      fs.readFile     │
     │                          │                      │
     │                          │  ◄─────return────────┤
     │   ◄──────return──────────┤                      │
     │                          │                      │
     │  { success, data }       │                      │
     └──────────────────────────┴──────────────────────┘
```

## Canales IPC Implementados

### Canales Invoke (Request-Response)

#### 1. `handle-file-open`
**Descripción:** Abre el diálogo nativo de selección de archivos

**Parámetros:** Ninguno

**Retorna:**
```typescript
{
  success: boolean;
  data?: {
    fileName: string;
    fileExtension: string;
    content: string; // Base64
    size: number;
  };
  message?: string;
}
```

**Ejemplo de Uso:**
```typescript
const result = await window.api.openFile();
if (result.success && result.data) {
  console.log('Archivo:', result.data.fileName);
}
```

#### 2. `handle-import-data`
**Descripción:** Importa datos desde un archivo a la base de datos (operación destructiva)

**Parámetros:**
```typescript
{
  content: string;        // Base64 encoded file content
  fileName: string;       // Original filename
  fileExtension: string;  // '.csv' | '.xlsx' | '.xls'
  tableName: string;      // Target database table
  programCodes?: string[]; // Program codes to replace
}
```

**Retorna:**
```typescript
{
  success: boolean;
  message?: string;
  data?: {
    recordsProcessed: number;
    programCodes: string[];
  };
}
```

**Flujo Interno:**
```
1. Decodificar contenido Base64
2. Parsear archivo (CSV o Excel)
3. Iniciar transacción
   3.1. DELETE registros existentes (WHERE program_code IN (...))
   3.2. INSERT nuevos registros
4. Commit transacción
5. Retornar resultado
```

**Ejemplo de Uso:**
```typescript
const result = await window.api.importData({
  content: fileContent,
  fileName: 'data.csv',
  fileExtension: '.csv',
  tableName: 'academic_programs',
  programCodes: ['CS-101', 'CS-102']
});
```

#### 3. `handle-fetch-dashboard-data`
**Descripción:** Obtiene datos de la base de datos con filtros

**Parámetros:**
```typescript
{
  tableName: string;
  filters?: Record<string, any>;
  select?: string;
}
```

**Retorna:**
```typescript
{
  success: boolean;
  data: any[] | null;
  message?: string;
}
```

**Ejemplo de Uso:**
```typescript
const result = await window.api.fetchDashboardData({
  tableName: 'students',
  filters: {
    semester: '2024-1',
    department: 'sistemas'
  },
  select: 'id, name, grade'
});
```

#### 4. `handle-check-connectivity`
**Descripción:** Verifica la conectividad con el servidor

**Parámetros:** Ninguno

**Retorna:**
```typescript
{
  success: boolean;
  online: boolean;
  message?: string;
}
```

#### 5. `handle-get-app-info`
**Descripción:** Obtiene información de la aplicación

**Parámetros:** Ninguno

**Retorna:**
```typescript
{
  version: string;
  name: string;
  platform: string;
  arch: string;
}
```

#### 6. `handle-download-update`
**Descripción:** Descarga una actualización disponible

**Parámetros:** Ninguno

**Retorna:**
```typescript
{
  success: boolean;
  message?: string;
}
```

#### 7. `handle-install-update`
**Descripción:** Instala la actualización descargada y reinicia la app

**Parámetros:** Ninguno

**Retorna:** `Promise<void>`

### Canales Send (One-way, Main → Renderer)

#### 1. `update-available`
**Descripción:** Notifica que hay una actualización disponible

**Payload:**
```typescript
{
  version: string;
  releaseDate: string;
  releaseName?: string;
}
```

**Listener:**
```typescript
const unsubscribe = window.api.onUpdateAvailable((info) => {
  console.log('Nueva versión:', info.version);
});
```

#### 2. `update-not-available`
**Descripción:** Notifica que no hay actualizaciones

**Payload:** Ninguno

#### 3. `download-progress`
**Descripción:** Informa el progreso de descarga de actualización

**Payload:**
```typescript
{
  percent: number;
  transferred: number;
  total: number;
}
```

#### 4. `update-downloaded`
**Descripción:** Notifica que la actualización se descargó completamente

**Payload:**
```typescript
{
  version: string;
  releaseDate: string;
}
```

## Seguridad y Mejores Prácticas

### Configuración de Seguridad en BrowserWindow

```typescript
webPreferences: {
  preload: path.join(__dirname, 'preload.js'),
  nodeIntegration: false,      // ✅ CRITICAL
  contextIsolation: true,      // ✅ CRITICAL
  sandbox: true,               // ✅ RECOMMENDED
  webSecurity: true            // ✅ RECOMMENDED
}
```

### Validación de Inputs

**En Main Process:**
```typescript
ipcMain.handle('handle-import-data', async (_event, params) => {
  // ✅ SIEMPRE validar inputs del renderer
  if (!params.tableName || typeof params.tableName !== 'string') {
    return { success: false, message: 'Invalid table name' };
  }
  
  // ✅ Sanitizar nombres de tabla
  const allowedTables = ['academic_programs', 'students', 'faculty'];
  if (!allowedTables.includes(params.tableName)) {
    return { success: false, message: 'Table not allowed' };
  }
  
  // ... resto del código
});
```

### Manejo de Errores

```typescript
try {
  const result = await someOperation();
  return { success: true, data: result };
} catch (error) {
  console.error('Error:', error);
  return {
    success: false,
    message: error instanceof Error ? error.message : 'Unknown error'
  };
}
```

### Uso de SERVICE_KEY

```typescript
// ✅ CORRECTO: Solo en Main Process
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ❌ INCORRECTO: NUNCA en Renderer
// const supabase = createClient(url, SERVICE_KEY); // ¡NO HACER ESTO!
```

## Añadir Nuevos Canales IPC

### 1. Definir el Handler en Main Process

```typescript
// electron/main.ts
ipcMain.handle('handle-new-operation', async (_event, params) => {
  try {
    // Tu lógica aquí
    return { success: true, data: result };
  } catch (error) {
    return { success: false, message: error.message };
  }
});
```

### 2. Exponer en Preload Script

```typescript
// electron/preload.ts
const api = {
  // ... existing methods
  newOperation: (params: OperationParams) => {
    return ipcRenderer.invoke('handle-new-operation', params);
  }
};

contextBridge.exposeInMainWorld('api', api);
```

### 3. Definir Tipos

```typescript
// src/types/electron.d.ts
interface Window {
  api: {
    // ... existing methods
    newOperation: (params: OperationParams) => Promise<OperationResult>;
  };
}
```

### 4. Usar en Renderer

```typescript
// src/components/SomeComponent.tsx
const handleOperation = async () => {
  const result = await window.api.newOperation({ /* params */ });
  if (result.success) {
    // Handle success
  }
};
```

## Debugging IPC

### En Renderer
```typescript
// Logs aparecen en DevTools Console
console.log('Calling IPC...');
const result = await window.api.someMethod();
console.log('Result:', result);
```

### En Main Process
```typescript
// Logs aparecen en terminal
console.log('IPC Handler called:', params);
```

### Verificar Canales Registrados
```typescript
// En main.ts
console.log('Registered channels:', ipcMain.eventNames());
```

## Performance Tips

1. **Batch Operations**: Agrupa múltiples consultas en una sola llamada IPC
2. **Caching**: Cachea datos que no cambian frecuentemente
3. **Pagination**: Usa paginación para grandes conjuntos de datos
4. **Throttle/Debounce**: Limita llamadas frecuentes

```typescript
// Ejemplo de debounce
const debouncedSearch = debounce(async (query: string) => {
  const results = await window.api.search({ query });
  setResults(results);
}, 300);
```

## Troubleshooting

### Problema: `window.api is undefined`
**Causa:** Preload script no se cargó correctamente
**Solución:** Verifica la ruta en `BrowserWindow.webPreferences.preload`

### Problema: Error "contextBridge is not defined"
**Causa:** `contextIsolation` está deshabilitado
**Solución:** Asegúrate de que `contextIsolation: true`

### Problema: Timeout en operaciones largas
**Causa:** Electron tiene un timeout por defecto en IPC
**Solución:** Divide la operación o aumenta el timeout

## Referencias

- [Electron IPC Documentation](https://www.electronjs.org/docs/latest/tutorial/ipc)
- [Electron Security Best Practices](https://www.electronjs.org/docs/latest/tutorial/security)
- [Context Bridge](https://www.electronjs.org/docs/latest/api/context-bridge)
