# Guía de Contribución

¡Gracias por tu interés en contribuir a CEAF Dashboard Desktop! Este documento proporciona pautas y mejores prácticas para contribuir al proyecto.

## 📋 Tabla de Contenidos

- [Código de Conducta](#código-de-conducta)
- [¿Cómo puedo contribuir?](#cómo-puedo-contribuir)
- [Configuración del Entorno](#configuración-del-entorno)
- [Proceso de Desarrollo](#proceso-de-desarrollo)
- [Estándares de Código](#estándares-de-código)
- [Commits y Pull Requests](#commits-y-pull-requests)
- [Reportar Bugs](#reportar-bugs)
- [Solicitar Features](#solicitar-features)

## 📜 Código de Conducta

### Nuestro Compromiso

Nos comprometemos a proporcionar un ambiente acogedor, seguro y respetuoso para todos, independientemente de:
- Edad
- Discapacidad
- Etnicidad
- Identidad de género
- Nivel de experiencia
- Nacionalidad
- Apariencia física
- Religión

### Comportamiento Esperado

- ✅ Usa lenguaje acogedor e inclusivo
- ✅ Respeta diferentes puntos de vista
- ✅ Acepta críticas constructivas
- ✅ Enfócate en lo mejor para la comunidad
- ✅ Muestra empatía hacia otros miembros

### Comportamiento Inaceptable

- ❌ Lenguaje o imágenes sexualizadas
- ❌ Trolling o comentarios insultantes
- ❌ Ataques personales o políticos
- ❌ Acoso público o privado
- ❌ Publicar información privada sin permiso

## 🤝 ¿Cómo puedo contribuir?

### Reportar Bugs

1. Verifica que el bug no haya sido reportado antes
2. Abre un Issue con template de bug
3. Incluye:
   - Descripción clara del problema
   - Pasos para reproducir
   - Comportamiento esperado vs actual
   - Screenshots/logs si aplica
   - Información del sistema (OS, versión de Node, etc.)

### Solicitar Features

1. Verifica que no exista una solicitud similar
2. Abre un Issue con template de feature request
3. Explica:
   - El problema que resuelve
   - Solución propuesta
   - Alternativas consideradas
   - Impacto en usuarios existentes

### Contribuir Código

1. Haz fork del repositorio
2. Crea una rama desde `main`
3. Implementa tus cambios
4. Escribe/actualiza tests si aplica
5. Actualiza documentación
6. Abre un Pull Request

## 🛠️ Configuración del Entorno

### 1. Fork y Clone

```bash
# Fork en GitHub, luego:
git clone https://github.com/tu-usuario/CEAF-Dashboard-UCB.git
cd CEAF-Dashboard-UCB/app\ desktop
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar Variables de Entorno

```bash
cp .env.example .env
# Edita .env con tus credenciales
```

### 4. Ejecutar en Desarrollo

```bash
npm run dev
```

## 🔄 Proceso de Desarrollo

### 1. Crear una Rama

```bash
# Para features
git checkout -b feature/nombre-descriptivo

# Para bugs
git checkout -b fix/nombre-del-bug

# Para documentación
git checkout -b docs/actualizar-readme
```

### 2. Hacer Cambios

- Escribe código limpio y legible
- Sigue los estándares del proyecto
- Comenta código complejo
- Mantén funciones pequeñas y enfocadas

### 3. Probar Cambios

```bash
# Type check
npm run type-check

# Build
npm run build:dir

# Prueba manual
npm run dev
```

### 4. Commit

```bash
git add .
git commit -m "tipo: descripción breve"
```

### 5. Push y PR

```bash
git push origin tu-rama
# Abre PR en GitHub
```

## 📝 Estándares de Código

### TypeScript

```typescript
// ✅ BIEN: Tipos explícitos
interface User {
  id: string;
  name: string;
  email: string;
}

function getUser(id: string): Promise<User> {
  // ...
}

// ❌ MAL: Tipos any
function getUser(id: any): any {
  // ...
}
```

### React Components

```typescript
// ✅ BIEN: Componente funcional con tipos
interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

const Button: React.FC<ButtonProps> = ({ onClick, children, variant = 'primary' }) => {
  return (
    <button onClick={onClick} className={`btn-${variant}`}>
      {children}
    </button>
  );
};

// ❌ MAL: Sin tipos
const Button = ({ onClick, children, variant }) => {
  // ...
};
```

### Naming Conventions

```typescript
// Componentes: PascalCase
const UserProfile = () => { /* ... */ };

// Funciones: camelCase
function getUserData() { /* ... */ }

// Constantes: UPPER_SNAKE_CASE
const MAX_RETRIES = 3;

// Variables: camelCase
const userData = {};

// Archivos de componentes: PascalCase.tsx
// UserProfile.tsx

// Archivos de utilidades: camelCase.ts
// helpers.ts
```

### Imports

```typescript
// Orden de imports:
// 1. Externos
import React from 'react';
import { useEffect } from 'react';

// 2. Internos (usando alias @)
import { Button } from '@/components/ui/Button';
import { useApp } from '@/contexts/AppContext';

// 3. Relativos
import { formatDate } from '../utils/helpers';

// 4. Estilos
import './styles.css';
```

### IPC Handlers

```typescript
// ✅ BIEN: Validación y manejo de errores
ipcMain.handle('handle-operation', async (_event, params) => {
  try {
    // Validar inputs
    if (!params.required) {
      return { success: false, message: 'Missing required parameter' };
    }

    // Operación
    const result = await doSomething(params);
    
    return { success: true, data: result };
  } catch (error) {
    console.error('Error in handle-operation:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
});

// ❌ MAL: Sin validación ni manejo de errores
ipcMain.handle('handle-operation', async (_event, params) => {
  const result = await doSomething(params);
  return result;
});
```

## 💬 Commits y Pull Requests

### Formato de Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

```
tipo(scope): descripción breve

Descripción detallada (opcional)

Footer (opcional)
```

### Tipos Permitidos:

- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `docs`: Cambios en documentación
- `style`: Formato (no afecta código)
- `refactor`: Refactorización
- `perf`: Mejora de performance
- `test`: Añadir/corregir tests
- `chore`: Mantenimiento

### Ejemplos:

```bash
# Feature
git commit -m "feat(dashboard): añadir gráfico de líneas para tendencias"

# Fix
git commit -m "fix(csv-uploader): corregir validación de archivos xlsx"

# Docs
git commit -m "docs(readme): actualizar guía de instalación"

# Refactor
git commit -m "refactor(ipc): mejorar manejo de errores en handlers"
```

### Pull Requests

**Título:**
```
tipo: Descripción Clara y Concisa
```

**Descripción debe incluir:**
- 📝 Qué cambia este PR
- 🎯 Por qué se necesita el cambio
- 🔗 Issue relacionado (si aplica)
- 📸 Screenshots (si aplica)
- ✅ Checklist de verificación

**Template de PR:**

```markdown
## Descripción
Breve descripción de los cambios

## Tipo de cambio
- [ ] Bug fix
- [ ] Nueva funcionalidad
- [ ] Cambio breaking
- [ ] Documentación

## ¿Cómo se ha probado?
Describe las pruebas realizadas

## Checklist
- [ ] Mi código sigue los estándares del proyecto
- [ ] He realizado self-review
- [ ] He comentado código complejo
- [ ] He actualizado la documentación
- [ ] No hay nuevos warnings
- [ ] He probado en desarrollo
- [ ] He probado el build de producción
```

## 🐛 Reportar Bugs

### Template de Bug Report

```markdown
**Descripción del Bug**
Descripción clara y concisa del bug.

**Pasos para Reproducir**
1. Ve a '...'
2. Haz clic en '....'
3. Scroll down to '....'
4. Ver error

**Comportamiento Esperado**
Qué esperabas que pasara.

**Comportamiento Actual**
Qué pasó realmente.

**Screenshots**
Si aplica, añade screenshots.

**Información del Sistema**
- OS: [ej. Windows 11]
- Versión de la App: [ej. 1.0.0]
- Node version: [ej. 18.17.0]

**Logs**
```
Pega logs relevantes aquí
```

**Contexto Adicional**
Cualquier información adicional relevante.
```

## 💡 Solicitar Features

### Template de Feature Request

```markdown
**¿Tu feature request está relacionado con un problema?**
Descripción clara del problema. Ej: Siempre me frustro cuando [...]

**Describe la solución que te gustaría**
Descripción clara de lo que quieres que pase.

**Describe alternativas que has considerado**
Descripción de soluciones alternativas.

**Contexto Adicional**
Screenshots, mockups, o contexto adicional.
```

## 🧪 Testing

### Antes de Hacer PR

1. **Type Check:**
```bash
npm run type-check
```

2. **Build:**
```bash
npm run build:dir
```

3. **Pruebas Manuales:**
   - ✅ La aplicación inicia
   - ✅ No hay errores en consola
   - ✅ La funcionalidad nueva funciona
   - ✅ No rompió funcionalidades existentes
   - ✅ UI se ve bien en tema claro y oscuro

## 📚 Documentación

Al añadir features, actualiza:

- [ ] README.md (si afecta uso general)
- [ ] ARCHITECTURE.md (si afecta arquitectura IPC)
- [ ] INSTALLATION.md (si afecta instalación)
- [ ] CHANGELOG.md (añade entrada en Unreleased)
- [ ] Comentarios en código (JSDoc para funciones complejas)

### Ejemplo de JSDoc:

```typescript
/**
 * Importa datos desde un archivo a la base de datos
 * 
 * Esta es una operación DESTRUCTIVA que elimina registros existentes
 * antes de insertar los nuevos.
 * 
 * @param params - Parámetros de importación
 * @param params.content - Contenido del archivo en Base64
 * @param params.tableName - Nombre de la tabla destino
 * @param params.programCodes - Códigos de programa a reemplazar
 * @returns Promise con resultado de la operación
 * 
 * @example
 * ```typescript
 * const result = await importData({
 *   content: 'base64content',
 *   tableName: 'students',
 *   programCodes: ['CS-101']
 * });
 * ```
 */
async function importData(params: ImportParams): Promise<ImportResult> {
  // ...
}
```

## ❓ ¿Preguntas?

Si tienes preguntas sobre cómo contribuir:

1. Revisa la documentación existente
2. Busca en Issues cerrados
3. Abre un Issue con tag `question`
4. Contacta al equipo: soporte@ucb.edu.bo

## 🙏 Agradecimientos

Gracias por contribuir a CEAF Dashboard Desktop. Tu tiempo y esfuerzo son muy apreciados!

---

**Happy Coding! 🚀**
