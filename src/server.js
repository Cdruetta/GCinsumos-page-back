require('dotenv').config()
const express = require('express')
const cors = require('cors')
const errorHandler = require('./middleware/errorHandler')

// Importar rutas
const productRoutes = require('./routes/products')
const categoryRoutes = require('./routes/categories')
const orderRoutes = require('./routes/orders')
const userRoutes = require('./routes/users')

const app = express()
const PORT = process.env.PORT || 5000

// Middleware CORS
const allowedOrigins = [
    'https://gcinsumos-page-front.onrender.com',
    'http://localhost:3000',
    process.env.FRONTEND_URL
].filter(Boolean)

app.use(cors({
    origin: function (origin, callback) {
        // Permitir requests sin origin (como mobile apps o curl)
        if (!origin) return callback(null, true)
        
        // Verificar si el origen está en la lista permitida
        if (allowedOrigins.includes(origin)) {
            callback(null, true)
        } else {
            // En producción, solo permitir orígenes conocidos
            // En desarrollo, permitir localhost
            if (process.env.NODE_ENV === 'development' || origin.includes('localhost')) {
                callback(null, true)
            } else {
                callback(new Error('No permitido por CORS'))
            }
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Servir archivos estáticos desde la carpeta uploads
app.use('/uploads', express.static('uploads'))

// Rutas
app.use('/api/products', productRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/users', userRoutes)

// Ruta de prueba
app.get('/', (req, res) => {
    res.json({
        message: 'GCinsumos API - Backend funcionando correctamente',
        version: '1.0.0',
        endpoints: {
            products: '/api/products',
            categories: '/api/categories',
            orders: '/api/orders',
            users: '/api/users',
        },
    })
})

// Ruta de health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

// Manejo de errores
app.use(errorHandler)

// Manejo de rutas no encontradas
app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' })
})

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`)
    console.log(`📝 Documentación de API disponible en http://localhost:${PORT}`)
    console.log(`🌍 Aceptando peticiones desde: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`)
})

module.exports = app
