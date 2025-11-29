# Resumen de Correcciones - Zona Horaria

## 🔧 Problema Identificado

Las fechas y horas se estaban guardando en **UTC** en lugar de la zona horaria de México **(UTC-6)**, causando que las fechas aparecieran 6 horas adelantadas.

## ✅ Solución Aplicada

### Cambios en Backend API

**Archivo:** `src/api/index.ts`

Reemplazados **8 instancias** de `datetime('now')` por `datetime('now', 'localtime')`:

1. ✅ **createJob** - Línea 86: `created_at`
2. ✅ **cancelJob** - Línea 160-164: `cancelled_at` y `updated_at`
3. ✅ **cancelJob** - Línea 177: Notificación `created_at`
4. ✅ **createQuote** - Línea 239: `created_at`
5. ✅ **createQuote** - Línea 265: Notificación `created_at`
6. ✅ **cancelQuote** - Línea 384-388: `cancelled_at` y `updated_at`
7. ✅ **cancelQuote** - Línea 397: Job `updated_at`
8. ✅ **cancelQuote** - Línea 411: Notificación `created_at`

### Cómo Funciona

SQLite's `datetime('now', 'localtime')` usa la zona horaria del sistema operativo del servidor. Esto significa:

- Si el servidor está en México → Hora de México (UTC-6)
- Si el servidor está en otro lugar → Ajustar zona horaria del sistema

## 📁 Archivos Creados/Modificados

### Nuevos Archivos

1. **`reset_data.sql`** - Script para limpiar todos los datos de prueba
2. **`TESTING_GUIDE.md`** - Guía completa de pruebas paso a paso
3. **`TIMEZONE_FIX.md`** - Este archivo (resumen de correcciones)

### Archivos Modificados

1. **`src/api/index.ts`** - 8 correcciones de timezone

## 🧹 Limpieza de Datos

### Ejecutar Script de Reset

```bash
cd /home/ventas/quotebot-frontend

# Opción 1: Si tienes sqlite3
sqlite3 tu_base_de_datos.db < reset_data.sql

# Opción 2: Copiar y pegar en consola SQL
# Ver contenido de reset_data.sql
```

### Qué Hace el Script

- ❌ Elimina todas las notificaciones
- ❌ Elimina todas las cotizaciones
- ❌ Elimina todos los trabajos
- 🔄 Resetea contadores auto-increment
- ✅ Verifica que todo esté limpio

## 🧪 Próximos Pasos

1. **Limpiar datos existentes**
   ```bash
   sqlite3 quotebot.db < reset_data.sql
   ```

2. **Verificar zona horaria**
   ```sql
   SELECT datetime('now') as utc, 
          datetime('now', 'localtime') as local;
   ```
   
   La hora local debe mostrar la hora actual de México.

3. **Seguir guía de pruebas**
   - Ver `TESTING_GUIDE.md` para instrucciones detalladas
   - Probar cada flujo desde cero
   - Verificar que las fechas sean correctas

## 📊 Verificación de Fechas

### Consulta de Prueba

```sql
-- Crear un trabajo de prueba
INSERT INTO jobs (description, status, ai_estimate, photo_keys, user_id, created_at)
VALUES ('Test', 'published', 100, '[]', 'test_user', datetime('now', 'localtime'));

-- Verificar la fecha
SELECT 
    job_id,
    created_at,
    datetime(created_at) as stored_datetime
FROM jobs 
WHERE description = 'Test';
```

La fecha debe mostrar la hora actual de México, no UTC.

## ⚠️ Notas Importantes

### Zona Horaria del Servidor

El modificador `'localtime'` de SQLite usa la zona horaria del **sistema operativo del servidor**. Asegúrate de que:

1. El servidor esté configurado en la zona horaria correcta
2. O usa un offset explícito: `datetime('now', '-6 hours')` para México

### Alternativa: Offset Explícito

Si prefieres no depender de la configuración del servidor:

```sql
-- En lugar de 'localtime', usa offset explícito
datetime('now', '-6 hours')  -- Para México (UTC-6)
```

### Frontend

El frontend usa `new Date()` de JavaScript que automáticamente convierte las fechas a la zona horaria del navegador del usuario. No requiere cambios.

## 🎯 Checklist de Verificación

- [x] Todas las instancias de `datetime('now')` reemplazadas
- [x] Script de reset creado
- [x] Guía de pruebas documentada
- [ ] Datos de prueba limpiados
- [ ] Zona horaria del servidor verificada
- [ ] Pruebas ejecutadas desde cero
- [ ] Fechas verificadas en base de datos

---

**Fecha de corrección:** 2025-11-28 17:28 (Hora de México)
**Archivos afectados:** 1 (src/api/index.ts)
**Líneas modificadas:** 8
