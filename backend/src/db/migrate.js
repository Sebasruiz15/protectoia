// src/db/migrate.js
import { pool } from './pool.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function migrate() {
  console.log('🔄 Ejecutando migraciones...');
  try {
    const sql = readFileSync(join(__dirname, 'schema.sql'), 'utf8');

    // Separar y ejecutar cada statement
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const stmt of statements) {
      await pool.query(stmt);
      console.log('✅', stmt.slice(0, 60).replace(/\n/g, ' ') + '...');
    }

    console.log('🎉 Migraciones completadas');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error en migración:', err.message);
    process.exit(1);
  }
}

migrate();