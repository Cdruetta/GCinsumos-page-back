# Migración de Base de Datos - Sistema de Usuarios

## 📋 Cambios Realizados

Se ha agregado un sistema completo de gestión de usuarios que se guarda en la base de datos PostgreSQL.

### Cambios en el Schema de Prisma

El modelo `User` ha sido actualizado para incluir:
- `username` (String, único) - en lugar de `email`
- `passwordHash` (String) - hash de la contraseña
- `role` (String) - roles: "admin", "sudo", "root"
- `active` (Boolean) - estado activo/inactivo del usuario

## 🚀 Pasos para Aplicar los Cambios

### 1. Navegar al directorio del backend

```bash
cd back/GCinsumos-page-back
```

### 2. Instalar dependencias (si no están instaladas)

```bash
npm install
```

### 3. Crear y aplicar la migración de Prisma

```bash
# Crear la migración
npx prisma migrate dev --name add_users_system

# O si prefieres solo aplicar cambios sin crear migración:
npx prisma db push
```

### 4. Regenerar el cliente de Prisma

```bash
npx prisma generate
```

### 5. (Opcional) Crear un usuario inicial

Puedes crear un usuario inicial usando el script de seed o directamente desde la aplicación web después de iniciar el servidor.

## ⚠️ Importante

- **Backup**: Antes de ejecutar la migración, asegúrate de tener un backup de tu base de datos.
- **Variables de entorno**: Verifica que tu archivo `.env` tenga la variable `DATABASE_URL` correctamente configurada.
- **Servidor**: Después de aplicar los cambios, reinicia el servidor del backend.

## 🔧 Verificación

Después de aplicar la migración, puedes verificar que todo funciona:

1. Inicia el servidor del backend:
   ```bash
   npm start
   ```

2. Verifica que el endpoint de usuarios funciona:
   ```bash
   curl http://localhost:5000/api/users
   ```

3. Desde el frontend, intenta crear un usuario desde el panel de administración.

## 📝 Notas

- Los usuarios ahora se guardan permanentemente en la base de datos PostgreSQL.
- El sistema mantiene compatibilidad con usuarios legacy almacenados en localStorage como fallback.
- Las contraseñas se hashean usando el mismo algoritmo que el frontend para mantener compatibilidad.

