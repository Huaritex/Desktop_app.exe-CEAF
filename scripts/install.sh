#!/bin/bash

# ==============================================
# CEAF Dashboard UCB - Desktop Edition
# Script de Instalación y Configuración
# ==============================================

set -e

echo "=================================================="
echo "  CEAF Dashboard UCB - Desktop Edition"
echo "  Script de Instalación"
echo "=================================================="
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir con color
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# Verificar Node.js
print_info "Verificando Node.js..."
if ! command -v node &> /dev/null; then
    print_error "Node.js no está instalado"
    echo "Por favor instala Node.js desde: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v)
print_success "Node.js $NODE_VERSION detectado"

# Verificar npm
print_info "Verificando npm..."
if ! command -v npm &> /dev/null; then
    print_error "npm no está instalado"
    exit 1
fi

NPM_VERSION=$(npm -v)
print_success "npm $NPM_VERSION detectado"

echo ""
print_info "========================================"
print_info "  PASO 1: Instalación de Dependencias"
print_info "========================================"
echo ""

# Instalar dependencias
print_info "Instalando dependencias de producción y desarrollo..."
npm install

if [ $? -eq 0 ]; then
    print_success "Dependencias instaladas correctamente"
else
    print_error "Error al instalar dependencias"
    exit 1
fi

echo ""
print_info "========================================"
print_info "  PASO 2: Configuración de Supabase"
print_info "========================================"
echo ""

# Verificar si .env existe
if [ -f ".env" ]; then
    print_warning ".env ya existe"
    read -p "¿Deseas reemplazarlo? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Manteniendo .env existente"
    else
        rm .env
        cp .env.example .env
        print_success ".env creado desde .env.example"
    fi
else
    if [ -f ".env.example" ]; then
        cp .env.example .env
        print_success ".env creado desde .env.example"
    else
        print_warning ".env.example no encontrado"
    fi
fi

echo ""
print_warning "IMPORTANTE: Debes configurar tus credenciales de Supabase en .env"
echo ""
echo "Edita el archivo .env y configura:"
echo "  - VITE_SUPABASE_URL"
echo "  - VITE_SUPABASE_ANON_KEY"
echo "  - SUPABASE_SERVICE_KEY"
echo ""

read -p "¿Deseas abrir .env ahora para configurarlo? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Detectar editor disponible
    if command -v code &> /dev/null; then
        code .env
    elif command -v nano &> /dev/null; then
        nano .env
    elif command -v vim &> /dev/null; then
        vim .env
    else
        print_warning "No se encontró un editor. Abre .env manualmente."
    fi
fi

echo ""
print_info "========================================"
print_info "  PASO 3: Base de Datos Supabase"
print_info "========================================"
echo ""

print_info "Pasos para configurar la base de datos:"
echo ""
echo "1. Ve a https://supabase.com/dashboard"
echo "2. Crea un nuevo proyecto o selecciona uno existente"
echo "3. Ve a Settings > API y copia las credenciales a .env"
echo "4. Ve a SQL Editor"
echo "5. Copia el contenido de database/schema.sql"
echo "6. Pégalo en el editor y ejecuta"
echo ""

read -p "¿Ya configuraste la base de datos en Supabase? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_warning "Recuerda configurar la base de datos antes de ejecutar la aplicación"
    echo ""
    echo "Archivo SQL: database/schema.sql"
fi

echo ""
print_info "========================================"
print_info "  PASO 4: Verificación"
print_info "========================================"
echo ""

# Verificar TypeScript
print_info "Verificando configuración de TypeScript..."
if npm run type-check 2>&1 | grep -q "error"; then
    print_warning "Hay errores de TypeScript (esto es normal si no configuraste .env)"
else
    print_success "TypeScript configurado correctamente"
fi

echo ""
print_info "========================================"
print_info "  INSTALACIÓN COMPLETA"
print_info "========================================"
echo ""

print_success "¡Instalación completada!"
echo ""
echo "Próximos pasos:"
echo ""
echo "1. Configurar credenciales de Supabase en .env"
echo "   ${YELLOW}nano .env${NC}"
echo ""
echo "2. Crear base de datos en Supabase"
echo "   ${YELLOW}Ejecutar: database/schema_unificado.sql${NC}"
echo ""
echo "3. Ejecutar en modo desarrollo"
echo "   ${GREEN}npm run dev${NC}"
echo ""
echo "4. Compilar para producción (Windows)"
echo "   ${GREEN}npm run build:win${NC}"
echo ""

print_info "Documentación disponible:"
echo "  - README.md - Documentación completa"
echo "  - INSTALLATION.md - Guía de instalación detallada"
echo "  - QUICKSTART.md - Guía rápida"
echo "  - PROJECT_STATUS.md - Estado del proyecto"
echo ""

print_success "¡Listo para desarrollar!"
