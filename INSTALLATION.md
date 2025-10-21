# Guía de Instalación - CEAF Dashboard Desktop

Esta guía te llevará paso a paso a través del proceso de instalación, configuración y despliegue de CEAF Dashboard Desktop Edition.

## 📋 Prerrequisitos

### Software Requerido

1. **Node.js** (v18 o superior)
   - Descarga desde: https://nodejs.org/
   - Verifica la instalación: `node --version`

2. **npm** o **yarn**
   - Viene con Node.js
   - Verifica: `npm --version`

3. **Git**
   - Descarga desde: https://git-scm.com/
   - Verifica: `git --version`

4. **Visual Studio Code** (Recomendado)
   - Descarga desde: https://code.visualstudio.com/

### Cuentas Necesarias

1. **Supabase Account**
   - Crea una cuenta en: https://supabase.com/
   - Crea un nuevo proyecto
   - Guarda las credenciales (URL, ANON_KEY, SERVICE_KEY)

2. **GitHub Account** (Para actualizaciones automáticas)
   - Crea una cuenta en: https://github.com/
   - Fork/Clone el repositorio del proyecto

## 🚀 Instalación Paso a Paso

### Paso 1: Clonar el Repositorio

```bash
# Clona el repositorio
git clone https://github.com/Huaritex/CEAF-Dashboard-UCB.git

# Navega a la carpeta del proyecto desktop
cd CEAF-Dashboard-UCB
cd "app desktop"
```

### Paso 2: Instalar Dependencias

```bash
# Usando npm
npm install

# O usando yarn
yarn install
```

**Nota:** Este proceso puede tomar varios minutos dependiendo de tu conexión a internet.

### Paso 3: Configurar Variables de Entorno

1. **Copia el archivo de ejemplo:**
```bash
cp .env.example .env
```

2. **Edita el archivo `.env`:**
```bash
# En Windows
notepad .env

# En Linux/Mac
nano .env
```

3. **Completa las variables:**
```env
# URL de tu proyecto Supabase
VITE_SUPABASE_URL=https://tuproyecto.supabase.co

# Anon Key (pública) - Disponible en Supabase Dashboard
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Service Role Key (privada) - ¡MANTÉN ESTO SEGURO!
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**⚠️ IMPORTANTE:** 
- Nunca compartas tu `SERVICE_KEY`
- Nunca la subas a Git
- El archivo `.env` está en `.gitignore` por seguridad

### Paso 4: Obtener Credenciales de Supabase

1. Ve a [Supabase Dashboard](https://app.supabase.com/)
2. Selecciona tu proyecto
3. Ve a **Settings** → **API**
4. Copia:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** → `VITE_SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_KEY`

### Paso 5: Configurar la Base de Datos

1. **Ejecutar migraciones:**
```bash
# En Supabase Dashboard → SQL Editor
# Ejecuta el archivo: supabase/migrations/20250826191647_academic_management_system.sql
```

2. **Verificar tablas creadas:**
   - `academic_programs`
   - `students`
   - `faculty`
   - `courses`
   - etc.

### Paso 6: Ejecutar en Modo Desarrollo

```bash
npm run dev
```

Esto iniciará:
- Servidor Vite en `http://localhost:5173`
- Electron con hot-reload activado

**Resultado esperado:**
- Se abrirá una ventana de Electron
- DevTools estará abierto
- Verás el dashboard principal

## 🔧 Configuración Adicional

### Configurar Iconos

1. **Coloca tus iconos en `resources/`:**
```
resources/
├── icon.png     (256x256 o superior)
├── icon.ico     (para Windows)
└── icon.icns    (para macOS, opcional)
```

2. **Genera iconos automáticamente:**
```bash
npm install -g electron-icon-builder
electron-icon-builder --input=resources/icon.png --output=resources
```

### Personalizar Metadatos de la Aplicación

Edita `package.json`:

```json
{
  "name": "ceaf-dashboard-desktop",
  "productName": "CEAF Dashboard UCB",
  "version": "1.0.0",
  "description": "Tu descripción aquí",
  "author": {
    "name": "Tu Nombre",
    "email": "tu@email.com"
  }
}
```

### Configurar Actualizaciones Automáticas

1. **Asegúrate de tener un repositorio en GitHub**

2. **Configura el proveedor en `package.json`:**
```json
{
  "build": {
    "publish": {
      "provider": "github",
      "owner": "tu-usuario",
      "repo": "tu-repo"
    }
  }
}
```

3. **Genera un token de GitHub:**
   - Ve a GitHub Settings → Developer settings → Personal access tokens
   - Genera un token con permisos `repo`
   - Guárdalo como variable de entorno:
```bash
export GH_TOKEN=ghp_tu_token_aqui
```

## 📦 Compilación para Producción

### Build Básico

```bash
# Compilar para tu plataforma actual
npm run build
```

### Build Solo Windows

