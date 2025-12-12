# 🚀 Pasos para Ejecutar la Migración de Usuarios

## ⚠️ IMPORTANTE: Sí, necesitas ejecutar las migraciones

El schema de Prisma fue actualizado para incluir el sistema de usuarios, pero la base de datos aún no tiene estos cambios aplicados.

## 📋 Pasos a Seguir

### 1. Navegar al directorio del backend

```bash
cd back/GCinsumos-page-back
```

### 2. Verificar que tienes las dependencias instaladas

```bash
npm install
```

### 3. Verificar tu archivo .env

Asegúrate de que tu archivo `.env` tenga la variable `DATABASE_URL` correctamente configurada:

```env
DATABASE_URL="postgresql://usuario:password@host:puerto/database"
```

### 4. Ejecutar la migración

Tienes **2 opciones**:

#### Opción A: Migración completa (Recomendado para producción)

```bash
npx prisma migrate dev --name add_users_system
```

Esto:
- ✅ Crea un archivo de migración en `prisma/migrations/`
- ✅ Aplica los cambios a la base de datos
- ✅ Regenera el cliente de Prisma automáticamente

#### Opción B: Aplicar cambios directamente (Más rápido para desarrollo)

```bash
npx prisma db push
npx prisma generate
```

Esto:
- ✅ Aplica los cambios directamente sin crear archivo de migración
- ✅ Más rápido pero no guarda historial de cambios
- ⚠️ Necesitas ejecutar `prisma generate` manualmente

### 5. Verificar que funcionó

```bash
# Ver la estructura de la tabla User
npx prisma studio
```

O verifica desde el código:

```bash
# Iniciar el servidor
npm start

# En otra terminal, probar el endpoint
curl http://localhost:5000/api/users
```

## 🔍 ¿Qué hace la migración?

La migración creará/actualizará la tabla `User` con esta estructura:

```sql
CREATE TABLE "User" (
  id          SERIAL PRIMARY KEY,
  username    VARCHAR UNIQUE NOT NULL,
  passwordHash VARCHAR NOT NULL,
  role        VARCHAR DEFAULT 'admin',
  active      BOOLEAN DEFAULT true,
  createdAt   TIMESTAMP DEFAULT NOW(),
  updatedAt   TIMESTAMP DEFAULT NOW()
);
```

## ❌ Si algo sale mal

### Error: "Can't reach database server"
- Verifica que PostgreSQL esté corriendo
- Verifica que `DATABASE_URL` sea correcta

### Error: "Table already exists"
- Si la tabla User ya existe pero con estructura diferente, puedes:
  1. Eliminarla manualmente: `DROP TABLE "User";`
  2. O usar: `npx prisma migrate reset` (⚠️ Esto elimina TODOS los datos)

### Error: "Migration failed"
- Revisa los logs de error
- Verifica que no haya conflictos con datos existentes

## ✅ Después de la migración

Una vez ejecutada la migración:

1. ✅ Reinicia el servidor del backend
2. ✅ Intenta crear un usuario desde el frontend
3. ✅ Verifica que se guarde correctamente

## 📝 Nota

Si ya tenías una tabla `User` con estructura antigua (con `email` en lugar de `username`), necesitarás:

1. Hacer backup de los datos existentes
2. Eliminar la tabla antigua
3. Ejecutar la migración
4. Migrar los datos manualmente si es necesario

