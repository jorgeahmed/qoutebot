# Sistema de Cancelación - QuoteBot

Sistema completo de cancelación para trabajos y levantamientos con notificaciones automáticas.

## 🚀 Inicio Rápido

### 1. Aplicar Schema Updates

```bash
# Navegar al directorio del proyecto
cd /home/ventas/quotebot-frontend

# Aplicar las actualizaciones de schema a la base de datos
sqlite3 quotebot.db < schema_updates.sql
```

### 2. Instalar Dependencias (si es necesario)

```bash
npm install
```

### 3. Configurar Variables de Entorno

Asegúrate de tener configurado en `.env`:

```env
REACT_APP_API_URL=http://localhost:3000
REACT_APP_WORKOS_CLIENT_ID=tu_client_id
```

### 4. Ejecutar la Aplicación

```bash
npm start
```

## 📁 Estructura de Archivos

```
quotebot-frontend/
├── schema_updates.sql              # Actualizaciones de base de datos
├── src/
│   ├── api/
│   │   └── index.ts               # Backend API con 11 endpoints
│   ├── services/
│   │   └── api.ts                 # Servicio frontend centralizado
│   ├── components/
│   │   ├── CancelJobModal.tsx     # Modal cancelar trabajo
│   │   ├── CancelJobModal.css
│   │   ├── CancelQuoteModal.tsx   # Modal cancelar levantamiento
│   │   ├── CancelQuoteModal.css
│   │   ├── NotificationCenter.tsx # Centro de notificaciones
│   │   ├── NotificationCenter.css
│   │   ├── JobDetailsView.tsx     # Vista detalles trabajo
│   │   ├── JobDetailsView.css
│   │   ├── QuoteDetailsView.tsx   # Vista detalles levantamiento
│   │   └── QuoteDetailsView.css
│   ├── App.js                     # App principal con integración
│   └── App.css
```

## 🎯 Características Principales

### ✅ Cancelación de Trabajos (Clientes)
- Modal con validación de razón obligatoria
- Solo el creador puede cancelar
- Notificaciones automáticas a contratistas
- UI actualizada en tiempo real

### ✅ Cancelación de Levantamientos (Contratistas)
- Modal con advertencia de marketplace
- Solo el contratista dueño puede cancelar
- **Reversión automática**: El trabajo vuelve a estado 'published'
- Notificación automática al cliente

### ✅ Sistema de Notificaciones
- Badge animado con contador
- Polling cada 30 segundos
- Marcar como leída automáticamente
- Iconos diferenciados por tipo

## 🔌 API Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/jobs/create` | Crear nuevo trabajo |
| GET | `/jobs/:jobId` | Obtener detalles del trabajo |
| **POST** | **`/jobs/:jobId/cancel`** | **Cancelar trabajo** |
| POST | `/quotes/create` | Crear nueva cotización |
| GET | `/quotes/:quoteId` | Obtener detalles de cotización |
| **POST** | **`/quotes/:quoteId/cancel`** | **Cancelar cotización** |
| GET | `/notifications/:userId` | Obtener notificaciones |
| PUT | `/notifications/:notificationId/read` | Marcar como leída |

## 🧪 Probar el Sistema

### Opción 1: Usar los Botones Demo

1. Inicia la aplicación
2. Inicia sesión
3. En la vista principal, verás una sección "🧪 Demo"
4. Click en "Ver Trabajo #1" para probar cancelación de trabajo
5. Click en "Ver Levantamiento #1" para probar cancelación de levantamiento

### Opción 2: Crear un Trabajo Real

1. Completa el formulario de cotización
2. Click en "Obtener Cotización"
3. Click en "Ver Detalles del Trabajo"
4. Click en "Cancelar Trabajo"
5. Ingresa una razón y confirma

## 📊 Base de Datos

### Tablas Creadas/Modificadas

**`jobs` (modificada)**
- Agregados: `cancelled_at`, `cancellation_reason`, `cancelled_by`

**`quotes` (nueva)**
- Almacena levantamientos de contratistas
- Incluye desglose de costos, cronograma, garantías

**`notifications` (nueva)**
- Sistema de notificaciones
- Tipos: `job_cancelled`, `quote_cancelled`, `quote_received`

## 🎨 Componentes UI

### CancelJobModal
```jsx
<CancelJobModal
  jobId={123}
  isOpen={true}
  onClose={() => {}}
  onSuccess={() => {}}
  userId="user123"
/>
```

### CancelQuoteModal
```jsx
<CancelQuoteModal
  quoteId={456}
  jobId={123}
  isOpen={true}
  onClose={() => {}}
  onSuccess={() => {}}
  contractorId="contractor123"
/>
```

### NotificationCenter
```jsx
<NotificationCenter userId="user123" />
```

## 🔒 Validaciones y Permisos

- ✅ Solo el creador puede cancelar un trabajo
- ✅ Solo el contratista dueño puede cancelar su levantamiento
- ✅ No se puede cancelar un trabajo/levantamiento ya cancelado
- ✅ Razón de cancelación es obligatoria
- ✅ Validación de permisos en backend y frontend

## 🚀 Deploy a Producción

### Backend (Raindrop)

1. Sube `src/api/index.ts` a tu proyecto Raindrop
2. Configura las rutas en `raindrop.manifest`
3. Aplica el schema a tu base de datos de producción

### Frontend (Netlify)

```bash
# Build
npm run build

# Deploy
netlify deploy --prod
```

## 📝 Notas Importantes

### Reversión Automática
Cuando un contratista cancela un levantamiento, el trabajo **automáticamente** vuelve a estado `'published'`, permitiendo que otros contratistas puedan tomarlo.

### Notificaciones
Las notificaciones se crean automáticamente cuando:
- Un cliente cancela un trabajo → Notifica a contratistas con quotes activos
- Un contratista cancela un levantamiento → Notifica al cliente

### Polling vs WebSocket
Actualmente usa polling cada 30 segundos. Para producción, considera implementar WebSocket para notificaciones en tiempo real.

## 🐛 Troubleshooting

### Error: "Cannot read property 'user_id'"
Asegúrate de que la tabla `jobs` tenga el campo `user_id` agregado.

### Error: "Quote not found"
Verifica que la tabla `quotes` esté creada correctamente con `schema_updates.sql`.

### Notificaciones no aparecen
1. Verifica que la tabla `notifications` exista
2. Revisa la consola del navegador para errores de API
3. Confirma que el polling esté activo (cada 30s)

## 📚 Documentación Adicional

- [Implementation Plan](file:///home/ventas/.gemini/antigravity/brain/ce2eb2b7-5b2f-4695-b56a-0bfecd925826/implementation_plan.md)
- [Walkthrough Completo](file:///home/ventas/.gemini/antigravity/brain/ce2eb2b7-5b2f-4695-b56a-0bfecd925826/walkthrough.md)
- [Task Checklist](file:///home/ventas/.gemini/antigravity/brain/ce2eb2b7-5b2f-4695-b56a-0bfecd925826/task.md)

## 🤝 Contribuir

Para agregar nuevas funcionalidades:

1. Actualiza el schema si es necesario
2. Agrega endpoints en `src/api/index.ts`
3. Crea funciones en `src/services/api.ts`
4. Desarrolla componentes UI
5. Integra en `App.js`
6. Actualiza documentación

---

**Desarrollado para QuoteBot AI** 🏗️