```bash
# Específicamente para Windows
npm run build:win
```

### Build de Directorio (Sin Instalador)

```bash
# Genera carpeta ejecutable sin instalador
npm run build:dir
```

### Resultado de la Compilación

Los archivos generados estarán en:
```
release/
└── CEAF Dashboard UCB-Setup-1.0.0.exe  (Instalador de Windows)
```

## 🧪 Testing

### Verificar la Compilación

1. **Instala el ejecutable generado:**
   - Ejecuta `release/CEAF Dashboard UCB-Setup-1.0.0.exe`
   - Sigue el asistente de instalación

2. **Verifica funcionalidades:**
   - ✅ La aplicación se abre correctamente
   - ✅ Puedes navegar entre módulos
   - ✅ El tema oscuro/claro funciona
   - ✅ Puedes conectarte a Supabase
   - ✅ La importación de archivos funciona

### Testing de Actualización

1. **Crea un release en GitHub:**
```bash
git tag v1.0.1
git push origin v1.0.1
```

2. **Compila y sube el nuevo instalador**

3. **Abre la versión anterior de la app**

4. **Verifica que detecta la actualización**

## 🚢 Despliegue

### 1. Crear un Release en GitHub

```bash
# Crea y publica un tag
git tag v1.0.0
git push origin v1.0.0
```

### 2. Compilar el Instalador

```bash
npm run build:win
```

### 3. Subir a GitHub Releases

1. Ve a tu repositorio en GitHub
2. Ve a **Releases** → **Create a new release**
3. Selecciona el tag `v1.0.0`
4. Sube el archivo `.exe` de `release/`
5. Publica el release

### 4. Distribución

**Opciones:**

**A) Descarga Directa:**
- Comparte el enlace del release de GitHub
- Los usuarios descargan e instalan manualmente

**B) Auto-actualización:**
- Los usuarios con versiones antiguas recibirán una notificación
- Pueden actualizar desde la app

**C) Servidor Interno:**
- Aloja el instalador en un servidor propio
- Comparte el enlace internamente

## 🛠️ Troubleshooting

### Problema: "npm install" falla

**Solución:**
```bash
# Limpia caché de npm
npm cache clean --force

# Elimina node_modules
rm -rf node_modules

# Reinstala
npm install
```

### Problema: Error de permisos en Windows

**Solución:**
```bash
# Ejecuta como administrador
# Abre PowerShell como admin
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Problema: Electron no abre ventana

**Solución:**
```bash
# Verifica que el puerto 5173 esté libre
netstat -ano | findstr :5173

# Mata el proceso si está ocupado
taskkill /PID [número_del_PID] /F
```

### Problema: Error de conexión a Supabase

**Verificaciones:**
1. ✅ Las variables de entorno están correctas
2. ✅ El proyecto de Supabase está activo
3. ✅ Las reglas RLS permiten acceso
4. ✅ Hay conexión a internet

### Problema: Build falla en Windows

**Soluciones:**
```bash
# Instala herramientas de compilación de Windows
npm install --global windows-build-tools

# O instala Visual Studio Build Tools manualmente
```

## 📚 Recursos Adicionales

### Documentación Oficial
- [Electron Docs](https://www.electronjs.org/docs)
- [Vite Docs](https://vitejs.dev/)
- [Supabase Docs](https://supabase.com/docs)

### Extensiones Recomendadas de VS Code
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript Vue Plugin (Volar)

### Comandos Útiles

```bash
# Ver versión de dependencias
npm list

# Actualizar dependencias
npm update

# Verificar vulnerabilidades
npm audit

# Corregir vulnerabilidades
npm audit fix

# Limpiar proyecto
npm run clean  # (si está configurado)
```

## 🆘 Soporte

Si encuentras problemas:

1. **Revisa los logs:**
   - Renderer: DevTools Console
   - Main: Terminal

2. **Busca en Issues:** 
   - [GitHub Issues](https://github.com/Huaritex/CEAF-Dashboard-UCB/issues)

3. **Crea un Issue:**
   - Incluye logs
   - Describe los pasos para reproducir
   - Especifica tu sistema operativo y versión de Node

4. **Contacto:**
   - Email: soporte@ucb.edu.bo

## ✅ Checklist de Verificación

Antes de distribuir, verifica:

- [ ] La aplicación compila sin errores
- [ ] Todos los módulos funcionan correctamente
- [ ] La importación de datos funciona
- [ ] El sistema de actualizaciones está configurado
- [ ] Los iconos están personalizados
- [ ] El README está actualizado
- [ ] Las variables de entorno están documentadas
- [ ] El `.env` NO está en Git
- [ ] El instalador funciona en una máquina limpia
- [ ] La app se puede desinstalar correctamente

---

**¡Felicitaciones! Tu aplicación está lista para usar.**

Para más información, consulta [README.md](./README.md) y [ARCHITECTURE.md](./ARCHITECTURE.md).
