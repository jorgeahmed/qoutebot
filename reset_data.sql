-- Script para limpiar datos de prueba y resetear el sistema
-- Ejecutar antes de comenzar pruebas desde cero

-- Eliminar todas las notificaciones
DELETE FROM notifications;

-- Eliminar todas las cotizaciones/levantamientos
DELETE FROM quotes;

-- Eliminar todos los trabajos
DELETE FROM jobs;

-- Resetear los auto-increment counters (SQLite)
DELETE FROM sqlite_sequence WHERE name='jobs';
DELETE FROM sqlite_sequence WHERE name='quotes';
DELETE FROM sqlite_sequence WHERE name='notifications';

-- Verificar que las tablas estén vacías
SELECT 'Jobs count:' as info, COUNT(*) as count FROM jobs
UNION ALL
SELECT 'Quotes count:', COUNT(*) FROM quotes
UNION ALL
SELECT 'Notifications count:', COUNT(*) FROM notifications;
