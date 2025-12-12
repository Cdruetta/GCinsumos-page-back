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

// Middleware CORS (solo orígenes permitidos, sin fallback)
const allowedOrigins = [
    process.env.FRONTEND_URL,
    'https://gcinsumos-page-front.onrender.com',
    'http://localhost:3000',
].filter(Boolean)

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
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
