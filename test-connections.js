/**
 * Script para verificar las conexiones:
 * 1. Backend -> Base de datos Neon
 * 2. Frontend -> Backend (verificar que el servidor esté corriendo)
 */

require('dotenv').config()
const prisma = require('./src/config/database')
const http = require('http')

async function testDatabaseConnection() {
    console.log('🔌 Verificando conexión Backend -> Base de datos Neon...\n')
    
    try {
        // Verificar conexión
        await prisma.$connect()
        console.log('   ✅ Conexión a Neon PostgreSQL exitosa\n')

        // Verificar tablas
        console.log('   📊 Verificando tablas...')
        
        const tables = {
            User: await prisma.user.count(),
            Product: await prisma.product.count(),
            Category: await prisma.category.count(),
            Order: await prisma.order.count(),
        }

        console.log(`      • Usuarios: ${tables.User}`)
        console.log(`      • Productos: ${tables.Product}`)
        console.log(`      • Categorías: ${tables.Category}`)
        console.log(`      • Órdenes: ${tables.Order}\n`)

        // Verificar DATABASE_URL
        const dbUrl = process.env.DATABASE_URL
        if (dbUrl) {
            const isNeon = dbUrl.includes('neon.tech')
            console.log(`   🌐 Base de datos: ${isNeon ? 'Neon PostgreSQL ✅' : 'Otro proveedor'}`)
            if (isNeon) {
                const region = dbUrl.match(/\.([a-z]+-[a-z]+-[0-9])\./)?.[1] || 'desconocida'
                console.log(`      Región: ${region}\n`)
            }
        }

        await prisma.$disconnect()
        return true
    } catch (error) {
        console.error('   ❌ Error de conexión:', error.message)
        if (error.message.includes('Environment variable not found')) {
            console.error('   💡 Verifica que el archivo .env tenga DATABASE_URL configurado\n')
        }
        await prisma.$disconnect()
        return false
    }
}

function testBackendServer() {
    return new Promise((resolve) => {
        console.log('🌐 Verificando servidor Backend...\n')
        
        const port = process.env.PORT || 5000
        const host = 'localhost'
        
        const options = {
            hostname: host,
            port: port,
            path: '/health',
            method: 'GET',
            timeout: 3000
        }

        const req = http.request(options, (res) => {
            let data = ''
            
            res.on('data', (chunk) => {
                data += chunk
            })
            
            res.on('end', () => {
                if (res.statusCode === 200) {
                    console.log(`   ✅ Servidor backend corriendo en http://${host}:${port}`)
                    console.log(`   ✅ Health check: OK\n`)
                    resolve(true)
                } else {
                    console.log(`   ⚠️  Servidor responde pero con código: ${res.statusCode}\n`)
                    resolve(false)
                }
            })
        })

        req.on('error', (error) => {
            if (error.code === 'ECONNREFUSED') {
                console.log(`   ❌ Servidor backend NO está corriendo`)
                console.log(`   💡 Inicia el servidor con: npm run dev\n`)
            } else {
                console.log(`   ❌ Error: ${error.message}\n`)
            }
            resolve(false)
        })

        req.on('timeout', () => {
            req.destroy()
            console.log(`   ⏱️  Timeout: El servidor no responde\n`)
            resolve(false)
        })

        req.end()
    })
}

function checkFrontendConfig() {
    console.log('📱 Verificando configuración Frontend -> Backend...\n')
    
    const backendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
    const backendPort = process.env.PORT || 5000
    const backendHost = `http://localhost:${backendPort}`
    
    console.log(`   🔗 Backend URL esperada: ${backendHost}`)
    console.log(`   📱 Frontend URL configurada: ${backendUrl}`)
    console.log(`\n   💡 El frontend debe hacer peticiones a:`)
    console.log(`      • ${backendHost}/api/products`)
    console.log(`      • ${backendHost}/api/categories`)
    console.log(`      • ${backendHost}/api/users`)
    console.log(`      • ${backendHost}/api/orders\n`)
    
    // Verificar CORS
    console.log(`   🔒 CORS configurado para: ${backendUrl}\n`)
}

async function main() {
    console.log('═══════════════════════════════════════════════════')
    console.log('   VERIFICACIÓN DE CONEXIONES')
    console.log('═══════════════════════════════════════════════════\n')

    // 1. Verificar conexión a base de datos
    const dbConnected = await testDatabaseConnection()
    
    // 2. Verificar servidor backend
    const backendRunning = await testBackendServer()
    
    // 3. Verificar configuración frontend
    checkFrontendConfig()

    // Resumen
    console.log('═══════════════════════════════════════════════════')
    console.log('   RESUMEN')
    console.log('═══════════════════════════════════════════════════\n')
    
    console.log(`   Backend → Neon DB:  ${dbConnected ? '✅ Conectado' : '❌ Desconectado'}`)
    console.log(`   Backend Server:     ${backendRunning ? '✅ Corriendo' : '❌ No corriendo'}`)
    console.log(`   Frontend → Backend: ${backendRunning ? '✅ Puede conectar' : '❌ No puede conectar'}\n`)

    if (dbConnected && backendRunning) {
        console.log('✨ ¡Todo está conectado correctamente!\n')
        process.exit(0)
    } else {
        console.log('⚠️  Hay problemas de conexión. Revisa los detalles arriba.\n')
        process.exit(1)
    }
}

main()

