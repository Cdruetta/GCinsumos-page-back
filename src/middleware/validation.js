const { body, validationResult } = require('express-validator')

// Middleware para validar producto
exports.validateProduct = [
    body('name').trim().notEmpty().withMessage('El nombre es requerido'),
    body('category').trim().notEmpty().withMessage('La categoría es requerida'),
    body('price')
        .custom((value) => {
            const num = Number(value)
            return !isNaN(num) && num >= 0 && Number.isInteger(num)
        })
        .withMessage('El precio debe ser un número entero positivo'),
    body('stock')
        .custom((value) => {
            const num = Number(value)
            return !isNaN(num) && num >= 0 && Number.isInteger(num)
        })
        .withMessage('El stock debe ser un número entero positivo'),
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
    body('stock')
        .custom((value) => {
            const num = Number(value)
            return !isNaN(num) && num >= 0 && Number.isInteger(num)
        })
        .withMessage('El stock debe ser un número entero positivo'),
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

// Middleware para validar categoría
exports.validateCategory = [
    body('name').trim().notEmpty().withMessage('El nombre de la categoría es requerido'),
    body('description').optional().trim(),
    (req, res, next) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }
        next()
    },
]