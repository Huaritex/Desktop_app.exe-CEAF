# Recursos del Proyecto

## Iconos

Coloca aquí los iconos de la aplicación:

- **icon.png** - Icono principal (256x256 o superior, formato PNG)
- **icon.ico** - Icono para Windows (generado automáticamente)
- **icon.icns** - Icono para macOS (opcional)

## Generar Iconos Automáticamente

Si tienes un archivo `icon.png`, puedes generar automáticamente los formatos requeridos:

```bash
# Instalar herramienta
npm install -g electron-icon-builder

# Generar iconos
electron-icon-builder --input=./icon.png --output=.
```

## Especificaciones

### icon.png
- Tamaño mínimo: 256x256 px
- Tamaño recomendado: 512x512 px o 1024x1024 px
- Formato: PNG con transparencia
- Aspecto: Cuadrado (1:1)

### Ejemplo de Icono

El icono debe representar:
- La marca CEAF/UCB
- Símbolos académicos (libro, graduación, etc.)
- Colores institucionales
- Diseño moderno y profesional

## Assets Adicionales

Coloca aquí otros recursos estáticos:
- Imágenes de splash screen
- Fondos
- Logos
- Recursos de marketing

---

**Nota:** Los iconos no están incluidos en el repositorio por defecto. Debes añadirlos antes de compilar la aplicación para producción.
