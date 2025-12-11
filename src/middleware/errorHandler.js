const errorHandler = (err, req, res, next) => {
    console.error('Error:', err)

    // Error de Prisma
    if (err.code && err.code.startsWith('P')) {
        return res.status(400).json({
            error: 'Error de base de datos',
            details: err.message,
        })
    }

    // Error de validación
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            error: 'Error de validación',
            details: err.message,
        })
    }

    // Error genérico
    res.status(err.status || 500).json({
        error: err.message || 'Error interno del servidor',
    })
}

module.exports = errorHandler
