# 🚀 Quick Start - CEAF Dashboard Desktop

Guía rápida para poner en marcha la aplicación en 5 minutos.

## ⚡ Inicio Rápido

### 1. Prerrequisitos

Asegúrate de tener instalado:
- Node.js 18+ ([Descargar](https://nodejs.org/))
- Git ([Descargar](https://git-scm.com/))

### 2. Clonar y Configurar

```bash
# Clonar repositorio
git clone https://github.com/Huaritex/CEAF-Dashboard-UCB.git
cd CEAF-Dashboard-UCB/app\ desktop

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Edita .env con tus credenciales de Supabase
```

### 3. Obtener Credenciales de Supabase

1. Ve a [Supabase Dashboard](https://app.supabase.com/)
2. Crea un nuevo proyecto (si no tienes uno)
3. Ve a **Settings** → **API**
4. Copia las credenciales al archivo `.env`:
   - `VITE_SUPABASE_URL` ← Project URL
   - `VITE_SUPABASE_ANON_KEY` ← anon public key
   - `SUPABASE_SERVICE_KEY` ← service_role key

### 4. Ejecutar en Desarrollo

```bash
npm run dev
```

¡Listo! La aplicación debería abrirse automáticamente.

## 📦 Compilar para Producción

```bash
# Compilar instalador de Windows
npm run build:win

# El instalador estará en: release/
```

## 🎯 Acciones Comunes

### Cambiar Tema

Click en el ícono de sol/luna en el header.

### Importar Datos

1. Ve a **Gestión Docente**
2. Click en **Seleccionar Archivo**
3. Elige tu archivo CSV/XLSX
4. Click en **Importar Datos**

⚠️ **Advertencia**: La importación es destructiva.

### Navegar entre Módulos

Usa la barra de navegación superior:
- Dashboard
- Rendimiento Estudiantil
- Operaciones Académicas
- Análisis Curricular
- Gestión Docente
- Optimización de Recursos

### Filtrar Datos

Usa los selectores globales en el header:
- **Semestre**: Filtra por período académico
- **Departamento**: Filtra por departamento

## 🔧 Troubleshooting Rápido

### Error: "Cannot find module"
```bash
rm -rf node_modules
npm install
```

### Error: "Permission denied"
```bash
# Windows (PowerShell como admin)
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Error de Conexión a Supabase
Verifica que tu archivo `.env` tenga las credenciales correctas.

### La Ventana no se Abre
Verifica que el puerto 5173 esté libre:
```bash
# Windows
netstat -ano | findstr :5173

# Linux/Mac
lsof -i :5173
```

## 📚 Documentación Completa

Para información más detallada, consulta:

- **[README.md](./README.md)** - Visión general y características
- **[INSTALLATION.md](./INSTALLATION.md)** - Guía de instalación paso a paso
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Arquitectura IPC detallada
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Cómo contribuir
- **[CHANGELOG.md](./CHANGELOG.md)** - Historial de cambios

## 📞 Soporte

- **Email**: soporte@ucb.edu.bo
- **Issues**: [GitHub Issues](https://github.com/Huaritex/CEAF-Dashboard-UCB/issues)
- **Docs**: Ver archivos .md en el repositorio

## ✅ Checklist de Verificación

Después de la instalación, verifica:

- [ ] La aplicación inicia sin errores
- [ ] Puedes navegar entre módulos
- [ ] El tema oscuro/claro funciona
- [ ] Los filtros globales funcionan
- [ ] (Si configuraste Supabase) Puedes ver datos

Si todo funciona, ¡estás listo para usar CEAF Dashboard Desktop! 🎉

---

**¿Necesitas ayuda?** Abre un Issue o consulta la documentación completa.
