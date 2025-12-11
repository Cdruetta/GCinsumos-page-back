require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')
const readline = require('readline')

const prisma = new PrismaClient()

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

function question(prompt) {
    return new Promise((resolve) => {
        rl.question(prompt, resolve)
    })
}

async function createAdmin() {
    try {
        console.log('👤 Crear nuevo usuario administrador\n')

        const email = await question('Email: ')
        const name = await question('Nombre: ')
        const password = await question('Contraseña: ')

        if (!email || !name || !password) {
            console.error('❌ Todos los campos son requeridos')
            process.exit(1)
        }

        // Verificar si el usuario ya existe
        const existingUser = await prisma.user.findUnique({
            where: { email }
        })

        if (existingUser) {
            console.error('❌ Ya existe un usuario con ese email')
            process.exit(1)
        }

        // Hashear la contraseña
        const saltRounds = 10
        const hashedPassword = await bcrypt.hash(password, saltRounds)

        // Crear el usuario admin
        const user = await prisma.user.create({
            data: {
                email,
                name,
                password: hashedPassword,
                role: 'admin'
            }
        })

        console.log('\n✅ Usuario administrador creado exitosamente!')
        console.log(`📧 Email: ${user.email}`)
        console.log(`👤 Nombre: ${user.name}`)
        console.log(`🔑 Rol: ${user.role}`)
        console.log(`🆔 ID: ${user.id}`)

    } catch (error) {
        console.error('❌ Error al crear usuario:', error.message)
        process.exit(1)
    } finally {
        await prisma.$disconnect()
        rl.close()
    }
}

createAdmin()

