const { body, validationResult } = require('express-validator')

// Middleware para validar producto
exports.validateProduct = [
    body('name').trim().notEmpty().withMessage('El nombre es requerido'),
    body('category').trim().notEmpty().withMessage('La categoría es requerida'),
    body('price').isInt({ min: 0 }).withMessage('El precio debe ser un número positivo'),
    body('stock').isInt({ min: 0 }).withMessage('El stock debe ser un número positivo'),
    body('description').trim().notEmpty().withMessage('La descripción es requerida'),
    (req, res, next) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }
        next()
    },
]

// Middleware para validar stock
exports.validateStock = [
    body('stock').isInt({ min: 0 }).withMessage('El stock debe ser un número positivo'),
    (req, res, next) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }
        next()
    },
]

// Middleware para validar orden
exports.validateOrder = [
    body('items').isArray({ min: 1 }).withMessage('La orden debe tener al menos un item'),
    body('items.*.productId').isInt().withMessage('ID de producto inválido'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('La cantidad debe ser al menos 1'),
    (req, res, next) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }
        next()
    },
]
