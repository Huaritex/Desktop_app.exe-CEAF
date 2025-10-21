# Scripts de Ayuda - CEAF Dashboard Desktop

Este directorio contiene scripts útiles para el desarrollo y mantenimiento del proyecto.

## Scripts Disponibles

### 1. clean.sh / clean.bat
Limpia directorios de build y cache

**Linux/Mac:**
```bash
#!/bin/bash
rm -rf node_modules
rm -rf dist
rm -rf dist-electron
rm -rf release
echo "Limpieza completada"
```

**Windows:**
```bat
@echo off
rmdir /s /q node_modules
rmdir /s /q dist
rmdir /s /q dist-electron
rmdir /s /q release
echo Limpieza completada
```

### 2. setup.sh / setup.bat
Configura el entorno de desarrollo

**Linux/Mac:**
```bash
#!/bin/bash
echo "Instalando dependencias..."
npm install

echo "Copiando archivo de entorno..."
if [ ! -f .env ]; then
  cp .env.example .env
  echo ".env creado. Por favor configúralo con tus credenciales."
fi

echo "Setup completado!"
```

**Windows:**
```bat
@echo off
echo Instalando dependencias...
call npm install

echo Copiando archivo de entorno...
if not exist .env (
  copy .env.example .env
  echo .env creado. Por favor configuralo con tus credenciales.
)

echo Setup completado!
```

### 3. dev.sh / dev.bat
Inicia el entorno de desarrollo

**Linux/Mac:**
```bash
#!/bin/bash
echo "Iniciando CEAF Dashboard Desktop en modo desarrollo..."
npm run dev
```

**Windows:**
```bat
@echo off
echo Iniciando CEAF Dashboard Desktop en modo desarrollo...
call npm run dev
```

### 4. build-release.sh / build-release.bat
Compila y crea un release completo

**Linux/Mac:**
```bash
#!/bin/bash
echo "=== Build de Release ==="
echo ""

# Verificar que .env existe
if [ ! -f .env ]; then
  echo "ERROR: .env no existe. Copia .env.example y configúralo."
  exit 1
fi

# Limpiar builds anteriores
echo "1. Limpiando builds anteriores..."
rm -rf dist dist-electron release

# Type check
echo "2. Verificando tipos TypeScript..."
npm run type-check
if [ $? -ne 0 ]; then
  echo "ERROR: Type check falló"
  exit 1
fi

# Build
echo "3. Compilando aplicación..."
npm run build:win

echo ""
echo "=== Build Completado ==="
echo "Instalador disponible en: release/"
```

## Uso

### Linux/Mac
```bash
# Dar permisos de ejecución
chmod +x scripts/*.sh

# Ejecutar
./scripts/clean.sh
./scripts/setup.sh
./scripts/dev.sh
```

### Windows
```bash
# Ejecutar directamente
scripts\clean.bat
scripts\setup.bat
scripts\dev.bat
```

## Crear tus Propios Scripts

Puedes crear scripts personalizados para tareas específicas. Ejemplo:

**test-imports.sh:**
```bash
#!/bin/bash
echo "Probando importación de CSV..."
# Tu lógica aquí
```

---

**Nota:** Los scripts de este directorio son opcionales y están diseñados para facilitar tareas comunes de desarrollo.
