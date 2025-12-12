const prisma = require('../config/database')
const crypto = require('crypto')

// Función simple para hash de contraseña (mismo que en el frontend)
const simpleHash = (str) => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return hash.toString()
}

// Obtener todos los usuarios
exports.getAllUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                username: true,
                role: true,
                active: true,
                createdAt: true,
                updatedAt: true,
                // No devolver passwordHash por seguridad
            },
        })

        // Mapear a formato esperado por el frontend
        const formattedUsers = users.map(user => ({
            id: user.id.toString(),
            username: user.username,
            role: user.role,
            active: user.active,
            createdAt: user.createdAt.toISOString(),
        }))

        res.json(formattedUsers)
    } catch (error) {
        console.error('Error al obtener usuarios:', error)
        res.status(500).json({ error: 'Error al obtener usuarios' })
    }
}

// Obtener un usuario por ID
exports.getUserById = async (req, res) => {
    try {
        const { id } = req.params

        const user = await prisma.user.findUnique({
            where: { id: parseInt(id) },
            select: {
                id: true,
                username: true,
                role: true,
                active: true,
                createdAt: true,
                updatedAt: true,
            },
        })

        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' })
        }

        res.json({
            ...user,
            id: user.id.toString(),
            createdAt: user.createdAt.toISOString(),
        })
    } catch (error) {
        console.error('Error al obtener usuario:', error)
        res.status(500).json({ error: 'Error al obtener usuario' })
    }
}

// Crear un nuevo usuario
exports.createUser = async (req, res) => {
    try {
        const { username, password, role, active } = req.body

        if (!username || !password) {
            return res.status(400).json({ error: 'Username y password son requeridos' })
        }

        // Verificar si el usuario ya existe
        const existingUser = await prisma.user.findUnique({
            where: { username: username.trim() },
        })

        if (existingUser) {
            return res.status(400).json({ error: 'El nombre de usuario ya existe' })
        }

        const passwordHash = simpleHash(password.trim())

        const user = await prisma.user.create({
            data: {
                username: username.trim(),
                passwordHash: passwordHash,
                role: role || 'admin',
                active: active !== undefined ? active : true,
            },
            select: {
                id: true,
                username: true,
                role: true,
                active: true,
                createdAt: true,
                updatedAt: true,
            },
        })

        res.status(201).json({
            ...user,
            id: user.id.toString(),
            createdAt: user.createdAt.toISOString(),
        })
    } catch (error) {
        console.error('Error al crear usuario:', error)
        console.error('Error completo:', JSON.stringify(error, null, 2))
        
        // Error de Prisma: tabla no existe
        if (error.code === 'P2021' || error.message?.includes('does not exist') || error.message?.includes('Unknown table')) {
            return res.status(500).json({ 
                error: 'La tabla de usuarios no existe en la base de datos. Ejecuta la migración: npx prisma migrate dev --name add_users_system',
                code: 'TABLE_NOT_EXISTS'
            })
        }
        
        // Error de Prisma: campo no existe
        if (error.code === 'P2022' || error.message?.includes("Unknown column") || error.message?.includes("doesn't exist")) {
            return res.status(500).json({ 
                error: 'La estructura de la tabla User no es correcta. Ejecuta: npx prisma db push',
                code: 'SCHEMA_MISMATCH'
            })
        }
        
        // Error de Prisma: usuario duplicado
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'Ya existe un usuario con este nombre' })
        }
        
        // Error de conexión a la base de datos
        if (error.code === 'P1001' || error.message?.includes('Can\'t reach database')) {
            return res.status(500).json({ 
                error: 'No se puede conectar a la base de datos. Verifica DATABASE_URL',
                code: 'DB_CONNECTION_ERROR'
            })
        }
        
        res.status(500).json({ 
            error: 'Error al crear usuario',
            message: error.message,
            code: error.code,
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        })
    }
}

// Actualizar un usuario
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params
        const { username, password, role, active } = req.body

        const updateData = {}
        if (username !== undefined) updateData.username = username.trim()
        if (role !== undefined) updateData.role = role
        if (active !== undefined) updateData.active = active
        if (password !== undefined && password.trim() !== '') {
            updateData.passwordHash = simpleHash(password.trim())
        }

        const user = await prisma.user.update({
            where: { id: parseInt(id) },
            data: updateData,
            select: {
                id: true,
                username: true,
                role: true,
                active: true,
                createdAt: true,
                updatedAt: true,
            },
        })

        res.json({
            ...user,
            id: user.id.toString(),
            createdAt: user.createdAt.toISOString(),
        })
    } catch (error) {
        console.error('Error al actualizar usuario:', error)
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Usuario no encontrado' })
        }
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'Ya existe un usuario con este nombre' })
        }
        res.status(500).json({ error: 'Error al actualizar usuario' })
    }
}

// Eliminar un usuario
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params

        await prisma.user.delete({
            where: { id: parseInt(id) },
        })

        res.json({ message: 'Usuario eliminado exitosamente' })
    } catch (error) {
        console.error('Error al eliminar usuario:', error)
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Usuario no encontrado' })
        }
        res.status(500).json({ error: 'Error al eliminar usuario' })
    }
}

// Verificar credenciales de usuario (para login)
exports.verifyUser = async (req, res) => {
    try {
        const { username, password } = req.body

        if (!username || !password) {
            return res.status(400).json({ error: 'Username y password son requeridos' })
        }

        const user = await prisma.user.findUnique({
            where: { username: username.trim() },
        })

        if (!user || !user.active) {
            return res.status(401).json({ error: 'Credenciales inválidas' })
        }

        const passwordHash = simpleHash(password.trim())
        if (user.passwordHash !== passwordHash) {
            return res.status(401).json({ error: 'Credenciales inválidas' })
        }

        res.json({
            id: user.id.toString(),
            username: user.username,
            role: user.role,
            active: user.active,
            createdAt: user.createdAt.toISOString(),
        })
    } catch (error) {
        console.error('Error al verificar usuario:', error)
        res.status(500).json({ error: 'Error al verificar usuario' })
    }
}

