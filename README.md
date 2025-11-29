# QuoteBot - Sistema de Cancelación

Sistema completo de gestión de trabajos y cotizaciones con funcionalidad de cancelación y notificaciones automáticas para clientes y contratistas.

## 🚀 Características Principales

### ✅ Gestión de Trabajos
- Crear trabajos con descripción y fotos
- Estimación de costos con IA (Vultr)
- Cancelación de trabajos por clientes
- Notificaciones automáticas a contratistas

### ✅ Gestión de Levantamientos/Cotizaciones
- Crear cotizaciones detalladas con desglose de costos
- Cronograma y términos de pago
- Cancelación de cotizaciones por contratistas
- **Reversión automática**: El trabajo vuelve al marketplace al cancelar

### ✅ Sistema de Notificaciones
- Centro de notificaciones con badge animado
- Polling automático cada 30 segundos
- Notificaciones por tipo: cancelaciones, nuevas cotizaciones
- Marcar como leídas automáticamente

## 📋 Requisitos

- Node.js 14+
- npm o yarn
- SQLite 3
- WorkOS account (para autenticación)

## 🛠️ Instalación

### 1. Clonar el repositorio

```bash
git clone [URL_DEL_REPO]
cd quotebot-frontend
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
REACT_APP_API_URL=http://localhost:3000
REACT_APP_WORKOS_CLIENT_ID=tu_workos_client_id
```

⚠️ **IMPORTANTE:** Nunca subas el archivo `.env` a GitHub. Ya está incluido en `.gitignore`.

### 4. Configurar la base de datos

```bash
# Aplicar schema inicial
sqlite3 quotebot.db < schema_updates.sql
```

## 🚀 Uso

### Desarrollo

```bash
npm start
```

La aplicación se abrirá en [http://localhost:3000](http://localhost:3000)

### Producción

```bash
npm run build
```

## 📚 Documentación

- **[CANCELLATION_SYSTEM.md](./CANCELLATION_SYSTEM.md)** - Guía completa del sistema de cancelación
- **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** - Instrucciones paso a paso para pruebas
- **[TIMEZONE_FIX.md](./TIMEZONE_FIX.md)** - Detalles de correcciones de zona horaria

## 🏗️ Arquitectura

### Backend
- **Raindrop/LiquidMetal** - Framework de backend
- **SQLite** - Base de datos
- **Vultr AI** - Estimación de costos con ML

### Frontend
- **React** - Framework UI
- **WorkOS AuthKit** - Autenticación
- **Axios** - Cliente HTTP

### Base de Datos

```
jobs
├── job_id (PK)
├── description
├── status (published, assigned, cancelled)
├── ai_estimate
├── created_at
├── cancelled_at
└── cancellation_reason

quotes
├── quote_id (PK)
├── job_id (FK)
├── contractor_id
├── status (active, cancelled, accepted)
├── estimated_cost
├── created_at
└── cancelled_at

notifications
├── notification_id (PK)
├── user_id
├── type (job_cancelled, quote_cancelled)
├── message
├── read_status
└── created_at
```

## 🔌 API Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/jobs/create` | Crear nuevo trabajo |
| GET | `/jobs/:jobId` | Obtener detalles del trabajo |
| POST | `/jobs/:jobId/cancel` | Cancelar trabajo |
| POST | `/quotes/create` | Crear cotización |
| GET | `/quotes/:quoteId` | Obtener cotización |
| POST | `/quotes/:quoteId/cancel` | Cancelar cotización |
| GET | `/notifications/:userId` | Obtener notificaciones |
| PUT | `/notifications/:notificationId/read` | Marcar como leída |

## 🧪 Pruebas

### Limpiar datos de prueba

```bash
sqlite3 quotebot.db < reset_data.sql
```

### Ejecutar pruebas completas

Sigue la guía en [TESTING_GUIDE.md](./TESTING_GUIDE.md) para probar:
- ✅ Creación de trabajos
- ✅ Cancelación de trabajos
- ✅ Creación de cotizaciones
- ✅ Cancelación de cotizaciones
- ✅ Sistema de notificaciones
- ✅ Reversión automática de estado

## 🔒 Seguridad

### Datos Sensibles Excluidos

El archivo `.gitignore` está configurado para **NUNCA** subir:
- ❌ Archivos `.env` (credenciales)
- ❌ Bases de datos `.db`, `.sqlite`
- ❌ Logs con información sensible
- ❌ Carpetas `private/`, `secrets/`

### Validaciones Implementadas

- ✅ Solo el creador puede cancelar un trabajo
- ✅ Solo el contratista dueño puede cancelar su cotización
- ✅ Validación de razón de cancelación obligatoria
- ✅ Verificación de permisos en backend

## 🌍 Zona Horaria

El sistema usa **hora local de México (UTC-6)** para todas las operaciones de fecha/hora.

SQLite guarda las fechas usando `datetime('now', 'localtime')` que respeta la zona horaria del sistema.

## 📦 Estructura del Proyecto

```
quotebot-frontend/
├── public/
├── src/
│   ├── api/
│   │   └── index.ts           # Backend API endpoints
│   ├── components/
│   │   ├── CancelJobModal.tsx
│   │   ├── CancelQuoteModal.tsx
│   │   ├── NotificationCenter.tsx
│   │   ├── JobDetailsView.tsx
│   │   └── QuoteDetailsView.tsx
│   ├── services/
│   │   └── api.ts             # Frontend API service
│   ├── App.js
│   └── App.css
├── schema_updates.sql          # Schema de base de datos
├── reset_data.sql              # Script de limpieza
├── CANCELLATION_SYSTEM.md      # Documentación del sistema
├── TESTING_GUIDE.md            # Guía de pruebas
└── TIMEZONE_FIX.md             # Correcciones de zona horaria
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Changelog

### v1.0.0 (2025-11-28)
- ✅ Sistema completo de cancelación
- ✅ Notificaciones automáticas
- ✅ Reversión automática de estado
- ✅ Corrección de zona horaria (UTC-6)
- ✅ Componentes UI modernos
- ✅ Validación de permisos

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 👥 Autores

- **Jorge Lopez** - *Trabajo Inicial* - [Mantenimiento Sinai](https://github.com/jorgeahmed)

## 🙏 Agradecimientos

- WorkOS por el sistema de autenticación
- Vultr por la infraestructura de IA
- Raindrop/LiquidMetal por el framework backend

---

**Última actualización:** 2025-11-28 21:27 (Hora de México)
