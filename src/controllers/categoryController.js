const prisma = require('../config/database')

// Obtener todas las categorías únicas
exports.getAllCategories = async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            select: { category: true },
            distinct: ['category'],
        })

        const categories = ['Todos', ...products.map((p) => p.category).sort()]

        res.json(categories)
    } catch (error) {
        console.error('Error al obtener categorías:', error)
        res.status(500).json({ error: 'Error al obtener categorías' })
    }
}
