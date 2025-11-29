# Guía de Limpieza y Pruebas desde Cero

## 🧹 Paso 1: Limpiar Datos Existentes

### Opción A: Usando el script SQL

```bash
cd /home/ventas/quotebot-frontend

# Si tienes sqlite3 instalado
sqlite3 tu_base_de_datos.db < reset_data.sql
```

### Opción B: Manualmente en la consola de base de datos

```sql
-- Eliminar todas las notificaciones
DELETE FROM notifications;

-- Eliminar todas las cotizaciones/levantamientos
DELETE FROM quotes;

-- Eliminar todos los trabajos
DELETE FROM jobs;

-- Resetear los auto-increment counters
DELETE FROM sqlite_sequence WHERE name='jobs';
DELETE FROM sqlite_sequence WHERE name='quotes';
DELETE FROM sqlite_sequence WHERE name='notifications';

-- Verificar que todo esté limpio
SELECT 'Jobs:' as tabla, COUNT(*) as registros FROM jobs
UNION ALL
SELECT 'Quotes:', COUNT(*) FROM quotes
UNION ALL
SELECT 'Notifications:', COUNT(*) FROM notifications;
```

## 🕐 Corrección de Zona Horaria

### Problema Identificado
Las fechas se estaban guardando en UTC en lugar de la zona horaria de México (UTC-6).

### Solución Aplicada
Todos los `datetime('now')` han sido reemplazados por `datetime('now', 'localtime')` que usa la zona horaria del sistema.

**Archivos actualizados:**
- ✅ `src/api/index.ts` - Todos los endpoints ahora usan 'localtime'
- ✅ `schema_updates.sql` - Defaults de tablas actualizados

### Verificar Zona Horaria

```sql
-- Ver la hora actual en la base de datos
SELECT datetime('now') as utc_time, 
       datetime('now', 'localtime') as local_time;
```

La hora local debería mostrar la hora actual de México (UTC-6).

## 🧪 Flujo de Pruebas Completo

### Test 1: Crear Trabajo (Cliente)

1. **Iniciar sesión** en la aplicación
2. **Completar formulario** de cotización:
   - Descripción: "Reparación de puerta principal"
   - Fotos: (opcional) subir 1-2 fotos
3. **Click** en "Obtener Cotización"
4. **Verificar**:
   - ✅ Se muestra el precio estimado
   - ✅ Aparece botón "Ver Detalles del Trabajo"
5. **Click** en "Ver Detalles del Trabajo"
6. **Verificar**:
   - ✅ Se muestra toda la información del trabajo
   - ✅ Status badge muestra "Publicado"
   - ✅ **Fecha y hora son correctas** (zona horaria de México)
   - ✅ Botón "Cancelar Trabajo" está visible

### Test 2: Crear Levantamiento (Contratista)

**Nota:** Para simular un contratista, necesitarás crear un quote manualmente o tener un endpoint para crear quotes desde el frontend.

**Usando la consola de base de datos:**

```sql
INSERT INTO quotes (
    job_id, 
    contractor_id, 
    contractor_name, 
    contractor_email,
    description,
    estimated_cost,
    materials_cost,
    labor_cost,
    other_costs,
    timeline_days,
    timeline_description,
    guarantees,
    payment_terms,
    photo_keys,
    created_at
) VALUES (
    1,  -- job_id del trabajo creado
    'contractor_123',
    'Juan Pérez Construcciones',
    'juan@construcciones.com',
    'Cotización para reparación de puerta',
    5000.00,
    2000.00,
    2500.00,
    500.00,
    5,
    'Día 1-2: Desmontaje. Día 3-4: Instalación. Día 5: Acabados',
    'Garantía de 1 año en mano de obra',
    '50% anticipo, 50% al terminar',
    '[]',
    datetime('now', 'localtime')
);
```

Luego en la app:

1. **Click** en "Ver Levantamiento #1" (botón demo)
2. **Verificar**:
   - ✅ Se muestra toda la información del levantamiento
   - ✅ Desglose de costos correcto
   - ✅ **Fecha y hora son correctas**
   - ✅ Botón "Cancelar Levantamiento" visible

### Test 3: Cancelar Trabajo

1. **Desde** la vista de detalles del trabajo
2. **Click** en "🚫 Cancelar Trabajo"
3. **Verificar modal**:
   - ✅ Se abre el modal
   - ✅ Muestra advertencia en amarillo
   - ✅ Campo de razón está vacío
4. **Intentar** confirmar sin razón
5. **Verificar**:
   - ✅ Muestra error "Por favor ingresa una razón"
6. **Ingresar razón**: "Ya no necesito el servicio"
7. **Click** "Confirmar Cancelación"
8. **Verificar**:
   - ✅ Modal se cierra
   - ✅ Status cambia a "Cancelado"
   - ✅ Aparece sección de cancelación con la razón
   - ✅ **Fecha de cancelación es correcta**
   - ✅ Botón "Cancelar Trabajo" desaparece

### Test 4: Notificación de Cancelación de Trabajo

Si hay quotes activos para el trabajo:

1. **Verificar** en base de datos:
```sql
SELECT * FROM notifications 
WHERE type = 'job_cancelled' 
ORDER BY created_at DESC 
LIMIT 1;
```

2. **Verificar**:
   - ✅ Notificación creada para el contractor_id
   - ✅ Mensaje incluye razón de cancelación
   - ✅ **Fecha de creación es correcta**

### Test 5: Cancelar Levantamiento

