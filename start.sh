#!/bin/bash

# ============================================
# CEAF Dashboard UCB - Desktop Edition
# INICIO RÁPIDO
# ============================================

echo "🚀 CEAF Dashboard UCB - Desktop Edition"
echo "========================================"
echo ""

# Verificar si ya se instaló
if [ ! -d "node_modules" ]; then
    echo "⚠️  Dependencias no instaladas"
    echo ""
    echo "Ejecuta primero:"
    echo "  ./scripts/install.sh"
    echo ""
    echo "O manualmente:"
    echo "  npm install"
    echo ""
    exit 1
fi

# Verificar .env
if [ ! -f ".env" ]; then
    echo "⚠️  Archivo .env no encontrado"
    echo ""
    echo "Copia el archivo de ejemplo:"
    echo "  cp .env.example .env"
    echo ""
    echo "Luego configura tus credenciales de Supabase"
    exit 1
fi

# Verificar si .env tiene credenciales reales
if grep -q "tu-proyecto.supabase.co" .env || grep -q "tu-anon-key-aqui" .env; then
    echo "⚠️  ADVERTENCIA: .env contiene valores de ejemplo"
    echo ""
    echo "Configura tus credenciales reales de Supabase en .env antes de continuar"
    echo ""
    read -p "¿Continuar de todos modos? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "✅ Iniciando aplicación en modo desarrollo..."
echo ""

# Ejecutar aplicación
npm run dev
