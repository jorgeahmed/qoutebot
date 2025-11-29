# Guía de Subida a GitHub

## ✅ Estado Actual

**Commit creado exitosamente:**
- Hash: `01fb796`
- Mensaje: "feat: Sistema completo de cancelación con notificaciones"
- Archivos: 36 archivos, 22,025 líneas agregadas

## 🔒 Datos Protegidos

El `.gitignore` está configurado para **NUNCA** subir:
- ❌ Archivos `.env` (credenciales de WorkOS, API keys)
- ❌ Bases de datos `.db`, `.sqlite`, `.sqlite3`
- ❌ Logs con información sensible
- ❌ Carpetas `private/`, `secrets/`, `credentials/`
- ❌ Archivos de configuración del IDE

## 📦 Archivos Incluidos en el Commit

### Documentación
- ✅ `README.md` - Guía principal del proyecto
- ✅ `CANCELLATION_SYSTEM.md` - Documentación del sistema de cancelación
- ✅ `TESTING_GUIDE.md` - Guía de pruebas paso a paso
- ✅ `TIMEZONE_FIX.md` - Detalles de correcciones de zona horaria

### Backend
- ✅ `src/api/index.ts` - API con 11 endpoints
- ✅ `schema_updates.sql` - Schema de base de datos
- ✅ `reset_data.sql` - Script de limpieza

### Frontend - Componentes
- ✅ `src/components/CancelJobModal.tsx` + CSS
- ✅ `src/components/CancelQuoteModal.tsx` + CSS
- ✅ `src/components/NotificationCenter.tsx` + CSS
- ✅ `src/components/JobDetailsView.tsx` + CSS
- ✅ `src/components/QuoteDetailsView.tsx` + CSS

### Frontend - Servicios
- ✅ `src/services/api.ts` - Servicio centralizado de API

### Frontend - App Principal
- ✅ `src/App.js` - Aplicación principal con integración
- ✅ `src/App.css` - Estilos globales

### Configuración
- ✅ `.gitignore` - Protección de datos sensibles
- ✅ `package.json` - Dependencias del proyecto
- ✅ `netlify.toml` - Configuración de deploy

## 🚀 Próximos Pasos para Subir a GitHub

### 1. Crear Repositorio en GitHub

Ve a [github.com/new](https://github.com/new) y crea un nuevo repositorio:
- Nombre: `quotebot-frontend` (o el que prefieras)
- Descripción: "Sistema de gestión de trabajos y cotizaciones con cancelación automática"
- Visibilidad: **Privado** (recomendado para proteger el código)
- ❌ NO inicialices con README, .gitignore, o licencia (ya los tenemos)

### 2. Conectar el Repositorio Local

Copia la URL del repositorio que acabas de crear y ejecuta:

```bash
cd /home/ventas/quotebot-frontend

# Agregar el remote (reemplaza <URL> con tu URL de GitHub)
git remote add origin <URL>

# Ejemplo:
# git remote add origin https://github.com/tu-usuario/quotebot-frontend.git
```

### 3. Subir el Código

```bash
# Subir a la rama master
git push -u origin master
```

### 4. Verificar en GitHub

1. Ve a tu repositorio en GitHub
2. Verifica que todos los archivos estén presentes
3. Revisa que el README.md se muestre correctamente
4. **IMPORTANTE:** Verifica que NO haya archivos `.env` o `.db`

## 🔐 Configurar Variables de Entorno en GitHub (Opcional)

Si usas GitHub Actions o quieres documentar las variables necesarias:

1. Ve a **Settings** → **Secrets and variables** → **Actions**
2. Agrega los secrets necesarios:
   - `WORKOS_CLIENT_ID`
   - `API_URL`
   - etc.

## ⚠️ Verificación de Seguridad

Antes de hacer push, verifica que estos archivos NO estén en el commit:

```bash
# Verificar qué archivos están en el commit
git ls-files | grep -E '\.(env|db|sqlite)$'

# No debería mostrar ningún resultado
```

Si aparece algún archivo sensible:

```bash
# Remover del staging
git rm --cached archivo_sensible

# Hacer nuevo commit
git commit --amend -m "feat: Sistema completo de cancelación con notificaciones (sin datos sensibles)"
```

## 📋 Checklist Final

Antes de hacer `git push`:

- [ ] Verificar que `.env` NO está en el repositorio
- [ ] Verificar que archivos `.db` NO están en el repositorio
- [ ] Verificar que `.gitignore` está actualizado
- [ ] Leer el README.md para confirmar que no hay información sensible
- [ ] Confirmar que el repositorio de GitHub es **Privado**
- [ ] Tener las credenciales de GitHub listas (token o SSH)

## 🎯 Comandos Resumidos

```bash
# 1. Crear repositorio en GitHub (manual)

# 2. Conectar remote
git remote add origin https://github.com/tu-usuario/quotebot-frontend.git

# 3. Verificar seguridad
git ls-files | grep -E '\.(env|db|sqlite)$'

# 4. Push
git push -u origin master

# 5. Verificar en GitHub
# Ir a https://github.com/tu-usuario/quotebot-frontend
```

## 🆘 Solución de Problemas

### Error: "remote origin already exists"
```bash
git remote remove origin
git remote add origin <nueva-URL>
```

### Error: "failed to push some refs"
```bash
git pull origin master --allow-unrelated-histories
git push -u origin master
```

### Olvidé excluir un archivo sensible
```bash
# Remover del historial (CUIDADO: reescribe historial)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch ruta/al/archivo" \
  --prune-empty --tag-name-filter cat -- --all

# Forzar push
git push origin --force --all
```

---

**Última actualización:** 2025-11-28 21:27 (Hora de México)