1. **Desde** la vista de detalles del levantamiento
2. **Click** en "❌ Cancelar Levantamiento"
3. **Verificar modal**:
   - ✅ Se abre el modal
   - ✅ Advertencia azul sobre marketplace
   - ✅ Mensaje: "El proyecto volverá al marketplace"
4. **Ingresar razón**: "No puedo completar el trabajo"
5. **Click** "Confirmar Cancelación"
6. **Verificar**:
   - ✅ Modal se cierra
   - ✅ Status cambia a "Cancelado"
   - ✅ Aparece aviso: "El proyecto ha vuelto al marketplace"
   - ✅ **Fecha de cancelación es correcta**

### Test 6: Reversión de Estado del Trabajo

Después de cancelar el levantamiento:

1. **Verificar** en base de datos:
```sql
SELECT job_id, status, updated_at 
FROM jobs 
WHERE job_id = 1;
```

2. **Verificar**:
   - ✅ Status del trabajo volvió a 'published'
   - ✅ **updated_at tiene la fecha/hora correcta**

### Test 7: Notificación al Cliente

1. **Verificar** en base de datos:
```sql
SELECT * FROM notifications 
WHERE type = 'quote_cancelled' 
ORDER BY created_at DESC 
LIMIT 1;
```

2. **Verificar**:
   - ✅ Notificación creada para el user_id del cliente
   - ✅ Mensaje incluye razón y aviso de marketplace
   - ✅ **Fecha de creación es correcta**

### Test 8: Centro de Notificaciones

1. **Verificar** badge de notificaciones en header
2. **Verificar**:
   - ✅ Badge muestra contador (si hay notificaciones)
   - ✅ Animación pulse funciona
3. **Click** en campana 🔔
4. **Verificar**:
   - ✅ Dropdown se abre
   - ✅ Lista de notificaciones visible
   - ✅ **Tiempo relativo correcto** ("Hace 2 min", etc.)
   - ✅ Iconos diferenciados por tipo
5. **Click** en una notificación
6. **Verificar**:
   - ✅ Se marca como leída
   - ✅ Contador disminuye
   - ✅ Punto azul desaparece

### Test 9: Polling de Notificaciones

1. **Esperar** 30 segundos sin interactuar
2. **Verificar** en consola del navegador:
   - ✅ Se hacen peticiones automáticas cada 30s
   - ✅ No hay errores en consola

## 📊 Verificación de Fechas en Base de Datos

### Consulta General

```sql
-- Ver todas las fechas de trabajos
SELECT 
    job_id,
    description,
    status,
    created_at,
    cancelled_at,
    datetime(created_at, 'localtime') as created_local,
    datetime(cancelled_at, 'localtime') as cancelled_local
FROM jobs;

-- Ver todas las fechas de quotes
SELECT 
    quote_id,
    job_id,
    contractor_name,
    status,
    created_at,
    cancelled_at
FROM quotes;

-- Ver todas las notificaciones con fechas
SELECT 
    notification_id,
    user_id,
    type,
    title,
    created_at,
    read_status
FROM notifications
ORDER BY created_at DESC;
```

## ✅ Checklist de Verificación

### Zona Horaria
- [ ] Hora de creación de trabajo coincide con hora actual de México
- [ ] Hora de cancelación de trabajo es correcta
- [ ] Hora de creación de quote es correcta
- [ ] Hora de cancelación de quote es correcta
- [ ] Hora de creación de notificaciones es correcta

### Funcionalidad
- [ ] Crear trabajo funciona
- [ ] Cancelar trabajo funciona
- [ ] Solo el dueño puede cancelar trabajo
- [ ] Crear quote funciona
- [ ] Cancelar quote funciona
- [ ] Solo el contratista dueño puede cancelar quote
- [ ] Job vuelve a 'published' al cancelar quote
- [ ] Notificaciones se crean correctamente
- [ ] Badge de notificaciones funciona
- [ ] Polling cada 30s funciona
- [ ] Marcar como leída funciona

### UI/UX
- [ ] Modales se abren/cierran correctamente
- [ ] Validación de formularios funciona
- [ ] Loading states se muestran
- [ ] Mensajes de error son claros
- [ ] Animaciones funcionan suavemente
- [ ] Diseño responsivo en móvil

## 🐛 Problemas Comunes

### Fechas en UTC
**Síntoma:** Las fechas se muestran 6 horas adelantadas

**Solución:** Asegúrate de que todos los `datetime('now')` fueron reemplazados por `datetime('now', 'localtime')`

### Notificaciones no aparecen
**Síntoma:** El badge no muestra contador

**Solución:** 
1. Verifica que las notificaciones se crearon en la DB
2. Revisa la consola del navegador por errores
3. Confirma que el userId es correcto

### Error "Job not found"
**Síntoma:** Al intentar ver detalles

**Solución:**
1. Verifica que el job_id existe en la base de datos
2. Asegúrate de haber creado al menos un trabajo

## 📝 Notas Importantes

1. **Zona Horaria del Sistema:** SQLite usa la zona horaria del sistema operativo cuando usas `'localtime'`. Asegúrate de que el servidor esté configurado en la zona horaria correcta.

2. **Formato de Fechas:** SQLite guarda las fechas como strings en formato ISO8601: `YYYY-MM-DD HH:MM:SS`

3. **Conversión en Frontend:** El frontend usa `new Date()` de JavaScript que automáticamente convierte a la zona horaria del navegador.

4. **Polling:** El polling de 30 segundos puede ajustarse en `NotificationCenter.tsx` línea 60.

---

**Última actualización:** 2025-11-28 17:28 (Hora de México)
