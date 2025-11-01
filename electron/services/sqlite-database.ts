/**
 * Servicio de Base de Datos SQLite para Electron (Main Process)
 *
 * IMPORTANTE: Este servicio SOLO debe ser utilizado en el Main Process.
 * Gestiona la base de datos local SQLite.
 * Nunca expongas este módulo al Renderer Process.
 */

import Database from 'better-sqlite3';
import { app } from 'electron';
import path from 'path';
import fs from 'fs';

let db: Database.Database | null = null;
const DB_PATH = path.join(app.getPath('userData'), 'ceaf_database.db');
const SCHEMA_PATH = path.join(__dirname, '../../database/schema_sqlite.sql');

/**
 * Inicializa la base de datos SQLite
 */
export function initializeDatabase(): Database.Database {
  if (db) {
    return db;
  }

  try {
    // Crear directorio si no existe
    const dbDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    // Abrir/crear base de datos
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL'); // Write-Ahead Logging para mejor rendimiento
    db.pragma('foreign_keys = ON'); // Habilitar claves foráneas

    console.log('✅ Base de datos SQLite inicializada:', DB_PATH);

    // Inicializar schema si es nueva
    initializeSchema();

    return db;
  } catch (error) {
    console.error('❌ Error inicializando base de datos:', error);
    throw error;
  }
}

/**
 * Inicializa el schema de la base de datos
 */
function initializeSchema(): void {
  if (!db) {
    throw new Error('Database not initialized');
  }

  try {
    // Verificar si ya tiene tablas
    const tables = db
      .prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='carreras'"
      )
      .get();

    if (!tables) {
      console.log('📦 Ejecutando schema inicial...');
      
      // Leer y ejecutar schema
      const schemaSQL = fs.readFileSync(SCHEMA_PATH, 'utf-8');
      db.exec(schemaSQL);
      
      console.log('✅ Schema inicializado correctamente');
    }
  } catch (error) {
    console.error('❌ Error inicializando schema:', error);
    // No lanzar error si el schema ya existe
  }
}

/**
 * Obtiene la instancia de la base de datos (singleton)
 */
export function getDatabase(): Database.Database {
  if (!db) {
    return initializeDatabase();
  }
  return db;
}

/**
 * Cierra la conexión de la base de datos
 */
export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
    console.log('🔒 Base de datos cerrada');
  }
}

/**
 * Verifica la conectividad con la base de datos
 */
export function checkDatabaseConnectivity(): boolean {
  try {
    const database = getDatabase();
    database.prepare('SELECT 1').get();
    return true;
  } catch (error) {
    console.error('Error checking connectivity:', error);
    return false;
  }
}

/**
 * Crea un respaldo de la base de datos
 */
export function backupDatabase(backupPath?: string): string {
  const database = getDatabase();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const finalBackupPath = backupPath || path.join(
    app.getPath('userData'),
    `backup_${timestamp}.db`
  );

  try {
    database.backup(finalBackupPath);
    console.log('✅ Respaldo creado:', finalBackupPath);
    return finalBackupPath;
  } catch (error) {
    console.error('❌ Error creando respaldo:', error);
    throw error;
  }
}

/**
 * Restaura la base de datos desde un respaldo
 */
export function restoreDatabase(backupPath: string): void {
  if (!fs.existsSync(backupPath)) {
    throw new Error('Backup file does not exist');
  }

  try {
    closeDatabase();
    fs.copyFileSync(backupPath, DB_PATH);
    initializeDatabase();
    console.log('✅ Base de datos restaurada desde:', backupPath);
  } catch (error) {
    console.error('❌ Error restaurando base de datos:', error);
    throw error;
  }
}

export function getDatabasePath(): string {
  return DB_PATH;
}
