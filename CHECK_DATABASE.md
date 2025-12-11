# Verificación de Base de Datos - Sistema de Usuarios

## 🔍 Verificar si la tabla User existe

### Opción 1: Usando Prisma Studio (Recomendado)

```bash
cd back/GCinsumos-page-back
npx prisma studio
```

Esto abrirá una interfaz web donde puedes ver todas las tablas. Verifica que exista la tabla `User`.

### Opción 2: Usando SQL directamente

Si tienes acceso a tu base de datos PostgreSQL:

```sql
-- Verificar si la tabla User existe
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'User';

-- Ver la estructura de la tabla User (si existe)
\d "User"

-- O en SQL estándar:
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'User';
```

### Opción 3: Verificar desde el código

Ejecuta este script de Node.js:

```javascript
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkDatabase() {
  try {
    // Intentar obtener usuarios
    const users = await prisma.user.findMany()
    console.log('✅ Tabla User existe. Usuarios encontrados:', users.length)
    
    // Verificar estructura
    if (users.length > 0) {
      console.log('Ejemplo de usuario:', users[0])
    }
  } catch (error) {
    if (error.code === 'P2021' || error.message.includes('does not exist')) {
      console.error('❌ La tabla User NO existe. Necesitas ejecutar la migración.')
      console.error('Ejecuta: npx prisma migrate dev --name add_users_system')
    } else {
      console.error('❌ Error:', error.message)
    }
  } finally {
    await prisma.$disconnect()
  }
}

checkDatabase()
```

## 🚀 Solución: Aplicar la Migración

Si la tabla no existe, ejecuta:

```bash
cd back/GCinsumos-page-back

# Opción 1: Crear migración (recomendado para producción)
npx prisma migrate dev --name add_users_system

# Opción 2: Aplicar cambios directamente (más rápido para desarrollo)
npx prisma db push

# Regenerar el cliente de Prisma
npx prisma generate
```

## 🔧 Verificar que el Backend esté corriendo

```bash
# En el directorio del backend
npm start

# O si usas nodemon
npm run dev
```

Luego verifica que el endpoint funcione:

```bash
# Verificar que el servidor responde
curl http://localhost:5000/health

# Verificar endpoint de usuarios (debería devolver array vacío si no hay usuarios)
curl http://localhost:5000/api/users
```

## 📝 Errores Comunes

### Error: "Table 'User' does not exist"
**Solución**: Ejecuta la migración de Prisma (ver arriba)

### Error: "Cannot find module '@prisma/client'"
**Solución**: 
```bash
npm install
npx prisma generate
```

### Error: "Connection refused" o "Network Error"
**Solución**: 
- Verifica que el backend esté corriendo
- Verifica la variable `NEXT_PUBLIC_API_URL` en el frontend
- Verifica CORS en el backend

### Error: "Field 'passwordHash' doesn't exist"
**Solución**: El schema no está actualizado. Ejecuta:
```bash
npx prisma db push
npx prisma generate
```

